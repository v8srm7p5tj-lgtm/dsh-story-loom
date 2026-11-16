import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {
  ensureStore,
  exportProjectBundle,
  importProjectBundle,
  readProject
} from '../lib/store.js'

async function tempRoot() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'story-loom-sync-'))
}

test('export bundle contains state, style guide and media', async () => {
  const root = await tempRoot()
  await ensureStore(root)
  const bundle = await exportProjectBundle(root, 'demo')
  assert.equal(bundle.format, 'dsh-story-loom/sync')
  assert.equal(bundle.version, 1)
  assert.equal(bundle.projectTitle, '雾港夜航')
  assert.ok(bundle.state.entries.length > 20)
  assert.ok(bundle.media.length >= 1)
  assert.ok(bundle.media.some((item) => item.name === 'map.svg'))
})

test('import bundle creates a new project with media and style guide', async () => {
  const source = await tempRoot()
  const target = await tempRoot()
  await ensureStore(source)
  await ensureStore(target)
  const bundle = await exportProjectBundle(source, 'demo')
  bundle.projectId = 'imported-world'
  bundle.state.project.id = 'imported-world'
  bundle.state.project.title = '导入世界'
  bundle.styleGuide = '# 导入文风\n\n短句。'
  const result = await importProjectBundle(target, bundle)
  assert.equal(result.imported, true)
  assert.equal(result.state.project.title, '导入世界')
  assert.equal(result.index.activeProjectId, 'imported-world')
  const loaded = await readProject(target, 'imported-world')
  assert.equal(loaded.state.entries.length, bundle.state.entries.length)
  assert.equal(loaded.state.settings.styleGuide, '# 导入文风\n\n短句。')
  const media = await fs.readdir(path.join(target, 'projects', 'imported-world', 'media'))
  assert.ok(media.includes('map.svg'))
})

test('import bundle rejects foreign files', async () => {
  const root = await tempRoot()
  await ensureStore(root)
  await assert.rejects(() => importProjectBundle(root, { hello: 'world' }), /同步包/)
})
