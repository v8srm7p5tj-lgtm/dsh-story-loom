/**
 * 织世 · 正典引擎
 *
 * 负责四件事：
 * 1. 归一化：把任意来源的 JSON 收敛成可保存的形状，坏数据不落盘。
 * 2. 连续性检查：断链、越阶、死人复现、伏笔逾期、时间线错位。
 * 3. 写作上下文：给某一章生成一份「必须遵守」的紧凑档案。
 * 4. 导出与搜索：Markdown 全文、跨板块检索。
 */

import { FIELD_TYPES, STORE_VERSION, VIEW_KINDS } from './schema.js'

export class ValidationError extends Error {
  constructor(message, details = []) {
    super(message)
    this.name = 'ValidationError'
    this.details = details
  }
}

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype'])
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/
const SEVERITY_ORDER = { error: 0, warn: 1, info: 2 }

export function uid(prefix = 'ent') {
  const random = Math.random().toString(36).slice(2, 9)
  return `${prefix}_${Date.now().toString(36)}${random}`
}

export function nowIso() {
  return new Date().toISOString()
}

export function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function text(value, max = 100000) {
  return typeof value === 'string' ? value.slice(0, max) : ''
}

function numeric(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function safeId(value, fallback = '') {
  const id = text(value, 64).trim()
  return ID_RE.test(id) ? id : fallback
}

function trimName(value, fallback = '未命名') {
  const name = text(value, 80).replace(/\s+/g, ' ').trim()
  return name || fallback
}

function normalizeName(value) {
  return text(value, 200).trim().toLowerCase().replace(/\s+/g, ' ')
}

function uniqueStrings(values, max = 100) {
  const out = []
  const seen = new Set()
  for (const value of Array.isArray(values) ? values : []) {
    const v = text(value, 500).trim()
    if (!v || seen.has(v)) continue
    seen.add(v)
    out.push(v)
    if (out.length >= max) break
  }
  return out
}

function sanitizeJson(value, depth = 0) {
  if (depth > 8) return null
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return typeof value === 'string' ? value.slice(0, 200000) : value
  }
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (Array.isArray(value)) {
    return value.slice(0, 500).map((item) => sanitizeJson(item, depth + 1))
  }
  if (isPlainObject(value)) {
    const out = {}
    let count = 0
    for (const [key, item] of Object.entries(value)) {
      if (DANGEROUS_KEYS.has(key)) continue
      if (key.length > 80) continue
      out[key] = sanitizeJson(item, depth + 1)
      count += 1
      if (count >= 200) break
    }
    return out
  }
  return null
}

function normalizeField(field, index, boardId, warn) {
  const raw = isPlainObject(field) ? field : {}
  const id = safeId(raw.id)
  if (!id) {
    warn(`板块 ${boardId} 的第 ${index + 1} 个字段缺少合法 id，已跳过`)
    return null
  }
  const type = FIELD_TYPES.includes(raw.type) ? raw.type : 'text'
  if (!FIELD_TYPES.includes(raw.type)) warn(`字段 ${boardId}.${id} 的类型 ${String(raw.type)} 不受支持，按文本处理`)
  const out = {
    id,
    label: text(raw.label, 60).trim() || id,
    type
  }
  if (Array.isArray(raw.options)) out.options = uniqueStrings(raw.options, 80)
  if (Array.isArray(raw.refBoards)) out.refBoards = uniqueStrings(raw.refBoards, 20)
  if (raw.required === true) out.required = true
  if (raw.hidden === true) out.hidden = true
  if (raw.help) out.help = text(raw.help, 300)
  if (raw.placeholder) out.placeholder = text(raw.placeholder, 200)
  if (raw.width === 'full' || raw.width === 'half') out.width = raw.width
  return out
}

function normalizeRelations(value, warn) {
  const out = []
  for (const rel of Array.isArray(value) ? value : []) {
    if (!isPlainObject(rel)) continue
    const targetId = safeId(rel.targetId)
    if (!targetId) continue
    out.push({
      id: safeId(rel.id) || uid('rel'),
      targetId,
      type: text(rel.type, 40).trim(),
      note: text(rel.note, 500).trim()
    })
    if (out.length >= 60) break
  }
  return out
}

function normalizeEntry(entry, boards, warn) {
  const boardId = safeId(entry && entry.boardId)
  const board = boards.get(boardId)
  if (!board) {
    warn(`条目 ${String(entry && entry.id)} 指向不存在的板块 ${String(entry && entry.boardId)}，已跳过`)
    return null
  }
  const id = safeId(entry.id)
  if (!id) {
    warn(`板块 ${boardId} 中有条目缺少合法 id，已跳过`)
    return null
  }
  const createdAt = text(entry.createdAt, 40) || nowIso()
  const updatedAt = text(entry.updatedAt, 40) || createdAt
  const fields = isPlainObject(entry.fields) ? sanitizeJson(entry.fields) : {}
  const name = trimName(entry.name, '未命名')
  return {
    id,
    boardId,
    name,
    subtitle: text(entry.subtitle, 160),
    summary: text(entry.summary, 400),
    body: text(entry.body, 400000),
    fields,
    tags: uniqueStrings(entry.tags, 24),
    locked: entry.locked === true,
    relations: normalizeRelations(entry.relations, warn),
    parentId: safeId(entry.parentId) || null,
    createdAt,
    updatedAt
  }
}

/**
 * 把任意输入收敛成可保存的 state。
 * strict 用于保存：结构错误直接拒绝，避免坏数据落盘。
 * 非 strict 用于读取：跳过坏条目并继续，尽量让用户还能打开旧文件。
 */
export function normalizeState(input, options = {}) {
  const strict = options.strict === true
  const warn = (message) => {
    if (strict) throw new ValidationError(message, [message])
    if (typeof options.onWarning === 'function') options.onWarning(message)
  }
  if (!isPlainObject(input)) throw new ValidationError('state 必须是一个对象')
  if (!isPlainObject(input.project)) throw new ValidationError('state.project 缺失')
  if (!Array.isArray(input.boards)) throw new ValidationError('state.boards 必须是数组')
  if (!Array.isArray(input.entries)) throw new ValidationError('state.entries 必须是数组')

  const boards = new Map()
  const boardList = []
  input.boards.forEach((raw, index) => {
    if (!isPlainObject(raw)) {
      warn(`第 ${index + 1} 个板块不是对象，已跳过`)
      return
    }
    const id = safeId(raw.id)
    if (!id) {
      warn(`第 ${index + 1} 个板块缺少合法 id，已跳过`)
      return
    }
    if (boards.has(id)) {
      warn(`板块 id 重复：${id}，已跳过后一个`)
      return
    }
    if (strict && !text(raw.name, 80).trim()) throw new ValidationError(`板块 ${id} 缺少名称`)
    const kind = VIEW_KINDS.includes(raw.kind) ? raw.kind : 'cards'
    const fields = []
    const fieldIds = new Set()
    for (const [fieldIndex, field] of (Array.isArray(raw.fields) ? raw.fields : []).entries()) {
      const normalized = normalizeField(field, fieldIndex, id, warn)
      if (!normalized) continue
      if (fieldIds.has(normalized.id)) {
        warn(`板块 ${id} 的字段 id 重复：${normalized.id}，已跳过`)
        continue
      }
      fieldIds.add(normalized.id)
      fields.push(normalized)
      if (fields.length >= 80) break
    }
    const board = {
      id,
      name: trimName(raw.name, '未命名板块'),
      icon: text(raw.icon, 40) || 'layers',
      group: trimName(raw.group, '未分组'),
      kind,
      order: numeric(raw.order) || index * 10 + 10,
      description: text(raw.description, 500),
      entryLabel: text(raw.entryLabel, 20) || '条目',
      singleton: raw.singleton === true,
      system: raw.system === true,
      hierarchy: raw.hierarchy === true,
      virtual: raw.virtual === true,
      fields
    }
    boards.set(id, board)
    boardList.push(board)
    if (boardList.length >= 80) warn('板块数量超过 80，已截断')
  })
  if (boards.size === 0) throw new ValidationError('至少需要一个板块')

  const entryList = []
  const entryIds = new Set()
  const singletonSeen = new Set()
  input.entries.forEach((raw, index) => {
    if (!isPlainObject(raw)) {
      warn(`第 ${index + 1} 个条目不是对象，已跳过`)
      return
    }
    const normalized = normalizeEntry(raw, boards, warn)
    if (!normalized) return
    if (entryIds.has(normalized.id)) {
      warn(`条目 id 重复：${normalized.id}，已跳过后一个`)
      return
    }
    const board = boards.get(normalized.boardId)
    if (board.virtual) {
      warn(`虚拟板块 ${board.id} 不应包含条目，已跳过 ${normalized.name}`)
      return
    }
    if (board.singleton) {
      if (singletonSeen.has(board.id)) {
        warn(`单例板块 ${board.id} 只能有一个条目，已跳过 ${normalized.name}`)
        return
      }
      singletonSeen.add(board.id)
    }
    entryIds.add(normalized.id)
    entryList.push(normalized)
    if (entryList.length >= 50000) warn('条目数量超过 50000，已截断')
  })

  const project = input.project
  const groups = []
  const groupNames = new Set()
  for (const group of Array.isArray(project.groups) ? project.groups : []) {
    const name = trimName(group && group.name, '')
    if (!name || groupNames.has(name)) continue
    groupNames.add(name)
    groups.push({ name, order: numeric(group.order) || groups.length * 10 + 10 })
  }
  for (const board of boardList) {
    if (!groupNames.has(board.group)) {
      groupNames.add(board.group)
      groups.push({ name: board.group, order: 900 + groups.length })
    }
  }
  if (groups.length === 0) groups.push({ name: '核心', order: 10 })

  const mapImage = text(project.map && project.map.image, 800)
  const map = {
    image: mapImage,
    width: numeric(project.map && project.map.width),
    height: numeric(project.map && project.map.height),
    uploadedAt: text(project.map && project.map.uploadedAt, 40)
  }

  const state = {
    schema: STORE_VERSION,
    revision: Math.max(0, Math.trunc(numeric(input.revision))),
    project: {
      id: safeId(project.id) || 'main',
      title: trimName(project.title, '未命名世界'),
      subtitle: text(project.subtitle, 200),
      author: text(project.author, 80),
      genre: text(project.genre, 120),
      logline: text(project.logline, 1200),
      createdAt: text(project.createdAt, 40) || nowIso(),
      updatedAt: text(project.updatedAt, 40) || nowIso(),
      groups,
      map
    },
    boards: boardList,
    entries: entryList,
    settings: {
      styleGuide: text(input.settings && input.settings.styleGuide, 200000),
      theme: text(input.settings && input.settings.theme, 20) || 'auto',
      density: text(input.settings && input.settings.density, 20) || 'comfortable',
      aiNotes: text(input.settings && input.settings.aiNotes, 20000)
    },
    log: []
  }

  const log = Array.isArray(input.log) ? input.log.slice(0, 500) : []
  for (const item of log) {
    if (!isPlainObject(item)) continue
    state.log.push({
      at: text(item.at, 40) || nowIso(),
      action: text(item.action, 80) || '更新',
      detail: text(item.detail, 800)
    })
  }
  if (state.log.length === 0) {
    state.log.push({ at: state.project.createdAt, action: '创建世界', detail: '织世已就绪。' })
  }
  return state
}

/* ------------------------------------------------------------------ */
/* 索引与查询                                                         */
/* ------------------------------------------------------------------ */

function indexState(state) {
  const boards = new Map(state.boards.map((board) => [board.id, board]))
  const entries = new Map(state.entries.map((entry) => [entry.id, entry]))
  const boardEntries = new Map()
  for (const entry of state.entries) {
    if (!boardEntries.has(entry.boardId)) boardEntries.set(entry.boardId, [])
    boardEntries.get(entry.boardId).push(entry)
  }
  return { boards, entries, boardEntries }
}

function fieldDef(board, fieldId) {
  return board && board.fields ? board.fields.find((field) => field.id === fieldId) : undefined
}

function fieldValue(entry, fieldId) {
  return entry && entry.fields ? entry.fields[fieldId] : undefined
}

function asRefs(value) {
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string' && item).slice(0, 100)
  if (typeof value === 'string' && value) return [value]
  return []
}

function isEmpty(value) {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (isPlainObject(value)) return Object.keys(value).length === 0
  return false
}

function clip(value, max = 900) {
  const s = text(value, max + 200).trim()
  if (s.length <= max) return s
  return `${s.slice(0, max).trimEnd()}…`
}

function chapterNumber(entry) {
  if (!entry) return null
  const raw = fieldValue(entry, 'number')
  if (raw === '' || raw === null || raw === undefined) return null
  const direct = Number(raw)
  if (Number.isFinite(direct) && direct > 0) return direct
  const match = String(raw).match(/(\d+)\s*$/)
  if (match) return Number(match[1])
  return null
}

function refName(entryMap, id) {
  const entry = entryMap.get(id)
  return entry ? entry.name : '（已删除）'
}

function refList(entryMap, ids) {
  const names = asRefs(ids).map((id) => refName(entryMap, id))
  return names.length ? names.join('、') : '—'
}

/* ------------------------------------------------------------------ */
/* 连续性检查                                                         */
/* ------------------------------------------------------------------ */

export function lintState(state) {
  const { boards, entries, boardEntries } = indexState(state)
  const issues = []
  const seen = new Set()
  const add = (issue) => {
    const key = `${issue.code}|${issue.entryId || ''}|${issue.fieldId || ''}|${issue.detail || ''}`
    if (seen.has(key)) return
    seen.add(key)
    issues.push(issue)
  }

  const overviewBoard = boards.get('overview')
  const characterBoard = boards.get('characters')
  const powerBoard = boards.get('power')
  const abilityBoard = boards.get('abilities')
  const outlineBoard = boards.get('outline')
  const timelineBoard = boards.get('timeline')
  const threadBoard = boards.get('threads')
  const chapterBoard = boards.get('chapters')
  const styleBoard = boards.get('style')

  /* 1. 名称与必填 */
  for (const board of state.boards) {
    const list = boardEntries.get(board.id) || []
    const nameMap = new Map()
    for (const entry of list) {
      const key = normalizeName(entry.name)
      if (nameMap.has(key)) {
        add({
          code: 'duplicate-name',
          severity: 'warn',
          title: '同一板块内有重名条目',
          detail: `「${entry.name}」与「${nameMap.get(key).name}」重名。引用会优先按 id，但读者与 AI 容易混淆。`,
          boardId: board.id,
          entryId: entry.id
        })
      } else {
        nameMap.set(key, entry)
      }
      if (!entry.name || entry.name === '未命名') {
        add({
          code: 'empty-name',
          severity: 'warn',
          title: '条目还没有名字',
          detail: `板块「${board.name}」中有一个未命名条目。`,
          boardId: board.id,
          entryId: entry.id
        })
      }
      for (const field of board.fields) {
        if (field.required && isEmpty(fieldValue(entry, field.id))) {
          add({
            code: 'required-field',
            severity: 'warn',
            title: '必填字段为空',
            detail: `「${entry.name}」缺少「${field.label}」。`,
            boardId: board.id,
            entryId: entry.id,
            fieldId: field.id
          })
        }
      }
    }
  }

  /* 2. 断链与引用类型 */
  const entryMap = entries
  const chapterNoById = new Map()
  if (chapterBoard) {
    for (const chapter of boardEntries.get('chapters') || []) {
      const n = chapterNumber(chapter)
      if (n !== null) chapterNoById.set(chapter.id, n)
    }
  }
  const outlineNoById = new Map()
  if (outlineBoard) {
    for (const node of boardEntries.get('outline') || []) {
      const n = chapterNumber(node)
      if (n !== null) outlineNoById.set(node.id, n)
    }
  }
  for (const entry of state.entries) {
    const board = boards.get(entry.boardId)
    if (!board) continue
    for (const field of board.fields) {
      if (field.type !== 'ref' && field.type !== 'refs') continue
      for (const targetId of asRefs(fieldValue(entry, field.id))) {
        const target = entryMap.get(targetId)
        if (!target) {
          add({
            code: 'dangling-ref',
            severity: 'error',
            title: '引用了不存在的条目',
            detail: `「${entry.name}」的「${field.label}」指向已删除的条目 ${targetId}。`,
            boardId: board.id,
            entryId: entry.id,
            fieldId: field.id
          })
          continue
        }
        if (field.refBoards && field.refBoards.length && !field.refBoards.includes(target.boardId)) {
          add({
            code: 'wrong-ref-type',
            severity: 'warn',
            title: '引用类型可能不匹配',
            detail: `「${entry.name}」的「${field.label}」引用了「${target.name}」，它属于「${boards.get(target.boardId)?.name || target.boardId}」。`,
            boardId: board.id,
            entryId: entry.id,
            fieldId: field.id
          })
        }
      }
    }
    for (const rel of entry.relations || []) {
      if (!entryMap.has(rel.targetId)) {
        add({
          code: 'dangling-relation',
          severity: 'error',
          title: '关系指向了不存在的条目',
          detail: `「${entry.name}」的关系「${rel.type || '未命名'}」指向已删除的条目 ${rel.targetId}。`,
          boardId: board.id,
          entryId: entry.id
        })
      }
    }
    if (entry.parentId) {
      const parent = entryMap.get(entry.parentId)
      if (!parent) {
        add({
          code: 'dangling-parent',
          severity: 'error',
          title: '父级条目不存在',
          detail: `「${entry.name}」的父级已被删除。`,
          boardId: board.id,
          entryId: entry.id
        })
      } else if (parent.boardId !== entry.boardId) {
        add({
          code: 'wrong-parent',
          severity: 'error',
          title: '父级不在同一板块',
          detail: `「${entry.name}」的父级「${parent.name}」属于另一个板块。`,
          boardId: board.id,
          entryId: entry.id
        })
      } else if (parent.id === entry.id) {
        add({
          code: 'self-parent',
          severity: 'error',
          title: '条目把自己设成了父级',
          detail: `「${entry.name}」的层级会形成死循环。`,
          boardId: board.id,
          entryId: entry.id
        })
      }
    }
  }

  /* 3. 大纲层级环 */
  if (outlineBoard) {
    const outlineList = boardEntries.get('outline') || []
    const byId = new Map(outlineList.map((entry) => [entry.id, entry]))
    for (const entry of outlineList) {
      const path = new Set()
      let cursor = entry
      let depth = 0
      while (cursor && cursor.parentId && depth < 55) {
        if (path.has(cursor.id)) {
          add({
            code: 'outline-cycle',
            severity: 'error',
            title: '大纲层级形成环',
            detail: `「${entry.name}」的父级链回到了自己。`,
            boardId: 'outline',
            entryId: entry.id
          })
          break
        }
        path.add(cursor.id)
        cursor = byId.get(cursor.parentId)
        depth += 1
      }
    }
  }

  /* 4. 力量体系 */
  const tierRank = new Map()
  if (powerBoard) {
    const powerList = (boardEntries.get('power') || []).slice().sort((a, b) => numeric(fieldValue(a, 'rank')) - numeric(fieldValue(b, 'rank')))
    const rankSeen = new Map()
    for (const tier of powerList) {
      const rank = Number(fieldValue(tier, 'rank'))
      if (!Number.isFinite(rank) || rank <= 0) {
        add({
          code: 'power-rank-missing',
          severity: 'warn',
          title: '境界缺少排序值',
          detail: `「${tier.name}」没有可比较的阶位序号，战力校验会跳过它。`,
          boardId: 'power',
          entryId: tier.id,
          fieldId: 'rank'
        })
        continue
      }
      tierRank.set(tier.id, rank)
      if (rankSeen.has(rank)) {
        add({
          code: 'power-rank-duplicate',
          severity: 'warn',
          title: '两个境界用了同一个阶位序号',
          detail: `「${tier.name}」与「${rankSeen.get(rank).name}」都是 ${rank}。`,
          boardId: 'power',
          entryId: tier.id,
          fieldId: 'rank'
        })
      } else {
        rankSeen.set(rank, tier)
      }
    }
  }

  if (characterBoard) {
    for (const character of boardEntries.get('characters') || []) {
      const tierId = fieldValue(character, 'tier')
      if (!tierId) {
        add({
          code: 'character-tier-missing',
          severity: 'info',
          title: '人物还没有定境界',
          detail: `「${character.name}」未绑定力量体系。涉及战斗时无法校验强弱。`,
          boardId: 'characters',
          entryId: character.id,
          fieldId: 'tier'
        })
      } else if (!tierRank.has(tierId)) {
        add({
          code: 'character-tier-invalid',
          severity: 'warn',
          title: '人物的境界无法比较',
          detail: `「${character.name}」绑定的境界没有合法阶位序号。`,
          boardId: 'characters',
          entryId: character.id,
          fieldId: 'tier'
        })
      }
      if (['死亡', '陨落', '已死亡'].includes(String(fieldValue(character, 'status') || '')) && !fieldValue(character, 'deathChapter')) {
        add({
          code: 'death-chapter-missing',
          severity: 'info',
          title: '已死亡人物缺少退场章节',
          detail: `「${character.name}」已标记死亡，但没有记录死于哪一章，后续无法检查复活/误出场。`,
          boardId: 'characters',
          entryId: character.id,
          fieldId: 'deathChapter'
        })
      }
    }
  }

  if (abilityBoard) {
    for (const ability of boardEntries.get('abilities') || []) {
      const minTierId = fieldValue(ability, 'minTier')
      const owners = asRefs(fieldValue(ability, 'owners'))
      if (!minTierId) {
        add({
          code: 'ability-tier-missing',
          severity: 'info',
          title: '能力没有标注最低境界',
          detail: `「${ability.name}」没有最低境界，战斗时无法判断谁能用。`,
          boardId: 'abilities',
          entryId: ability.id,
          fieldId: 'minTier'
        })
        continue
      }
      const minRank = tierRank.get(minTierId)
      if (minRank === undefined) continue
      for (const ownerId of owners) {
        const owner = entryMap.get(ownerId)
        if (!owner || owner.boardId !== 'characters') continue
        const ownerTierId = fieldValue(owner, 'tier')
        const ownerRank = ownerTierId ? tierRank.get(ownerTierId) : undefined
        if (ownerRank !== undefined && ownerRank < minRank) {
          add({
            code: 'power-overreach',
            severity: 'error',
            title: '越阶掌握能力',
            detail: `「${owner.name}」当前境界低于「${ability.name}」的最低境界。要么补一条破例设定，要么改能力门槛。`,
            boardId: 'abilities',
            entryId: ability.id,
            fieldId: 'owners'
          })
        }
      }
    }
  }

  /* 5. 死亡人物在后续章节复现 */
  if (characterBoard) {
    for (const character of boardEntries.get('characters') || []) {
      if (!['死亡', '陨落', '已死亡'].includes(String(fieldValue(character, 'status') || ''))) continue
      const deathId = fieldValue(character, 'deathChapter')
      const deathNo = deathId ? chapterNoById.get(deathId) : undefined
      if (deathNo === undefined) continue
      for (const chapter of boardEntries.get('chapters') || []) {
        const n = chapterNumber(chapter)
        if (n === null || n <= deathNo) continue
        if (asRefs(fieldValue(chapter, 'cast')).includes(character.id)) {
          add({
            code: 'dead-character-appears',
            severity: 'error',
            title: '已死亡人物在后续章节出现',
            detail: `「${character.name}」死于第 ${deathNo} 章，却出现在第 ${n} 章的出场人物中。若是回忆/闪回，请把本章标注为回忆。`,
            boardId: 'chapters',
            entryId: chapter.id,
            fieldId: 'cast'
          })
        }
      }
      for (const node of (outlineBoard ? boardEntries.get('outline') || [] : [])) {
        const n = chapterNumber(node)
        if (n === null || n <= deathNo) continue
        if (asRefs(fieldValue(node, 'cast')).includes(character.id)) {
          add({
            code: 'dead-character-outline',
            severity: 'warn',
            title: '大纲让已死亡人物再次出场',
            detail: `「${character.name}」死于第 ${deathNo} 章，但大纲节点「${node.name}」仍把他/她列入出场人物。`,
            boardId: 'outline',
            entryId: node.id,
            fieldId: 'cast'
          })
        }
      }
    }
  }

  /* 6. 伏笔账本 */
  const currentChapter = (() => {
    let max = 0
    if (chapterBoard) {
      for (const chapter of boardEntries.get('chapters') || []) {
        if (!['已完成', '已修订'].includes(String(fieldValue(chapter, 'status') || ''))) continue
        const n = chapterNumber(chapter)
        if (n !== null) max = Math.max(max, n)
      }
    }
    return max
  })()

  if (threadBoard) {
    for (const thread of boardEntries.get('threads') || []) {
      const status = String(fieldValue(thread, 'status') || '')
      const plantId = fieldValue(thread, 'plantChapter')
      const payoffId = fieldValue(thread, 'payoffChapter')
      const importance = String(fieldValue(thread, 'importance') || '')
      if (status === '已回收' && !payoffId) {
        add({
          code: 'thread-payoff-missing',
          severity: 'warn',
          title: '伏笔标记已回收，但没记回收章节',
          detail: `「${thread.name}」缺少回收章节，读者会不知道这个坑什么时候填的。`,
          boardId: 'threads',
          entryId: thread.id,
          fieldId: 'payoffChapter'
        })
      }
      if (status === '待回收' && !plantId) {
        add({
          code: 'thread-plant-missing',
          severity: 'warn',
          title: '伏笔待回收，但没记埋设章节',
          detail: `「${thread.name}」没有埋设章节，后续无法判断这个坑埋了多久。`,
          boardId: 'threads',
          entryId: thread.id,
          fieldId: 'plantChapter'
        })
      }
      if (status === '已埋' && !plantId) {
        add({
          code: 'thread-plant-info',
          severity: 'info',
          title: '已埋的伏笔缺少埋设章节',
          detail: `「${thread.name}」最好补上埋设章节，方便跨卷追踪。`,
          boardId: 'threads',
          entryId: thread.id,
          fieldId: 'plantChapter'
        })
      }
      if (payoffId && !['已回收', '废弃'].includes(status)) {
        const payoffNo = chapterNoById.get(payoffId) ?? (outlineBoard ? outlineNoById.get(payoffId) : undefined)
        if (payoffNo !== undefined && currentChapter > payoffNo) {
          add({
            code: 'thread-overdue',
            severity: 'warn',
            title: '伏笔已过计划回收章节',
            detail: `「${thread.name}」计划在第 ${payoffNo} 章回收，当前已写到第 ${currentChapter} 章，仍未标记回收。`,
            boardId: 'threads',
            entryId: thread.id,
            fieldId: 'payoffChapter'
          })
        }
      }
      if (['核心', '重要'].includes(importance) && !fieldValue(thread, 'truth')) {
        add({
          code: 'thread-truth-missing',
          severity: 'info',
          title: '重要伏笔还没有写真相',
          detail: `「${thread.name}」没有填「真相（作者可见）」，写到回收时容易临时改设定。`,
          boardId: 'threads',
          entryId: thread.id,
          fieldId: 'truth'
        })
      }
    }
  }

  /* 7. 大纲与章节档案 */
  if (outlineBoard) {
    const outlineList = boardEntries.get('outline') || []
    const numberSeen = new Map()
    for (const node of outlineList) {
      const number = String(fieldValue(node, 'number') || '').trim()
      if (number) {
        if (numberSeen.has(number)) {
          add({
            code: 'outline-number-duplicate',
            severity: 'error',
            title: '大纲序号重复',
            detail: `「${node.name}」与「${numberSeen.get(number).name}」都用了序号 ${number}。`,
            boardId: 'outline',
            entryId: node.id,
            fieldId: 'number'
          })
        } else {
          numberSeen.set(number, node)
        }
      }
      const level = String(fieldValue(node, 'level') || '')
      if (level === '章') {
        if (!node.parentId) {
          add({
            code: 'chapter-without-parent',
            severity: 'info',
            title: '章节点没有挂到卷/幕',
            detail: `「${node.name}」没有父级，大纲树会把它当作顶层节点。`,
            boardId: 'outline',
            entryId: node.id
          })
        } else {
          const parent = entryMap.get(node.parentId)
          if (parent && String(fieldValue(parent, 'level') || '') === '章') {
            add({
              code: 'chapter-under-chapter',
              severity: 'warn',
              title: '章节点挂在另一个章下面',
              detail: `「${node.name}」的父级也是章节点，层级可能错了。`,
              boardId: 'outline',
              entryId: node.id
            })
          }
        }
      }
      if (String(fieldValue(node, 'status') || '') === '已定稿' && !fieldValue(node, 'chapterRecord')) {
        const matchedChapter = (chapterBoard ? boardEntries.get('chapters') || [] : []).find((chapter) => fieldValue(chapter, 'outlineRef') === node.id)
        if (!matchedChapter) {
          add({
            code: 'outline-final-no-record',
            severity: 'info',
            title: '已定稿章节还没有章节档案',
            detail: `「${node.name}」已定稿，但没有对应章节档案，写作后的事实无法追踪。`,
            boardId: 'outline',
            entryId: node.id,
            fieldId: 'chapterRecord'
          })
        }
      }
    }
  }

  if (chapterBoard) {
    const chapterList = boardEntries.get('chapters') || []
    const numberSeen = new Map()
    for (const chapter of chapterList) {
      const n = chapterNumber(chapter)
      if (n === null) {
        add({
          code: 'chapter-number-missing',
          severity: 'warn',
          title: '章节档案缺少序号',
          detail: `「${chapter.name}」没有可排序的章节序号。`,
          boardId: 'chapters',
          entryId: chapter.id,
          fieldId: 'number'
        })
      } else if (numberSeen.has(n)) {
        add({
          code: 'chapter-number-duplicate',
          severity: 'error',
          title: '章节序号重复',
          detail: `「${chapter.name}」与「${numberSeen.get(n).name}」都是第 ${n} 章。`,
          boardId: 'chapters',
          entryId: chapter.id,
          fieldId: 'number'
        })
      } else {
        numberSeen.set(n, chapter)
      }
      if (!fieldValue(chapter, 'outlineRef')) {
        add({
          code: 'chapter-outline-missing',
          severity: 'info',
          title: '章节档案没有对应大纲',
          detail: `「${chapter.name}」未关联大纲节点，后续无法核对是否写偏。`,
          boardId: 'chapters',
          entryId: chapter.id,
          fieldId: 'outlineRef'
        })
      }
      if (isEmpty(fieldValue(chapter, 'events'))) {
        add({
          code: 'chapter-events-missing',
          severity: 'info',
          title: '章节档案没有记录「本章发生」',
          detail: `「${chapter.name}」缺少事实摘要，写到后文时容易忘记。`,
          boardId: 'chapters',
          entryId: chapter.id,
          fieldId: 'events'
        })
      }
    }
  }

  /* 8. 时间线 */
  if (timelineBoard) {
    const timeline = (boardEntries.get('timeline') || []).slice()
    const sortSeen = new Map()
    for (const event of timeline) {
      const sort = Number(fieldValue(event, 'sort'))
      if (!Number.isFinite(sort)) {
        add({
          code: 'timeline-sort-missing',
          severity: 'warn',
          title: '时间线事件缺少排序值',
          detail: `「${event.name}」没有数字排序值，无法放进时间轴。`,
          boardId: 'timeline',
          entryId: event.id,
          fieldId: 'sort'
        })
        continue
      }
      if (sortSeen.has(sort)) {
        add({
          code: 'timeline-sort-duplicate',
          severity: 'info',
          title: '两个事件用了同一个排序值',
          detail: `「${event.name}」与「${sortSeen.get(sort).name}」的排序值都是 ${sort}，顺序会不稳定。`,
          boardId: 'timeline',
          entryId: event.id,
          fieldId: 'sort'
        })
      } else {
        sortSeen.set(sort, event)
      }
      if (!fieldValue(event, 'era') && !fieldValue(event, 'dateLabel')) {
        add({
          code: 'timeline-date-missing',
          severity: 'info',
          title: '事件缺少时间标签',
          detail: `「${event.name}」既没有纪元也没有时间标签。`,
          boardId: 'timeline',
          entryId: event.id
        })
      }
    }
    const sorted = timeline
      .filter((event) => Number.isFinite(Number(fieldValue(event, 'sort'))))
      .sort((a, b) => Number(fieldValue(a, 'sort')) - Number(fieldValue(b, 'sort')))
    let previous = null
    for (const event of sorted) {
      const chapterId = fieldValue(event, 'chapter')
      const n = chapterId ? chapterNoById.get(chapterId) ?? (outlineBoard ? outlineNoById.get(chapterId) : undefined) : undefined
      if (n !== undefined && previous && previous.n !== undefined && n < previous.n) {
        add({
          code: 'timeline-chapter-inversion',
          severity: 'info',
          title: '时间线与章节顺序相反',
          detail: `「${event.name}」在时间上晚于「${previous.event.name}」，但关联章节更靠前。若这是倒叙/回忆，可忽略。`,
          boardId: 'timeline',
          entryId: event.id
        })
        break
      }
      previous = { event, n }
    }
  }

  /* 9. 总览与文风 */
  if (overviewBoard) {
    const overview = (boardEntries.get('overview') || [])[0]
    if (overview) {
      if (!fieldValue(overview, 'tagline')) {
        add({
          code: 'overview-tagline',
          severity: 'info',
          title: '还没有一句话故事',
          detail: '一句话故事是后续所有生成任务的锚点，建议先补上。',
          boardId: 'overview',
          entryId: overview.id,
          fieldId: 'tagline'
        })
      }
      if (!fieldValue(overview, 'coreConflict')) {
        add({
          code: 'overview-conflict',
          severity: 'warn',
          title: '还没有核心冲突',
          detail: '没有冲突，所有章节都会变成设定说明。先写清楚谁想要什么、谁在阻止。',
          boardId: 'overview',
          entryId: overview.id,
          fieldId: 'coreConflict'
        })
      }
      if (!fieldValue(overview, 'worldRules')) {
        add({
          code: 'overview-rules',
          severity: 'warn',
          title: '还没有世界法则',
          detail: '世界法则是防止 AI 写飞的第一道闸。至少写三条不可违背的规则。',
          boardId: 'overview',
          entryId: overview.id,
          fieldId: 'worldRules'
        })
      }
    }
  }

  if (styleBoard && (boardEntries.get('style') || []).length === 0) {
    add({
      code: 'style-sample-empty',
      severity: 'info',
      title: '还没有文风样本',
      detail: '把用户发来的网文范例粘贴到「文风样本」，生成时才会优先模仿其短句、节奏与爽点。',
      boardId: 'style'
    })
  }

  /* 10. 规则与禁忌 */
  const ruleBoard = boards.get('rules')
  if (ruleBoard) {
    for (const rule of boardEntries.get('rules') || []) {
      if (String(fieldValue(rule, 'force') || '') === '绝对' && !fieldValue(rule, 'consequence')) {
        add({
          code: 'rule-consequence-missing',
          severity: 'warn',
          title: '绝对规则没有写违反后果',
          detail: `「${rule.name}」被标为绝对，但没有后果，写作时容易被绕开。`,
          boardId: 'rules',
          entryId: rule.id,
          fieldId: 'consequence'
        })
      }
    }
  }

  /* 11. 正文里的 [[跨链]] */
  const nameIndex = new Map()
  for (const entry of state.entries) {
    if (!nameIndex.has(entry.name)) nameIndex.set(entry.name, entry)
  }
  for (const entry of state.entries) {
    if (!entry.body) continue
    // 代码块/行内代码里的双链只是示例，不当作真实引用。
    const linkText = entry.body
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`\n]*`/g, '')
    const matches = linkText.matchAll(/\[\[([^\]\n|]{1,80})(?:\|[^\]\n]{1,80})?\]\]/g)
    for (const match of matches) {
      const target = match[1].trim()
      if (!nameIndex.has(target)) {
        add({
          code: 'dangling-wikilink',
          severity: 'info',
          title: '正文里有指向未知条目的双链',
          detail: `「${entry.name}」的正文引用了 [[${target}]]，但没有同名条目。可以稍后补建，或改成普通文字。`,
          boardId: entry.boardId,
          entryId: entry.id
        })
      }
    }
  }

  /* 排序与评分 */
  const boardOrder = new Map(state.boards.map((board) => [board.id, board.order]))
  issues.sort((a, b) => {
    const s = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
    if (s !== 0) return s
    const bo = (boardOrder.get(a.boardId) || 0) - (boardOrder.get(b.boardId) || 0)
    if (bo !== 0) return bo
    return String(a.title).localeCompare(String(b.title), 'zh-CN')
  })
  const counts = { error: 0, warn: 0, info: 0 }
  for (const issue of issues) counts[issue.severity] = (counts[issue.severity] || 0) + 1
  const penalty = counts.error * 10 + counts.warn * 4 + counts.info
  return {
    issues,
    counts,
    score: Math.max(0, Math.min(100, 100 - penalty)),
    checkedAt: nowIso()
  }
}

/* ------------------------------------------------------------------ */
/* 写作上下文                                                         */
/* ------------------------------------------------------------------ */

function findBoard(state, id) {
  return state.boards.find((board) => board.id === id)
}

function entriesOf(state, boardId) {
  return state.entries.filter((entry) => entry.boardId === boardId)
}

function entryMapOf(state) {
  return new Map(state.entries.map((entry) => [entry.id, entry]))
}

function parseNumericChapter(value) {
  const direct = Number(value)
  if (Number.isFinite(direct) && direct > 0) return direct
  const match = String(value || '').match(/(\d+)/)
  return match ? Number(match[1]) : null
}

export function resolveChapter(state, needle) {
  const chapterBoard = findBoard(state, 'chapters')
  const outlineBoard = findBoard(state, 'outline')
  const chapters = chapterBoard ? entriesOf(state, 'chapters') : []
  const outline = outlineBoard ? entriesOf(state, 'outline') : []
  const chapterList = chapters.slice().sort((a, b) => (parseNumericChapter(fieldValue(a, 'number')) || 0) - (parseNumericChapter(fieldValue(b, 'number')) || 0))
  const outlineList = outline.slice().sort((a, b) => {
    const ao = Number(fieldValue(a, 'order')) || 0
    const bo = Number(fieldValue(b, 'order')) || 0
    return ao - bo
  })

  let chapter = null
  let outlineNode = null
  const raw = needle === undefined || needle === null ? '' : String(needle).trim()

  if (raw) {
    const byIdChapter = chapterList.find((item) => item.id === raw)
    const byIdOutline = outlineList.find((item) => item.id === raw)
    if (byIdChapter) {
      chapter = byIdChapter
      const ref = fieldValue(chapter, 'outlineRef')
      outlineNode = ref ? outlineList.find((item) => item.id === ref) || null : null
    } else if (byIdOutline) {
      outlineNode = byIdOutline
    }
    if (!chapter && !outlineNode) {
      const number = parseNumericChapter(raw)
      if (number !== null) {
        chapter = chapterList.find((item) => parseNumericChapter(fieldValue(item, 'number')) === number) || null
        if (chapter) {
          const ref = fieldValue(chapter, 'outlineRef')
          outlineNode = ref ? outlineList.find((item) => item.id === ref) || null : null
        } else {
          const chapterNode = outlineList.find(
            (item) => fieldValue(item, 'level') === '章' && parseNumericChapter(fieldValue(item, 'number')) === number
          )
          outlineNode = chapterNode || null
        }
      }
    }
    if (!chapter && !outlineNode) {
      const q = raw.toLowerCase()
      chapter = chapterList.find((item) => item.name.toLowerCase().includes(q)) || null
      if (chapter) {
        const ref = fieldValue(chapter, 'outlineRef')
        outlineNode = ref ? outlineList.find((item) => item.id === ref) || null : null
      } else {
        outlineNode = outlineList.find((item) => item.name.toLowerCase().includes(q)) || null
      }
    }
  }

  if (!chapter && !outlineNode) {
    chapter = chapterList.find((item) => fieldValue(item, 'status') === '写作中') || null
    if (chapter) {
      const ref = fieldValue(chapter, 'outlineRef')
      outlineNode = ref ? outlineList.find((item) => item.id === ref) || null : null
    }
  }

  if (!outlineNode) {
    const done = new Set(chapterList.map((item) => fieldValue(item, 'outlineRef')).filter(Boolean))
    outlineNode =
      outlineList.find(
        (item) =>
          fieldValue(item, 'level') === '章' &&
          !['已定稿', '完成'].includes(String(fieldValue(item, 'status') || '')) &&
          !done.has(item.id)
      ) || null
  }

  if (!chapter && outlineNode) {
    chapter = chapterList.find((item) => fieldValue(item, 'outlineRef') === outlineNode.id) || null
  }
  if (!outlineNode && chapter) {
    const ref = fieldValue(chapter, 'outlineRef')
    outlineNode = ref ? outlineList.find((item) => item.id === ref) || null : null
  }

  const number =
    (chapter && parseNumericChapter(fieldValue(chapter, 'number'))) ||
    (outlineNode && parseNumericChapter(fieldValue(outlineNode, 'number'))) ||
    null

  return {
    chapter,
    outline: outlineNode,
    number,
    chapters: chapterList,
    outlineNodes: outlineList
  }
}

function styleBaseline() {
  return [
    '暂无用户样本。先使用站内基线，收到范例后以「文风样本」为准：',
    '- 短句优先。一个动作一段，一个信息一段。',
    '- 口语化。少用书面连接词，人物怎么说话就怎么写。',
    '- 强情绪。少写「他很愤怒」，多写他做了什么。',
    '- 每章有目标、阻力、转折、钩子；每三章至少一次明确兑现。',
    '- 不解释设定。让规则在冲突里显形。'
  ].join('\n')
}

function fieldLine(board, entry, field, entryMap) {
  const value = fieldValue(entry, field.id)
  if (isEmpty(value)) return ''
  let rendered
  if (field.type === 'ref') rendered = refName(entryMap, value)
  else if (field.type === 'refs') rendered = refList(entryMap, value)
  else if (field.type === 'relations') {
    rendered = (Array.isArray(value) ? value : [])
      .map((rel) => `${refName(entryMap, rel.targetId)}（${rel.type || '关系'}）${rel.note ? `：${rel.note}` : ''}`)
      .join('；')
  } else if (Array.isArray(value)) rendered = value.join('、')
  else if (typeof value === 'boolean') rendered = value ? '是' : '否'
  else rendered = String(value)
  if (!rendered) return ''
  return `- ${field.label}：${clip(rendered, 600)}`
}

function entryBlock(state, entry, entryMap, opts = {}) {
  const board = findBoard(state, entry.boardId)
  if (!board) return ''
  const fields = board.fields
    .filter((field) => !field.hidden)
    .map((field) => fieldLine(board, entry, field, entryMap))
    .filter(Boolean)
  const lines = [`### ${entry.name}`]
  if (entry.subtitle) lines.push(`*${entry.subtitle}*`)
  if (entry.tags && entry.tags.length) lines.push(`标签：${entry.tags.join('、')}`)
  if (fields.length) lines.push(fields.join('\n'))
  if (entry.body) lines.push('', opts.compact ? clip(entry.body, opts.clip || 900) : entry.body)
  return lines.join('\n')
}

export function buildContext(state, options = {}) {
  const { chapter, outline, number, chapters, outlineNodes } = resolveChapter(state, options.chapter)
  const entryMap = entryMapOf(state)
  const board = (id) => findBoard(state, id)
  const overview = entriesOf(state, 'overview')[0]
  const project = state.project
  const targetName = (chapter && chapter.name) || (outline && outline.name) || '下一章'
  const targetNo = number ? `第 ${number} 章` : '未编号章节'
  const targetBoard = chapter ? board('chapters') : board('outline')

  const castIds = uniqueStrings([
    ...asRefs(chapter && fieldValue(chapter, 'cast')),
    ...asRefs(outline && fieldValue(outline, 'cast'))
  ])
  const placeIds = uniqueStrings([
    ...asRefs(chapter && fieldValue(chapter, 'places')),
    ...asRefs(outline && fieldValue(outline, 'locations'))
  ])
  let threadIds = uniqueStrings([
    ...asRefs(outline && fieldValue(outline, 'threads')),
    ...asRefs(chapter && fieldValue(chapter, 'advanceThreads')),
    ...asRefs(chapter && fieldValue(chapter, 'payoffThreads'))
  ])
  for (const thread of entriesOf(state, 'threads')) {
    const status = String(fieldValue(thread, 'status') || '')
    if (['已回收', '废弃'].includes(status)) continue
    if (outline && (fieldValue(thread, 'plantChapter') === outline.id || fieldValue(thread, 'payoffChapter') === outline.id)) {
      threadIds.push(thread.id)
    }
  }
  threadIds = uniqueStrings(threadIds)

  const previous = (chapters || [])
    .filter((item) => (parseNumericChapter(fieldValue(item, 'number')) || 0) < (number || 0))
    .slice(-3)
  const relatedChapters = (chapters || []).filter((item) => (parseNumericChapter(fieldValue(item, 'number')) || 0) <= (number || 0)).slice(-3)

  const timeline = entriesOf(state, 'timeline')
    .slice()
    .sort((a, b) => Number(fieldValue(a, 'sort')) - Number(fieldValue(b, 'sort')))
    .filter((event) => {
      const ref = fieldValue(event, 'chapter')
      if (!ref) return true
      const n = parseNumericChapter(fieldValue(entryMap.get(ref) || {}, 'number'))
      return n === null || number === null || n <= number
    })
    .slice(-8)

  const rules = entriesOf(state, 'rules')
    .slice()
    .sort((a, b) => {
      const rank = { 绝对: 0, 强: 1, 弱: 2 }
      return (rank[fieldValue(a, 'force')] ?? 3) - (rank[fieldValue(b, 'force')] ?? 3)
    })
  const power = entriesOf(state, 'power')
    .slice()
    .sort((a, b) => Number(fieldValue(a, 'rank')) - Number(fieldValue(b, 'rank')))
  const style = entriesOf(state, 'style').slice(-3)
  const openThreads = entriesOf(state, 'threads').filter((thread) => !['已回收', '废弃'].includes(String(fieldValue(thread, 'status') || '')))
  const relevantIssues = lintState(state).issues
    .filter(
      (issue) =>
        issue.entryId === (chapter && chapter.id) ||
        issue.entryId === (outline && outline.id) ||
        castIds.includes(issue.entryId) ||
        placeIds.includes(issue.entryId) ||
        threadIds.includes(issue.entryId) ||
        ['power-overreach', 'dead-character-appears', 'dead-character-outline', 'thread-overdue'].includes(issue.code)
    )
    .slice(0, 12)

  const lines = []
  lines.push(`# 《${project.title}》 · 写作上下文`)
  lines.push('')
  lines.push(`> 目标：${targetNo}「${targetName}」 · 由织世生成 · ${new Date().toLocaleString('zh-CN')}`)
  lines.push('')

  lines.push('## 一、作品坐标')
  lines.push('')
  if (project.logline) lines.push(`- 一句话故事：${project.logline}`)
  if (project.genre) lines.push(`- 题材：${project.genre}`)
  if (project.subtitle) lines.push(`- 副标题：${project.subtitle}`)
  if (overview) {
    if (fieldValue(overview, 'tone')) lines.push(`- 基调：${fieldValue(overview, 'tone')}`)
    if (fieldValue(overview, 'pov')) lines.push(`- 视角：${fieldValue(overview, 'pov')}`)
    if (fieldValue(overview, 'tense')) lines.push(`- 时态：${fieldValue(overview, 'tense')}`)
    if (fieldValue(overview, 'themes')) lines.push(`- 主题：${fieldValue(overview, 'themes')}`)
    if (fieldValue(overview, 'coreConflict')) lines.push(`- 核心冲突：${clip(fieldValue(overview, 'coreConflict'), 700)}`)
    if (fieldValue(overview, 'worldRules')) lines.push(`- 世界法则：${clip(fieldValue(overview, 'worldRules'), 900)}`)
  }
  lines.push('')

  lines.push('## 二、不可违背的正典')
  lines.push('')
  if (rules.length === 0) {
    lines.push('_尚未登记规则与禁忌。写作时不要发明不可逆的世界规则。_')
  } else {
    for (const rule of rules) {
      lines.push(
        `- [${fieldValue(rule, 'force') || '未标约束力'}] ${rule.name}` +
          (fieldValue(rule, 'consequence') ? ` —— 违反后果：${clip(fieldValue(rule, 'consequence'), 300)}` : '')
      )
      if (rule.body) lines.push(`  ${clip(rule.body, 260).replace(/\n/g, ' ')}`)
    }
  }
  lines.push('')

  lines.push('## 三、力量阶梯')
  lines.push('')
  if (power.length === 0) {
    lines.push('_尚未建立力量体系。战斗描写只写相对强弱，不要自创境界。_')
  } else {
    for (const tier of power) {
      lines.push(
        `${fieldValue(tier, 'rank') || '?'}. **${tier.name}**` +
          (fieldValue(tier, 'aliases') ? `（${fieldValue(tier, 'aliases')}）` : '') +
          (fieldValue(tier, 'power') ? `：${clip(fieldValue(tier, 'power'), 220)}` : '')
      )
    }
  }
  lines.push('')

  lines.push('## 四、本章大纲')
  lines.push('')
  if (outline) {
    if (fieldValue(outline, 'logline')) lines.push(`- 一句话梗概：${fieldValue(outline, 'logline')}`)
    if (fieldValue(outline, 'conflict')) lines.push(`- 核心冲突：${clip(fieldValue(outline, 'conflict'), 700)}`)
    if (fieldValue(outline, 'hooks')) lines.push(`- 爽点/钩子：${clip(fieldValue(outline, 'hooks'), 700)}`)
    if (fieldValue(outline, 'timePoint')) lines.push(`- 故事内时间：${fieldValue(outline, 'timePoint')}`)
    if (placeIds.length) lines.push(`- 发生地点：${refList(entryMap, placeIds)}`)
    if (outline.body) lines.push('', '### 节拍', '', clip(outline.body, 3000))
  } else {
    lines.push('_没有找到对应的大纲节点。先补大纲，不要让 AI 自由发挥一整章。_')
  }
  lines.push('')

  lines.push('## 五、出场人物')
  lines.push('')
  if (castIds.length === 0) {
    lines.push('_本章没有登记出场人物。至少确认视角人物与对手是谁。_')
  } else {
    for (const id of castIds) {
      const character = entryMap.get(id)
      if (!character) continue
      const boardChar = board('characters')
      lines.push(entryBlock(state, character, entryMap, { compact: true, clip: 700 }))
      lines.push('')
    }
  }

  lines.push('## 六、场景与空间')
  lines.push('')
  if (placeIds.length === 0) {
    lines.push('_没有登记地点。场景会缺少空间锚点。_')
  } else {
    for (const id of placeIds) {
      const place = entryMap.get(id)
      if (!place) continue
      lines.push(entryBlock(state, place, entryMap, { compact: true, clip: 500 }))
      lines.push('')
    }
  }

  lines.push('## 七、前情与连续性事实')
  lines.push('')
  if (relatedChapters.length === 0) {
    lines.push('_这是开篇或还没有章节档案。开篇必须自己建立时间、地点、人物状态。_')
  } else {
    for (const item of relatedChapters) {
      lines.push(`### 第 ${fieldValue(item, 'number') || '?'} 章 · ${item.name}`)
      if (fieldValue(item, 'timePoint')) lines.push(`- 时间：${fieldValue(item, 'timePoint')}`)
      if (fieldValue(item, 'events')) lines.push(`- 发生：${clip(fieldValue(item, 'events'), 500)}`)
      if (fieldValue(item, 'stateChanges')) lines.push(`- 状态变更：${clip(fieldValue(item, 'stateChanges'), 500)}`)
      if (fieldValue(item, 'cast')) lines.push(`- 出场：${refList(entryMap, fieldValue(item, 'cast'))}`)
      lines.push('')
    }
  }

  lines.push('## 八、伏笔账本（不可漏）')
  lines.push('')
  if (openThreads.length === 0) {
    lines.push('_当前没有未回收伏笔。本章若新挖坑，必须新建伏笔条目并写清计划回收位置。_')
  } else {
    const targetThreads = openThreads.filter((thread) => threadIds.includes(thread.id))
    const others = openThreads.filter((thread) => !threadIds.includes(thread.id)).slice(0, 10)
    const renderThread = (thread) => {
      const status = fieldValue(thread, 'status') || '待埋'
      const importance = fieldValue(thread, 'importance') || '一般'
      const plant = fieldValue(thread, 'plantChapter')
      const payoff = fieldValue(thread, 'payoffChapter')
      lines.push(`- [${status}][${importance}] **${thread.name}**`)
      if (plant) lines.push(`  - 埋设：${refName(entryMap, plant)}`)
      if (payoff) lines.push(`  - 回收：${refName(entryMap, payoff)}`)
      if (fieldValue(thread, 'plan')) lines.push(`  - 计划：${clip(fieldValue(thread, 'plan'), 200)}`)
      if (fieldValue(thread, 'known')) lines.push(`  - 读者已知：${clip(fieldValue(thread, 'known'), 300)}`)
      if (fieldValue(thread, 'truth')) lines.push(`  - 作者真相（禁止直接写进正文）：${clip(fieldValue(thread, 'truth'), 300)}`)
    }
    if (targetThreads.length) {
      lines.push('### 本章直接相关')
      for (const thread of targetThreads) renderThread(thread)
      lines.push('')
    }
    if (others.length) {
      lines.push('### 其他未回收（不要误写已解决）')
      for (const thread of others) renderThread(thread)
      lines.push('')
    }
  }

  lines.push('## 九、时间线相关事件')
  lines.push('')
  if (timeline.length === 0) {
    lines.push('_没有登记时间线事件。_')
  } else {
    for (const event of timeline) {
      lines.push(
        `- ${fieldValue(event, 'dateLabel') || fieldValue(event, 'era') || '未标时间'} · **${event.name}**` +
          (fieldValue(event, 'impact') ? `：${clip(fieldValue(event, 'impact'), 220)}` : '')
      )
    }
  }
  lines.push('')

  lines.push('## 十、文风约束')
  lines.push('')
  if (state.settings.styleGuide) {
    lines.push(clip(state.settings.styleGuide, 3000))
    lines.push('')
  }
  if (style.length) {
    for (const sample of style) {
      lines.push(`### 样本：${sample.name}`)
      if (fieldValue(sample, 'learn')) lines.push(`- 学习点：${clip(fieldValue(sample, 'learn'), 500)}`)
      if (sample.body) lines.push('', clip(sample.body, 1600))
      lines.push('')
    }
  } else {
    lines.push(styleBaseline())
    lines.push('')
  }

  lines.push('## 十一、连续性警告')
  lines.push('')
  if (relevantIssues.length === 0) {
    lines.push('_本章相关条目没有发现明显矛盾。_')
  } else {
    for (const issue of relevantIssues) {
      lines.push(`- [${issue.severity}] ${issue.title}：${issue.detail}`)
    }
  }
  lines.push('')

  lines.push('## 十二、写作要求')
  lines.push('')
  lines.push(`1. 只写「${targetName}」这一章，不提前写下一章，不跳过大纲里的关键转折。`)
  lines.push('2. 视角人物必须清楚；本章结束时，状态必须发生变化。')
  lines.push('3. 每个场景都要有目标、阻力、转折。至少一个明确的爽点或情绪爆点。')
  lines.push('4. 结尾留钩子，但不要用「欲知后事如何」式旁白。')
  lines.push('5. 不解释设定。规则通过代价、动作、对话显形。')
  lines.push('6. 不揭露「作者真相」字段里的内容，除非大纲明确要求本章揭露。')
  lines.push('7. 力量表现不得超出人物当前境界；若剧情需要越阶，必须先改设定或写清代价。')
  lines.push('8. 已死亡人物不得无解释出场；回忆/闪回必须明确标注。')
  lines.push('')
  lines.push('## 十三、写完后必须回写')
  lines.push('')
  lines.push('- 更新或新建「章节档案」：本章发生、状态变更、出场人物、地点、推进/回收的伏笔。')
  lines.push('- 新挖的坑 → 新建「伏笔」条目，状态写「已埋」，补埋设章节与计划回收。')
  lines.push('- 新的世界事实 → 写进「设定集」或「规则与禁忌」。')
  lines.push('- 新的时间节点 → 写进「时间线」。')
  lines.push('- 角色死亡/突破/关系变化 → 更新人物状态与章节档案。')
  lines.push('- 运行 `node dsh-story-loom/bin/storyctl.mjs check`，把 error 清零再交稿。')
  lines.push('')

  return {
    markdown: lines.join('\n'),
    target: {
      chapter: chapter ? { id: chapter.id, name: chapter.name, number: fieldValue(chapter, 'number') } : null,
      outline: outline ? { id: outline.id, name: outline.name, number: fieldValue(outline, 'number') } : null,
      number
    },
    castIds,
    placeIds,
    threadIds
  }
}

export function contextMarkdown(state, options = {}) {
  return buildContext(state, options).markdown
}

/* ------------------------------------------------------------------ */
/* 导出与搜索                                                         */
/* ------------------------------------------------------------------ */

export function exportMarkdown(state, options = {}) {
  const entryMap = entryMapOf(state)
  const project = state.project
  const lines = []
  lines.push(`# 《${project.title}》 · 织世设定集`)
  lines.push('')
  if (project.subtitle) lines.push(`> ${project.subtitle}`)
  if (project.author) lines.push(`> 作者：${project.author}`)
  lines.push(`> 导出时间：${new Date().toLocaleString('zh-CN')} · 修订 ${state.revision}`)
  lines.push('')
  if (project.logline) {
    lines.push('## 一句话故事')
    lines.push('')
    lines.push(project.logline)
    lines.push('')
  }

  for (const group of state.project.groups) {
    const groupBoards = state.boards.filter((board) => board.group === group.name).sort((a, b) => a.order - b.order)
    if (groupBoards.length === 0) continue
    lines.push(`# ${group.name}`)
    lines.push('')
    for (const board of groupBoards) {
      if (board.kind === 'map') {
        lines.push(`## ${board.name}`)
        lines.push('')
        lines.push(project.map.image ? `地图文件：${project.map.image}` : '_尚未上传地图。_')
        lines.push('')
        const pins = state.entries
          .filter((entry) => entry.boardId === 'locations' && Number.isFinite(Number(fieldValue(entry, 'mapX'))))
          .map((entry) => `- ${entry.name}（${fieldValue(entry, 'mapX')}%, ${fieldValue(entry, 'mapY')}%）`)
        if (pins.length) lines.push('地图标记：', '', ...pins, '')
        continue
      }
      lines.push(`## ${board.name}`)
      lines.push('')
      if (board.description) lines.push(`_${board.description}_`, '')
      const list = state.entries.filter((entry) => entry.boardId === board.id)
      if (list.length === 0) {
        lines.push('_（空）_', '')
        continue
      }
      for (const entry of list) {
        lines.push(entryBlock(state, entry, entryMap))
        lines.push('')
      }
    }
  }

  if (options.includeLint !== false) {
    const lint = lintState(state)
    lines.push('# 连续性检查')
    lines.push('')
    lines.push(`评分：${lint.score} / 100 · error ${lint.counts.error} · warn ${lint.counts.warn} · info ${lint.counts.info}`)
    lines.push('')
    if (lint.issues.length === 0) {
      lines.push('未发现问题。')
    } else {
      for (const issue of lint.issues) {
        lines.push(`- [${issue.severity}] ${issue.title}：${issue.detail}`)
      }
    }
    lines.push('')
  }
  return lines.join('\n')
}

export function searchEntries(state, query, options = {}) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return []
  const boardId = options.boardId || ''
  const entryMap = entryMapOf(state)
  const results = []
  for (const entry of state.entries) {
    if (boardId && entry.boardId !== boardId) continue
    const board = state.boards.find((item) => item.id === entry.boardId)
    if (!board) continue
    let score = 0
    const name = entry.name.toLowerCase()
    if (name === q) score += 200
    else if (name.startsWith(q)) score += 120
    else if (name.includes(q)) score += 80
    if (entry.subtitle.toLowerCase().includes(q)) score += 40
    if (entry.tags.some((tag) => tag.toLowerCase().includes(q))) score += 35
    let snippet = ''
    const fieldTexts = []
    for (const field of board.fields) {
      const value = fieldValue(entry, field.id)
      if (value === undefined || value === null) continue
      const rendered = Array.isArray(value) ? value.join(' ') : typeof value === 'object' ? '' : String(value)
      if (rendered) fieldTexts.push(`${field.label}：${rendered}`)
    }
    const fieldBlob = fieldTexts.join('\n')
    if (fieldBlob.toLowerCase().includes(q)) {
      score += 25
      const idx = fieldBlob.toLowerCase().indexOf(q)
      snippet = clip(fieldBlob.slice(Math.max(0, idx - 40), idx + 120), 180)
    }
    if (entry.body.toLowerCase().includes(q)) {
      score += 15
      const idx = entry.body.toLowerCase().indexOf(q)
      if (!snippet) snippet = clip(entry.body.slice(Math.max(0, idx - 50), idx + 150), 200)
    }
    if (score > 0) {
      results.push({
        entry,
        boardName: board.name,
        boardId: board.id,
        score,
        snippet: snippet || clip(entry.summary || entry.body || fieldTexts[0] || '', 160)
      })
    }
  }
  results.sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name, 'zh-CN'))
  return results.slice(0, 60)
}
