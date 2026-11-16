#!/usr/bin/env node
/**
 * storyctl — 织世的命令行入口。
 *
 * AI 写作时优先走这里，而不是直接改 story.json：
 *   node dsh-story-loom/bin/storyctl.mjs context --chapter 1
 *   node dsh-story-loom/bin/storyctl.mjs check
 *   node dsh-story-loom/bin/storyctl.mjs update 沈雾 --field status=重伤
 *
 * 所有写操作都走和 UI 相同的 store 层：乐观锁、原子写、备份。
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'
import {
  bootstrap,
  readProject,
  saveProject,
  activateProject,
  listBackups,
  defaultRoot,
  ConflictError,
  NotFoundError,
  projectFile
} from '../lib/store.js'
import { scanHooks, textStats } from '../lib/extract.js'
import {
  buildContext,
  contextMarkdown,
  exportMarkdown,
  lintState,
  searchEntries,
  normalizeState,
  ValidationError
} from '../lib/canon.js'

const OPTIONS = {
  project: { type: 'string', short: 'p' },
  root: { type: 'string' },
  title: { type: 'string' },
  subtitle: { type: 'string' },
  genre: { type: 'string' },
  logline: { type: 'string' },
  chapter: { type: 'string', short: 'c' },
  json: { type: 'boolean' },
  board: { type: 'string', short: 'b' },
  body: { type: 'string' },
  field: { type: 'string', multiple: true, short: 'f' },
  tag: { type: 'string', multiple: true, short: 't' },
  name: { type: 'string' },
  parent: { type: 'string' },
  lock: { type: 'boolean' },
  unlock: { type: 'boolean' },
  status: { type: 'string' },
  plant: { type: 'string' },
  payoff: { type: 'string' },
  plan: { type: 'string' },
  out: { type: 'string', short: 'o' },
  outline: { type: 'string' },
  limit: { type: 'string' },
  lint: { type: 'boolean' },
  strict: { type: 'boolean' },
  help: { type: 'boolean', short: 'h' }
}

function usage() {
  return `织世 · storyctl

用法：
  node dsh-story-loom/bin/storyctl.mjs <命令> [参数]

命令：
  project                      查看/修改当前世界的基本信息
  path                         打印数据目录与当前项目文件
  projects                     列出所有世界
  use <项目 id>                 切换当前世界
  boards                       列出板块与字段
  context [--chapter 1|章节id]  生成某一章的写作上下文（Markdown）
  search <关键词> [--board id]  跨板块搜索
  show <条目 id|名称>           查看一个条目
  check [--json] [--strict]     连续性检查；--strict 时遇到 error 退出 1
  add <板块 id> <名称>          新建条目
  update <条目 id|名称>         修改条目
  thread <条目 id|名称>         快捷修改伏笔状态
  scan <文件|-> [--limit 30]    从正文里粗筛「值得复核的坑」，不改数据
  ingest <文件> --chapter N     把正文写进章节档案，并打印候选坑
  export [--out 文件]           导出完整设定集 Markdown
  backups                      列出备份

通用参数：
  --project <id>               指定世界，默认用 index.json 里的当前世界
  --root <目录>                数据目录，默认 ./story-loom
  --json                       以 JSON 输出（context/check 支持）

字段写法：
  --field status=重伤
  --field owners=沈雾,顾临
  --body @draft.md
`
}

async function main() {
  let parsed
  try {
    parsed = parseArgs({
      args: process.argv.slice(2),
      options: OPTIONS,
      allowPositionals: true,
      strict: false
    })
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
  const { values, positionals } = parsed
  if (values.help || positionals.length === 0) {
    console.log(usage())
    return
  }
  const root = path.resolve(values.root || defaultRoot())
  const command = positionals[0]
  const args = positionals.slice(1)

  const boot = await bootstrap(root)
  let projectId = values.project || boot.activeProjectId || 'main'
  if (values.project) {
    const exists = boot.index.projects.some((item) => item.id === projectId)
    if (!exists) throw new Error(`项目不存在：${projectId}`)
  }

  if (command === 'project') {
    const patch = {}
    for (const key of ['title', 'subtitle', 'genre', 'logline']) {
      if (values[key] !== undefined) patch[key] = values[key]
    }
    if (Object.keys(patch).length === 0) {
      printJson({ project: state.project })
      return
    }
    Object.assign(state.project, patch)
    state.project.updatedAt = new Date().toISOString()
    state.log.push({ at: new Date().toISOString(), action: '更新世界信息', detail: Object.keys(patch).join('、') })
    await saveWithRetry(root, projectId, state, '更新世界信息')
    printJson({ project: state.project })
    return
  }

  if (command === 'path') {
    printJson({ root, projectId, file: projectFile(root, projectId), projects: boot.index.projects })
    return
  }
  if (command === 'projects') {
    for (const project of boot.index.projects) {
      const marker = project.id === boot.index.activeProjectId ? '*' : ' '
      console.log(`${marker} ${project.id.padEnd(18)} ${project.title}  (${project.updatedAt.slice(0, 10)})`)
    }
    return
  }
  if (command === 'use') {
    const id = args[0]
    if (!id) throw new Error('用法：use <项目 id>')
    const index = await activateProject(root, id)
    console.log(`当前世界：${index.activeProjectId}`)
    return
  }
  if (command === 'init') {
    console.log(`已就绪：${root}`)
    return
  }

  const loaded = await readProject(root, projectId)
  const state = loaded.state

  if (command === 'boards') {
    for (const board of state.boards) {
      console.log(`${board.id.padEnd(14)} ${board.name}  [${board.kind}]  字段：${board.fields.map((f) => f.id).join(', ') || '—'}`)
    }
    return
  }

  if (command === 'context') {
    const result = buildContext(state, { chapter: values.chapter })
    if (values.json) printJson(result)
    else console.log(result.markdown)
    return
  }

  if (command === 'search') {
    const query = args.join(' ')
    if (!query) throw new Error('用法：search <关键词>')
    const results = searchEntries(state, query, { boardId: values.board })
    if (values.json) {
      printJson(results.map((item) => ({
        id: item.entry.id,
        name: item.entry.name,
        board: item.boardName,
        snippet: item.snippet
      })))
      return
    }
    if (results.length === 0) {
      console.log('没有结果。')
      return
    }
    for (const item of results) {
      console.log(`- [${item.boardName}] ${item.entry.name}  (${item.entry.id})`)
      if (item.snippet) console.log(`  ${item.snippet.replace(/\n/g, ' ')}`)
    }
    return
  }

  if (command === 'show') {
    const query = args.join(' ')
    const entry = resolveEntry(state, query)
    if (!entry) throw new Error(`找不到条目：${query}`)
    printEntry(state, entry)
    return
  }

  if (command === 'check' || command === 'lint') {
    const result = lintState(state)
    if (values.json) {
      printJson(result)
    } else {
      console.log(`连续性评分：${result.score}/100 · error ${result.counts.error} · warn ${result.counts.warn} · info ${result.counts.info}`)
      for (const issue of result.issues) {
        console.log(`- [${issue.severity}] ${issue.title}：${issue.detail}`)
      }
      if (result.issues.length === 0) console.log('未发现问题。')
    }
    if (values.strict && result.counts.error > 0) process.exit(1)
    return
  }

  if (command === 'scan') {
    const source = args.join(' ')
    if (!source) throw new Error('用法：scan <文件|-> 或 scan <章节名>')
    let text = ''
    if (source === '-') {
      text = await readStdin()
    } else {
      const existing = resolveEntry(state, source)
      if (existing && existing.boardId === 'chapters') {
        text = existing.body || ''
      } else {
        text = await fs.readFile(source, 'utf8')
      }
    }
    const candidates = scanHooks(text, { limit: values.limit })
    if (values.json) {
      printJson({ stats: textStats(text), candidates })
      return
    }
    console.log(`正文：${textStats(text).cjkWords} 字 · 候选坑 ${candidates.length} 条`)
    for (const item of candidates) {
      console.log(`- L${item.line} [${item.score}] ${item.text}`)
      console.log(`  命中：${item.reasons.join(' / ')}`)
    }
    console.log('\n以上只是候选。真正登记为伏笔前，先判断它是否会被后文兑现。')
    return
  }

  if (command === 'ingest') {
    const file = args[0]
    const number = Number(values.chapter)
    if (!file || !Number.isFinite(number) || number <= 0) throw new Error('用法：ingest <文件> --chapter N [--name 标题]')
    const text = await fs.readFile(file, 'utf8')
    const stats = textStats(text)
    const board = state.boards.find((item) => item.id === 'chapters')
    if (!board) throw new Error('当前世界没有「章节档案」板块')
    let entry = state.entries.find((item) => item.boardId === 'chapters' && Number(item.fields.number) === number)
    const firstLine = (text.split(/\r?\n/).find((line) => line.trim()) || '').trim()
    const titleMatch = firstLine.match(/^第[一二三四五六七八九十百千0-9]+章[\s·、.．-]*(.*)$/)
    const name = values.name || (titleMatch && titleMatch[1] ? `第 ${number} 章 · ${titleMatch[1]}` : `第 ${number} 章`)
    if (!entry) {
      entry = {
        id: `ent_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
        boardId: 'chapters',
        name,
        subtitle: '',
        summary: '',
        body: text,
        fields: {
          number,
          status: values.status || '已完成',
          wordCount: stats.cjkWords,
          cast: [],
          places: [],
          events: '',
          stateChanges: '',
          newLore: [],
          advanceThreads: [],
          payoffThreads: []
        },
        tags: [],
        locked: false,
        relations: [],
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      if (values.outline) entry.fields.outlineRef = resolveChapterRef(state, values.outline)
      state.entries.push(entry)
    } else {
      entry.name = name
      entry.body = text
      entry.fields = { ...(entry.fields || {}), number, status: values.status || entry.fields.status || '已完成', wordCount: stats.cjkWords }
      if (values.outline) entry.fields.outlineRef = resolveChapterRef(state, values.outline)
      entry.updatedAt = new Date().toISOString()
    }
    state.log.push({ at: new Date().toISOString(), action: '导入正文', detail: `第 ${number} 章 · ${stats.cjkWords} 字` })
    await saveWithRetry(root, projectId, state, `导入第 ${number} 章`)
    const candidates = scanHooks(text, { limit: values.limit })
    printJson({ ok: true, chapterId: entry.id, number, name, stats, candidates })
    return
  }

  if (command === 'backups') {
    const backups = await listBackups(root, projectId)
    if (backups.length === 0) {
      console.log('还没有备份。')
      return
    }
    for (const backup of backups) {
      console.log(`rev-${backup.revision}  ${backup.at.slice(0, 19)}  ${Math.round(backup.size / 1024)} KB`)
    }
    return
  }

  if (command === 'export') {
    const markdown = exportMarkdown(state, { includeLint: values.lint !== false })
    const out =
      values.out ||
      path.join(root, 'exports', `story-${projectId}-${new Date().toISOString().slice(0, 10)}.md`)
    await fs.mkdir(path.dirname(out), { recursive: true })
    await fs.writeFile(out, markdown, 'utf8')
    console.log(`已导出：${out}`)
    return
  }

  if (command === 'add') {
    const boardId = args[0]
    const name = args.slice(1).join(' ')
    if (!boardId || !name) throw new Error('用法：add <板块 id> <名称>')
    const board = state.boards.find((item) => item.id === boardId)
    if (!board) throw new Error(`板块不存在：${boardId}。先运行 boards 查看。`)
    const body = await readBodyOption(values.body)
    const fields = buildFields(state, board, values.field || [])
    const entry = {
      id: `ent_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
      boardId,
      name,
      subtitle: '',
      summary: '',
      body,
      fields,
      tags: values.tag || [],
      locked: values.lock === true,
      relations: [],
      parentId: values.parent ? resolveEntry(state, values.parent)?.id || values.parent : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    state.entries.push(entry)
    state.log.push({ at: new Date().toISOString(), action: '新增条目', detail: `[${board.name}] ${name}` })
    const saved = await saveWithRetry(root, projectId, state, `新增 ${name}`)
    console.log(`已新增：${saved.entries.find((item) => item.id === entry.id)?.id || entry.id}`)
    return
  }

  if (command === 'update') {
    const query = args[0]
    if (!query) throw new Error('用法：update <条目 id|名称> [--field k=v] [--body ...]')
    const entry = resolveEntry(state, query)
    if (!entry) throw new Error(`找不到条目：${query}`)
    const board = state.boards.find((item) => item.id === entry.boardId)
    if (values.name !== undefined) entry.name = values.name
    if (values.body !== undefined) entry.body = await readBodyOption(values.body)
    if (values.parent !== undefined) {
      const parent = values.parent ? resolveEntry(state, values.parent) : null
      entry.parentId = parent ? parent.id : null
    }
    if (values.lock) entry.locked = true
    if (values.unlock) entry.locked = false
    if (values.tag && values.tag.length) entry.tags = Array.from(new Set([...(entry.tags || []), ...values.tag]))
    if (values.field && values.field.length) {
      const patch = buildFields(state, board, values.field)
      entry.fields = { ...(entry.fields || {}), ...patch }
    }
    entry.updatedAt = new Date().toISOString()
    state.log.push({ at: new Date().toISOString(), action: '修改条目', detail: `[${board.name}] ${entry.name}` })
    await saveWithRetry(root, projectId, state, `修改 ${entry.name}`)
    console.log(`已更新：${entry.id}`)
    return
  }

  if (command === 'thread') {
    const query = args.join(' ')
    if (!query) throw new Error('用法：thread <条目 id|名称> --status 已回收')
    const entry = resolveEntry(state, query)
    if (!entry || entry.boardId !== 'threads') throw new Error(`不是伏笔条目：${query}`)
    const board = state.boards.find((item) => item.id === 'threads')
    if (values.status) entry.fields.status = values.status
    if (values.plant) entry.fields.plantChapter = resolveChapterRef(state, values.plant)
    if (values.payoff) entry.fields.payoffChapter = resolveChapterRef(state, values.payoff)
    if (values.plan) entry.fields.plan = values.plan
    entry.updatedAt = new Date().toISOString()
    state.log.push({ at: new Date().toISOString(), action: '更新伏笔', detail: `${entry.name} → ${entry.fields.status || '?'}` })
    await saveWithRetry(root, projectId, state, `更新伏笔 ${entry.name}`)
    console.log(`已更新伏笔：${entry.name}  ${entry.fields.status || ''}`)
    return
  }

  throw new Error(`未知命令：${command}\n\n${usage()}`)
}

function printJson(value) {
  console.log(JSON.stringify(value, null, 2))
}

function resolveEntry(state, query) {
  const q = String(query || '').trim()
  if (!q) return null
  return (
    state.entries.find((entry) => entry.id === q) ||
    state.entries.find((entry) => entry.name === q) ||
    state.entries.find((entry) => entry.name.includes(q)) ||
    null
  )
}

function resolveChapterRef(state, query) {
  const entry = resolveEntry(state, query)
  if (entry && (entry.boardId === 'outline' || entry.boardId === 'chapters')) return entry.id
  const number = Number(String(query).match(/\d+/)?.[0])
  if (Number.isFinite(number)) {
    const chapter = state.entries.find((item) => item.boardId === 'chapters' && Number(item.fields.number) === number)
    if (chapter) return chapter.id
    const outline = state.entries.find((item) => item.boardId === 'outline' && String(item.fields.number || '').endsWith(String(number).padStart(2, '0')))
    if (outline) return outline.id
  }
  return String(query)
}

function printEntry(state, entry) {
  const board = state.boards.find((item) => item.id === entry.boardId)
  console.log(`# ${entry.name}`)
  console.log(`板块：${board?.name || entry.boardId}  id：${entry.id}`)
  if (entry.tags?.length) console.log(`标签：${entry.tags.join('、')}`)
  console.log('')
  const byId = new Map(state.entries.map((item) => [item.id, item]))
  for (const field of board?.fields || []) {
    const value = entry.fields?.[field.id]
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) continue
    let rendered
    if (field.type === 'ref') rendered = byId.get(value)?.name || value
    else if (field.type === 'refs') rendered = (value || []).map((id) => byId.get(id)?.name || id).join('、')
    else if (Array.isArray(value)) rendered = value.join('、')
    else if (typeof value === 'object') rendered = JSON.stringify(value)
    else rendered = String(value)
    console.log(`- ${field.label}：${rendered}`)
  }
  if (entry.body) {
    console.log('')
    console.log(entry.body)
  }
}

function readStdin() {
  return new Promise((resolve) => {
    let data = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => { data += chunk })
    process.stdin.on('end', () => resolve(data))
    process.stdin.on('error', () => resolve(data))
  })
}

async function readBodyOption(value) {
  if (value === undefined) return ''
  if (value.startsWith('@')) return fs.readFile(value.slice(1), 'utf8')
  return value
}

function buildFields(state, board, pairs) {
  const fields = {}
  const byName = new Map(state.entries.map((entry) => [entry.name, entry]))
  for (const pair of pairs) {
    const idx = pair.indexOf('=')
    if (idx < 0) throw new Error(`字段写法应为 key=value：${pair}`)
    const key = pair.slice(0, idx).trim()
    const raw = pair.slice(idx + 1)
    const def = board.fields.find((field) => field.id === key || field.label === key)
    if (!def) throw new Error(`板块「${board.name}」没有字段：${key}`)
    if (def.type === 'number' || def.type === 'rating') {
      fields[def.id] = Number(raw)
    } else if (def.type === 'checkbox') {
      fields[def.id] = raw === 'true' || raw === '1' || raw === '是'
    } else if (def.type === 'ref') {
      const target = byName.get(raw) || state.entries.find((entry) => entry.id === raw)
      fields[def.id] = target ? target.id : raw
    } else if (def.type === 'refs') {
      const ids = raw
        .split(/[,，、]/)
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => byName.get(item)?.id || state.entries.find((entry) => entry.id === item)?.id || item)
      fields[def.id] = ids
    } else if (def.type === 'tags') {
      fields[def.id] = raw.split(/[,，、]/).map((item) => item.trim()).filter(Boolean)
    } else if (def.type === 'relations') {
      fields[def.id] = JSON.parse(raw)
    } else {
      fields[def.id] = raw
    }
  }
  return fields
}

async function saveWithRetry(root, projectId, state, action) {
  try {
    return await saveProject(root, projectId, state, {
      baseRevision: state.revision,
      action,
      detail: '由 storyctl 写入'
    })
  } catch (error) {
    if (error instanceof ConflictError) {
      throw new Error(`保存冲突：磁盘上的修订已变为 ${error.currentRevision}。请重新读取后再试。`)
    }
    throw error
  }
}

main().catch((error) => {
  if (error instanceof ValidationError) {
    console.error(`数据校验失败：${error.message}`)
  } else if (error instanceof NotFoundError) {
    console.error(`找不到：${error.message}`)
  } else {
    console.error(error && error.stack ? error.stack : String(error))
  }
  process.exit(1)
})
