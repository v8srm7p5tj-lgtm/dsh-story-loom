import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {
  ensureStore,
  readProject,
  saveProject,
  createProject,
  listBackups,
  restoreBackup,
  ConflictError
} from '../lib/store.js'
import { buildContext, exportMarkdown, lintState, normalizeState, resolveChapter, searchEntries } from '../lib/canon.js'
import { demoProjectState, emptyProjectState } from '../lib/schema.js'

async function tempRoot() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'story-loom-test-'))
}

test('initialize creates main and demo projects with valid files', async () => {
  const root = await tempRoot()
  const boot = await ensureStore(root)
  assert.equal(boot.index.projects.length, 2)
  assert.ok(boot.index.projects.some((project) => project.id === 'main'))
  assert.ok(boot.index.projects.some((project) => project.id === 'demo'))
  const main = await readProject(root, 'main')
  assert.equal(main.state.project.title, '未命名世界')
  assert.ok(main.state.boards.length >= 15)
  const demo = await readProject(root, 'demo')
  assert.equal(demo.state.project.title, '雾港夜航')
  assert.ok(demo.state.entries.length >= 40)
})

test('demo lint catches power overreach and dead character recurrence', async () => {
  const state = demoProjectState('demo')
  const result = lintState(state)
  const codes = result.issues.map((issue) => issue.code)
  assert.ok(codes.includes('power-overreach'))
  assert.ok(codes.includes('dead-character-outline'))
  assert.ok(result.score < 100)
})

test('normalization rejects duplicate board ids in strict mode', () => {
  const state = emptyProjectState('x')
  state.boards.push(JSON.parse(JSON.stringify(state.boards[0])))
  assert.throws(() => normalizeState(state, { strict: true }), /重复/)
})

test('save increments revision and rejects stale writes', async () => {
  const root = await tempRoot()
  await ensureStore(root)
  const loaded = await readProject(root, 'main')
  const state = loaded.state
  state.project.logline = '测试一句话'
  const saved = await saveProject(root, 'main', state, { baseRevision: state.revision })
  assert.equal(saved.revision, 1)
  assert.equal(saved.project.logline, '测试一句话')
  await assert.rejects(
    () => saveProject(root, 'main', state, { baseRevision: 0 }),
    (error) => error instanceof ConflictError && error.currentRevision === 1
  )
  const backups = await listBackups(root, 'main')
  assert.equal(backups.length, 1)
  assert.equal(backups[0].revision, 0)
})

test('backup restore creates a new revision without losing the current file', async () => {
  const root = await tempRoot()
  await ensureStore(root)
  const loaded = await readProject(root, 'main')
  const state = loaded.state
  state.project.title = '改过的标题'
  const saved = await saveProject(root, 'main', state, { baseRevision: state.revision })
  const restored = await restoreBackup(root, 'main', 0)
  assert.equal(restored.project.title, '未命名世界')
  assert.equal(restored.revision, saved.revision + 1)
})

test('demo context includes canon, power, cast, threads and continuity warnings', () => {
  const state = demoProjectState('demo')
  const result = buildContext(state, { chapter: 1 })
  assert.match(result.markdown, /不可违背的正典/)
  assert.match(result.markdown, /力量阶梯/)
  assert.match(result.markdown, /沈雾/)
  assert.match(result.markdown, /伏笔账本/)
  assert.match(result.markdown, /连续性警告/)
  assert.match(result.markdown, /文风约束/)
  assert.ok(result.markdown.length > 3000)
})

test('markdown export contains every board and entry', () => {
  const state = demoProjectState('demo')
  const markdown = exportMarkdown(state)
  assert.match(markdown, /雾港夜航/)
  assert.match(markdown, /怪物图鉴/)
  assert.match(markdown, /潮骸/)
  assert.match(markdown, /连续性检查/)
})

test('search finds entries by body and tags', () => {
  const state = demoProjectState('demo')
  const results = searchEntries(state, '影子')
  assert.ok(results.length >= 1)
  assert.ok(results.some((item) => item.entry.name === '无影尸体的身份'))
})

test('create project returns a clean empty state', async () => {
  const root = await tempRoot()
  await ensureStore(root)
  const created = await createProject(root, { title: '第二个世界' })
  assert.equal(created.project.title, '第二个世界')
  assert.equal(created.entries.length, 2)
})


test('chapter number resolves to its own outline node, not the volume with the same number', () => {
  const state = {
    boards: [
      { id: 'chapters', name: '章节档案', fields: [] },
      { id: 'outline', name: '主线大纲', fields: [] }
    ],
    entries: [
      { id: 'v1', boardId: 'outline', name: '卷一 · 没有牌的人', fields: { level: '卷', number: 1, order: 1 } },
      { id: 'o1', boardId: 'outline', name: '第一章 · 荒野', fields: { level: '章', number: '1-01', order: 101 } },
      { id: 'c1', boardId: 'chapters', name: '荒野', fields: { number: 1, outlineRef: 'o1' } }
    ],
    project: { title: '测试' },
    settings: {},
    log: []
  }
  const resolved = resolveChapter(state, '1')
  assert.equal(resolved.chapter.id, 'c1')
  assert.equal(resolved.outline.id, 'o1')
})
