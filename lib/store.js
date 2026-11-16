/**
 * 织世 · 文件存储
 *
 * 数据落在工作区的 story-loom/ 下：
 *   story-loom/
 *     index.json
 *     projects/<id>/story.json
 *     projects/<id>/media/*
 *     projects/<id>/backups/rev-*.json
 *     style/style-guide.md
 *     exports/
 *
 * 单文件、原子写、乐观锁。UI 与 CLI 可以同时改，靠 revision 拒绝覆盖。
 */

import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { normalizeState, nowIso, uid, ValidationError } from './canon.js'
import { emptyProjectState, demoProjectState } from './schema.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PLUGIN_ROOT = path.resolve(__dirname, '..')

export class ConflictError extends Error {
  constructor(currentRevision) {
    super('revision-conflict')
    this.name = 'ConflictError'
    this.currentRevision = currentRevision
  }
}

export class NotFoundError extends Error {
  constructor(message = 'not-found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export function defaultRoot() {
  return path.resolve(process.env.STORY_LOOM_HOME || path.join(process.cwd(), 'story-loom'))
}

export const SYNC_CONFIG_FILE = process.env.STORY_LOOM_SYNC_CONFIG
  ? path.resolve(process.env.STORY_LOOM_SYNC_CONFIG)
  : path.join(os.homedir(), '.dsh', 'story-loom-sync.json')

export function readSyncConfig() {
  try {
    const raw = JSON.parse(fs.readFileSync(SYNC_CONFIG_FILE, 'utf8'))
    return {
      dataRoot: typeof raw.dataRoot === 'string' && raw.dataRoot ? path.resolve(raw.dataRoot) : null
    }
  } catch {
    return { dataRoot: null }
  }
}

export async function writeSyncConfig(dataRoot) {
  await fsp.mkdir(path.dirname(SYNC_CONFIG_FILE), { recursive: true })
  await writeJsonAtomic(SYNC_CONFIG_FILE, { dataRoot: dataRoot ? path.resolve(dataRoot) : null, updatedAt: nowIso() })
}

export function projectDir(root, id) {
  return path.join(root, 'projects', id)
}

export function projectFile(root, id) {
  return path.join(projectDir(root, id), 'story.json')
}

export function mediaDir(root, id) {
  return path.join(projectDir(root, id), 'media')
}

function backupDir(root, id) {
  return path.join(projectDir(root, id), 'backups')
}

function indexPath(root) {
  return path.join(root, 'index.json')
}

function safeId(id) {
  const value = String(id || '')
  return /^[A-Za-z0-9_-]{1,64}$/.test(value) ? value : ''
}

function sanitizeRootPath(root) {
  return path.resolve(root || defaultRoot())
}

async function pathExists(file) {
  try {
    await fsp.access(file)
    return true
  } catch {
    return false
  }
}

async function readJson(file, fallback = null) {
  try {
    const raw = await fsp.readFile(file, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    if (error && error.code === 'ENOENT') return fallback
    throw error
  }
}

async function writeFileAtomic(file, content) {
  await fsp.mkdir(path.dirname(file), { recursive: true })
  const tmp = `${file}.tmp-${process.pid}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
  await fsp.writeFile(tmp, content, 'utf8')
  await fsp.rename(tmp, file)
}

async function writeJsonAtomic(file, value) {
  await writeFileAtomic(file, `${JSON.stringify(value, null, 2)}\n`)
}

async function withLock(root, fn) {
  // 锁放在本机临时目录，避免共享/云同步文件夹把 .lock 文件同步到另一台设备。
  const lockKey = crypto.createHash('sha1').update(path.resolve(root)).digest('hex').slice(0, 16)
  const lockFile = path.join(os.tmpdir(), `story-loom-${lockKey}.lock`)
  await fsp.mkdir(root, { recursive: true })
  let acquired = false
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const handle = await fsp.open(lockFile, 'wx')
      await handle.writeFile(JSON.stringify({ pid: process.pid, at: Date.now() }), 'utf8')
      await handle.close()
      acquired = true
      break
    } catch (error) {
      if (!error || error.code !== 'EEXIST') throw error
      try {
        const stat = await fsp.stat(lockFile)
        if (Date.now() - stat.mtimeMs > 30000) {
          await fsp.unlink(lockFile).catch(() => {})
          continue
        }
      } catch {
        continue
      }
      await new Promise((resolve) => setTimeout(resolve, 40))
    }
  }
  if (!acquired) throw new Error('写入锁超时：另一个保存正在进行，请稍后再试')
  try {
    return await fn()
  } finally {
    await fsp.unlink(lockFile).catch(() => {})
  }
}

function makeProjectId(title, existingIds) {
  const base = String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 28)
  let id = base || `world-${Date.now().toString(36)}`
  let suffix = 2
  while (existingIds.has(id)) {
    id = `${base || 'world'}-${suffix}`
    suffix += 1
  }
  return id
}

async function readIndex(root) {
  const raw = await readJson(indexPath(root), null)
  if (!raw || typeof raw !== 'object') return { version: 1, activeProjectId: 'main', projects: [] }
  const projects = []
  const seen = new Set()
  for (const item of Array.isArray(raw.projects) ? raw.projects : []) {
    const id = safeId(item && item.id)
    if (!id || seen.has(id)) continue
    seen.add(id)
    projects.push({
      id,
      title: String((item && item.title) || id).slice(0, 120),
      createdAt: String((item && item.createdAt) || nowIso()),
      updatedAt: String((item && item.updatedAt) || nowIso())
    })
  }
  return {
    version: 1,
    activeProjectId: safeId(raw.activeProjectId) || projects[0]?.id || 'main',
    projects
  }
}

async function writeIndex(root, index) {
  await writeJsonAtomic(indexPath(root), {
    version: 1,
    activeProjectId: index.activeProjectId,
    projects: index.projects
  })
}

async function upsertProjectMeta(root, id, patch = {}) {
  const index = await readIndex(root)
  const existing = index.projects.find((item) => item.id === id)
  if (existing) {
    Object.assign(existing, patch)
    if (!existing.updatedAt) existing.updatedAt = nowIso()
  } else {
    index.projects.push({
      id,
      title: patch.title || id,
      createdAt: patch.createdAt || nowIso(),
      updatedAt: patch.updatedAt || nowIso()
    })
  }
  await writeIndex(root, index)
}

async function copyDemoMap(root, id) {
  const source = path.join(PLUGIN_ROOT, 'assets', 'demo-map.svg')
  if (!(await pathExists(source))) return
  const target = path.join(mediaDir(root, id), 'map.svg')
  if (await pathExists(target)) return
  await fsp.mkdir(path.dirname(target), { recursive: true })
  await fsp.copyFile(source, target)
}

/**
 * 初始化目录与索引。只在缺失时创建，绝不覆盖已有项目。
 * 第一次初始化会同时建一个空白主世界和一个示例世界。
 */
export async function ensureStore(rootInput, options = {}) {
  const root = sanitizeRootPath(rootInput)
  const seedDemo = options.seedDemo !== false
  await fsp.mkdir(path.join(root, 'projects'), { recursive: true })
  await fsp.mkdir(path.join(root, 'exports'), { recursive: true })
  await fsp.mkdir(path.join(root, 'style'), { recursive: true })

  let index = await readIndex(root)
  const hasIndex = await pathExists(indexPath(root))
  if (!hasIndex) {
    const mainState = emptyProjectState('main')
    await writeJsonAtomic(projectFile(root, 'main'), mainState)
    index.projects.push({
      id: 'main',
      title: mainState.project.title,
      createdAt: mainState.project.createdAt,
      updatedAt: mainState.project.updatedAt
    })
    index.activeProjectId = 'main'
    if (seedDemo) {
      const demoState = demoProjectState('demo')
      await writeJsonAtomic(projectFile(root, 'demo'), demoState)
      await copyDemoMap(root, 'demo')
      index.projects.push({
        id: 'demo',
        title: demoState.project.title,
        createdAt: demoState.project.createdAt,
        updatedAt: demoState.project.updatedAt
      })
    }
    await writeIndex(root, index)
    return { root, index }
  }

  // 索引存在，但项目文件可能被移动/删除：不自动重建，交给 UI 显示异常。
  if (!index.projects.some((item) => item.id === 'main')) {
    const mainState = emptyProjectState('main')
    await writeJsonAtomic(projectFile(root, 'main'), mainState)
    index.projects.push({
      id: 'main',
      title: mainState.project.title,
      createdAt: mainState.project.createdAt,
      updatedAt: mainState.project.updatedAt
    })
    if (!safeId(index.activeProjectId)) index.activeProjectId = 'main'
    await writeIndex(root, index)
  }
  // 示例世界只在首次初始化时播种。用户删掉后不再自动重建。
  return { root, index }
}

export async function readProject(rootInput, idInput) {
  const root = sanitizeRootPath(rootInput)
  const id = safeId(idInput)
  if (!id) throw new NotFoundError('非法项目 id')
  const file = projectFile(root, id)
  let raw
  try {
    raw = await fsp.readFile(file, 'utf8')
  } catch (error) {
    if (error && error.code === 'ENOENT') throw new NotFoundError(`项目 ${id} 不存在`)
    throw error
  }
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    throw new ValidationError(`项目 ${id} 的 story.json 不是合法 JSON：${error.message}`)
  }
  const warnings = []
  const state = normalizeState(parsed, { onWarning: (message) => warnings.push(message) })
  state.project.id = id
  // 文风指南同时存一份纯 Markdown，方便 CLI / 其他 AI 工具直接读。
  // 如果 state 里还没填，就从文件回填；state 有值时以 state 为准。
  if (!state.settings.styleGuide) {
    const styleText = await fsp
      .readFile(path.join(root, 'style', 'style-guide.md'), 'utf8')
      .catch(() => '')
    if (styleText) state.settings.styleGuide = styleText.slice(0, 200000)
  }
  return { state, warnings, path: file }
}

export async function saveProject(rootInput, idInput, inputState, options = {}) {
  const root = sanitizeRootPath(rootInput)
  const id = safeId(idInput)
  if (!id) throw new NotFoundError('非法项目 id')
  const current = await readProject(root, id)
  const baseRevision = options.baseRevision
  if (baseRevision !== undefined && baseRevision !== null && Number(baseRevision) !== current.state.revision) {
    throw new ConflictError(current.state.revision)
  }
  const state = normalizeState(inputState, { strict: true })
  state.project.id = id
  state.revision = current.state.revision + 1
  state.project.updatedAt = nowIso()
  const action = String(options.action || '保存').slice(0, 80)
  const detail = String(options.detail || '').slice(0, 800)
  state.log = [
    ...(Array.isArray(state.log) ? state.log : []),
    { at: nowIso(), action, detail }
  ].slice(-500)

  return withLock(root, async () => {
    // 锁内再读一次，防止两个保存同时通过检查。
    const latest = await readProject(root, id)
    if (baseRevision !== undefined && baseRevision !== null && Number(baseRevision) !== latest.state.revision) {
      throw new ConflictError(latest.state.revision)
    }
    const previous = latest.state
    if (Number.isInteger(previous.revision) && previous.revision >= 0) {
      const backupFile = path.join(backupDir(root, id), `rev-${previous.revision}.json`)
      if (!(await pathExists(backupFile))) {
        await fsp.mkdir(path.dirname(backupFile), { recursive: true })
        await writeFileAtomic(backupFile, `${JSON.stringify(previous, null, 2)}\n`)
        await pruneBackups(root, id, 30)
      }
    }
    await writeJsonAtomic(projectFile(root, id), state)
    const styleGuide = state.settings.styleGuide || ''
    const styleFile = path.join(root, 'style', 'style-guide.md')
    const existingStyle = await fsp.readFile(styleFile, 'utf8').catch(() => null)
    if (existingStyle !== styleGuide) await writeFileAtomic(styleFile, styleGuide)
    await upsertProjectMeta(root, id, {
      title: state.project.title,
      updatedAt: state.project.updatedAt
    })
    return state
  })
}

async function pruneBackups(root, id, keep) {
  const dir = backupDir(root, id)
  let files = []
  try {
    files = await fsp.readdir(dir)
  } catch {
    return
  }
  const revisions = files
    .map((name) => {
      const match = name.match(/^rev-(\d+)\.json$/)
      return match ? { name, revision: Number(match[1]) } : null
    })
    .filter(Boolean)
    .sort((a, b) => b.revision - a.revision)
  for (const file of revisions.slice(keep)) {
    await fsp.unlink(path.join(dir, file.name)).catch(() => {})
  }
}

export async function createProject(rootInput, options = {}) {
  const root = sanitizeRootPath(rootInput)
  await ensureStore(root)
  const index = await readIndex(root)
  const title = String(options.title || '未命名世界').trim().slice(0, 80) || '未命名世界'
  const id = makeProjectId(title, new Set(index.projects.map((item) => item.id)))
  const state = options.template === 'demo' ? demoProjectState(id) : emptyProjectState(id, title)
  state.project.title = title
  state.project.id = id
  if (options.template === 'demo') state.project.map.image = `/story-loom/media/${id}/map.svg`
  state.revision = 0
  state.project.createdAt = nowIso()
  state.project.updatedAt = nowIso()
  state.log = [{ at: nowIso(), action: '创建世界', detail: `「${title}」已建立。` }]
  await writeJsonAtomic(projectFile(root, id), state)
  if (options.template === 'demo') await copyDemoMap(root, id)
  index.projects.push({
    id,
    title,
    createdAt: state.project.createdAt,
    updatedAt: state.project.updatedAt
  })
  index.activeProjectId = id
  await writeIndex(root, index)
  return state
}

export async function activateProject(rootInput, idInput) {
  const root = sanitizeRootPath(rootInput)
  const id = safeId(idInput)
  if (!id) throw new NotFoundError('非法项目 id')
  const index = await readIndex(root)
  if (!index.projects.some((item) => item.id === id)) throw new NotFoundError('项目不存在')
  index.activeProjectId = id
  await writeIndex(root, index)
  return index
}

export async function deleteProject(rootInput, idInput) {
  const root = sanitizeRootPath(rootInput)
  const id = safeId(idInput)
  if (!id) throw new NotFoundError('非法项目 id')
  if (id === 'main') throw new ValidationError('主世界不能删除')
  const index = await readIndex(root)
  if (!index.projects.some((item) => item.id === id)) throw new NotFoundError('项目不存在')
  const dir = projectDir(root, id)
  const resolved = path.resolve(dir)
  const projectsRoot = path.resolve(root, 'projects')
  if (!resolved.startsWith(`${projectsRoot}${path.sep}`)) throw new ValidationError('拒绝删除项目目录之外的路径')
  await fsp.rm(resolved, { recursive: true, force: true })
  index.projects = index.projects.filter((item) => item.id !== id)
  if (index.activeProjectId === id) index.activeProjectId = index.projects[0]?.id || 'main'
  await writeIndex(root, index)
  return index
}

export async function bootstrap(rootInput) {
  const root = sanitizeRootPath(rootInput)
  const { index } = await ensureStore(root)
  let activeProjectId = index.activeProjectId || index.projects[0]?.id || 'main'
  if (!index.projects.some((item) => item.id === activeProjectId)) {
    activeProjectId = index.projects[0]?.id || 'main'
    if (activeProjectId !== index.activeProjectId) {
      index.activeProjectId = activeProjectId
      await writeIndex(root, index)
    }
  }
  return { root, index, activeProjectId }
}

export async function listBackups(rootInput, idInput) {
  const root = sanitizeRootPath(rootInput)
  const id = safeId(idInput)
  if (!id) throw new NotFoundError('非法项目 id')
  const dir = backupDir(root, id)
  let files = []
  try {
    files = await fsp.readdir(dir)
  } catch {
    return []
  }
  const out = []
  for (const name of files) {
    const match = name.match(/^rev-(\d+)\.json$/)
    if (!match) continue
    const file = path.join(dir, name)
    const stat = await fsp.stat(file).catch(() => null)
    out.push({
      revision: Number(match[1]),
      size: stat ? stat.size : 0,
      at: stat ? new Date(stat.mtimeMs).toISOString() : ''
    })
  }
  out.sort((a, b) => b.revision - a.revision)
  return out
}

export async function restoreBackup(rootInput, idInput, revisionInput) {
  const root = sanitizeRootPath(rootInput)
  const id = safeId(idInput)
  const revision = Number(revisionInput)
  if (!id || !Number.isInteger(revision) || revision < 0) throw new ValidationError('非法备份修订号')
  const file = path.join(backupDir(root, id), `rev-${revision}.json`)
  let raw
  try {
    raw = JSON.parse(await fsp.readFile(file, 'utf8'))
  } catch {
    throw new NotFoundError('备份不存在')
  }
  const state = normalizeState(raw, { strict: true })
  return saveProject(root, id, state, {
    baseRevision: null,
    action: `恢复修订 ${revision}`,
    detail: `从备份 rev-${revision} 恢复为新修订。`
  })
}

const MIME_EXT = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif'
}

export async function saveMedia(rootInput, idInput, payload = {}) {
  const root = sanitizeRootPath(rootInput)
  const id = safeId(idInput)
  if (!id) throw new NotFoundError('非法项目 id')
  const mime = String(payload.mime || '').toLowerCase()
  const ext = MIME_EXT[mime]
  if (!ext) throw new ValidationError('只支持 PNG / JPEG / WebP / GIF 图片')
  const base64 = String(payload.data || '').replace(/^data:[^;]+;base64,/, '')
  if (!base64) throw new ValidationError('图片内容为空')
  let buffer
  try {
    buffer = Buffer.from(base64, 'base64')
  } catch {
    throw new ValidationError('图片 base64 无效')
  }
  if (buffer.length > 12 * 1024 * 1024) throw new ValidationError('图片超过 12 MB')
  if (buffer.length < 8) throw new ValidationError('图片内容无效')
  await fsp.mkdir(mediaDir(root, id), { recursive: true })
  const baseName = String(payload.filename || 'image')
    .replace(/\.[^.]+$/, '')
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'image'
  const fileName = `${Date.now().toString(36)}-${baseName}${ext}`
  const target = path.join(mediaDir(root, id), fileName)
  await fsp.writeFile(target, buffer)
  return {
    url: `/story-loom/media/${id}/${fileName}`,
    fileName,
    size: buffer.length,
    mime
  }
}

export function resolveMediaFile(rootInput, idInput, fileNameInput) {
  const root = sanitizeRootPath(rootInput)
  const id = safeId(idInput)
  const fileName = path.basename(String(fileNameInput || ''))
  if (!id || !fileName || fileName !== String(fileNameInput || '')) return null
  if (!/^[A-Za-z0-9._-]{1,120}$/.test(fileName)) return null
  const file = path.join(mediaDir(root, id), fileName)
  const resolved = path.resolve(file)
  const dir = path.resolve(mediaDir(root, id))
  if (!resolved.startsWith(`${dir}${path.sep}`)) return null
  return resolved
}


const SYNC_FORMAT = 'dsh-story-loom/sync'
const EXT_MIME = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif'
}

/**
 * 导出一个可跨设备传输的同步包。
 * 只包含当前世界、地图/图片、文风指南；不包含其他世界。
 * 同步包是明文 JSON，用户应通过私密渠道传输。
 */
export async function exportProjectBundle(rootInput, idInput) {
  const root = sanitizeRootPath(rootInput)
  const id = safeId(idInput)
  if (!id) throw new NotFoundError('非法项目 id')
  const loaded = await readProject(root, id)
  const state = loaded.state
  const media = []
  let files = []
  try {
    files = await fsp.readdir(mediaDir(root, id), { withFileTypes: true })
  } catch {
    files = []
  }
  let total = 0
  for (const dirent of files) {
    if (!dirent.isFile()) continue
    const name = dirent.name
    if (!/^[A-Za-z0-9._-]{1,120}$/.test(name)) continue
    const ext = path.extname(name).toLowerCase()
    const mime = EXT_MIME[ext]
    if (!mime) continue
    const file = path.join(mediaDir(root, id), name)
    const stat = await fsp.stat(file)
    if (stat.size > 20 * 1024 * 1024) continue
    total += stat.size
    if (total > 100 * 1024 * 1024) throw new ValidationError('地图/图片总大小超过 100 MB，无法导出同步包')
    const buffer = await fsp.readFile(file)
    media.push({ name, mime, data: buffer.toString('base64') })
  }
  return {
    format: SYNC_FORMAT,
    version: 1,
    exportedAt: nowIso(),
    projectId: id,
    projectTitle: state.project.title,
    revision: state.revision,
    styleGuide: state.settings.styleGuide || '',
    state,
    media
  }
}

/**
 * 导入同步包。已存在的项目会先走 saveProject 的备份/修订流程；
 * 新项目直接落盘并加入 index。导入后把该项目设为 active。
 */
export async function importProjectBundle(rootInput, payload, options = {}) {
  const root = sanitizeRootPath(rootInput)
  if (!payload || payload.format !== SYNC_FORMAT) throw new ValidationError('不是织世同步包')
  if (Number(payload.version) !== 1) throw new ValidationError('同步包版本不受支持')
  if (!payload.state || typeof payload.state !== 'object') throw new ValidationError('同步包缺少 state')
  const id = safeId(payload.projectId || payload.state.project?.id)
  if (!id) throw new ValidationError('同步包缺少合法项目 id')
  const state = normalizeState(payload.state, { strict: true })
  state.project.id = id
  state.settings.styleGuide = String(payload.styleGuide || state.settings.styleGuide || '').slice(0, 200000)
  const now = nowIso()
  state.project.updatedAt = now
  state.log = [...(Array.isArray(state.log) ? state.log : []), {
    at: now,
    action: '同步导入',
    detail: `来自同步包（导出于 ${payload.exportedAt || '未知时间'}）`
  }].slice(-500)

  await ensureStore(root)
  const before = await readIndex(root)
  const exists = before.projects.some((item) => item.id === id)

  // 先写图片，再写 state；state 里的 URL 指向这些文件名。
  // 不在这里拿写锁，避免和 saveProject 内部的锁嵌套。
  await fsp.mkdir(mediaDir(root, id), { recursive: true })
  for (const item of Array.isArray(payload.media) ? payload.media : []) {
    const name = path.basename(String((item && item.name) || ''))
    if (!/^[A-Za-z0-9._-]{1,120}$/.test(name) || name !== String((item && item.name) || '')) continue
    const ext = path.extname(name).toLowerCase()
    if (!EXT_MIME[ext]) continue
    const base64 = String(item.data || '').replace(/^data:[^;]+;base64,/, '')
    if (!base64) continue
    const buffer = Buffer.from(base64, 'base64')
    if (buffer.length < 8 || buffer.length > 20 * 1024 * 1024) continue
    await fsp.writeFile(path.join(mediaDir(root, id), name), buffer)
  }

  let saved
  if (exists) {
    // 已存在：saveProject 会备份上一版、递增 revision、更新 index。
    saved = await saveProject(root, id, state, {
      baseRevision: null,
      action: '同步导入',
      detail: `覆盖本机同名项目（导出于 ${payload.exportedAt || '未知时间'}）`
    })
  } else {
    state.revision = Math.max(1, Number(state.revision) || 1)
    state.project.updatedAt = now
    saved = await withLock(root, async () => {
      const latestIndex = await readIndex(root)
      await fsp.mkdir(projectDir(root, id), { recursive: true })
      await writeJsonAtomic(projectFile(root, id), state)
      latestIndex.projects.push({
        id,
        title: state.project.title,
        createdAt: state.project.createdAt || now,
        updatedAt: state.project.updatedAt
      })
      await writeIndex(root, latestIndex)
      if (state.settings.styleGuide) await writeStyleGuide(root, state.settings.styleGuide)
      return state
    })
  }

  const latestIndex = await withLock(root, async () => {
    const index = await readIndex(root)
    index.activeProjectId = id
    const meta = index.projects.find((item) => item.id === id)
    if (meta) {
      meta.title = saved.project.title
      meta.updatedAt = saved.project.updatedAt
    }
    await writeIndex(root, index)
    return index
  })
  return { state: saved, index: latestIndex, imported: !exists }
}

export async function writeStyleGuide(rootInput, content) {
  const root = sanitizeRootPath(rootInput)
  await fsp.mkdir(path.join(root, 'style'), { recursive: true })
  await writeFileAtomic(path.join(root, 'style', 'style-guide.md'), String(content || ''))
}

export { uid }
