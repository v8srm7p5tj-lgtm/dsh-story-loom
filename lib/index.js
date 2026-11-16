/**
 * dsh-story-loom · Host 半侧
 *
 * 注册 /story-loom 下的本地 HTTP API，读写工作区的 story-loom/ 数据目录。
 * 所有写操作都走 store.js 的乐观锁；前端不需要知道文件路径。
 *
 * 设计上不依赖 DSH 私有 Remote 面：普通 fetch + 同源信任栅栏即可。
 * 这样即使桌面端走 file:// + IPC，只有 webServer 形态下才启用这一层。
 */

import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  bootstrap,
  readProject,
  saveProject,
  createProject,
  activateProject,
  deleteProject,
  listBackups,
  restoreBackup,
  saveMedia,
  resolveMediaFile,
  exportProjectBundle,
  importProjectBundle,
  defaultRoot,
  ConflictError,
  NotFoundError
} from './store.js'
import {
  lintState,
  exportMarkdown,
  contextMarkdown,
  buildContext,
  searchEntries,
  ValidationError,
  normalizeState
} from './canon.js'

const NS = 'dsh-story-loom'
const BASE = '/story-loom'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const MIME = {
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif'
}

const inject = ['webServer', 'connection']

function resolveWebServer(ctx) {
  try {
    const viaGet = typeof ctx.get === 'function' ? ctx.get('webServer') : undefined
    if (viaGet) return viaGet
  } catch {
    /* 取不到就当没有 */
  }
  return ctx.webServer
}

function hasRoutes(server) {
  return !!server && typeof server.register === 'function' && typeof server.tapIndex === 'function'
}

function sendJson(res, code, payload) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8')
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': String(body.length)
  })
  res.end(body)
}

function sendText(res, code, type, textValue, headers = {}) {
  const body = Buffer.from(String(textValue), 'utf8')
  res.writeHead(code, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'Content-Length': String(body.length),
    ...headers
  })
  res.end(body)
}

function readBody(req, limit = 20 * 1024 * 1024) {
  return new Promise((resolve) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        req.destroy()
        resolve('')
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', () => resolve(''))
  })
}

/**
 * 数据目录不能依赖 Host 进程的 cwd：桌面端的 cwd 是 profile 目录，
 * 不是用户工作区。优先从 workspaceRegistry 取当前工作区，再退回 cwd。
 */
function resolveDataRoot(ctx) {
  if (process.env.STORY_LOOM_HOME) return path.resolve(process.env.STORY_LOOM_HOME)
  try {
    const registry = typeof ctx.get === 'function' ? ctx.get('workspaceRegistry') : undefined
    const list = registry && typeof registry.list === 'function' ? registry.list() : []
    if (Array.isArray(list) && list.length > 0) {
      const preferred =
        list.find((workspace) => typeof workspace.path === 'string' && /(^|\/)default-workspace$/.test(workspace.path)) ||
        list[0]
      if (preferred && typeof preferred.path === 'string' && preferred.path) {
        return path.join(preferred.path, 'story-loom')
      }
    }
  } catch (error) {
    try {
      ctx.logger?.warn?.(`[${NS}] 无法从 workspaceRegistry 解析工作区，退回 cwd：${String(error && error.message)}`)
    } catch {
      /* noop */
    }
  }
  return defaultRoot()
}

export function apply(ctx) {
  const disposers = []
  const webServer = resolveWebServer(ctx)
  if (!hasRoutes(webServer)) {
    try {
      ctx.logger?.warn?.(
        `[${NS}] 当前 profile 没有可注册路由的 webServer；织世面板需要 Web 形态的 DSH。`
      )
    } catch {
      /* 日志失败不影响加载 */
    }
    return
  }

  function rejected(req, res) {
    try {
      const conn = (typeof ctx.get === 'function' ? ctx.get('connection') : undefined) || ctx.connection
      if (!conn || typeof conn.requestRejection !== 'function') return false
      const code = conn.requestRejection(req)
      if (code === undefined || code === null || code === false) return false
      res.statusCode = typeof code === 'number' ? code : 403
      res.end()
      return true
    } catch {
      return false
    }
  }

  function register(route) {
    const inner = route.handler
    const wrapped = {
      ...route,
      handler: async (req, res) => {
        if (rejected(req, res)) return
        try {
          await inner(req, res)
        } catch (error) {
          if (res.headersSent) {
            try {
              res.end()
            } catch {
              /* noop */
            }
            return
          }
          if (error instanceof ConflictError) {
            sendJson(res, 409, { ok: false, error: 'revision-conflict', currentRevision: error.currentRevision })
            return
          }
          if (error instanceof NotFoundError) {
            sendJson(res, 404, { ok: false, error: error.message })
            return
          }
          if (error instanceof ValidationError) {
            sendJson(res, 400, { ok: false, error: error.message, details: error.details || [] })
            return
          }
          try {
            ctx.logger?.warn?.(`[${NS}] ${req.method} ${req.url}: ${error && error.stack ? error.stack : error}`)
          } catch {
            /* noop */
          }
          sendJson(res, 500, { ok: false, error: String((error && error.message) || error) })
        }
      }
    }
    disposers.push(webServer.register(wrapped))
  }

  const root = resolveDataRoot(ctx)

  register({
    kind: 'prefix',
    path: BASE,
    handler: async (req, res) => {
      const url = new URL(req.url || '/', 'http://localhost')
      let pathname
      try {
        pathname = decodeURIComponent(url.pathname)
      } catch {
        sendJson(res, 400, { ok: false, error: 'bad-path' })
        return
      }
      const method = (req.method || 'GET').toUpperCase()

      if (pathname === `${BASE}/api/health`) {
        sendJson(res, 200, { ok: true, name: NS, root, version: 1 })
        return
      }

      if (pathname === `${BASE}/api/bootstrap` && method === 'GET') {
        const boot = await bootstrap(root)
        sendJson(res, 200, {
          ok: true,
          root: boot.root,
          index: boot.index,
          activeProjectId: boot.activeProjectId
        })
        return
      }

      if (pathname === `${BASE}/api/sync/import` && method === 'POST') {
        const body = await parseJsonBody(req, 150 * 1024 * 1024)
        const bundle = body && body.bundle ? body.bundle : body
        const result = await importProjectBundle(root, bundle)
        sendJson(res, 200, { ok: true, state: result.state, index: result.index, imported: result.imported })
        return
      }

      if (pathname === `${BASE}/api/projects` && method === 'POST') {
        const body = await parseJsonBody(req)
        const state = await createProject(root, { title: body.title, template: body.template })
        const boot = await bootstrap(root)
        sendJson(res, 200, { ok: true, state, index: boot.index })
        return
      }

      const projectMatch = pathname.match(/^\/story-loom\/api\/projects\/([^/]+)(?:\/(save|activate|export|export-bundle|context|lint|backups|restore|upload))?$/)
      if (projectMatch) {
        const projectId = projectMatch[1]
        const action = projectMatch[2] || ''
        if (!projectId) {
          sendJson(res, 400, { ok: false, error: 'missing-project' })
          return
        }

        if (!action && method === 'GET') {
          const loaded = await readProject(root, projectId)
          sendJson(res, 200, {
            ok: true,
            state: loaded.state,
            warnings: loaded.warnings,
            path: loaded.path
          })
          return
        }

        if (!action && method === 'DELETE') {
          const index = await deleteProject(root, projectId)
          sendJson(res, 200, { ok: true, index })
          return
        }

        if (action === 'activate' && method === 'POST') {
          const index = await activateProject(root, projectId)
          sendJson(res, 200, { ok: true, index })
          return
        }

        if (action === 'save' && method === 'POST') {
          const body = await parseJsonBody(req)
          if (!body.state || typeof body.state !== 'object') {
            sendJson(res, 400, { ok: false, error: 'missing-state' })
            return
          }
          const state = await saveProject(root, projectId, body.state, {
            baseRevision: body.baseRevision,
            action: body.action || '保存',
            detail: body.detail || ''
          })
          sendJson(res, 200, { ok: true, state })
          return
        }

        if (action === 'export-bundle' && method === 'GET') {
          const bundle = await exportProjectBundle(root, projectId)
          sendText(res, 200, 'application/json; charset=utf-8', JSON.stringify(bundle, null, 2), {
            'Content-Disposition': `attachment; filename="${projectId}.storyloom.json"`
          })
          return
        }

        if (action === 'export' && method === 'GET') {
          const loaded = await readProject(root, projectId)
          const markdown = exportMarkdown(loaded.state, { includeLint: url.searchParams.get('lint') !== '0' })
          sendText(res, 200, 'text/markdown; charset=utf-8', markdown, {
            'Content-Disposition': `attachment; filename="story-${projectId}.md"`
          })
          return
        }

        if (action === 'context' && method === 'GET') {
          const loaded = await readProject(root, projectId)
          const chapter = url.searchParams.get('chapter') || undefined
          const format = url.searchParams.get('format') || 'md'
          if (format === 'json') {
            sendJson(res, 200, { ok: true, result: buildContext(loaded.state, { chapter }) })
            return
          }
          sendText(res, 200, 'text/markdown; charset=utf-8', contextMarkdown(loaded.state, { chapter }))
          return
        }

        if (action === 'lint' && method === 'POST') {
          const body = await parseJsonBody(req)
          let state
          if (body.state && typeof body.state === 'object') {
            state = normalizeState(body.state, { strict: false })
          } else {
            state = (await readProject(root, projectId)).state
          }
          sendJson(res, 200, { ok: true, lint: lintState(state) })
          return
        }

        if (action === 'backups' && method === 'GET') {
          const backups = await listBackups(root, projectId)
          sendJson(res, 200, { ok: true, backups })
          return
        }

        if (action === 'restore' && method === 'POST') {
          const body = await parseJsonBody(req)
          const state = await restoreBackup(root, projectId, body.revision)
          sendJson(res, 200, { ok: true, state })
          return
        }

        if (action === 'upload' && method === 'POST') {
          const body = await parseJsonBody(req)
          const media = await saveMedia(root, projectId, body)
          sendJson(res, 200, { ok: true, media })
          return
        }

        sendJson(res, 405, { ok: false, error: 'method-not-allowed' })
        return
      }

      const mediaMatch = pathname.match(/^\/story-loom\/media\/([^/]+)\/([^/]+)$/)
      if (mediaMatch && method === 'GET') {
        const file = resolveMediaFile(root, mediaMatch[1], mediaMatch[2])
        if (!file) {
          sendJson(res, 404, { ok: false, error: 'media-not-found' })
          return
        }
        let stat
        try {
          stat = await fsp.stat(file)
        } catch {
          sendJson(res, 404, { ok: false, error: 'media-not-found' })
          return
        }
        if (!stat.isFile()) {
          sendJson(res, 404, { ok: false, error: 'media-not-found' })
          return
        }
        const ext = path.extname(file).toLowerCase()
        const type = MIME[ext] || 'application/octet-stream'
        res.writeHead(200, {
          'Content-Type': type,
          'Content-Length': String(stat.size),
          'Cache-Control': 'public, max-age=3600'
        })
        fs.createReadStream(file).pipe(res)
        return
      }

      // 可选：给 Agent / 调试用的搜索接口（只读）。
      if (pathname === `${BASE}/api/search` && method === 'GET') {
        const loaded = await readProject(root, url.searchParams.get('project') || 'main')
        const results = searchEntries(loaded.state, url.searchParams.get('q') || '', {
          boardId: url.searchParams.get('board') || ''
        })
        sendJson(res, 200, {
          ok: true,
          results: results.map((item) => ({
            id: item.entry.id,
            name: item.entry.name,
            boardId: item.boardId,
            boardName: item.boardName,
            snippet: item.snippet
          }))
        })
        return
      }

      sendJson(res, 404, { ok: false, error: 'not-found' })
    }
  })

  ctx.effect(() => () => {
    for (const dispose of disposers) {
      try {
        dispose()
      } catch {
        /* noop */
      }
    }
  })
}

async function parseJsonBody(req, limit) {
  const text = await readBody(req, limit)
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    throw new ValidationError('请求体不是合法 JSON')
  }
}

export { inject, NS }
export const name = NS
