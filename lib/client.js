/* dsh-story-loom · 织世 · built 2026-11-17T01:12:18.116Z */
window.__ModuleLoader__.load({
  id: "dsh-story-loom",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    var react = require("react");
    var reactDom = require("react-dom");
    var h = react.createElement;
    var Fragment = react.Fragment;
    var useState = react.useState;
    var useEffect = react.useEffect;
    var useLayoutEffect = react.useLayoutEffect;
    var useMemo = react.useMemo;
    var useCallback = react.useCallback;
    var useRef = react.useRef;

/* ---- 00-base.js ---- */
/* 织世 · 基础层：常量、图标、通用工具 */

var TAB_ID = 'dsh-story-loom'
var TAB_KIND = 'story-loom'
var API_BASE = '/story-loom/api'
var MEDIA_BASE = '/story-loom/media'
var STYLE_ID = 'dsh-story-loom-style'
var LS_LAST = 'dsh-story-loom:last'
var DASHBOARD = '__dashboard'

var BOARD_ICONS = ['compass', 'book', 'scale', 'user', 'flag', 'pin', 'map', 'bolt', 'spark', 'branch', 'clock', 'thread', 'scroll', 'quill', 'quote', 'note', 'paw', 'layers', 'gem', 'mask', 'key', 'crown', 'ship', 'moon', 'sun', 'flame', 'drop', 'mountain', 'tree', 'eye']
var VIEW_LABELS = {
  overview: '总览',
  cards: '卡片',
  list: '清单',
  timeline: '时间线',
  power: '阶梯',
  outline: '大纲树',
  threads: '线索板',
  map: '地图',
  notes: '便签',
  codex: '图鉴'
}
var FIELD_TYPE_LABELS = {
  text: '单行文本',
  textarea: '多行文本',
  number: '数字',
  select: '单选',
  ref: '关联一个条目',
  refs: '关联多个条目',
  relations: '人物关系',
  tags: '标签',
  date: '日期',
  checkbox: '是/否',
  rating: '评分'
}

function clone(value) {
  try {
    return structuredClone(value)
  } catch (err) {
    return JSON.parse(JSON.stringify(value))
  }
}

function uid(prefix) {
  return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function cx() {
  var out = []
  for (var i = 0; i < arguments.length; i += 1) {
    var value = arguments[i]
    if (!value) continue
    if (typeof value === 'string') out.push(value)
    else if (Array.isArray(value)) out.push(cx.apply(null, value))
    else if (typeof value === 'object') {
      for (var key in value) if (value[key]) out.push(key)
    }
  }
  return out.join(' ')
}

function nf(value) {
  var n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('zh-CN')
}

function formatDate(value, withTime) {
  if (!value) return ''
  var d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  var pad = function (n) { return String(n).padStart(2, '0') }
  var base = d.getFullYear() + '.' + pad(d.getMonth() + 1) + '.' + pad(d.getDate())
  return withTime ? base + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) : base
}

function relativeTime(value) {
  if (!value) return ''
  var d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  var diff = Date.now() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小时前'
  if (diff < 86400000 * 30) return Math.floor(diff / 86400000) + ' 天前'
  return formatDate(value)
}

function clipText(value, max) {
  var s = String(value || '').replace(/\s+/g, ' ').trim()
  if (s.length <= max) return s
  return s.slice(0, max).trimEnd() + '…'
}

function stripMarkdown(value) {
  return String(value || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, function (_, a, b) { return b || a })
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function safeUrl(url) {
  var s = String(url || '').trim()
  if (/^(https?:|mailto:|\/)/i.test(s)) return s
  return ''
}

function renderInline(text) {
  var out = escapeHtml(text)
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>')
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
  out = out.replace(/\[\[([^\]\n|]+)(?:\|([^\]\n]+))?\]\]/g, function (_, name, label) {
    return '<span class="sl-wikilink" data-wikilink="' + escapeHtml(name.trim()) + '">' + escapeHtml((label || name).trim()) + '</span>'
  })
  out = out.replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, function (_, label, url) {
    var safe = safeUrl(url)
    if (!safe) return label
    return '<a href="' + escapeHtml(safe) + '" target="_blank" rel="noreferrer">' + label + '</a>'
  })
  return out
}

function renderMarkdown(markdown) {
  var src = String(markdown || '').replace(/\r\n/g, '\n')
  if (!src.trim()) return '<p class="sl-md-empty">还没有正文。</p>'
  var lines = src.split('\n')
  var html = []
  var listType = ''
  var inCode = false
  var codeLines = []
  var paragraph = []

  function flushParagraph() {
    if (!paragraph.length) return
    html.push('<p>' + paragraph.map(renderInline).join('<br/>') + '</p>')
    paragraph = []
  }
  function closeList() {
    if (listType) {
      html.push('</' + listType + '>')
      listType = ''
    }
  }
  for (var i = 0; i < lines.length; i += 1) {
    var line = lines[i]
    if (/^```/.test(line.trim())) {
      flushParagraph()
      closeList()
      if (inCode) {
        html.push('<pre><code>' + escapeHtml(codeLines.join('\n')) + '</code></pre>')
        codeLines = []
        inCode = false
      } else {
        inCode = true
      }
      continue
    }
    if (inCode) {
      codeLines.push(line)
      continue
    }
    if (!line.trim()) {
      flushParagraph()
      closeList()
      continue
    }
    var heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      flushParagraph()
      closeList()
      var level = Math.min(6, heading[1].length)
      html.push('<h' + level + '>' + renderInline(heading[2]) + '</h' + level + '>')
      continue
    }
    if (/^\s*(---|\*\*\*)\s*$/.test(line)) {
      flushParagraph()
      closeList()
      html.push('<hr/>')
      continue
    }
    if (/^>\s?/.test(line)) {
      flushParagraph()
      closeList()
      html.push('<blockquote>' + renderInline(line.replace(/^>\s?/, '')) + '</blockquote>')
      continue
    }
    var ordered = line.match(/^\s*\d+[.)]\s+(.*)$/)
    var unordered = line.match(/^\s*[-*+]\s+(.*)$/)
    if (ordered || unordered) {
      flushParagraph()
      var nextType = ordered ? 'ol' : 'ul'
      if (listType !== nextType) {
        closeList()
        html.push('<' + nextType + '>')
        listType = nextType
      }
      html.push('<li>' + renderInline((ordered || unordered)[1]) + '</li>')
      continue
    }
    paragraph.push(line)
  }
  if (inCode) html.push('<pre><code>' + escapeHtml(codeLines.join('\n')) + '</code></pre>')
  flushParagraph()
  closeList()
  return html.join('\n')
}

function statusTone(status) {
  var s = String(status || '')
  if (['已完成', '已修订', '已回收', '存活', '已定稿', '安全', '无害', '已归档'].indexOf(s) >= 0) return 'jade'
  if (['死亡', '陨落', '已死亡', '待回收', '高危', '灭城', '禁区', 'error'].indexOf(s) >= 0) return 'red'
  if (['推进中', '写作中', '草稿', '中危', '重要', '进行中'].indexOf(s) >= 0) return 'gold'
  if (['已埋', '待埋', '构思', '大纲', '未写', '低危', '收件箱', '一般'].indexOf(s) >= 0) return 'blue'
  return 'gray'
}

function refId(value) {
  if (Array.isArray(value)) return value[0] || ''
  return typeof value === 'string' ? value : ''
}

function refIds(value) {
  if (Array.isArray(value)) return value.filter(function (item) { return typeof item === 'string' && item })
  if (typeof value === 'string' && value) return [value]
  return []
}

function fieldValue(entry, fieldId) {
  return entry && entry.fields ? entry.fields[fieldId] : undefined
}

function entryMap(state) {
  var map = {}
  ;(state.entries || []).forEach(function (entry) { map[entry.id] = entry })
  return map
}

function boardMap(state) {
  var map = {}
  ;(state.boards || []).forEach(function (board) { map[board.id] = board })
  return map
}

function boardOf(state, id) {
  return (state.boards || []).find(function (board) { return board.id === id })
}

function entriesOf(state, boardId) {
  return (state.entries || []).filter(function (entry) { return entry.boardId === boardId })
}

function refName(map, id) {
  var entry = map[id]
  return entry ? entry.name : '（已删除）'
}

function refNames(map, value) {
  return refIds(value).map(function (id) { return refName(map, id) })
}

function entryInitial(name) {
  var s = String(name || '?').trim()
  return s ? s.slice(0, 1) : '?'
}

function groupBoards(state) {
  var groups = (state.project.groups || []).slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0) })
  return groups.map(function (group) {
    return {
      name: group.name,
      boards: (state.boards || [])
        .filter(function (board) { return board.group === group.name })
        .sort(function (a, b) { return (a.order || 0) - (b.order || 0) })
    }
  }).filter(function (group) { return group.boards.length > 0 })
}

function fieldTypeLabel(type) {
  return FIELD_TYPE_LABELS[type] || type
}

function calcStats(state, lint) {
  var chapters = entriesOf(state, 'chapters')
  var written = chapters.filter(function (entry) {
    return ['已完成', '已修订'].indexOf(String(fieldValue(entry, 'status') || '')) >= 0
  })
  var threads = entriesOf(state, 'threads')
  var openThreads = threads.filter(function (entry) {
    return ['已回收', '废弃'].indexOf(String(fieldValue(entry, 'status') || '')) < 0
  })
  var words = 0
  chapters.forEach(function (entry) {
    var n = Number(fieldValue(entry, 'wordCount'))
    if (Number.isFinite(n)) words += n
  })
  var characters = entriesOf(state, 'characters')
  var castAlive = characters.filter(function (entry) {
    return String(fieldValue(entry, 'status') || '存活') !== '死亡'
  })
  return {
    entries: state.entries.length,
    boards: state.boards.length,
    chapters: written.length,
    words: words,
    openThreads: openThreads.length,
    characters: characters.length,
    castAlive: castAlive.length,
    score: lint ? lint.score : null,
    errors: lint ? lint.counts.error : 0,
    warnings: lint ? lint.counts.warn : 0
  }
}

function defaultEntryName(board) {
  return '未命名' + (board.entryLabel === '条目' ? '条目' : board.entryLabel)
}

function makeEntry(state, boardId, extra) {
  var board = boardOf(state, boardId)
  var now = new Date().toISOString()
  var fields = {}
  if (board && board.fields) {
    board.fields.forEach(function (field) {
      if (field.type === 'select' && field.options && field.options.length) fields[field.id] = field.options[0]
      else if (field.type === 'number' || field.type === 'rating') fields[field.id] = 0
      else if (field.type === 'refs' || field.type === 'tags') fields[field.id] = []
      else if (field.type === 'relations') fields[field.id] = []
      else if (field.type === 'checkbox') fields[field.id] = false
      else fields[field.id] = ''
    })
  }
  var base = {
    id: uid('ent'),
    boardId: boardId,
    name: defaultEntryName(board),
    subtitle: '',
    summary: '',
    body: '',
    fields: fields,
    tags: [],
    locked: false,
    relations: [],
    parentId: null,
    createdAt: now,
    updatedAt: now
  }
  if (extra && extra.fields) {
    base.fields = Object.assign({}, fields, extra.fields)
    extra = Object.assign({}, extra)
    delete extra.fields
  }
  return Object.assign(base, extra || {})
}

function chapterNo(entry) {
  var raw = fieldValue(entry, 'number')
  var direct = Number(raw)
  if (Number.isFinite(direct) && direct > 0) return direct
  var match = String(raw || '').match(/(\d+)\s*$/)
  return match ? Number(match[1]) : null
}

function sortOutline(state) {
  var list = entriesOf(state, 'outline').slice()
  list.sort(function (a, b) {
    var ao = Number(fieldValue(a, 'order')) || 0
    var bo = Number(fieldValue(b, 'order')) || 0
    if (ao !== bo) return ao - bo
    return String(fieldValue(a, 'number') || '').localeCompare(String(fieldValue(b, 'number') || ''), 'zh-CN')
  })
  return list
}

function buildOutlineTree(state) {
  var list = sortOutline(state)
  var byId = {}
  list.forEach(function (entry) { byId[entry.id] = entry })
  var children = {}
  var roots = []
  list.forEach(function (entry) {
    if (entry.parentId && byId[entry.parentId]) {
      if (!children[entry.parentId]) children[entry.parentId] = []
      children[entry.parentId].push(entry)
    } else {
      roots.push(entry)
    }
  })
  return { roots: roots, children: children, byId: byId }
}

function fileToDataUrl(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader()
    reader.onload = function () { resolve(String(reader.result || '')) }
    reader.onerror = function () { reject(new Error('读取图片失败')) }
    reader.readAsDataURL(file)
  })
}

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text)
  return new Promise(function (resolve, reject) {
    try {
      var area = document.createElement('textarea')
      area.value = text
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      document.body.removeChild(area)
      resolve()
    } catch (err) {
      reject(err)
    }
  })
}

function downloadText(filename, text, type) {
  var blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' })
  var url = URL.createObjectURL(blob)
  var a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(function () { URL.revokeObjectURL(url) }, 1000)
}

function svgPath(name) {
  var paths = {
    grid: ['M4 4h6v6H4z', 'M14 4h6v6h-6z', 'M4 14h6v6H4z', 'M14 14h6v6h-6z'],
    compass: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M15.5 8.5l-2 5-5 2 2-5 5-2z'],
    book: ['M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z', 'M4 5.5v16', 'M8 7h8', 'M8 11h6'],
    scale: ['M12 3v18', 'M6 6h12', 'M6 6l-3 6h6L6 6z', 'M18 6l-3 6h6l-3-6z', 'M8 21h8'],
    user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4 21a8 8 0 0 1 16 0'],
    flag: ['M5 21V4', 'M5 4h11l-2 4 2 4H5'],
    pin: ['M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z', 'M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'],
    map: ['M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z', 'M9 3v15', 'M15 6v15'],
    bolt: ['M13 2L4 14h7l-1 8 9-12h-7z'],
    spark: ['M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z', 'M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z'],
    branch: ['M6 4v10a4 4 0 0 0 4 4h8', 'M6 8h6a4 4 0 0 1 4 4v6', 'M15 15l3 3-3 3', 'M6 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', 'M15 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'],
    clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2'],
    thread: ['M4 6c4 0 4 12 8 12s4-12 8-12', 'M4 12h16', 'M4 18c4 0 4-12 8-12'],
    scroll: ['M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M8 7h8', 'M8 11h8', 'M8 15h5'],
    quill: ['M4 20c6 0 12-4 15-12l1-4-4 1C8 8 4 14 4 20z', 'M4 20l7-7', 'M11 13l4 4'],
    quote: ['M8 11H4V7h5v4c0 3-2 5-5 6', 'M20 11h-4V7h5v4c0 3-2 5-5 6'],
    note: ['M5 3h10l4 4v14H5z', 'M15 3v5h5', 'M8 12h8', 'M8 16h6'],
    paw: ['M8.5 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', 'M15.5 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', 'M4.5 15a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', 'M19.5 15a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', 'M12 13c-3 0-5 3-5 5.2 0 1.6 1.2 2.8 2.8 2.8 1 0 1.5-.4 2.2-.4s1.2.4 2.2.4c1.6 0 2.8-1.2 2.8-2.8C17 16 15 13 12 13z'],
    layers: ['M12 3l9 5-9 5-9-5z', 'M3 13l9 5 9-5', 'M3 18l9 5 9-5'],
    gem: ['M6 3h12l3 6-9 12L3 9z', 'M3 9h18', 'M9 3l3 6 3-6', 'M9 9l3 12 3-12'],
    mask: ['M4 6c3-2 13-2 16 0v5c0 5-4 8-8 9-4-1-8-4-8-9z', 'M8 11h2', 'M14 11h2', 'M9 15c2 1 4 1 6 0'],
    key: ['M14 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M17 10h4', 'M19 10v3', 'M11 10L3 18v3h3l2-2v-2h2v-2h2l2-2'],
    crown: ['M3 8l4 4 5-7 5 7 4-4v11H3z', 'M3 19h18'],
    ship: ['M4 15l2 6h12l2-6', 'M6 15l3-8h6l3 8', 'M12 3v4', 'M9 7h6', 'M3 12c3 2 6-1 9-1s6 3 9 1'],
    moon: ['M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z'],
    sun: ['M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z', 'M12 2v2', 'M12 20v2', 'M4.2 4.2l1.4 1.4', 'M18.4 18.4l1.4 1.4', 'M2 12h2', 'M20 12h2', 'M4.2 19.8l1.4-1.4', 'M18.4 5.6l1.4-1.4'],
    flame: ['M12 22c4 0 7-3 7-7 0-4-3-6-4-9-1 4-3 5-3 8 0-2-2-3-3-5-2 2-4 4-4 7 0 3 3 6 7 6z'],
    drop: ['M12 3s7 7.2 7 12a7 7 0 0 1-14 0c0-4.8 7-12 7-12z'],
    mountain: ['M3 20l6-12 4 7 2-3 6 8z'],
    tree: ['M12 3l5 6h-3l4 5h-4l3 4H7l3-4H6l4-5H7z', 'M12 18v3'],
    eye: ['M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
    search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M21 21l-4.3-4.3'],
    plus: ['M12 5v14', 'M5 12h14'],
    minus: ['M5 12h14'],
    settings: ['M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z', 'M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21h-3v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.1-2.1.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3v-3h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V3h3v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.1 2.1-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1H21v3h-.1a1.7 1.7 0 0 0-1.5 1z'],
    help: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M9.2 9a3 3 0 1 1 4.5 2.7c-.9.6-1.7 1.2-1.7 2.3', 'M12 17.5h.01'],
    close: ['M6 6l12 12', 'M18 6L6 18'],
    'chevron-right': ['M9 5l7 7-7 7'],
    'chevron-left': ['M15 5l-7 7 7 7'],
    'chevron-down': ['M5 9l7 7 7-7'],
    'chevron-up': ['M5 15l7-7 7 7'],
    'arrow-left': ['M19 12H5', 'M11 6l-6 6 6 6'],
    'arrow-right': ['M5 12h14', 'M13 6l6 6-6 6'],
    edit: ['M4 20h4L19 9l-4-4L4 16z', 'M13 7l4 4'],
    trash: ['M4 7h16', 'M9 7V4h6v3', 'M6 7l1 14h10l1-14', 'M10 11v6', 'M14 11v6'],
    lock: ['M6 11h12v10H6z', 'M8 11V7a4 4 0 0 1 8 0v4'],
    unlock: ['M6 11h12v10H6z', 'M8 11V7a4 4 0 0 1 7.5-2'],
    save: ['M5 3h12l3 3v15H4V3z', 'M8 3v6h8V3', 'M8 14h8v7H8z'],
    undo: ['M9 7L4 12l5 5', 'M4 12h10a6 6 0 0 1 0 12'],
    redo: ['M15 7l5 5-5 5', 'M20 12H10a6 6 0 0 0 0 12'],
    check: ['M4 12l5 5L20 6'],
    warning: ['M12 3L2 21h20z', 'M12 9v5', 'M12 18h.01'],
    error: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M9 9l6 6', 'M15 9l-6 6'],
    info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 11v6', 'M12 7h.01'],
    more: ['M5 12h.01', 'M12 12h.01', 'M19 12h.01'],
    download: ['M12 3v12', 'M7 10l5 5 5-5', 'M4 21h16'],
    upload: ['M12 16V4', 'M7 9l5-5 5 5', 'M4 21h16'],
    menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
    filter: ['M3 5h18l-7 8v6l-4 2v-8z'],
    sort: ['M8 5v14', 'M4 15l4 4 4-4', 'M16 19V5', 'M12 9l4-4 4 4'],
    link: ['M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1', 'M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1'],
    external: ['M14 3h7v7', 'M10 14L21 3', 'M21 14v7H3V3h7'],
    eye: ['M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
    columns: ['M4 4h16v16H4z', 'M12 4v16'],
    list: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'],
    cards: ['M4 4h7v7H4z', 'M13 4h7v7h-7z', 'M4 13h7v7H4z', 'M13 13h7v7h-7z'],
    sparkles: ['M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z', 'M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z', 'M5 15l.6 1.6L7 17l-1.4.6L5 19l-.6-1.4L3 17l1.4-.4z'],
    circle: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z'],
    target: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z', 'M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'],
    scene: ['M3 5h18v14H3z', 'M3 15l5-5 4 4 3-3 6 6', 'M8 9h.01'],
    route: ['M6 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z', 'M18 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4z', 'M8 6h5a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8h7'],
    wand: ['M4 20L16 8', 'M14 4l2 2', 'M18 8l2 2', 'M5 5l1 3 3 1-3 1-1 3-1-3-3-1 3-1z'],
    archive: ['M3 5h18v4H3z', 'M5 9v11h14V9', 'M9 13h6'],
    sync: ['M20 11a8 8 0 0 0-14.9-4M4 4v5h5', 'M4 13a8 8 0 0 0 14.9 4M20 20v-5h-5'],
    copy: ['M9 9h11v11H9z', 'M5 15H4V4h11v1']
  }
  return paths[name] || paths.circle
}

function Icon(props) {
  var name = props.name || 'circle'
  var size = props.size || 18
  var paths = svgPath(name)
  return h(
    'svg',
    {
      className: 'sl-icon ' + (props.className || ''),
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: props.strokeWidth || 1.7,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': 'true'
    },
    paths.map(function (d, index) {
      return h('path', { key: index, d: d })
    })
  )
}

function Seal(props) {
  return h(
    'span',
    { className: 'sl-seal ' + (props.className || ''), title: props.title || '织世', 'aria-hidden': 'true' },
    h('span', { className: 'sl-seal-inner' }, '织')
  )
}

function StatusPill(props) {
  var value = props.value || '未设置'
  var tone = props.tone || statusTone(value)
  return h(
    'span',
    { className: 'sl-pill sl-tone-' + tone + ' ' + (props.className || '') },
    props.dot === false ? null : h('i', { className: 'sl-dot' }),
    value
  )
}

function Tag(props) {
  return h(
    'span',
    { className: 'sl-tag ' + (props.onRemove ? 'sl-tag-removable' : '') },
    props.children,
    props.onRemove
      ? h('button', { className: 'sl-tag-x', type: 'button', onClick: props.onRemove, title: '移除' }, h(Icon, { name: 'close', size: 10 }))
      : null
  )
}


/* ---- 05-styles.js ---- */
/* 织世 · 纸张、朱砂与墨 */

var CSS = `
.sl-app{
  --sl-paper:#f7f1e5;
  --sl-paper-2:#f1e8d8;
  --sl-paper-3:#eadfcd;
  --sl-panel:rgba(255,252,245,.88);
  --sl-panel-solid:#fbf7ee;
  --sl-ink:#26221d;
  --sl-ink-2:#4d463c;
  --sl-muted:#847966;
  --sl-faint:#a29681;
  --sl-line:#ded1bb;
  --sl-line-soft:rgba(126,110,88,.16);
  --sl-accent:#a63d2f;
  --sl-accent-soft:rgba(166,61,47,.09);
  --sl-accent-line:rgba(166,61,47,.28);
  --sl-jade:#3f6b5c;
  --sl-jade-soft:rgba(63,107,92,.10);
  --sl-gold:#a97b3f;
  --sl-gold-soft:rgba(169,123,63,.12);
  --sl-blue:#516a80;
  --sl-blue-soft:rgba(81,106,128,.10);
  --sl-danger:#a63d2f;
  --sl-shadow:0 18px 50px rgba(64,48,30,.13), 0 3px 10px rgba(64,48,30,.05);
  --sl-radius:14px;
  --sl-serif:"Songti SC","STSong","Noto Serif SC","Source Han Serif SC",serif;
  --sl-sans:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
  position:relative;
  display:flex;
  flex-direction:column;
  height:100%;
  min-height:0;
  overflow:hidden;
  container-type:inline-size;
  color:var(--sl-ink);
  font-family:var(--sl-sans);
  font-size:13px;
  line-height:1.55;
  background:
    radial-gradient(1200px 600px at 18% -10%,rgba(255,255,255,.72),transparent 60%),
    radial-gradient(900px 500px at 95% 110%,rgba(166,61,47,.055),transparent 60%),
    repeating-linear-gradient(0deg,rgba(90,72,48,.018) 0 1px,transparent 1px 4px),
    var(--sl-paper);
  -webkit-font-smoothing:antialiased;
}
body[data-ds-dark-theme] .sl-app,
html[data-ds-theme="dark"] .sl-app,
body[data-theme="dark"] .sl-app{
  --sl-paper:#181917;
  --sl-paper-2:#1e201d;
  --sl-paper-3:#252722;
  --sl-panel:rgba(31,33,29,.9);
  --sl-panel-solid:#20221e;
  --sl-ink:#eee7d9;
  --sl-ink-2:#cfc6b6;
  --sl-muted:#a99e8b;
  --sl-faint:#7f7565;
  --sl-line:#3a3a32;
  --sl-line-soft:rgba(220,205,180,.12);
  --sl-accent:#d87563;
  --sl-accent-soft:rgba(216,117,99,.12);
  --sl-accent-line:rgba(216,117,99,.32);
  --sl-jade:#83b6a2;
  --sl-jade-soft:rgba(131,182,162,.12);
  --sl-gold:#c9a46a;
  --sl-gold-soft:rgba(201,164,106,.12);
  --sl-blue:#8aa8bf;
  --sl-blue-soft:rgba(138,168,191,.12);
  --sl-shadow:0 22px 60px rgba(0,0,0,.36), 0 3px 12px rgba(0,0,0,.28);
  background:
    radial-gradient(900px 500px at 20% -10%,rgba(255,240,210,.035),transparent 60%),
    radial-gradient(800px 500px at 100% 110%,rgba(216,117,99,.04),transparent 60%),
    repeating-linear-gradient(0deg,rgba(255,240,210,.008) 0 1px,transparent 1px 4px),
    var(--sl-paper);
}
.sl-app *{box-sizing:border-box}
.sl-app button,.sl-app input,.sl-app textarea,.sl-app select{font:inherit;color:inherit}
.sl-app button{cursor:pointer}
.sl-app ::selection{background:rgba(166,61,47,.18)}
.sl-app ::-webkit-scrollbar{width:9px;height:9px}
.sl-app ::-webkit-scrollbar-thumb{background:rgba(126,110,88,.26);border-radius:20px;border:3px solid transparent;background-clip:padding-box}
.sl-app ::-webkit-scrollbar-track{background:transparent}
.sl-icon{display:block;flex:none}
.sl-muted{color:var(--sl-muted)}
.sl-faint{color:var(--sl-faint)}
.sl-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none;display:inline-block}
.sl-kbd{display:inline-flex;align-items:center;justify-content:center;min-width:19px;height:19px;padding:0 5px;border:1px solid var(--sl-line);border-radius:5px;font-size:10px;line-height:1;color:var(--sl-faint);background:rgba(255,255,255,.28)}
.sl-seal{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:linear-gradient(145deg,#b64a3a,#8f2f25);color:#f9efdd;box-shadow:0 4px 10px rgba(143,47,37,.24),inset 0 0 0 1px rgba(255,255,255,.18);transform:rotate(-2deg);flex:none}
.sl-seal-inner{font-family:var(--sl-serif);font-size:19px;font-weight:600;line-height:1;letter-spacing:0}
.sl-pill{display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:999px;font-size:10.5px;line-height:1.7;white-space:nowrap;border:1px solid transparent}
.sl-tone-jade{color:var(--sl-jade);background:var(--sl-jade-soft);border-color:rgba(63,107,92,.18)}
.sl-tone-red{color:var(--sl-accent);background:var(--sl-accent-soft);border-color:var(--sl-accent-line)}
.sl-tone-gold{color:var(--sl-gold);background:var(--sl-gold-soft);border-color:rgba(169,123,63,.2)}
.sl-tone-blue{color:var(--sl-blue);background:var(--sl-blue-soft);border-color:rgba(81,106,128,.2)}
.sl-tone-gray{color:var(--sl-muted);background:rgba(126,110,88,.08);border-color:var(--sl-line-soft)}
.sl-tag{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:5px;font-size:10.5px;color:var(--sl-muted);background:rgba(126,110,88,.075);border:1px solid var(--sl-line-soft);white-space:nowrap}
.sl-tag-removable{padding-right:2px}
.sl-tag-x{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;padding:0;border:0;border-radius:4px;background:transparent;color:var(--sl-faint)}
.sl-tag-x:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:30px;padding:0 12px;border-radius:8px;border:1px solid var(--sl-line);background:rgba(255,252,245,.55);color:var(--sl-ink-2);font-size:12px;line-height:1;white-space:nowrap;transition:background .15s,border-color .15s,color .15s,transform .15s}
.sl-btn:hover{border-color:var(--sl-accent-line);color:var(--sl-accent);background:var(--sl-accent-soft)}
.sl-btn:active{transform:translateY(1px)}
.sl-btn.primary{background:linear-gradient(145deg,#b44737,#953326);border-color:transparent;color:#fff8ea;box-shadow:0 4px 12px rgba(149,51,38,.18)}
.sl-btn.primary:hover{color:#fff;filter:brightness(1.04)}
.sl-btn.ghost{border-color:transparent;background:transparent;color:var(--sl-muted)}
.sl-btn.ghost:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-btn.danger{color:var(--sl-accent);border-color:var(--sl-accent-line)}
.sl-btn.danger:hover{background:var(--sl-accent);color:#fff}
.sl-btn.small{height:26px;padding:0 9px;font-size:11px;border-radius:7px}
.sl-btn.icon{width:30px;padding:0}
.sl-btn:disabled{opacity:.45;pointer-events:none}
.sl-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;border-radius:7px;background:transparent;color:var(--sl-muted);flex:none}
.sl-icon-btn:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-icon-btn.active{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-icon-btn:disabled{opacity:.35;pointer-events:none}

/* 顶栏 */
.sl-top{height:54px;flex:none;display:flex;align-items:center;gap:10px;padding:0 14px;border-bottom:1px solid var(--sl-line);background:linear-gradient(180deg,rgba(255,252,245,.45),rgba(255,252,245,.12));position:relative;z-index:20}
body[data-ds-dark-theme] .sl-top,html[data-ds-theme="dark"] .sl-top{background:linear-gradient(180deg,rgba(255,240,210,.025),transparent)}
.sl-top-left{display:flex;align-items:center;gap:10px;min-width:0}
.sl-brand{display:flex;align-items:center;gap:9px;min-width:0}
.sl-brand-text{display:flex;flex-direction:column;min-width:0;line-height:1.05}
.sl-brand-name{font-family:var(--sl-serif);font-size:17px;font-weight:600;letter-spacing:.12em;color:var(--sl-ink)}
.sl-brand-sub{font-size:8px;letter-spacing:.22em;color:var(--sl-faint);margin-top:3px;text-transform:uppercase}
.sl-top-divider{width:1px;height:24px;background:var(--sl-line);flex:none;margin:0 2px}
.sl-project-btn{display:flex;align-items:center;gap:6px;min-width:0;max-width:250px;padding:4px 7px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--sl-ink-2)}
.sl-project-btn:hover{background:var(--sl-accent-soft);border-color:var(--sl-accent-line)}
.sl-project-title{font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-project-genre{font-size:10px;color:var(--sl-faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px}
.sl-search-trigger{flex:1;max-width:420px;display:flex;align-items:center;gap:8px;height:30px;margin:0 auto;padding:0 10px;border:1px solid var(--sl-line);border-radius:8px;background:rgba(255,252,245,.42);color:var(--sl-faint);font-size:12px}
.sl-search-trigger:hover{border-color:var(--sl-accent-line);color:var(--sl-muted)}
.sl-search-trigger .sl-kbd{margin-left:auto}
.sl-top-actions{display:flex;align-items:center;gap:2px;flex:none}
.sl-save-state{display:flex;align-items:center;gap:5px;font-size:10.5px;color:var(--sl-faint);white-space:nowrap;margin-right:4px}
.sl-save-state .sl-dot{background:var(--sl-jade)}
.sl-save-state.dirty .sl-dot{background:var(--sl-gold)}
.sl-save-state.error{color:var(--sl-accent)}
.sl-save-state.error .sl-dot{background:var(--sl-accent)}
.sl-lint-btn{position:relative;display:flex;align-items:center;gap:6px;height:28px;padding:0 9px;border:1px solid var(--sl-line);border-radius:7px;background:transparent;color:var(--sl-muted);font-size:11px}
.sl-lint-btn:hover{border-color:var(--sl-accent-line);color:var(--sl-accent)}
.sl-lint-btn .sl-lint-count{display:inline-flex;align-items:center;justify-content:center;min-width:17px;height:17px;padding:0 4px;border-radius:99px;background:var(--sl-accent);color:#fff;font-size:9.5px;font-weight:600}
.sl-lint-btn.clean .sl-lint-count{background:var(--sl-jade)}

/* 身体与导航 */
.sl-body{flex:1;min-height:0;display:flex;position:relative}
.sl-nav{width:206px;flex:none;display:flex;flex-direction:column;border-right:1px solid var(--sl-line);background:linear-gradient(180deg,rgba(255,252,245,.28),rgba(255,252,245,.06));min-height:0;z-index:12}
body[data-ds-dark-theme] .sl-nav,html[data-ds-theme="dark"] .sl-nav{background:linear-gradient(180deg,rgba(255,240,210,.02),transparent)}
.sl-nav-head{padding:12px 12px 7px;display:flex;align-items:center;justify-content:space-between}
.sl-nav-label{font-size:9px;letter-spacing:.18em;color:var(--sl-faint);text-transform:uppercase}
.sl-nav-scroll{flex:1;min-height:0;overflow:auto;padding:0 8px 12px}
.sl-nav-dash{display:flex;align-items:center;gap:9px;width:100%;height:34px;padding:0 9px;margin-bottom:6px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--sl-ink-2);text-align:left;font-size:12.5px}
.sl-nav-dash:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-nav-dash.active{background:var(--sl-accent-soft);border-color:var(--sl-accent-line);color:var(--sl-accent);font-weight:600}
.sl-nav-group{margin-top:10px}
.sl-nav-group-head{display:flex;align-items:center;justify-content:space-between;height:22px;padding:0 8px 0 9px;color:var(--sl-faint);font-size:12px;letter-spacing:.05em}
.sl-nav-group-head span{font-family:var(--sl-serif);font-size:12px;letter-spacing:.14em}
.sl-nav-add{width:18px;height:18px;border:0;border-radius:4px;background:transparent;color:var(--sl-faint);display:inline-flex;align-items:center;justify-content:center;padding:0;opacity:0}
.sl-nav-group:hover .sl-nav-add{opacity:1}
.sl-nav-add:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-nav-item{position:relative;display:flex;align-items:center;gap:8px;width:100%;height:31px;padding:0 8px 0 9px;margin:1px 0;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--sl-ink-2);text-align:left;font-size:12px}
.sl-nav-item:hover{background:rgba(126,110,88,.07)}
.sl-nav-item.active{background:rgba(255,252,245,.66);border-color:var(--sl-line);color:var(--sl-ink);box-shadow:0 1px 2px rgba(64,48,30,.04)}
.sl-nav-item.active:before{content:"";position:absolute;left:-1px;top:6px;bottom:6px;width:2px;border-radius:2px;background:var(--sl-accent)}
.sl-nav-icon{width:16px;color:var(--sl-muted);display:flex;align-items:center;justify-content:center;flex:none}
.sl-nav-item.active .sl-nav-icon{color:var(--sl-accent)}
.sl-nav-text{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-nav-count{font-size:9.5px;color:var(--sl-faint);font-variant-numeric:tabular-nums}
.sl-nav-badge{width:5px;height:5px;border-radius:50%;background:var(--sl-accent);flex:none}
.sl-nav-footer{flex:none;padding:9px 10px 12px;border-top:1px solid var(--sl-line-soft);display:flex;flex-direction:column;gap:3px}
.sl-nav-foot-btn{display:flex;align-items:center;gap:8px;width:100%;height:30px;padding:0 8px;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--sl-muted);font-size:11.5px;text-align:left}
.sl-nav-foot-btn:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-nav-score{margin-left:auto;font-family:var(--sl-serif);font-size:12px;color:var(--sl-jade)}
.sl-nav-score.warn{color:var(--sl-gold)}
.sl-nav-score.bad{color:var(--sl-accent)}
.sl-nav-scrim{display:none}

/* 主区 */
.sl-main{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;position:relative}
.sl-board-head{flex:none;padding:15px 20px 12px;border-bottom:1px solid var(--sl-line-soft);display:flex;align-items:flex-start;gap:14px}
.sl-board-heading{min-width:0;flex:1}
.sl-breadcrumb{display:flex;align-items:center;gap:6px;font-size:10px;letter-spacing:.08em;color:var(--sl-faint);margin-bottom:3px}
.sl-board-title-row{display:flex;align-items:center;gap:8px;min-width:0}
.sl-board-title{font-family:var(--sl-serif);font-size:22px;font-weight:600;letter-spacing:.04em;margin:0;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-board-desc{color:var(--sl-muted);font-size:11px;margin-top:4px;max-width:720px;line-height:1.5}
.sl-board-head-actions{display:flex;align-items:center;gap:7px;flex:none;padding-top:3px}
.sl-toolbar{flex:none;display:flex;align-items:center;gap:8px;padding:8px 20px;border-bottom:1px solid var(--sl-line-soft);min-height:42px}
.sl-toolbar-left{display:flex;align-items:center;gap:6px;min-width:0;flex:1;overflow:hidden}
.sl-toolbar-right{display:flex;align-items:center;gap:4px;flex:none}
.sl-filter-input{height:27px;width:150px;padding:0 9px;border:1px solid var(--sl-line);border-radius:7px;background:rgba(255,252,245,.4);font-size:11.5px;outline:none}
.sl-filter-input:focus{border-color:var(--sl-accent-line);box-shadow:0 0 0 2px var(--sl-accent-soft)}
.sl-count-note{font-size:10.5px;color:var(--sl-faint);white-space:nowrap}
.sl-content{flex:1;min-height:0;overflow:auto;padding:16px 20px 40px;scroll-behavior:smooth}
.sl-content.no-pad{padding:0}
.sl-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:280px;padding:40px 24px;border:1px dashed var(--sl-line);border-radius:var(--sl-radius);background:rgba(255,252,245,.24);color:var(--sl-muted)}
body[data-ds-dark-theme] .sl-empty,html[data-ds-theme="dark"] .sl-empty{background:rgba(255,240,210,.02)}
.sl-empty-art{width:54px;height:54px;border-radius:50%;border:1px solid var(--sl-line);display:flex;align-items:center;justify-content:center;color:var(--sl-accent);margin-bottom:14px;background:var(--sl-accent-soft)}
.sl-empty h3{font-family:var(--sl-serif);font-size:17px;font-weight:600;margin:0 0 5px;color:var(--sl-ink)}
.sl-empty p{margin:0 0 14px;font-size:11.5px;max-width:360px;line-height:1.7}
.sl-empty-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.sl-spinner{width:20px;height:20px;border-radius:50%;border:2px solid var(--sl-line);border-top-color:var(--sl-accent);animation:sl-spin .8s linear infinite}
@keyframes sl-spin{to{transform:rotate(360deg)}}
.sl-loading{height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:var(--sl-muted);font-size:12px;letter-spacing:.08em}
.sl-error-panel{max-width:480px;margin:60px auto;padding:24px;border:1px solid var(--sl-line);border-radius:var(--sl-radius);background:var(--sl-panel);box-shadow:var(--sl-shadow)}
.sl-error-panel h3{font-family:var(--sl-serif);margin:0 0 8px;font-size:18px}
.sl-error-panel code{display:block;margin:10px 0;padding:8px;border-radius:6px;background:var(--sl-paper-2);font-size:11px;word-break:break-all;color:var(--sl-muted)}

/* 仪表盘 */
.sl-dash{display:flex;flex-direction:column;gap:16px;max-width:1180px;margin:0 auto}
.sl-hero{position:relative;overflow:hidden;border:1px solid var(--sl-line);border-radius:18px;padding:26px 28px 22px;background:linear-gradient(135deg,rgba(255,252,245,.9),rgba(247,239,224,.62));box-shadow:0 12px 36px rgba(64,48,30,.06)}
body[data-ds-dark-theme] .sl-hero,html[data-ds-theme="dark"] .sl-hero{background:linear-gradient(135deg,rgba(255,240,210,.035),rgba(255,240,210,.01))}
.sl-hero:after{content:"织";position:absolute;right:20px;top:-18px;font-family:var(--sl-serif);font-size:150px;line-height:1;color:var(--sl-accent);opacity:.055;pointer-events:none}
.sl-hero-eyebrow{display:flex;align-items:center;gap:8px;font-size:9px;letter-spacing:.24em;text-transform:uppercase;color:var(--sl-accent);margin-bottom:10px}
.sl-hero-eyebrow:before{content:"";width:24px;height:1px;background:var(--sl-accent)}
.sl-hero-title{font-family:var(--sl-serif);font-size:34px;line-height:1.18;letter-spacing:.03em;margin:0 0 8px;font-weight:600;max-width:760px}
.sl-hero-sub{font-size:12px;color:var(--sl-muted);margin:0 0 6px;letter-spacing:.02em}
.sl-hero-logline{font-family:var(--sl-serif);font-size:15px;line-height:1.85;color:var(--sl-ink-2);max-width:760px;margin:10px 0 0}
.sl-hero-logline.empty{color:var(--sl-faint);font-style:italic}
.sl-hero-actions{display:flex;align-items:center;gap:8px;margin-top:18px;flex-wrap:wrap}
.sl-hero-meta{margin-left:auto;display:flex;gap:18px;align-items:flex-end;color:var(--sl-faint);font-size:10px;text-align:right}
.sl-hero-meta b{display:block;font-family:var(--sl-serif);font-size:19px;color:var(--sl-ink-2);font-weight:600;line-height:1.2}
.sl-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.sl-stat{border:1px solid var(--sl-line);border-radius:12px;padding:12px 14px;background:rgba(255,252,245,.44);position:relative;overflow:hidden}
body[data-ds-dark-theme] .sl-stat,html[data-ds-theme="dark"] .sl-stat{background:rgba(255,240,210,.025)}
.sl-stat:before{content:"";position:absolute;left:0;top:12px;bottom:12px;width:2px;border-radius:2px;background:var(--sl-accent);opacity:.62}
.sl-stat:nth-child(2):before{background:var(--sl-jade)}
.sl-stat:nth-child(3):before{background:var(--sl-gold)}
.sl-stat:nth-child(4):before{background:var(--sl-blue)}
.sl-stat-value{font-family:var(--sl-serif);font-size:25px;line-height:1.1;letter-spacing:.02em;color:var(--sl-ink)}
.sl-stat-label{font-size:10px;color:var(--sl-faint);letter-spacing:.08em;margin-top:4px}
.sl-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:12px}
.sl-grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}
.sl-card{border:1px solid var(--sl-line);border-radius:14px;background:rgba(255,252,245,.42);min-width:0;overflow:hidden}
body[data-ds-dark-theme] .sl-card,html[data-ds-theme="dark"] .sl-card{background:rgba(255,240,210,.022)}
.sl-card-head{display:flex;align-items:center;gap:8px;padding:11px 14px;border-bottom:1px solid var(--sl-line-soft)}
.sl-card-title{font-family:var(--sl-serif);font-size:13px;font-weight:600;letter-spacing:.06em;flex:1;min-width:0}
.sl-card-body{padding:10px 14px 14px}
.sl-card-link{font-size:10px;color:var(--sl-faint);background:none;border:0;padding:2px 4px;border-radius:4px}
.sl-card-link:hover{color:var(--sl-accent);background:var(--sl-accent-soft)}
.sl-progress-row{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px dashed var(--sl-line-soft);min-width:0}
.sl-progress-row:last-child{border-bottom:0}
.sl-progress-index{width:30px;flex:none;font-size:9.5px;color:var(--sl-faint);font-variant-numeric:tabular-nums}
.sl-progress-main{flex:1;min-width:0}
.sl-progress-title{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-progress-sub{font-size:9.5px;color:var(--sl-faint);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-thread-mini{display:flex;align-items:flex-start;gap:8px;padding:7px 0;border-bottom:1px dashed var(--sl-line-soft);min-width:0}
.sl-thread-mini:last-child{border-bottom:0}
.sl-thread-mini .sl-pill{flex:none;margin-top:1px}
.sl-thread-mini-main{flex:1;min-width:0}
.sl-thread-mini-title{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-thread-mini-sub{font-size:9.5px;color:var(--sl-faint);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-dash-characters{display:flex;flex-wrap:wrap;gap:8px}
.sl-dash-char{display:flex;align-items:center;gap:7px;padding:5px 8px 5px 5px;border:1px solid var(--sl-line-soft);border-radius:999px;background:rgba(255,252,245,.4);max-width:100%}
.sl-dash-char span{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-avatar{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;flex:none;font-family:var(--sl-serif);font-size:13px;color:#fbf4e5;background:linear-gradient(145deg,#6a7f73,#3f5b50);box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)}
.sl-avatar.big{width:38px;height:38px;font-size:17px}
.sl-avatar.red{background:linear-gradient(145deg,#b05a4c,#8d3429)}
.sl-avatar.gold{background:linear-gradient(145deg,#b08a51,#866536)}
.sl-avatar.blue{background:linear-gradient(145deg,#6e8499,#4b6074)}
.sl-avatar.gray{background:linear-gradient(145deg,#8b8272,#655e52)}
.sl-quick-list{display:flex;flex-direction:column;gap:2px}
.sl-quick-item{display:flex;align-items:center;gap:8px;padding:7px 4px;border:0;border-bottom:1px dashed var(--sl-line-soft);background:transparent;text-align:left;font-size:11.5px;color:var(--sl-ink-2);border-radius:5px}
.sl-quick-item:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-quick-item:last-child{border-bottom:0}
.sl-quick-item .sl-icon{color:var(--sl-faint)}
.sl-quick-item.done{color:var(--sl-faint);text-decoration:line-through}
.sl-quick-check{width:15px;height:15px;border:1px solid var(--sl-line);border-radius:4px;display:flex;align-items:center;justify-content:center;flex:none;color:var(--sl-jade)}

/* 卡片视图 */
.sl-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}
.sl-entry-card{position:relative;display:flex;flex-direction:column;min-height:148px;padding:13px 14px 12px;border:1px solid var(--sl-line);border-radius:12px;background:rgba(255,252,245,.44);text-align:left;overflow:hidden;transition:transform .16s,box-shadow .16s,border-color .16s}
body[data-ds-dark-theme] .sl-entry-card,html[data-ds-theme="dark"] .sl-entry-card{background:rgba(255,240,210,.022)}
.sl-entry-card:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(64,48,30,.08);border-color:var(--sl-accent-line)}
.sl-entry-card.selected{border-color:var(--sl-accent);box-shadow:0 0 0 2px var(--sl-accent-soft)}
.sl-entry-card:before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,var(--sl-accent),transparent 70%);opacity:.55}
.sl-entry-card-top{display:flex;align-items:flex-start;gap:9px;min-width:0}
.sl-entry-card-title{flex:1;min-width:0}
.sl-entry-name{font-family:var(--sl-serif);font-size:16px;font-weight:600;line-height:1.3;letter-spacing:.02em;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-entry-sub{font-size:10px;color:var(--sl-faint);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-entry-summary{font-size:11px;color:var(--sl-muted);line-height:1.6;margin-top:8px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;min-height:52px}
.sl-entry-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:auto;padding-top:8px}
.sl-entry-meta .sl-tag{font-size:9.5px}
.sl-entry-warning{position:absolute;right:9px;top:9px;color:var(--sl-accent);display:flex;align-items:center;gap:3px;font-size:9px}

/* 清单视图 */
.sl-table{border:1px solid var(--sl-line);border-radius:12px;overflow:hidden;background:rgba(255,252,245,.32)}
.sl-table-head,.sl-table-row{display:grid;grid-template-columns:minmax(150px,1.6fr) minmax(100px,1fr) minmax(90px,.85fr) minmax(80px,.7fr) minmax(70px,.6fr);gap:10px;align-items:center;padding:0 13px}
.sl-table-head{height:32px;background:rgba(126,110,88,.055);border-bottom:1px solid var(--sl-line);font-size:9px;letter-spacing:.12em;color:var(--sl-faint);text-transform:uppercase}
.sl-table-row{min-height:44px;border-bottom:1px solid var(--sl-line-soft);background:transparent;border-left:0;border-right:0;border-top:0;text-align:left;width:100%;color:var(--sl-ink-2)}
.sl-table-row:last-child{border-bottom:0}
.sl-table-row:hover{background:var(--sl-accent-soft)}
.sl-table-row.selected{background:var(--sl-accent-soft);box-shadow:inset 2px 0 0 var(--sl-accent)}
.sl-table-main{min-width:0;display:flex;align-items:center;gap:9px}
.sl-table-name{font-size:12.5px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-table-sub{font-size:9.5px;color:var(--sl-faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}
.sl-table-cell{min-width:0;font-size:10.5px;color:var(--sl-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-table-actions{display:flex;justify-content:flex-end;gap:2px}

/* 时间线 */
.sl-timeline{position:relative;max-width:920px;margin:0 auto;padding:6px 0 20px}
.sl-timeline:before{content:"";position:absolute;left:92px;top:0;bottom:0;width:1px;background:var(--sl-line)}
.sl-tl-era{position:relative;margin:12px 0 6px 92px;padding-left:18px;font-family:var(--sl-serif);font-size:12px;letter-spacing:.14em;color:var(--sl-accent)}
.sl-tl-row{position:relative;display:grid;grid-template-columns:78px 1fr;gap:28px;padding:5px 0 5px 0;min-width:0}
.sl-tl-date{text-align:right;font-size:10px;color:var(--sl-faint);padding-top:12px;line-height:1.45;font-variant-numeric:tabular-nums}
.sl-tl-axis{position:absolute;left:88px;top:17px;width:9px;height:9px;border-radius:50%;background:var(--sl-paper);border:2px solid var(--sl-accent);z-index:1}
.sl-tl-card{position:relative;text-align:left;border:1px solid var(--sl-line);border-radius:10px;background:rgba(255,252,245,.48);padding:10px 12px;color:var(--sl-ink-2);min-width:0}
body[data-ds-dark-theme] .sl-tl-card,html[data-ds-theme="dark"] .sl-tl-card{background:rgba(255,240,210,.025)}
.sl-tl-card:hover{border-color:var(--sl-accent-line);box-shadow:0 6px 18px rgba(64,48,30,.06)}
.sl-tl-top{display:flex;align-items:center;gap:7px;min-width:0}
.sl-tl-title{font-family:var(--sl-serif);font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-tl-body{font-size:10.5px;color:var(--sl-muted);margin-top:4px;line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sl-tl-meta{display:flex;align-items:center;gap:6px;margin-top:6px;flex-wrap:wrap}
.sl-tl-meta .sl-tag{font-size:9px}

/* 力量阶梯 */
.sl-ladder-wrap{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(230px,.55fr);gap:14px;max-width:1100px;margin:0 auto;align-items:start}
.sl-ladder{display:flex;flex-direction:column;gap:0;border:1px solid var(--sl-line);border-radius:14px;overflow:hidden;background:rgba(255,252,245,.32)}
.sl-rung{display:grid;grid-template-columns:52px 1fr;gap:12px;padding:13px 15px;border-bottom:1px solid var(--sl-line-soft);background:transparent;text-align:left;color:var(--sl-ink-2);position:relative}
.sl-rung:last-child{border-bottom:0}
.sl-rung:hover{background:var(--sl-accent-soft)}
.sl-rung-rank{display:flex;align-items:center;justify-content:center;align-self:start;width:36px;height:36px;border-radius:50%;border:1px solid var(--sl-accent-line);color:var(--sl-accent);font-family:var(--sl-serif);font-size:16px;background:var(--sl-accent-soft)}
.sl-rung-body{min-width:0}
.sl-rung-name{display:flex;align-items:center;gap:7px;font-family:var(--sl-serif);font-size:16px;font-weight:600;line-height:1.25}
.sl-rung-alias{font-size:10px;color:var(--sl-faint);font-family:var(--sl-sans);font-weight:400}
.sl-rung-desc{font-size:10.5px;color:var(--sl-muted);margin-top:4px;line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sl-rung-meta{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:7px}
.sl-power-side{display:flex;flex-direction:column;gap:10px;position:sticky;top:0}
.sl-warning-card{border:1px solid var(--sl-accent-line);border-radius:12px;background:var(--sl-accent-soft);padding:11px 12px}
.sl-warning-card h4{margin:0 0 6px;font-size:10px;letter-spacing:.12em;color:var(--sl-accent);text-transform:uppercase}
.sl-warning-card p{margin:0;font-size:10.5px;line-height:1.6;color:var(--sl-ink-2)}
.sl-warning-card ul{margin:0;padding-left:15px;font-size:10.5px;line-height:1.6;color:var(--sl-ink-2)}

/* 大纲树 */
.sl-outline{max-width:1040px;margin:0 auto;border:1px solid var(--sl-line);border-radius:12px;overflow:hidden;background:rgba(255,252,245,.3)}
.sl-outline-row{display:flex;align-items:center;gap:7px;min-height:40px;padding:5px 12px;border-bottom:1px solid var(--sl-line-soft);background:transparent;width:100%;text-align:left;color:var(--sl-ink-2);border-left:0;border-right:0;border-top:0}
.sl-outline-row:last-child{border-bottom:0}
.sl-outline-row:hover{background:var(--sl-accent-soft)}
.sl-outline-row.is-volume{background:rgba(126,110,88,.045);min-height:44px}
.sl-outline-row.is-volume:hover{background:var(--sl-accent-soft)}
.sl-outline-caret{width:18px;height:18px;border:0;background:transparent;color:var(--sl-faint);display:inline-flex;align-items:center;justify-content:center;padding:0;flex:none;border-radius:4px}
.sl-outline-caret:hover{background:var(--sl-line-soft);color:var(--sl-accent)}
.sl-level-badge{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 5px;border-radius:5px;border:1px solid var(--sl-line);font-size:9px;color:var(--sl-muted);flex:none;background:rgba(255,252,245,.35)}
.sl-outline-title{font-family:var(--sl-serif);font-size:13.5px;font-weight:600;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-outline-row.is-volume .sl-outline-title{font-size:15px}
.sl-outline-sub{font-size:9.5px;color:var(--sl-faint);max-width:38%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:none}
.sl-outline-meta{display:flex;align-items:center;gap:5px;flex:none}
.sl-outline-num{font-size:9.5px;color:var(--sl-faint);font-variant-numeric:tabular-nums;min-width:30px;text-align:right}
.sl-outline-children{position:relative}
.sl-outline-children:before{content:"";position:absolute;left:24px;top:0;bottom:0;width:1px;background:var(--sl-line-soft)}
.sl-outline-children .sl-outline-row{padding-left:calc(12px + var(--depth,0) * 18px)}
.sl-outline-hint{font-size:10px;color:var(--sl-faint);padding:8px 12px;border-top:1px dashed var(--sl-line-soft)}

/* 伏笔看板 */
.sl-kanban{display:grid;grid-template-columns:repeat(5,minmax(150px,1fr));gap:9px;align-items:start;min-width:780px;padding-bottom:10px}
.sl-kanban-col{border:1px solid var(--sl-line);border-radius:11px;background:rgba(126,110,88,.035);min-height:150px;overflow:hidden}
.sl-kanban-head{display:flex;align-items:center;gap:6px;padding:8px 10px;border-bottom:1px solid var(--sl-line-soft);font-size:10px;letter-spacing:.08em;color:var(--sl-muted);background:rgba(255,252,245,.3)}
.sl-kanban-head b{font-family:var(--sl-serif);font-size:12px;font-weight:600;color:var(--sl-ink-2);flex:1}
.sl-kanban-count{font-size:9px;color:var(--sl-faint);background:rgba(126,110,88,.08);padding:1px 6px;border-radius:99px}
.sl-kanban-body{display:flex;flex-direction:column;gap:6px;padding:7px;min-height:100px}
.sl-kanban-body.drag-over{background:var(--sl-accent-soft);outline:1px dashed var(--sl-accent-line);outline-offset:-4px}
.sl-thread-card{display:flex;flex-direction:column;gap:5px;padding:8px 9px;border:1px solid var(--sl-line);border-radius:8px;background:rgba(255,252,245,.55);text-align:left;color:var(--sl-ink-2);cursor:pointer;position:relative}
body[data-ds-dark-theme] .sl-thread-card,html[data-ds-theme="dark"] .sl-thread-card{background:rgba(255,240,210,.025)}
.sl-thread-card:hover{border-color:var(--sl-accent-line);box-shadow:0 4px 12px rgba(64,48,30,.06)}
.sl-thread-card.overdue{border-left:3px solid var(--sl-accent)}
.sl-thread-name{font-size:11.5px;font-weight:500;line-height:1.4}
.sl-thread-sub{font-size:9px;color:var(--sl-faint);line-height:1.5}
.sl-thread-foot{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
.sl-thread-foot .sl-pill{font-size:8.5px;padding:1px 5px}
.sl-thread-drag{font-size:8px;color:var(--sl-faint);text-align:right}

/* 地图 */
.sl-map-wrap{max-width:1200px;margin:0 auto;display:flex;flex-direction:column;gap:10px;min-height:0}
.sl-map-toolbar{display:flex;align-items:center;gap:7px;flex-wrap:wrap;padding:8px 10px;border:1px solid var(--sl-line);border-radius:10px;background:rgba(255,252,245,.38)}
.sl-map-stage-wrap{border:1px solid var(--sl-line);border-radius:12px;overflow:auto;background:#d8d1c2;max-height:calc(100vh - 240px);min-height:300px;position:relative}
.sl-map-stage{position:relative;transform-origin:top left;min-width:100%;min-height:360px}
.sl-map-img{display:block;width:100%;height:auto;user-select:none;pointer-events:none}
.sl-map-pin{position:absolute;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;gap:2px;border:0;background:transparent;padding:0;color:var(--sl-ink);z-index:3}
.sl-map-pin .sl-pin-dot{width:12px;height:12px;border-radius:50% 50% 50% 0;background:var(--sl-accent);border:2px solid #fbf4e5;box-shadow:0 2px 5px rgba(0,0,0,.25);transform:rotate(-45deg)}
.sl-map-pin .sl-pin-label{font-size:9.5px;padding:1px 5px;border-radius:4px;background:rgba(251,244,229,.9);border:1px solid rgba(90,72,48,.25);white-space:nowrap;color:#3b3024}
.sl-map-pin:hover .sl-pin-dot{background:#7b241c;transform:rotate(-45deg) scale(1.18)}
.sl-map-pin.selected .sl-pin-dot{box-shadow:0 0 0 4px rgba(166,61,47,.25)}
.sl-map-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:420px;color:var(--sl-muted);gap:10px;text-align:center;background:repeating-linear-gradient(45deg,rgba(126,110,88,.045) 0 8px,transparent 8px 16px)}
.sl-map-empty h3{font-family:var(--sl-serif);font-size:18px;margin:0;color:var(--sl-ink)}
.sl-map-legend{display:flex;gap:10px;flex-wrap:wrap;font-size:9.5px;color:var(--sl-faint)}

/* 便签与图鉴 */
.sl-notes{columns:3 240px;column-gap:10px;max-width:1100px;margin:0 auto}
.sl-note-card{display:inline-flex;flex-direction:column;width:100%;break-inside:avoid;margin:0 0 10px;padding:11px 12px;border:1px solid var(--sl-line);border-radius:10px;background:rgba(255,252,245,.5);text-align:left;color:var(--sl-ink-2);box-shadow:0 2px 0 rgba(64,48,30,.025)}
.sl-note-card:hover{border-color:var(--sl-accent-line);transform:translateY(-1px)}
.sl-note-card.important{border-top:2px solid var(--sl-accent)}
.sl-note-top{display:flex;align-items:center;gap:6px;margin-bottom:6px}
.sl-note-name{font-family:var(--sl-serif);font-size:14px;font-weight:600;line-height:1.35;flex:1}
.sl-note-body{font-size:10.5px;line-height:1.65;color:var(--sl-muted);display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden}
.sl-note-foot{display:flex;align-items:center;gap:5px;margin-top:8px;flex-wrap:wrap}
.sl-codex-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px;max-width:1100px;margin:0 auto}
.sl-codex-card{display:flex;flex-direction:column;border:1px solid var(--sl-line);border-radius:12px;background:rgba(255,252,245,.42);padding:14px;text-align:left;color:var(--sl-ink-2);position:relative;overflow:hidden}
.sl-codex-card:hover{border-color:var(--sl-accent-line);box-shadow:0 8px 20px rgba(64,48,30,.07)}
.sl-codex-card:after{content:"";position:absolute;right:-18px;bottom:-24px;width:90px;height:90px;border:1px solid var(--sl-accent-line);border-radius:50%;opacity:.35}
.sl-codex-top{display:flex;align-items:flex-start;gap:10px}
.sl-codex-emblem{width:38px;height:38px;border-radius:9px;border:1px solid var(--sl-accent-line);background:var(--sl-accent-soft);display:flex;align-items:center;justify-content:center;color:var(--sl-accent);font-family:var(--sl-serif);font-size:19px;flex:none}
.sl-codex-title{flex:1;min-width:0}
.sl-codex-name{font-family:var(--sl-serif);font-size:16px;font-weight:600;line-height:1.3}
.sl-codex-cat{font-size:9.5px;color:var(--sl-faint);margin-top:2px}
.sl-codex-desc{font-size:10.5px;color:var(--sl-muted);line-height:1.65;margin-top:9px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.sl-codex-meta{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:auto;padding-top:9px}

/* 详情编辑 */
.sl-detail{width:376px;flex:none;min-height:0;display:flex;flex-direction:column;border-left:1px solid var(--sl-line);background:var(--sl-panel);backdrop-filter:blur(10px);z-index:14;box-shadow:-8px 0 24px rgba(64,48,30,.035)}
.sl-detail-head{flex:none;padding:11px 14px 9px;border-bottom:1px solid var(--sl-line-soft)}
.sl-detail-top{display:flex;align-items:center;gap:7px;min-width:0}
.sl-detail-board{display:flex;align-items:center;gap:5px;font-size:9.5px;color:var(--sl-faint);letter-spacing:.07em;min-width:0;flex:1}
.sl-detail-board span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-detail-actions{display:flex;align-items:center;gap:1px;flex:none}
.sl-entry-title-input{width:100%;border:0;border-bottom:1px solid transparent;background:transparent;font-family:var(--sl-serif);font-size:23px;font-weight:600;line-height:1.35;padding:7px 0 3px;outline:none;color:var(--sl-ink)}
.sl-entry-title-input:focus{border-bottom-color:var(--sl-accent-line)}
.sl-entry-sub-input{width:100%;border:0;background:transparent;font-size:11px;color:var(--sl-muted);padding:0 0 4px;outline:none}
.sl-detail-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:5px}
.sl-detail-tabs{display:flex;align-items:center;gap:1px;margin-top:7px}
.sl-detail-tab{height:25px;padding:0 9px;border:0;border-radius:5px;background:transparent;color:var(--sl-muted);font-size:10.5px}
.sl-detail-tab:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-detail-tab.active{background:var(--sl-accent-soft);color:var(--sl-accent);font-weight:500}
.sl-detail-body{flex:1;min-height:0;overflow:auto;padding:12px 14px 20px}
.sl-detail-foot{flex:none;display:flex;align-items:center;gap:7px;padding:8px 14px;border-top:1px solid var(--sl-line-soft);font-size:9.5px;color:var(--sl-faint)}
.sl-detail-foot .sl-btn{margin-left:auto}
.sl-lock-note{display:flex;align-items:center;gap:6px;margin:0 0 9px;padding:6px 8px;border:1px solid var(--sl-gold);border-radius:6px;background:var(--sl-gold-soft);color:var(--sl-gold);font-size:10px;line-height:1.5}
.sl-fields{display:grid;grid-template-columns:1fr;gap:8px}
.sl-field{min-width:0}
.sl-field.full{grid-column:1/-1}
.sl-field-label{display:flex;align-items:center;gap:5px;font-size:9.5px;letter-spacing:.09em;color:var(--sl-faint);margin-bottom:4px;text-transform:uppercase}
.sl-field-label b{font-weight:500;color:var(--sl-muted);letter-spacing:0;text-transform:none;font-size:10px}
.sl-field-help{font-size:9px;color:var(--sl-faint);margin-top:3px;line-height:1.5}
.sl-input,.sl-select,.sl-textarea{width:100%;border:1px solid var(--sl-line);border-radius:7px;background:rgba(255,252,245,.5);padding:6px 8px;font-size:11.5px;line-height:1.5;outline:none;color:var(--sl-ink);transition:border-color .15s,box-shadow .15s}
body[data-ds-dark-theme] .sl-input,body[data-ds-dark-theme] .sl-select,body[data-ds-dark-theme] .sl-textarea,html[data-ds-theme="dark"] .sl-input,html[data-ds-theme="dark"] .sl-select,html[data-ds-theme="dark"] .sl-textarea{background:rgba(255,240,210,.035)}
.sl-input:focus,.sl-select:focus,.sl-textarea:focus{border-color:var(--sl-accent-line);box-shadow:0 0 0 2px var(--sl-accent-soft)}
.sl-input::placeholder,.sl-textarea::placeholder{color:var(--sl-faint);opacity:.8}
.sl-textarea{resize:vertical;min-height:62px}
.sl-select{appearance:none;background-image:linear-gradient(45deg,transparent 50%,var(--sl-faint) 50%),linear-gradient(135deg,var(--sl-faint) 50%,transparent 50%);background-position:calc(100% - 13px) 50%,calc(100% - 9px) 50%;background-size:4px 4px,4px 4px;background-repeat:no-repeat;padding-right:24px}
.sl-refs{display:flex;flex-wrap:wrap;gap:4px;align-items:center;min-height:29px;padding:3px 4px;border:1px solid var(--sl-line);border-radius:7px;background:rgba(255,252,245,.4);position:relative}
.sl-ref-chip{display:inline-flex;align-items:center;gap:3px;padding:2px 5px;border-radius:4px;background:var(--sl-accent-soft);color:var(--sl-accent);font-size:10px;max-width:100%}
.sl-ref-chip span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px}
.sl-ref-chip button{border:0;background:none;padding:0;color:inherit;display:inline-flex;align-items:center}
.sl-ref-add{display:inline-flex;align-items:center;gap:3px;height:20px;padding:0 5px;border:1px dashed var(--sl-line);border-radius:4px;background:transparent;color:var(--sl-faint);font-size:9.5px}
.sl-ref-add:hover{border-color:var(--sl-accent);color:var(--sl-accent)}
.sl-ref-picker{position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:30;border:1px solid var(--sl-line);border-radius:8px;background:var(--sl-panel-solid);box-shadow:var(--sl-shadow);padding:6px;max-height:220px;overflow:auto}
.sl-ref-picker input{width:100%;height:25px;border:1px solid var(--sl-line);border-radius:5px;background:transparent;padding:0 7px;font-size:10.5px;outline:none;margin-bottom:4px}
.sl-ref-option{display:flex;align-items:center;gap:6px;width:100%;padding:4px 5px;border:0;border-radius:4px;background:transparent;text-align:left;font-size:10.5px;color:var(--sl-ink-2)}
.sl-ref-option:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-ref-option small{color:var(--sl-faint);font-size:9px}
.sl-ref-option.selected{color:var(--sl-accent);background:var(--sl-accent-soft)}
.sl-relations{display:flex;flex-direction:column;gap:5px}
.sl-rel-row{display:flex;flex-direction:column;gap:3px;padding:6px;border:1px solid var(--sl-line-soft);border-radius:6px;background:rgba(126,110,88,.03)}
.sl-rel-line{display:flex;align-items:center;gap:4px}
.sl-rel-line .sl-select{height:25px;padding:2px 20px 2px 6px;font-size:10px}
.sl-rel-line .sl-input{height:25px;font-size:10px}
.sl-rel-note{font-size:10px !important;min-height:24px}
.sl-rel-del{width:22px;height:22px;border:0;border-radius:4px;background:transparent;color:var(--sl-faint);display:inline-flex;align-items:center;justify-content:center;flex:none}
.sl-rel-del:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-body-editor{margin-top:10px;border:1px solid var(--sl-line);border-radius:9px;overflow:hidden;background:rgba(255,252,245,.35)}
.sl-md-toolbar{display:flex;align-items:center;gap:2px;padding:4px 6px;border-bottom:1px solid var(--sl-line-soft);background:rgba(126,110,88,.035)}
.sl-md-tab{height:22px;padding:0 7px;border:0;border-radius:4px;background:transparent;color:var(--sl-faint);font-size:9.5px}
.sl-md-tab:hover{color:var(--sl-accent);background:var(--sl-accent-soft)}
.sl-md-tab.active{color:var(--sl-accent);background:var(--sl-accent-soft);font-weight:500}
.sl-md-hint{margin-left:auto;font-size:8.5px;color:var(--sl-faint)}
.sl-md-textarea{display:block;width:100%;min-height:240px;max-height:52vh;border:0;background:transparent;padding:10px 11px;font-family:var(--sl-serif);font-size:13px;line-height:1.9;resize:vertical;outline:none;color:var(--sl-ink)}
.sl-md{padding:10px 12px;font-family:var(--sl-serif);font-size:13px;line-height:1.9;color:var(--sl-ink-2);min-height:160px;max-height:52vh;overflow:auto}
.sl-md h1,.sl-md h2,.sl-md h3,.sl-md h4{margin:14px 0 5px;line-height:1.35;color:var(--sl-ink);font-weight:600}
.sl-md h1{font-size:20px}
.sl-md h2{font-size:17px}
.sl-md h3{font-size:15px}
.sl-md p{margin:0 0 9px}
.sl-md ul,.sl-md ol{margin:4px 0 10px;padding-left:20px}
.sl-md li{margin:2px 0}
.sl-md blockquote{margin:8px 0;padding:4px 10px;border-left:2px solid var(--sl-accent-line);color:var(--sl-muted);background:rgba(126,110,88,.035)}
.sl-md code{padding:1px 4px;border-radius:3px;background:rgba(126,110,88,.1);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px}
.sl-md pre{padding:10px;border-radius:6px;background:rgba(126,110,88,.08);overflow:auto;font-size:11px}
.sl-md pre code{padding:0;background:none}
.sl-md hr{border:0;border-top:1px solid var(--sl-line);margin:14px 0}
.sl-md a{color:var(--sl-accent);text-decoration:none;border-bottom:1px solid var(--sl-accent-line)}
.sl-md .sl-wikilink{color:var(--sl-jade);border-bottom:1px dashed var(--sl-jade);cursor:pointer;padding:0 1px}
.sl-md .sl-wikilink:hover{background:var(--sl-jade-soft)}
.sl-md-empty{color:var(--sl-faint);font-style:italic}
.sl-meta-list{display:flex;flex-direction:column;gap:5px;font-size:10.5px;color:var(--sl-muted)}
.sl-meta-row{display:flex;gap:8px}
.sl-meta-row b{width:64px;flex:none;font-weight:400;color:var(--sl-faint)}
.sl-history-row{display:flex;gap:7px;padding:6px 0;border-bottom:1px dashed var(--sl-line-soft);font-size:10px;color:var(--sl-muted);line-height:1.5}
.sl-history-row .sl-history-date{flex:none;width:76px;color:var(--sl-faint);font-variant-numeric:tabular-nums}
.sl-detail-placeholder{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30px;color:var(--sl-faint);gap:9px}
.sl-detail-placeholder .sl-seal{opacity:.45;transform:rotate(-6deg) scale(.9)}
.sl-detail-placeholder p{margin:0;font-size:10.5px;line-height:1.7;max-width:210px}

/* 弹层通用 */
.sl-modal-layer{position:fixed;inset:0;z-index:2147482000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(28,22,15,.38);backdrop-filter:blur(5px);animation:sl-fade .16s ease}
.sl-modal{width:min(760px,calc(100vw - 32px));max-height:min(82vh,780px);display:flex;flex-direction:column;border:1px solid var(--sl-line);border-radius:16px;background:var(--sl-panel-solid);box-shadow:0 30px 90px rgba(20,14,8,.32);overflow:hidden;animation:sl-rise .18s ease}
.sl-modal.wide{width:min(1000px,calc(100vw - 32px))}
.sl-modal.narrow{width:min(480px,calc(100vw - 32px))}
.sl-modal-head{flex:none;display:flex;align-items:flex-start;gap:10px;padding:15px 18px 11px;border-bottom:1px solid var(--sl-line-soft)}
.sl-modal-heading{flex:1;min-width:0}
.sl-modal-title{font-family:var(--sl-serif);font-size:19px;font-weight:600;margin:0;letter-spacing:.03em;line-height:1.3}
.sl-modal-sub{font-size:10.5px;color:var(--sl-muted);margin-top:3px;line-height:1.5}
.sl-modal-body{flex:1;min-height:0;overflow:auto;padding:15px 18px 20px}
.sl-modal-foot{flex:none;display:flex;align-items:center;gap:7px;padding:10px 18px;border-top:1px solid var(--sl-line-soft);background:rgba(126,110,88,.025)}
.sl-modal-foot .sl-spacer{flex:1}
@keyframes sl-fade{from{opacity:0}to{opacity:1}}
@keyframes sl-rise{from{transform:translateY(8px) scale(.99);opacity:.6}to{transform:none;opacity:1}}
.sl-field-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.sl-field-grid .full{grid-column:1/-1}
.sl-modal textarea.sl-textarea{min-height:80px}
.sl-check-row{display:flex;align-items:center;gap:7px;font-size:11px;color:var(--sl-muted);padding:5px 0}
.sl-check-row input{accent-color:var(--sl-accent)}

/* 项目菜单/下拉 */
.sl-pop-layer{position:fixed;inset:0;z-index:2147481900}
.sl-popover{position:absolute;z-index:2147481950;min-width:220px;padding:5px;border:1px solid var(--sl-line);border-radius:10px;background:var(--sl-panel-solid);box-shadow:var(--sl-shadow);animation:sl-fade .12s ease}
.sl-menu-item{display:flex;align-items:center;gap:8px;width:100%;padding:7px 8px;border:0;border-radius:6px;background:transparent;text-align:left;font-size:11.5px;color:var(--sl-ink-2)}
.sl-menu-item:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-menu-item .sl-icon{color:var(--sl-faint)}
.sl-menu-item:hover .sl-icon{color:var(--sl-accent)}
.sl-menu-item.active{color:var(--sl-accent);font-weight:500}
.sl-menu-sep{height:1px;background:var(--sl-line-soft);margin:4px 6px}
.sl-menu-label{padding:5px 8px 3px;font-size:8.5px;letter-spacing:.14em;color:var(--sl-faint);text-transform:uppercase}
.sl-menu-hint{margin-left:auto;font-size:9px;color:var(--sl-faint)}

/* 搜索 */
.sl-search-modal{width:min(680px,calc(100vw - 28px));max-height:min(78vh,700px);border:1px solid var(--sl-line);border-radius:16px;background:var(--sl-panel-solid);box-shadow:0 30px 90px rgba(20,14,8,.35);overflow:hidden;display:flex;flex-direction:column;animation:sl-rise .16s ease}
.sl-search-top{display:flex;align-items:center;gap:9px;padding:13px 16px;border-bottom:1px solid var(--sl-line-soft)}
.sl-search-top .sl-icon{color:var(--sl-accent)}
.sl-search-input{flex:1;border:0;background:transparent;font-size:15px;outline:none;color:var(--sl-ink);font-family:var(--sl-serif)}
.sl-search-input::placeholder{color:var(--sl-faint)}
.sl-search-results{overflow:auto;padding:6px 8px 10px;min-height:120px}
.sl-search-section{font-size:8.5px;letter-spacing:.16em;color:var(--sl-faint);padding:9px 9px 4px;text-transform:uppercase}
.sl-search-row{display:flex;align-items:flex-start;gap:9px;width:100%;padding:8px 9px;border:0;border-radius:7px;background:transparent;text-align:left;color:var(--sl-ink-2)}
.sl-search-row:hover,.sl-search-row.active{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-search-row .sl-avatar{width:24px;height:24px;font-size:11px}
.sl-search-main{flex:1;min-width:0}
.sl-search-name{font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-search-sub{font-size:9.5px;color:var(--sl-faint);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl-search-board{font-size:9px;color:var(--sl-faint);flex:none;padding-top:2px}
.sl-search-empty{padding:30px 20px;text-align:center;color:var(--sl-faint);font-size:11px}
.sl-search-foot{display:flex;align-items:center;gap:10px;padding:8px 14px;border-top:1px solid var(--sl-line-soft);font-size:9px;color:var(--sl-faint)}
.sl-search-foot .sl-kbd{height:17px;min-width:17px}

/* 设置 */
.sl-settings{display:grid;grid-template-columns:142px 1fr;gap:0;min-height:380px}
.sl-settings-nav{border-right:1px solid var(--sl-line-soft);padding:4px 8px 8px 0;display:flex;flex-direction:column;gap:1px}
.sl-settings-tab{display:flex;align-items:center;gap:6px;height:30px;padding:0 8px;border:0;border-radius:6px;background:transparent;color:var(--sl-muted);font-size:11px;text-align:left}
.sl-settings-tab:hover{background:var(--sl-accent-soft);color:var(--sl-accent)}
.sl-settings-tab.active{background:var(--sl-accent-soft);color:var(--sl-accent);font-weight:500}
.sl-settings-pane{padding:4px 0 4px 16px;min-width:0}
.sl-settings-section{margin-bottom:18px}
.sl-settings-section h4{margin:0 0 8px;font-family:var(--sl-serif);font-size:13px;font-weight:600;letter-spacing:.06em;color:var(--sl-ink)}
.sl-settings-section p{margin:0 0 8px;font-size:10.5px;color:var(--sl-muted);line-height:1.65}
.sl-settings-note{padding:8px 10px;border:1px solid var(--sl-line-soft);border-radius:7px;background:rgba(126,110,88,.035);font-size:10px;color:var(--sl-muted);line-height:1.65}
.sl-path-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;background:rgba(126,110,88,.08);border:1px solid var(--sl-line-soft);border-radius:5px;padding:5px 7px;word-break:break-all;color:var(--sl-muted)}
.sl-cmd-list{display:flex;flex-direction:column;gap:6px}
.sl-cmd-row{display:flex;align-items:center;gap:6px;padding:6px 8px;border:1px solid var(--sl-line-soft);border-radius:6px;background:rgba(126,110,88,.03)}
.sl-cmd-row code{flex:1;min-width:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;color:var(--sl-ink-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sl-backup-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px dashed var(--sl-line-soft);font-size:10.5px;color:var(--sl-muted)}
.sl-backup-row:last-child{border-bottom:0}
.sl-backup-row .sl-spacer{flex:1}

/* 板块管理 */
.sl-board-manager{display:grid;grid-template-columns:182px 1fr;min-height:440px;max-height:64vh}
.sl-board-list{border-right:1px solid var(--sl-line-soft);padding-right:9px;overflow:auto}
.sl-board-list-item{display:flex;align-items:center;gap:6px;width:100%;padding:6px 7px;border:0;border-radius:6px;background:transparent;text-align:left;font-size:10.5px;color:var(--sl-ink-2);margin-bottom:1px}
.sl-board-list-item:hover{background:var(--sl-accent-soft)}
.sl-board-list-item.active{background:var(--sl-accent-soft);color:var(--sl-accent);font-weight:500}
.sl-board-list-item small{margin-left:auto;color:var(--sl-faint);font-size:8.5px}
.sl-board-form{overflow:auto;padding-left:16px;min-width:0}
.sl-field-editor{border:1px solid var(--sl-line-soft);border-radius:8px;padding:8px;margin-bottom:7px;background:rgba(126,110,88,.025)}
.sl-field-editor-top{display:flex;align-items:center;gap:5px;margin-bottom:5px}
.sl-field-editor-top .sl-input{height:26px;font-size:10.5px}
.sl-field-editor-top .sl-select{height:26px;font-size:10px;width:104px;flex:none}
.sl-field-editor-actions{display:flex;gap:1px;margin-left:auto}
.sl-options-input{width:100%;height:25px;border:1px solid var(--sl-line);border-radius:5px;background:transparent;padding:0 7px;font-size:10px;outline:none;margin-top:4px}
.sl-board-add-row{display:flex;gap:6px;margin-top:10px}
.sl-board-add-row .sl-input{flex:1}
.sl-danger-zone{margin-top:16px;padding-top:10px;border-top:1px dashed var(--sl-line);display:flex;align-items:center;gap:8px;font-size:10px;color:var(--sl-faint)}
.sl-danger-zone .sl-btn{margin-left:auto}

/* 连续性抽屉/弹层 */
.sl-lint-summary{display:flex;align-items:center;gap:12px;padding:10px 12px;border:1px solid var(--sl-line);border-radius:10px;background:rgba(126,110,88,.03);margin-bottom:12px}
.sl-score-ring{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--sl-serif);font-size:18px;font-weight:600;flex:none;border:2px solid var(--sl-jade);color:var(--sl-jade);background:var(--sl-jade-soft)}
.sl-score-ring.warn{border-color:var(--sl-gold);color:var(--sl-gold);background:var(--sl-gold-soft)}
.sl-score-ring.bad{border-color:var(--sl-accent);color:var(--sl-accent);background:var(--sl-accent-soft)}
.sl-lint-summary-main{flex:1;min-width:0}
.sl-lint-summary-main b{display:block;font-size:12px;font-weight:500}
.sl-lint-summary-main span{font-size:9.5px;color:var(--sl-faint)}
.sl-lint-filters{display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap}
.sl-lint-issue{display:flex;align-items:flex-start;gap:8px;width:100%;padding:8px 9px;border:1px solid var(--sl-line-soft);border-radius:7px;background:transparent;text-align:left;margin-bottom:5px;color:var(--sl-ink-2)}
.sl-lint-issue:hover{border-color:var(--sl-accent-line);background:var(--sl-accent-soft)}
.sl-lint-issue .sl-icon{margin-top:1px}
.sl-lint-issue.sev-error .sl-icon{color:var(--sl-accent)}
.sl-lint-issue.sev-warn .sl-icon{color:var(--sl-gold)}
.sl-lint-issue.sev-info .sl-icon{color:var(--sl-blue)}
.sl-lint-issue-main{flex:1;min-width:0}
.sl-lint-issue-title{font-size:11px;font-weight:500;line-height:1.4}
.sl-lint-issue-detail{font-size:9.5px;color:var(--sl-muted);line-height:1.55;margin-top:2px}
.sl-lint-issue-board{font-size:8.5px;color:var(--sl-faint);flex:none;padding-top:1px}
.sl-lint-clean{text-align:center;padding:28px 20px;color:var(--sl-muted)}
.sl-lint-clean .sl-seal{margin:0 auto 10px;opacity:.65}
.sl-lint-clean h4{font-family:var(--sl-serif);font-size:16px;margin:0 0 4px;color:var(--sl-ink)}
.sl-lint-clean p{margin:0;font-size:10.5px;line-height:1.6}

/* toast / confirm */
.sl-toast-wrap{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483000;display:flex;flex-direction:column;gap:6px;align-items:center;pointer-events:none}
.sl-toast{pointer-events:auto;display:flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid var(--sl-line);border-radius:9px;background:var(--sl-panel-solid);box-shadow:0 10px 30px rgba(20,14,8,.2);font-size:11px;color:var(--sl-ink-2);animation:sl-rise .16s ease;max-width:min(480px,calc(100vw - 30px))}
.sl-toast .sl-icon{color:var(--sl-accent)}
.sl-toast.ok .sl-icon{color:var(--sl-jade)}
.sl-toast button{border:0;background:var(--sl-accent-soft);color:var(--sl-accent);font-size:10px;padding:3px 7px;border-radius:5px;margin-left:4px}
.sl-confirm-body{font-size:12px;line-height:1.7;color:var(--sl-ink-2)}
.sl-confirm-body b{font-weight:600}
.sl-confirm-body p{margin:0 0 8px}

/* 帮助 */
.sl-help-steps{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:4px 0 14px}
.sl-help-step{border:1px solid var(--sl-line-soft);border-radius:8px;padding:9px 10px;background:rgba(126,110,88,.025)}
.sl-help-step b{display:flex;align-items:center;gap:5px;font-size:10.5px;color:var(--sl-accent);margin-bottom:3px}
.sl-help-step p{margin:0;font-size:10px;color:var(--sl-muted);line-height:1.6}
.sl-shortcuts{display:grid;grid-template-columns:1fr 1fr;gap:4px 14px}
.sl-shortcut{display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px dashed var(--sl-line-soft);font-size:10px;color:var(--sl-muted)}
.sl-shortcut span:last-child{display:flex;gap:3px}

/* 拖拽/加载 */
.sl-drop-hint{position:absolute;inset:8px;border:2px dashed var(--sl-accent-line);border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(247,241,229,.82);color:var(--sl-accent);font-size:11px;pointer-events:none;z-index:5}

/* 响应式 */
@container (max-width:1080px){
  .sl-grid{grid-template-columns:1fr}
  .sl-grid.three{grid-template-columns:1fr 1fr}
  .sl-stats{grid-template-columns:1fr 1fr}
  .sl-ladder-wrap{grid-template-columns:1fr}
  .sl-power-side{position:static}
  .sl-detail{width:342px}
}
@container (max-width:860px){
  .sl-nav{position:absolute;left:0;top:0;bottom:0;transform:translateX(-102%);transition:transform .2s ease;box-shadow:18px 0 50px rgba(20,14,8,.14);background:var(--sl-panel-solid)}
  .sl-app[data-nav-open="true"] .sl-nav{transform:none}
  .sl-nav-scrim{display:block;position:absolute;inset:0;background:rgba(28,22,15,.28);z-index:11;opacity:0;pointer-events:none;transition:opacity .2s}
  .sl-app[data-nav-open="true"] .sl-nav-scrim{opacity:1;pointer-events:auto}
  .sl-detail{position:absolute;right:0;top:0;bottom:0;width:min(390px,92%);box-shadow:-20px 0 60px rgba(20,14,8,.18);animation:sl-slide-in .2s ease}
  .sl-detail-scrim{display:block;position:absolute;inset:0;background:rgba(28,22,15,.2);z-index:13}
  .sl-search-trigger{max-width:220px}
  .sl-hero-meta{display:none}
  .sl-kanban{grid-template-columns:repeat(5,170px);overflow-x:auto}
  .sl-table-head,.sl-table-row{grid-template-columns:minmax(130px,1.5fr) minmax(90px,1fr) minmax(70px,.7fr)}
  .sl-table-head > :nth-child(4),.sl-table-row > :nth-child(4){display:none}
}
@container (max-width:620px){
  .sl-top{padding:0 9px;gap:6px;height:50px}
  .sl-brand-sub{display:none}
  .sl-brand-name{font-size:15px}
  .sl-seal{width:28px;height:28px}
  .sl-brand .sl-seal{width:28px;height:28px}
  .sl-top-divider{display:none}
  .sl-project-btn{max-width:150px}
  .sl-project-genre{display:none}
  .sl-search-trigger{width:30px;flex:none;padding:0;justify-content:center;border-color:transparent;background:transparent;margin-left:auto}
  .sl-search-trigger span,.sl-search-trigger .sl-kbd{display:none}
  .sl-save-state{display:none}
  .sl-top-actions .sl-hide-sm{display:none}
  .sl-board-head{padding:12px 13px 9px}
  .sl-board-title{font-size:19px}
  .sl-board-desc{font-size:10.5px}
  .sl-toolbar{padding:7px 13px}
  .sl-content{padding:12px 13px 30px}
  .sl-hero{padding:20px 18px 17px;border-radius:14px}
  .sl-hero-title{font-size:26px}
  .sl-hero-logline{font-size:13.5px}
  .sl-stats{grid-template-columns:1fr 1fr;gap:7px}
  .sl-stat{padding:10px 11px}
  .sl-stat-value{font-size:21px}
  .sl-grid.three{grid-template-columns:1fr}
  .sl-detail{width:100%;border-left:0}
  .sl-settings{grid-template-columns:1fr}
  .sl-settings-nav{flex-direction:row;overflow:auto;border-right:0;border-bottom:1px solid var(--sl-line-soft);padding:0 0 7px;gap:3px}
  .sl-settings-tab{white-space:nowrap;height:27px}
  .sl-settings-pane{padding:12px 0 0}
  .sl-board-manager{grid-template-columns:1fr;max-height:70vh}
  .sl-board-list{display:flex;gap:3px;overflow:auto;border-right:0;border-bottom:1px solid var(--sl-line-soft);padding:0 0 8px;margin-bottom:10px}
  .sl-board-list-item{white-space:nowrap;margin:0}
  .sl-board-form{padding-left:0}
  .sl-field-grid{grid-template-columns:1fr}
  .sl-help-steps{grid-template-columns:1fr}
  .sl-shortcuts{grid-template-columns:1fr}
  .sl-notes{columns:1}
  .sl-cards{grid-template-columns:1fr}
  .sl-codex-grid{grid-template-columns:1fr}
  .sl-timeline:before{left:20px}
  .sl-tl-era{margin-left:20px;padding-left:24px}
  .sl-tl-row{grid-template-columns:1fr;gap:0;padding-left:38px}
  .sl-tl-date{text-align:left;padding:0 0 3px 0;font-size:9px}
  .sl-tl-axis{left:16px;top:13px}
  .sl-table{border-radius:9px}
  .sl-table-head{display:none}
  .sl-table-row{grid-template-columns:1fr;gap:2px;padding:9px 11px}
  .sl-table-row > :nth-child(2),.sl-table-row > :nth-child(3){display:none}
  .sl-outline-sub{display:none}
  .sl-outline-meta .sl-tag{display:none}
  .sl-modal-layer{padding:10px}
  .sl-modal{max-height:88vh;border-radius:13px}
  .sl-modal-head{padding:13px 14px 9px}
  .sl-modal-body{padding:12px 14px 16px}
  .sl-modal-foot{padding:9px 14px}
}
@container (max-width:420px){
  .sl-top-actions .sl-icon-btn.sl-optional{display:none}
  .sl-hero-title{font-size:23px}
  .sl-stats{grid-template-columns:1fr 1fr}
}
@keyframes sl-slide-in{from{transform:translateX(16px);opacity:.5}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){
  .sl-app *{scroll-behavior:auto !important;animation-duration:.001ms !important;transition-duration:.001ms !important}
}
.sl-dropdown{position:relative}
.sl-hide-lg{display:none}
.sl-detail-scrim{display:none}
.sl-context-pre{white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;line-height:1.75;color:var(--sl-ink-2);background:rgba(126,110,88,.045);border:1px solid var(--sl-line-soft);border-radius:8px;padding:12px;max-height:52vh;overflow:auto;margin:0}
.sl-note{border:1px solid var(--sl-line-soft);border-radius:8px;background:rgba(126,110,88,.035);padding:9px 10px;margin:0 0 8px}
.sl-note p{margin:0 0 5px;font-size:10.5px;line-height:1.7;color:var(--sl-muted)}
.sl-note p:last-child{margin-bottom:0}
.sl-segmented{display:inline-flex;padding:2px;border:1px solid var(--sl-line);border-radius:7px;background:rgba(126,110,88,.035)}
.sl-segmented-item{height:22px;padding:0 8px;border:0;border-radius:5px;background:transparent;color:var(--sl-faint);font-size:10px}
.sl-segmented-item.active{background:var(--sl-panel-solid);color:var(--sl-accent);box-shadow:0 1px 2px rgba(64,48,30,.08)}
@container (max-width:860px){
  .sl-hide-lg{display:inline-flex}
  .sl-detail.empty{display:none}
  .sl-detail-scrim{display:block;position:absolute;inset:0;background:rgba(28,22,15,.2);z-index:13}
}
@container (max-width:620px){
  .sl-table-row > :nth-child(5){display:none}
  .sl-top-actions .sl-lint-btn span:not(.sl-lint-count){display:none}
}

.sl-conflict-bar{display:flex;align-items:center;gap:8px;padding:7px 12px;border-bottom:1px solid var(--sl-accent-line);background:var(--sl-accent-soft);color:var(--sl-accent);font-size:10.5px;flex:none;flex-wrap:wrap}
.sl-conflict-bar .sl-btn{height:24px;font-size:10px;background:var(--sl-panel-solid)}

.sl-sync-state{display:inline-flex;align-items:center;gap:5px;font-size:10px;color:var(--sl-faint);white-space:nowrap;margin-right:3px}
.sl-sync-state .sl-dot{background:var(--sl-jade)}
.sl-reader-app{height:100%}
.sl-reader-title{font-family:var(--sl-serif);font-size:24px;font-weight:600;line-height:1.35;letter-spacing:.03em;margin:8px 0 2px;color:var(--sl-ink);word-break:break-word}
.sl-reader-subtitle{font-size:11px;color:var(--sl-muted);margin-bottom:5px;line-height:1.6}
.sl-reader-sync{font-size:9px;color:var(--sl-faint);margin-left:auto}
.sl-reader-fields{display:flex;flex-direction:column;gap:0}
.sl-reader-field{display:grid;grid-template-columns:76px 1fr;gap:8px;padding:6px 0;border-bottom:1px dashed var(--sl-line-soft);min-width:0}
.sl-reader-field:last-child{border-bottom:0}
.sl-reader-label{font-size:9.5px;letter-spacing:.06em;color:var(--sl-faint);padding-top:2px}
.sl-reader-value{font-size:11.5px;line-height:1.65;color:var(--sl-ink-2);min-width:0;word-break:break-word}
.sl-reader-text{white-space:pre-wrap}
.sl-reader-number{font-variant-numeric:tabular-nums;font-size:12px}
.sl-reader-muted{color:var(--sl-faint);font-size:10.5px}
.sl-reader-refs,.sl-reader-tags{display:flex;flex-wrap:wrap;gap:4px}
.sl-reader-ref{display:inline-flex;align-items:center;gap:3px;padding:1px 6px;border:1px solid var(--sl-jade);border-radius:5px;background:var(--sl-jade-soft);color:var(--sl-jade);font-size:10px;line-height:1.7;max-width:100%;text-align:left}
.sl-reader-ref:hover{background:var(--sl-jade);color:#fff}
.sl-reader-ref .sl-icon{opacity:.7}
.sl-reader-relations{display:flex;flex-direction:column;gap:5px}
.sl-reader-relation{display:flex;align-items:flex-start;gap:5px;flex-wrap:wrap;font-size:10px;color:var(--sl-muted);line-height:1.6;padding:4px 0;border-bottom:1px dashed var(--sl-line-soft)}
.sl-reader-relation:last-child{border-bottom:0}
.sl-reader-relation b{font-weight:500;color:var(--sl-accent);font-size:9.5px;padding:1px 5px;border-radius:4px;background:var(--sl-accent-soft)}
.sl-reader-relation span{flex:1;min-width:100px}
.sl-reader-section{margin-top:13px}
.sl-reader-section-title{font-size:9px;letter-spacing:.14em;color:var(--sl-faint);text-transform:uppercase;margin-bottom:5px}
.sl-reader-body{background:rgba(126,110,88,.025);border:1px solid var(--sl-line-soft);border-radius:8px;padding:10px 11px}
.sl-reader-help p{font-size:11.5px;line-height:1.85;color:var(--sl-muted);margin:0 0 10px}
.sl-reader-help p:last-child{margin-bottom:0}
.sl-reader-help p.sl-faint{font-size:10.5px;border-top:1px dashed var(--sl-line-soft);padding-top:9px}
@media (max-width:900px){
  .sl-reader-detail{width:388px}
}

.sl-sync-card{display:flex;align-items:flex-start;gap:10px;padding:11px 12px;border:1px solid var(--sl-line);border-radius:9px;background:rgba(126,110,88,.03);margin-bottom:8px}
.sl-sync-icon{width:34px;height:34px;border-radius:9px;border:1px solid var(--sl-accent-line);background:var(--sl-accent-soft);color:var(--sl-accent);display:flex;align-items:center;justify-content:center;flex:none}
.sl-sync-card b{display:block;font-size:11.5px;font-weight:600;margin-bottom:2px}
.sl-sync-card p{margin:0;font-size:10px;color:var(--sl-muted);line-height:1.6;max-width:330px}
.sl-sync-card .sl-btn{flex:none;margin-left:auto;align-self:center}
.sl-sync-pending{display:flex;align-items:center;gap:6px;margin-top:8px;padding:7px 9px;border:1px dashed var(--sl-accent-line);border-radius:7px;background:var(--sl-accent-soft);font-size:10px;color:var(--sl-muted);flex-wrap:wrap}
.sl-sync-pending .sl-btn{margin-left:auto}

.sl-sync-folder{border:1px solid var(--sl-line);border-radius:10px;padding:10px 11px;background:rgba(126,110,88,.025);margin-bottom:10px}
.sl-sync-folder .sl-settings-section{margin-bottom:0}
.sl-sync-folder .sl-path-code{margin-top:5px}
.sl-sync-divider{display:flex;align-items:center;gap:8px;margin:8px 0;color:var(--sl-faint);font-size:9px;letter-spacing:.08em}
.sl-sync-divider:before,.sl-sync-divider:after{content:"";height:1px;flex:1;background:var(--sl-line-soft)}

`


/* ---- 10-api.js ---- */
/* 织世 · API 与本地偏好 */

function ApiError(message, status, data) {
  this.name = 'ApiError'
  this.message = message || '请求失败'
  this.status = status || 0
  this.data = data || null
}
ApiError.prototype = Object.create(Error.prototype)
ApiError.prototype.constructor = ApiError

async function apiRequest(path, options) {
  var opts = options || {}
  var headers = Object.assign({}, opts.headers || {})
  if (opts.body && !headers['content-type']) headers['content-type'] = 'application/json'
  var response
  try {
    response = await fetch(API_BASE + path, Object.assign({ credentials: 'same-origin' }, opts, { headers: headers }))
  } catch (err) {
    throw new ApiError('无法连接织世服务。请确认 DSH 的 Web 服务已启动。', 0, null)
  }
  var text = await response.text()
  var data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch (err) {
    data = { raw: text }
  }
  if (!response.ok) {
    var message = (data && (data.error || data.message)) || 'HTTP ' + response.status
    throw new ApiError(message, response.status, data)
  }
  return data
}

var api = {
  bootstrap: function () {
    return apiRequest('/bootstrap')
  },
  getProject: function (id) {
    return apiRequest('/projects/' + encodeURIComponent(id))
  },
  saveProject: function (id, body) {
    return apiRequest('/projects/' + encodeURIComponent(id) + '/save', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  },
  createProject: function (body) {
    return apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(body)
    })
  },
  activateProject: function (id) {
    return apiRequest('/projects/' + encodeURIComponent(id) + '/activate', { method: 'POST', body: '{}' })
  },
  deleteProject: function (id) {
    return apiRequest('/projects/' + encodeURIComponent(id), { method: 'DELETE' })
  },
  lint: function (id, state) {
    return apiRequest('/projects/' + encodeURIComponent(id) + '/lint', {
      method: 'POST',
      body: JSON.stringify({ state: state })
    })
  },
  upload: function (id, payload) {
    return apiRequest('/projects/' + encodeURIComponent(id) + '/upload', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  backups: function (id) {
    return apiRequest('/projects/' + encodeURIComponent(id) + '/backups')
  },
  restore: function (id, revision) {
    return apiRequest('/projects/' + encodeURIComponent(id) + '/restore', {
      method: 'POST',
      body: JSON.stringify({ revision: revision })
    })
  },
  exportBundle: async function (id) {
    const response = await fetch(API_BASE + '/projects/' + encodeURIComponent(id) + '/export-bundle', { credentials: 'same-origin' })
    if (!response.ok) throw new ApiError('导出同步包失败：HTTP ' + response.status, response.status, null)
    return response.json()
  },
  importBundle: function (bundle) {
    return apiRequest('/sync/import', {
      method: 'POST',
      body: JSON.stringify({ bundle: bundle })
    })
  },
  syncConfig: function () {
    return apiRequest('/sync/config')
  },
  switchSyncFolder: function (folder, mode) {
    return apiRequest('/sync/folder', {
      method: 'POST',
      body: JSON.stringify({ folder: folder, mode: mode })
    })
  },
  resetSyncFolder: function () {
    return apiRequest('/sync/reset', { method: 'POST', body: '{}' })
  },
  exportUrl: function (id) {
    return API_BASE + '/projects/' + encodeURIComponent(id) + '/export'
  },
  contextUrl: function (id, chapter) {
    return API_BASE + '/projects/' + encodeURIComponent(id) + '/context?chapter=' + encodeURIComponent(chapter || '')
  },
  contextText: async function (id, chapter) {
    var response = await fetch(api.contextUrl(id, chapter), { credentials: 'same-origin' })
    if (!response.ok) throw new ApiError('生成上下文失败：HTTP ' + response.status, response.status, null)
    return response.text()
  }
}

function readLastPrefs() {
  try {
    return JSON.parse(localStorage.getItem(LS_LAST) || '{}') || {}
  } catch (err) {
    return {}
  }
}

function writeLastPrefs(patch) {
  try {
    var current = readLastPrefs()
    localStorage.setItem(LS_LAST, JSON.stringify(Object.assign(current, patch)))
  } catch (err) {
    /* localStorage 不可用时静默 */
  }
}


/* ---- 20-ui.js ---- */
/* 织世 · 通用界面组件 */

var createPortal = reactDom && reactDom.createPortal ? reactDom.createPortal : null

function Portal(props) {
  if (!createPortal) return props.children
  return createPortal(props.children, document.body)
}

function useEscape(active, onEscape) {
  useEffect(function () {
    if (!active) return undefined
    function onKey(event) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onEscape()
      }
    }
    document.addEventListener('keydown', onKey)
    return function () { document.removeEventListener('keydown', onKey) }
  }, [active, onEscape])
}

function Modal(props) {
  useEscape(true, props.onClose)
  useEffect(function () {
    var previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return function () { document.body.style.overflow = previous }
  }, [])
  var widthClass = props.width === 'wide' ? ' wide' : props.width === 'narrow' ? ' narrow' : ''
  return h(
    Portal,
    null,
    h(
      'div',
      {
        className: 'sl-modal-layer',
        onMouseDown: function (event) {
          if (event.target === event.currentTarget) props.onClose()
        }
      },
      h(
        'div',
        { className: 'sl-modal' + widthClass + ' ' + (props.className || ''), role: 'dialog', 'aria-modal': 'true' },
        h(
          'div',
          { className: 'sl-modal-head' },
          h(
            'div',
            { className: 'sl-modal-heading' },
            h('h3', { className: 'sl-modal-title' }, props.title),
            props.subtitle ? h('div', { className: 'sl-modal-sub' }, props.subtitle) : null
          ),
          h('button', { className: 'sl-icon-btn', type: 'button', onClick: props.onClose, title: '关闭' }, h(Icon, { name: 'close', size: 17 }))
        ),
        h('div', { className: 'sl-modal-body' }, props.children),
        props.footer ? h('div', { className: 'sl-modal-foot' }, props.footer) : null
      )
    )
  )
}

function Dropdown(props) {
  return h(
    'div',
    { className: 'sl-dropdown' },
    props.trigger,
    props.open
      ? h(
          Portal,
          null,
          h('div', { className: 'sl-pop-layer', onMouseDown: props.onClose }),
          h(
            'div',
            {
              className: 'sl-popover ' + (props.className || ''),
              style: Object.assign({ position: 'fixed' }, props.style || {})
            },
            props.children
          )
        )
      : null
  )
}

function MenuItem(props) {
  return h(
    'button',
    {
      type: 'button',
      className: 'sl-menu-item ' + (props.active ? 'active' : ''),
      onClick: props.onClick,
      title: props.title
    },
    props.icon ? h(Icon, { name: props.icon, size: 14 }) : null,
    h('span', { style: { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, props.children),
    props.hint ? h('span', { className: 'sl-menu-hint' }, props.hint) : null
  )
}

function EmptyState(props) {
  return h(
    'div',
    { className: 'sl-empty ' + (props.className || '') },
    h('div', { className: 'sl-empty-art' }, h(Icon, { name: props.icon || 'spark', size: 24 })),
    h('h3', null, props.title || '这里还是空的'),
    props.description ? h('p', null, props.description) : null,
    props.actions ? h('div', { className: 'sl-empty-actions' }, props.actions) : null
  )
}

function ScoreRing(props) {
  var score = Number(props.score)
  var tone = score >= 85 ? '' : score >= 65 ? 'warn' : 'bad'
  return h('div', { className: 'sl-score-ring ' + tone }, Number.isFinite(score) ? score : '—')
}

function Spinner(props) {
  return h('span', { className: 'sl-spinner', style: props.size ? { width: props.size, height: props.size } : null })
}

function Toast(props) {
  if (!props.toast) return null
  var toast = props.toast
  return h(
    Portal,
    null,
    h(
      'div',
      { className: 'sl-toast-wrap' },
      h(
        'div',
        { className: 'sl-toast ' + (toast.kind || '') },
        h(Icon, { name: toast.kind === 'ok' ? 'check' : toast.kind === 'error' ? 'error' : 'info', size: 15 }),
        h('span', { style: { flex: 1, minWidth: 0 } }, toast.text),
        toast.action
          ? h('button', { type: 'button', onClick: function () { toast.action.onClick() } }, toast.action.label)
          : null
      )
    )
  )
}

function ConfirmDialog(props) {
  if (!props.open) return null
  return h(
    Modal,
    {
      title: props.title || '确认操作',
      subtitle: props.subtitle,
      width: 'narrow',
      onClose: props.onCancel,
      footer: [
        h('div', { key: 'space', className: 'sl-spacer' }),
        h('button', { key: 'cancel', type: 'button', className: 'sl-btn ghost', onClick: props.onCancel }, '取消'),
        h('button', { key: 'ok', type: 'button', className: 'sl-btn ' + (props.danger ? 'danger' : 'primary'), onClick: props.onConfirm }, props.confirmLabel || '确认')
      ]
    },
    h('div', { className: 'sl-confirm-body' }, props.children)
  )
}

function Segmented(props) {
  return h(
    'div',
    { className: 'sl-segmented' },
    (props.options || []).map(function (option) {
      var value = typeof option === 'string' ? option : option.value
      var label = typeof option === 'string' ? option : option.label
      return h(
        'button',
        {
          key: value,
          type: 'button',
          className: 'sl-segmented-item ' + (props.value === value ? 'active' : ''),
          onClick: function () { props.onChange(value) }
        },
        label
      )
    })
  )
}

function SectionCard(props) {
  return h(
    'section',
    { className: 'sl-card ' + (props.className || '') },
    h(
      'div',
      { className: 'sl-card-head' },
      props.icon ? h(Icon, { name: props.icon, size: 14, className: 'sl-faint' }) : null,
      h('div', { className: 'sl-card-title' }, props.title),
      props.action || null
    ),
    h('div', { className: 'sl-card-body' }, props.children)
  )
}

function useOutsidePointer(ref, callback, active) {
  useEffect(function () {
    if (!active) return undefined
    function onPointer(event) {
      if (ref.current && !ref.current.contains(event.target)) callback(event)
    }
    document.addEventListener('mousedown', onPointer, true)
    return function () { document.removeEventListener('mousedown', onPointer, true) }
  }, [active, callback])
}

function useDebouncedCallback(callback, delay, deps) {
  var timer = useRef(null)
  useEffect(function () {
    return function () {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])
  return useCallback(function () {
    var args = arguments
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(function () { callback.apply(null, args) }, delay)
  }, deps || [])
}


/* ---- 30-views.js ---- */
/* 织世 · 板块视图 */

function OverviewView(props) {
  var state = props.state
  var entry = entriesOf(state, 'overview')[0]
  if (!entry) {
    return h(EmptyState, { icon: 'compass', title: '总览还没有建立', description: '创建一个总览条目，写下一句话故事和世界法则。', actions: h('button', { type: 'button', className: 'sl-btn primary', onClick: props.onNew }, '创建总览') })
  }
  var board = boardOf(state, 'overview')
  var fields = board ? board.fields : []
  var stats = props.stats
  return h(
    'div',
    { style: { maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 } },
    h(
      'div',
      { style: { border: '1px solid var(--sl-line)', borderRadius: 16, padding: '24px 26px', background: 'rgba(255,252,245,.42)' } },
      h('div', { className: 'sl-hero-eyebrow' }, '世界总览'),
      h('h1', { className: 'sl-hero-title', style: { fontSize: 31 } }, entry.name),
      fieldValue(entry, 'tagline') ? h('p', { className: 'sl-hero-logline' }, fieldValue(entry, 'tagline')) : null,
      h(
        'div',
        { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 } },
        [fieldValue(entry, 'genre'), fieldValue(entry, 'tone'), fieldValue(entry, 'pov'), fieldValue(entry, 'tense'), fieldValue(entry, 'status')]
          .filter(Boolean)
          .map(function (value) { return h(StatusPill, { key: value, value: value, dot: false }) })
      ),
      h(
        'div',
        { style: { marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
        h('div', null, h('div', { className: 'sl-field-label' }, '核心冲突'), h('div', { style: { fontSize: 12.5, lineHeight: 1.8, whiteSpace: 'pre-wrap' } }, fieldValue(entry, 'coreConflict') || '—')),
        h('div', null, h('div', { className: 'sl-field-label' }, '世界法则'), h('div', { style: { fontSize: 12.5, lineHeight: 1.8, whiteSpace: 'pre-wrap' } }, fieldValue(entry, 'worldRules') || '—')),
        h('div', null, h('div', { className: 'sl-field-label' }, '主题母题'), h('div', { style: { fontSize: 12.5, lineHeight: 1.8 } }, fieldValue(entry, 'themes') || '—')),
        h('div', null, h('div', { className: 'sl-field-label' }, '目标字数'), h('div', { style: { fontSize: 12.5, lineHeight: 1.8 } }, (fieldValue(entry, 'targetWords') || '—') + ' 万字'))
      ),
      fields.length
        ? h(
            'div',
            { style: { marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--sl-line-soft)', display: 'flex', gap: 8, flexWrap: 'wrap' } },
            props.readOnly
              ? h('span', { className: 'sl-faint', style: { fontSize: 10 } }, '只读档案 · 要改设定，直接在对话里说')
              : h('button', { type: 'button', className: 'sl-btn primary', onClick: function () { props.onOpen(entry) } }, h(Icon, { name: 'edit', size: 13 }), '编辑总览'),
            h('span', { className: 'sl-faint', style: { fontSize: 9.5, alignSelf: 'center', marginLeft: 'auto' } }, '统计：' + stats.entries + ' 条目 · ' + stats.words + ' 字')
          )
        : null
    ),
    entry.body
      ? h('div', { className: 'sl-card' }, h('div', { className: 'sl-card-head' }, h('div', { className: 'sl-card-title' }, '工作笔记')), h('div', { className: 'sl-md', dangerouslySetInnerHTML: { __html: renderMarkdown(entry.body) } }))
      : null
  )
}

function fieldDisplayValue(state, entry, field) {
  var map = entryMap(state)
  var value = fieldValue(entry, field.id)
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) return ''
  if (field.type === 'ref') return refName(map, value)
  if (field.type === 'refs') return refNames(map, value).join('、')
  if (field.type === 'tags') return (value || []).join('、')
  if (field.type === 'checkbox') return value ? '是' : '否'
  if (field.type === 'relations') return (value || []).length + ' 条关系'
  return String(value)
}

function cardMetaFor(state, entry) {
  var board = boardOf(state, entry.boardId)
  var map = entryMap(state)
  var items = []
  if (entry.boardId === 'characters') {
    var role = fieldValue(entry, 'role')
    var tier = fieldValue(entry, 'tier') ? refName(map, fieldValue(entry, 'tier')) : ''
    var faction = fieldValue(entry, 'faction') ? refName(map, fieldValue(entry, 'faction')) : ''
    if (role) items.push(role)
    if (tier) items.push(tier)
    if (faction) items.push(faction)
  } else if (entry.boardId === 'locations') {
    if (fieldValue(entry, 'type')) items.push(fieldValue(entry, 'type'))
    if (fieldValue(entry, 'danger')) items.push(fieldValue(entry, 'danger'))
    if (fieldValue(entry, 'faction')) items.push(refName(map, fieldValue(entry, 'faction')))
  } else if (entry.boardId === 'factions') {
    if (fieldValue(entry, 'type')) items.push(fieldValue(entry, 'type'))
    if (fieldValue(entry, 'stance')) items.push(fieldValue(entry, 'stance'))
    if (fieldValue(entry, 'leader')) items.push(refName(map, fieldValue(entry, 'leader')))
  } else if (entry.boardId === 'lore') {
    if (fieldValue(entry, 'category')) items.push(fieldValue(entry, 'category'))
    if (fieldValue(entry, 'oneLine')) items.push(fieldValue(entry, 'oneLine'))
  } else if (board) {
    board.fields.slice(0, 3).forEach(function (field) {
      if (field.hidden) return
      var shown = fieldDisplayValue(state, entry, field)
      if (shown) items.push(shown)
    })
  }
  return items.filter(Boolean)
}

function CardsView(props) {
  var state = props.state
  if (!props.entries.length) {
    return h(EmptyState, {
      icon: props.board.icon || 'layers',
      title: '「' + props.board.name + '」还没有条目',
      description: props.readOnly ? '还没有条目。告诉我，我来补。' : props.board.description || '新建一个条目，把这个世界的这一块立起来。',
      actions: props.readOnly ? null : h('button', { type: 'button', className: 'sl-btn primary', onClick: props.onNew }, h(Icon, { name: 'plus', size: 13 }), '新建' + (props.board.entryLabel || '条目'))
    })
  }
  return h(
    'div',
    { className: 'sl-cards' },
    props.entries.map(function (entry) {
      var meta = cardMetaFor(state, entry)
      var status = fieldValue(entry, 'status') || fieldValue(entry, 'danger') || fieldValue(entry, 'level')
      var summary = entry.summary || fieldValue(entry, 'oneLine') || fieldValue(entry, 'goal') || fieldValue(entry, 'power') || stripMarkdown(entry.body)
      var role = String(fieldValue(entry, 'role') || '')
      return h(
        'button',
        {
          key: entry.id,
          type: 'button',
          className: 'sl-entry-card ' + (props.selectedId === entry.id ? 'selected' : ''),
          onClick: function () { props.onOpen(entry) }
        },
        h(
          'div',
          { className: 'sl-entry-card-top' },
          props.board.id === 'characters'
            ? h('span', { className: 'sl-avatar ' + (role === '反派' ? 'red' : role === '主角' ? '' : role === '导师' ? 'gold' : 'gray') }, entryInitial(entry.name))
            : h('span', { className: 'sl-avatar ' + (props.board.id === 'locations' ? 'blue' : props.board.id === 'factions' ? 'gold' : '') }, entryInitial(entry.name)),
          h(
            'div',
            { className: 'sl-entry-card-title' },
            h('div', { className: 'sl-entry-name' }, entry.name),
            h('div', { className: 'sl-entry-sub' }, meta.slice(0, 2).join(' · ') || props.board.entryLabel)
          )
        ),
        entry.locked ? h(Icon, { name: 'lock', size: 12, className: 'sl-faint' }) : null,
        h('div', { className: 'sl-entry-summary' }, clipText(summary || '还没有填写摘要。', 130)),
        h(
          'div',
          { className: 'sl-entry-meta' },
          status ? h(StatusPill, { value: status }) : null,
          (entry.tags || []).slice(0, 3).map(function (tag) { return h(Tag, { key: tag }, tag) })
        )
      )
    })
  )
}

function listColumns(state, board) {
  var preferred = {
    rules: ['ruleType', 'force'],
    abilities: ['type', 'minTier', 'owners'],
    chapters: ['number', 'status', 'wordCount', 'cast'],
    glossary: ['category', 'definition'],
    timeline: ['dateLabel', 'eventType', 'chapter'],
    codex: ['category', 'danger', 'tier']
  }[board.id]
  var ids = preferred || board.fields.filter(function (field) { return !field.hidden }).slice(0, 3).map(function (field) { return field.id })
  return ids.map(function (id) { return board.fields.find(function (field) { return field.id === id }) }).filter(Boolean)
}

function ListView(props) {
  var state = props.state
  var board = props.board
  var columns = listColumns(state, board)
  if (!props.entries.length) {
    return h(EmptyState, {
      icon: board.icon || 'list',
      title: '「' + board.name + '」还是空的',
      description: props.readOnly ? '还没有条目。告诉我，我来补。' : board.description || '新建第一个条目。',
      actions: props.readOnly ? null : h('button', { type: 'button', className: 'sl-btn primary', onClick: props.onNew }, h(Icon, { name: 'plus', size: 13 }), '新建' + (board.entryLabel || '条目'))
    })
  }
  return h(
    'div',
    { className: 'sl-table' },
    h(
      'div',
      { className: 'sl-table-head' },
      h('span', null, '名称'),
      columns.slice(0, 3).map(function (field) { return h('span', { key: field.id }, field.label) }),
      h('span', null, '更新')
    ),
    props.entries.map(function (entry) {
      var status = fieldValue(entry, 'status')
      return h(
        'button',
        {
          key: entry.id,
          type: 'button',
          className: 'sl-table-row ' + (props.selectedId === entry.id ? 'selected' : ''),
          onClick: function () { props.onOpen(entry) }
        },
        h(
          'span',
          { className: 'sl-table-main' },
          h('span', { className: 'sl-avatar', style: { width: 24, height: 24, fontSize: 11 } }, entryInitial(entry.name)),
          h(
            'span',
            { style: { minWidth: 0 } },
            h('span', { className: 'sl-table-name', style: { display: 'flex', gap: 5, alignItems: 'center' } }, entry.name, entry.locked ? h(Icon, { name: 'lock', size: 10, className: 'sl-faint' }) : null),
            h('span', { className: 'sl-table-sub' }, clipText(entry.subtitle || stripMarkdown(entry.body) || '—', 50))
          )
        ),
        columns.slice(0, 3).map(function (field) {
          var value = fieldDisplayValue(state, entry, field)
          if (field.id === 'status' && value) return h('span', { key: field.id }, h(StatusPill, { value: value }))
          return h('span', { key: field.id, className: 'sl-table-cell' }, clipText(value || '—', 36))
        }),
        h('span', { className: 'sl-table-cell' }, relativeTime(entry.updatedAt))
      )
    })
  )
}

function TimelineView(props) {
  var state = props.state
  if (!props.entries.length) {
    return h(EmptyState, {
      icon: 'clock',
      title: '时间线还没有事件',
      description: props.readOnly ? '还没有事件。告诉我，我来排。' : '至少写下「故事开始前」和「第一章」两个节点。排序值用数字，越大越晚。',
      actions: props.readOnly ? null : h('button', { type: 'button', className: 'sl-btn primary', onClick: props.onNew }, h(Icon, { name: 'plus', size: 13 }), '新增事件')
    })
  }
  var sorted = props.entries.slice().sort(function (a, b) {
    var av = Number(fieldValue(a, 'sort'))
    var bv = Number(fieldValue(b, 'sort'))
    return (Number.isFinite(av) ? av : 999999) - (Number.isFinite(bv) ? bv : 999999)
  })
  var groups = []
  sorted.forEach(function (entry) {
    var era = String(fieldValue(entry, 'era') || '未分纪元')
    var group = groups.find(function (item) { return item.era === era })
    if (!group) {
      group = { era: era, entries: [] }
      groups.push(group)
    }
    group.entries.push(entry)
  })
  var map = entryMap(state)
  return h(
    'div',
    { className: 'sl-timeline' },
    groups.map(function (group) {
      return h(
        'div',
        { key: group.era },
        h('div', { className: 'sl-tl-era' }, group.era),
        group.entries.map(function (entry) {
          var chapter = fieldValue(entry, 'chapter')
          return h(
            'div',
            { key: entry.id, className: 'sl-tl-row' },
            h('div', { className: 'sl-tl-date' }, fieldValue(entry, 'dateLabel') || fieldValue(entry, 'sort') || '—'),
            h('div', { className: 'sl-tl-axis' }),
            h(
              'button',
              { type: 'button', className: 'sl-tl-card', onClick: function () { props.onOpen(entry) } },
              h(
                'div',
                { className: 'sl-tl-top' },
                fieldValue(entry, 'eventType') ? h(StatusPill, { value: fieldValue(entry, 'eventType'), dot: false }) : null,
                h('span', { className: 'sl-tl-title' }, entry.name)
              ),
              fieldValue(entry, 'impact') ? h('div', { className: 'sl-tl-body' }, fieldValue(entry, 'impact')) : null,
              h(
                'div',
                { className: 'sl-tl-meta' },
                refNames(map, fieldValue(entry, 'cast')).slice(0, 4).map(function (name) { return h(Tag, { key: name }, name) }),
                refNames(map, fieldValue(entry, 'place')).slice(0, 2).map(function (name) { return h(Tag, { key: name }, name) }),
                chapter ? h(Tag, null, refName(map, chapter)) : null
              )
            )
          )
        })
      )
    })
  )
}

function PowerView(props) {
  var state = props.state
  var map = entryMap(state)
  var tiers = props.entries.slice().sort(function (a, b) { return Number(fieldValue(a, 'rank')) - Number(fieldValue(b, 'rank')) })
  var abilities = entriesOf(state, 'abilities')
  var characters = entriesOf(state, 'characters')
  var issues = props.lint ? props.lint.issues.filter(function (issue) { return ['power-overreach', 'power-rank-missing', 'power-rank-duplicate', 'character-tier-invalid'].indexOf(issue.code) >= 0 }) : []
  var unranked = characters.filter(function (entry) { return !fieldValue(entry, 'tier') })
  if (!tiers.length) {
    return h(EmptyState, {
      icon: 'bolt',
      title: '还没有力量阶梯',
      description: props.readOnly ? '还没有力量阶梯。告诉我你的境界设定，我来排。' : '从最弱的「凡人」开始，往上排三到五个境界。每个境界写清楚：战力边界、突破条件、代价。',
      actions: props.readOnly ? null : h('button', { type: 'button', className: 'sl-btn primary', onClick: props.onNew }, h(Icon, { name: 'plus', size: 13 }), '新建第一阶')
    })
  }
  return h(
    'div',
    { className: 'sl-ladder-wrap' },
    h(
      'div',
      { className: 'sl-ladder' },
      tiers.map(function (tier) {
        var rank = fieldValue(tier, 'rank')
        var reps = refNames(map, fieldValue(tier, 'representatives'))
        var tierAbilities = abilities.filter(function (ability) { return fieldValue(ability, 'minTier') === tier.id })
        return h(
          'button',
          { key: tier.id, type: 'button', className: 'sl-rung', onClick: function () { props.onOpen(tier) } },
          h('span', { className: 'sl-rung-rank' }, rank || '?'),
          h(
            'span',
            { className: 'sl-rung-body' },
            h('span', { className: 'sl-rung-name' }, tier.name, fieldValue(tier, 'aliases') ? h('span', { className: 'sl-rung-alias' }, fieldValue(tier, 'aliases')) : null),
            fieldValue(tier, 'power') ? h('span', { className: 'sl-rung-desc' }, fieldValue(tier, 'power')) : null,
            h(
              'span',
              { className: 'sl-rung-meta' },
              reps.slice(0, 4).map(function (name) { return h(Tag, { key: name }, name) }),
              h(Tag, null, tierAbilities.length + ' 项能力'),
              fieldValue(tier, 'breakthrough') ? h('span', { className: 'sl-faint', style: { fontSize: 9 } }, '突破：' + clipText(fieldValue(tier, 'breakthrough'), 34)) : null
            )
          )
        )
      })
    ),
    h(
      'div',
      { className: 'sl-power-side' },
      h(
        'div',
        { className: 'sl-warning-card' },
        h('h4', null, issues.length ? '战力校验' : '阶梯完整'),
        issues.length
          ? h('ul', null, issues.slice(0, 6).map(function (issue) { return h('li', { key: issue.id || issue.code }, issue.detail) }))
          : h('p', null, '当前没有发现越阶或阶位缺失。')
      ),
      unranked.length
        ? h(
            'div',
            { className: 'sl-warning-card', style: { borderColor: 'var(--sl-line)', background: 'rgba(126,110,88,.04)' } },
            h('h4', { style: { color: 'var(--sl-muted)' } }, '未归阶人物'),
            h('p', null, unranked.map(function (entry) { return entry.name }).join('、')),
            h('p', { style: { marginTop: 6, color: 'var(--sl-faint)' } }, '涉及战斗时，先给他们定一个阶位。')
          )
        : null,
      h(
        'div',
        { className: 'sl-note-card', style: { cursor: 'default' } },
        h('div', { className: 'sl-note-top' }, h('span', { className: 'sl-note-name' }, '校验规则')),
        h(
          'div',
          { style: { fontSize: 10, lineHeight: 1.7, color: 'var(--sl-muted)' } },
          '能力的最低境界不能高于拥有者的当前境界。越阶必须有破例设定或代价，否则检查器会报 error。'
        )
      )
    )
  )
}

function outlineRow(props) {
  var entry = props.entry
  var level = String(fieldValue(entry, 'level') || '')
  var children = props.childrenMap[entry.id] || []
  var open = props.expanded[entry.id] !== false
  var isVolume = level === '卷' || level === '幕'
  var status = fieldValue(entry, 'status') || '构思'
  var target = Number(fieldValue(entry, 'targetWords')) || 0
  var actual = Number(fieldValue(entry, 'actualWords')) || 0
  return h(
    'div',
    { key: entry.id },
    h(
      'div',
      {
        className: 'sl-outline-row ' + (isVolume ? 'is-volume' : ''),
        style: { '--depth': props.depth, paddingLeft: 12 + props.depth * 18 },
        role: 'button',
        tabIndex: 0,
        onClick: function () { props.onOpen(entry) },
        onKeyDown: function (event) { if (event.key === 'Enter' || event.key === ' ') props.onOpen(entry) }
      },
      children.length
        ? h(
            'button',
            {
              type: 'button',
              className: 'sl-outline-caret',
              onClick: function (event) { event.stopPropagation(); props.onToggle(entry.id) },
              title: open ? '折叠' : '展开'
            },
            h(Icon, { name: open ? 'chevron-down' : 'chevron-right', size: 13 })
          )
        : h('span', { className: 'sl-outline-caret' }),
      h('span', { className: 'sl-level-badge' }, level || '节'),
      h('span', { className: 'sl-outline-num' }, fieldValue(entry, 'number') || ''),
      h('span', { className: 'sl-outline-title' }, entry.name),
      h('span', { className: 'sl-outline-sub' }, clipText(fieldValue(entry, 'logline') || fieldValue(entry, 'conflict') || '', 46)),
      h(
        'span',
        { className: 'sl-outline-meta' },
        target || actual ? h('span', { className: 'sl-faint', style: { fontSize: 9 } }, nf(actual) + '/' + nf(target) + ' 字') : null,
        h(StatusPill, { value: status })
      )
    ),
    children.length && open
      ? h(
          'div',
          { className: 'sl-outline-children' },
          children.map(function (child) {
            return outlineRow({ entry: child, depth: props.depth + 1, childrenMap: props.childrenMap, expanded: props.expanded, onToggle: props.onToggle, onOpen: props.onOpen })
          })
        )
      : null
  )
}

function OutlineView(props) {
  var state = props.state
  var expandedState = useState({})
  var expanded = expandedState[0]
  var setExpanded = expandedState[1]
  if (!props.entries.length) {
    return h(EmptyState, {
      icon: 'branch',
      title: '大纲还是空的',
      description: props.readOnly ? '还没有大纲。告诉我卷章结构，我来搭。' : '先建「第一卷」，再在它下面建「第一章」。层级用父级字段组织，顺序用排序值。',
      actions: props.readOnly ? null : [
        h('button', { key: 'vol', type: 'button', className: 'sl-btn primary', onClick: function () { props.onNew({ fields: { level: '卷', status: '构思', number: '第一卷', order: 1 } }) } }, '新建第一卷'),
        h('button', { key: 'ch', type: 'button', className: 'sl-btn', onClick: function () { props.onNew({ fields: { level: '章', status: '构思', number: '1-01', order: 101 } }) } }, '新建第一章')
      ]
    })
  }
  var tree = buildOutlineTree(state)
  function toggle(id) {
    setExpanded(function (previous) {
      var next = Object.assign({}, previous)
      next[id] = previous[id] === false
      return next
    })
  }
  return h(
    'div',
    { className: 'sl-outline' },
    tree.roots.map(function (entry) {
      return outlineRow({ entry: entry, depth: 0, childrenMap: tree.children, expanded: expanded, onToggle: toggle, onOpen: props.onOpen })
    }),
    h('div', { className: 'sl-outline-hint' }, '用父级字段组织卷/幕/章；用排序值控制同层顺序。章节的「章节档案」会在写完后接到这里。')
  )
}

function ThreadsView(props) {
  var state = props.state
  var map = entryMap(state)
  var columns = ['待埋', '已埋', '推进中', '待回收', '已回收']
  var chapters = entriesOf(state, 'chapters')
  var current = 0
  chapters.forEach(function (entry) {
    if (['已完成', '已修订'].indexOf(String(fieldValue(entry, 'status') || '')) >= 0) current = Math.max(current, chapterNo(entry) || 0)
  })
  if (!props.entries.length) {
    return h(EmptyState, {
      icon: 'thread',
      title: '还没有登记伏笔',
      description: props.readOnly ? '还没有登记伏笔。你写正文，我来扒。' : '挖了坑就记下来：埋在哪一章、读者已知什么、计划什么时候回收、真相是什么。',
      actions: props.readOnly ? null : h('button', { type: 'button', className: 'sl-btn primary', onClick: props.onNew }, h(Icon, { name: 'plus', size: 13 }), '登记第一个伏笔')
    })
  }
  return h(
    'div',
    { className: 'sl-kanban' },
    columns.map(function (status) {
      var list = props.entries.filter(function (entry) { return String(fieldValue(entry, 'status') || '待埋') === status })
      return h(
        'div',
        {
          key: status,
          className: 'sl-kanban-col',
          onDragOver: props.readOnly ? undefined : function (event) { event.preventDefault(); event.currentTarget.querySelector('.sl-kanban-body').classList.add('drag-over') },
          onDragLeave: props.readOnly ? undefined : function (event) { event.currentTarget.querySelector('.sl-kanban-body').classList.remove('drag-over') },
          onDrop: props.readOnly ? undefined : function (event) {
            event.preventDefault()
            event.currentTarget.querySelector('.sl-kanban-body').classList.remove('drag-over')
            var id = event.dataTransfer.getData('text/plain')
            if (id) props.onQuickStatus(id, status)
          }
        },
        h(
          'div',
          { className: 'sl-kanban-head' },
          h(StatusPill, { value: status, dot: false }),
          h('b', null, status),
          h('span', { className: 'sl-kanban-count' }, list.length)
        ),
        h(
          'div',
          { className: 'sl-kanban-body' },
          list.length
            ? list.map(function (entry) {
                var payoff = fieldValue(entry, 'payoffChapter')
                var payoffNo = payoff ? chapterNo(map[payoff]) : null
                var overdue = payoffNo !== null && current > payoffNo && status !== '已回收'
                return h(
                  'div',
                  {
                    key: entry.id,
                    className: 'sl-thread-card ' + (overdue ? 'overdue' : ''),
                    draggable: !props.readOnly,
                    onDragStart: props.readOnly ? undefined : function (event) { event.dataTransfer.setData('text/plain', entry.id); event.dataTransfer.effectAllowed = 'move' },
                    onClick: function () { props.onOpen(entry) }
                  },
                  h('div', { className: 'sl-thread-name' }, entry.name),
                  h(
                    'div',
                    { className: 'sl-thread-sub' },
                    [
                      fieldValue(entry, 'importance') || '一般',
                      fieldValue(entry, 'plantChapter') ? '埋 ' + refName(map, fieldValue(entry, 'plantChapter')) : '未记埋设',
                      payoff ? '收 ' + refName(map, payoff) : fieldValue(entry, 'plan') ? clipText(fieldValue(entry, 'plan'), 18) : '待定'
                    ].join(' · ')
                  ),
                  h(
                    'div',
                    { className: 'sl-thread-foot' },
                    overdue ? h(StatusPill, { value: '逾期', tone: 'red' }) : null,
                    fieldValue(entry, 'type') ? h(Tag, null, fieldValue(entry, 'type')) : null
                  )
                )
              })
            : h('div', { className: 'sl-faint', style: { fontSize: 9.5, textAlign: 'center', padding: '18px 6px' } }, props.readOnly ? '暂无' : '拖动卡片到这里')
        )
      )
    })
  )
}

function MapView(props) {
  var state = props.state
  var project = state.project
  var map = project.map || {}
  var locations = entriesOf(state, 'locations').filter(function (entry) {
    return Number.isFinite(Number(fieldValue(entry, 'mapX'))) && Number.isFinite(Number(fieldValue(entry, 'mapY')))
  })
  var zoomState = useState(1)
  var zoom = zoomState[0]
  var setZoom = zoomState[1]
  var markState = useState(false)
  var markMode = markState[0]
  var setMarkMode = markState[1]
  var targetState = useState('')
  var targetId = targetState[0]
  var setTargetId = targetState[1]
  var fileRef = useRef(null)
  var mapEntry = entryMap(state)

  function upload(file) {
    if (!file) return
    props.onUploadMap(file)
  }

  function onStageClick(event) {
    if (!markMode || !targetId) return
    var rect = event.currentTarget.getBoundingClientRect()
    var x = ((event.clientX - rect.left) / rect.width) * 100
    var y = ((event.clientY - rect.top) / rect.height) * 100
    if (x < 0 || x > 100 || y < 0 || y > 100) return
    props.onFieldChange(targetId, 'mapX', Math.round(x * 10) / 10)
    props.onFieldChange(targetId, 'mapY', Math.round(y * 10) / 10)
    props.onToast({ kind: 'ok', text: '已把「' + (mapEntry[targetId] ? mapEntry[targetId].name : '地点') + '」钉在地图上。' })
  }

  return h(
    'div',
    { className: 'sl-map-wrap' },
    h(
      'div',
      { className: 'sl-map-toolbar' },
      props.readOnly ? null : h('button', { type: 'button', className: 'sl-btn small', onClick: function () { fileRef.current && fileRef.current.click() } }, h(Icon, { name: 'upload', size: 13 }), map.image ? '更换地图' : '上传地图'),
      props.readOnly ? null : h('input', {
        ref: fileRef,
        type: 'file',
        accept: 'image/png,image/jpeg,image/webp,image/gif',
        style: { display: 'none' },
        onChange: function (event) { upload(event.target.files && event.target.files[0]); event.target.value = '' }
      }),
      map.image
        ? h(
            'div',
            { style: { display: 'flex', alignItems: 'center', gap: 4 } },
            h('button', { type: 'button', className: 'sl-icon-btn', onClick: function () { setZoom(Math.max(0.5, Math.round((zoom - 0.1) * 10) / 10)) }, title: '缩小' }, h(Icon, { name: 'minus', size: 14 })),
            h('span', { className: 'sl-faint', style: { fontSize: 10, minWidth: 32, textAlign: 'center' } }, Math.round(zoom * 100) + '%'),
            h('button', { type: 'button', className: 'sl-icon-btn', onClick: function () { setZoom(Math.min(2, Math.round((zoom + 0.1) * 10) / 10)) }, title: '放大' }, h(Icon, { name: 'plus', size: 14 })),
            h('button', { type: 'button', className: 'sl-btn small ghost', onClick: function () { setZoom(1) } }, '重置')
          )
        : null,
      props.readOnly
        ? null
        : h(
            'button',
            {
              type: 'button',
              className: 'sl-btn small ' + (markMode ? 'primary' : ''),
              onClick: function () {
                if (!markMode && !targetId && locations.length) setTargetId(locations[0].id)
                setMarkMode(!markMode)
              }
            },
            h(Icon, { name: 'pin', size: 13 }),
            markMode ? '退出标记' : '标记地点'
          ),
      !props.readOnly && markMode
        ? h(
            'select',
            { className: 'sl-select', style: { width: 150, height: 26, fontSize: 10.5 }, value: targetId, onChange: function (event) { setTargetId(event.target.value) } },
            h('option', { value: '' }, '选择地点'),
            entriesOf(state, 'locations').map(function (entry) { return h('option', { key: entry.id, value: entry.id }, entry.name) })
          )
        : null,
      !props.readOnly && markMode ? h('span', { className: 'sl-faint', style: { fontSize: 9.5 } }, '点击地图放置；再点可移动') : null,
      h('span', { style: { flex: 1 } }),
      h('span', { className: 'sl-faint', style: { fontSize: 9.5 } }, locations.length + ' 个地点已标记')
    ),
    map.image
      ? h(
          'div',
          { className: 'sl-map-stage-wrap' },
          h(
            'div',
            { className: 'sl-map-stage', style: { width: zoom * 100 + '%', cursor: !props.readOnly && markMode ? 'crosshair' : 'default' }, onClick: props.readOnly ? undefined : onStageClick },
            h('img', { className: 'sl-map-img', src: map.image, alt: '世界地图', draggable: false }),
            locations.map(function (entry) {
              var x = Number(fieldValue(entry, 'mapX'))
              var y = Number(fieldValue(entry, 'mapY'))
              return h(
                'button',
                {
                  key: entry.id,
                  type: 'button',
                  className: 'sl-map-pin ' + (targetId === entry.id ? 'selected' : ''),
                  style: { left: x + '%', top: y + '%' },
                  onClick: function (event) { event.stopPropagation(); if (!markMode) props.onOpen(entry) },
                  title: entry.name
                },
                h('span', { className: 'sl-pin-dot' }),
                h('span', { className: 'sl-pin-label' }, entry.name)
              )
            })
          )
        )
      : h(
          'div',
          { className: 'sl-map-stage-wrap' },
          h(
            'div',
            { className: 'sl-map-empty' },
            h(Icon, { name: 'map', size: 34 }),
            h('h3', null, '还差一张地图'),
            h('p', { style: { maxWidth: 320, fontSize: 10.5, lineHeight: 1.7, margin: 0 } }, props.readOnly ? '还没有上传地图。把地图文件发我，我来放进去。' : '上传一张世界地图或城市地图，再把「地点」钉上去。支持 PNG / JPEG / WebP / GIF。'),
            props.readOnly ? null : h('button', { type: 'button', className: 'sl-btn primary', onClick: function () { fileRef.current && fileRef.current.click() } }, h(Icon, { name: 'upload', size: 13 }), '上传地图')
          )
        ),
    h(
      'div',
      { className: 'sl-map-legend' },
      h('span', null, props.readOnly ? '只读地图 · 地点由 AI 维护' : '提示：先在「地点」里建好地点，再回到地图标记。'),
      h('span', null, '地图图片存放在 story-loom/projects/<id>/media/。')
    )
  )
}

function NotesView(props) {
  var state = props.state
  if (!props.entries.length) {
    return h(EmptyState, {
      icon: 'note',
      title: '便签墙是空的',
      description: props.readOnly ? '还没有便签。告诉我，我来记。' : '灵感、待办、决策、问题，先记下来。之后再把它们归进设定或大纲。',
      actions: props.readOnly ? null : h('button', { type: 'button', className: 'sl-btn primary', onClick: props.onNew }, h(Icon, { name: 'plus', size: 13 }), '写一张便签')
    })
  }
  var sorted = props.entries.slice().sort(function (a, b) {
    var rank = { 核心: 0, 重要: 1, 一般: 2 }
    var ar = rank[fieldValue(a, 'importance')] || 9
    var br = rank[fieldValue(b, 'importance')] || 9
    if (ar !== br) return ar - br
    return String(b.updatedAt).localeCompare(String(a.updatedAt))
  })
  return h(
    'div',
    { className: 'sl-notes' },
    sorted.map(function (entry) {
      var important = String(fieldValue(entry, 'importance') || '') === '核心' || String(fieldValue(entry, 'importance') || '') === '重要'
      var body = entry.body || fieldValue(entry, 'learn') || fieldValue(entry, 'definition') || ''
      return h(
        'button',
        {
          key: entry.id,
          type: 'button',
          className: 'sl-note-card ' + (important ? 'important' : ''),
          onClick: function () { props.onOpen(entry) }
        },
        h(
          'div',
          { className: 'sl-note-top' },
          h('span', { className: 'sl-note-name' }, entry.name),
          fieldValue(entry, 'type') ? h(StatusPill, { value: fieldValue(entry, 'type'), dot: false }) : null
        ),
        body ? h('div', { className: 'sl-note-body' }, stripMarkdown(body)) : null,
        h(
          'div',
          { className: 'sl-note-foot' },
          fieldValue(entry, 'status') ? h(StatusPill, { value: fieldValue(entry, 'status') }) : null,
          (entry.tags || []).slice(0, 3).map(function (tag) { return h(Tag, { key: tag }, tag) })
        )
      )
    })
  )
}

function CodexView(props) {
  var state = props.state
  var map = entryMap(state)
  if (!props.entries.length) {
    return h(EmptyState, {
      icon: 'paw',
      title: '图鉴还没有条目',
      description: props.readOnly ? '图鉴还是空的。告诉我，我来收。' : '怪物、异种、道具、植物……每条写清楚：危险等级、弱点、栖息地、战力对标。',
      actions: props.readOnly ? null : h('button', { type: 'button', className: 'sl-btn primary', onClick: props.onNew }, h(Icon, { name: 'plus', size: 13 }), '收录第一个条目')
    })
  }
  return h(
    'div',
    { className: 'sl-codex-grid' },
    props.entries.map(function (entry, index) {
      var danger = fieldValue(entry, 'danger')
      return h(
        'button',
        { key: entry.id, type: 'button', className: 'sl-codex-card', onClick: function () { props.onOpen(entry) } },
        h(
          'div',
          { className: 'sl-codex-top' },
          h('span', { className: 'sl-codex-emblem' }, entryInitial(entry.name)),
          h(
            'span',
            { className: 'sl-codex-title' },
            h('span', { className: 'sl-codex-name' }, entry.name),
            h('span', { className: 'sl-codex-cat' }, [fieldValue(entry, 'category'), fieldValue(entry, 'tier') ? '对标 ' + refName(map, fieldValue(entry, 'tier')) : ''].filter(Boolean).join(' · ') || '未分类')
          ),
          danger ? h(StatusPill, { value: danger }) : null
        ),
        h('div', { className: 'sl-codex-desc' }, clipText(fieldValue(entry, 'behavior') || fieldValue(entry, 'weakness') || stripMarkdown(entry.body) || '还没有写习性。', 120)),
        h(
          'div',
          { className: 'sl-codex-meta' },
          refNames(map, fieldValue(entry, 'habitat')).slice(0, 2).map(function (name) { return h(Tag, { key: name }, name) }),
          fieldValue(entry, 'weakness') ? h(Tag, null, '弱点：' + clipText(fieldValue(entry, 'weakness'), 18)) : null
        )
      )
    })
  )
}

function BoardView(props) {
  var board = props.board
  if (!board) return null
  if (board.kind === 'overview') return h(OverviewView, props)
  if (board.kind === 'timeline') return h(TimelineView, props)
  if (board.kind === 'power') return h(PowerView, props)
  if (board.kind === 'outline') return h(OutlineView, props)
  if (board.kind === 'threads') return h(ThreadsView, props)
  if (board.kind === 'map') return h(MapView, props)
  if (board.kind === 'notes') return h(NotesView, props)
  if (board.kind === 'codex') return h(CodexView, props)
  if (board.kind === 'list') return h(ListView, props)
  return h(CardsView, props)
}


/* ---- 45-reader-modals.js ---- */
/* 织世 · 只读端的搜索与连续性弹层 */

function SearchModal(props) {
  var state = props.state
  var inputRef = useRef(null)
  var queryState = useState('')
  var query = queryState[0]
  var setQuery = queryState[1]
  var activeState = useState(0)
  var active = activeState[0]
  var setActive = activeState[1]
  useEffect(function () {
    if (inputRef.current) inputRef.current.focus()
  }, [])
  useEscape(true, props.onClose)
  var q = query.trim().toLowerCase()
  var results = []
  if (q) {
    var map = entryMap(state)
    state.entries.forEach(function (entry) {
      var board = boardOf(state, entry.boardId)
      var score = 0
      if (entry.name.toLowerCase() === q) score += 100
      else if (entry.name.toLowerCase().indexOf(q) >= 0) score += 60
      if ((entry.subtitle || '').toLowerCase().indexOf(q) >= 0) score += 25
      if ((entry.tags || []).some(function (tag) { return tag.toLowerCase().indexOf(q) >= 0 })) score += 20
      var fieldText = ''
      if (board) {
        board.fields.forEach(function (field) {
          var value = fieldValue(entry, field.id)
          if (value && typeof value !== 'object') fieldText += ' ' + value
        })
      }
      if (fieldText.toLowerCase().indexOf(q) >= 0) score += 12
      if ((entry.body || '').toLowerCase().indexOf(q) >= 0) score += 8
      if (score > 0) results.push({ entry: entry, board: board, score: score })
    })
    results.sort(function (a, b) { return b.score - a.score || a.entry.name.localeCompare(b.entry.name, 'zh-CN') })
    results = results.slice(0, 30)
  } else {
    results = state.entries.slice().sort(function (a, b) { return String(b.updatedAt).localeCompare(String(a.updatedAt)) }).slice(0, 8).map(function (entry) { return { entry: entry, board: boardOf(state, entry.boardId), score: 0 } })
  }
  useEffect(function () { setActive(0) }, [query])
  function open(entry) {
    if (!entry) return
    props.onOpen(entry)
    props.onClose()
  }
  function onKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive(function (value) { return Math.min(results.length - 1, value + 1) })
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive(function (value) { return Math.max(0, value - 1) })
    } else if (event.key === 'Enter') {
      event.preventDefault()
      var selected = results[active]
      if (selected) open(selected.entry)
      else if (q) props.onNewByQuery && props.onNewByQuery(q)
    }
  }
  return h(
    Portal,
    null,
    h(
      'div',
      { className: 'sl-modal-layer', onMouseDown: function (event) { if (event.target === event.currentTarget) props.onClose() } },
      h(
        'div',
        { className: 'sl-search-modal', role: 'dialog', 'aria-modal': 'true' },
        h(
          'div',
          { className: 'sl-search-top' },
          h(Icon, { name: 'search', size: 18 }),
          h('input', {
            ref: inputRef,
            className: 'sl-search-input',
            value: query,
            placeholder: '搜索人物、设定、伏笔、正文…',
            onChange: function (event) { setQuery(event.target.value) },
            onKeyDown: onKeyDown
          }),
          h('span', { className: 'sl-kbd' }, 'ESC')
        ),
        h(
          'div',
          { className: 'sl-search-results' },
          q ? h('div', { className: 'sl-search-section' }, results.length ? '搜索结果 · ' + results.length : '没有找到') : h('div', { className: 'sl-search-section' }, '最近修改'),
          results.map(function (result, index) {
            return h(
              'button',
              {
                key: result.entry.id,
                type: 'button',
                className: 'sl-search-row ' + (index === active ? 'active' : ''),
                onMouseEnter: function () { setActive(index) },
                onClick: function () { open(result.entry) }
              },
              h('span', { className: 'sl-avatar ' + (result.board && result.board.id === 'characters' ? 'red' : result.board && result.board.id === 'locations' ? 'blue' : 'gray') }, entryInitial(result.entry.name)),
              h(
                'span',
                { className: 'sl-search-main' },
                h('span', { className: 'sl-search-name' }, result.entry.name),
                h('span', { className: 'sl-search-sub' }, clipText(result.entry.subtitle || stripMarkdown(result.entry.body) || '—', 76))
              ),
              h('span', { className: 'sl-search-board' }, result.board ? result.board.name : '')
            )
          }),
          !results.length
            ? h(
                'div',
                { className: 'sl-search-empty' },
                q ? '没有匹配的条目。' : '输入一个名字、设定或句子。',
                q && props.onNewByQuery ? h('div', { style: { marginTop: 10 } }, h('button', { type: 'button', className: 'sl-btn small', onClick: function () { props.onNewByQuery(q) } }, '新建「' + q + '」')) : null
              )
            : null
        ),
        h(
          'div',
          { className: 'sl-search-foot' },
          h('span', null, h('span', { className: 'sl-kbd' }, '↑'), h('span', { className: 'sl-kbd' }, '↓'), ' 选择'),
          h('span', null, h('span', { className: 'sl-kbd' }, '↵'), ' 打开'),
          h('span', { style: { marginLeft: 'auto' } }, '搜索所有板块与正文')
        )
      )
    )
  )
}

function LintModal(props) {
  var lint = props.lint
  var filterState = useState('all')
  var filter = filterState[0]
  var setFilter = filterState[1]
  if (!lint) return null
  var issues = lint.issues.filter(function (issue) { return filter === 'all' || issue.severity === filter })
  var map = entryMap(props.state)
  return h(
    Modal,
    {
      title: '连续性检查',
      subtitle: '断链、越阶、死者复现、伏笔逾期、时间线错位——在写下一章之前先看一遍。',
      width: 'wide',
      onClose: props.onClose,
      footer: [
        h('span', { key: 'hint', className: 'sl-faint', style: { fontSize: 9.5 } }, '检查基于当前已保存的数据；改完后再点一次「重新检查」。'),
        h('div', { key: 'space', className: 'sl-spacer' }),
        h('button', { key: 'recheck', type: 'button', className: 'sl-btn', onClick: props.onRecheck }, h(Icon, { name: 'redo', size: 13 }), '重新检查'),
        h('button', { key: 'close', type: 'button', className: 'sl-btn primary', onClick: props.onClose }, '关闭')
      ]
    },
    h(
      'div',
      { className: 'sl-lint-summary' },
      h(ScoreRing, { score: lint.score }),
      h(
        'div',
        { className: 'sl-lint-summary-main' },
        h('b', null, lint.counts.error ? '还有 ' + lint.counts.error + ' 个硬矛盾要处理' : '没有硬矛盾'),
        h('span', null, 'error ' + lint.counts.error + ' · warn ' + lint.counts.warn + ' · info ' + lint.counts.info + ' · 检查于 ' + relativeTime(lint.checkedAt))
      )
    ),
    h(
      'div',
      { className: 'sl-lint-filters' },
      h('button', { type: 'button', className: 'sl-btn small ' + (filter === 'all' ? 'primary' : 'ghost'), onClick: function () { setFilter('all') } }, '全部 ' + lint.issues.length),
      h('button', { type: 'button', className: 'sl-btn small ' + (filter === 'error' ? 'primary' : 'ghost'), onClick: function () { setFilter('error') } }, '矛盾 ' + lint.counts.error),
      h('button', { type: 'button', className: 'sl-btn small ' + (filter === 'warn' ? 'primary' : 'ghost'), onClick: function () { setFilter('warn') } }, '提醒 ' + lint.counts.warn),
      h('button', { type: 'button', className: 'sl-btn small ' + (filter === 'info' ? 'primary' : 'ghost'), onClick: function () { setFilter('info') } }, '建议 ' + lint.counts.info)
    ),
    issues.length
      ? issues.map(function (issue) {
          return h(
            'button',
            {
              key: issue.id || issue.code + (issue.entryId || ''),
              type: 'button',
              className: 'sl-lint-issue sev-' + issue.severity,
              onClick: function () {
                if (issue.entryId && map[issue.entryId]) {
                  props.onOpen(map[issue.entryId])
                  props.onClose()
                }
              }
            },
            h(Icon, { name: issue.severity === 'error' ? 'error' : issue.severity === 'warn' ? 'warning' : 'info', size: 15 }),
            h(
              'span',
              { className: 'sl-lint-issue-main' },
              h('span', { className: 'sl-lint-issue-title' }, issue.title),
              h('span', { className: 'sl-lint-issue-detail' }, issue.detail)
            ),
            issue.boardId ? h('span', { className: 'sl-lint-issue-board' }, (boardOf(props.state, issue.boardId) || {}).name || issue.boardId) : null
          )
        })
      : h(
          'div',
          { className: 'sl-lint-clean' },
          h(Seal),
          h('h4', null, '这一遍很干净'),
          h('p', null, '没有发现断链、越阶、死者复现、伏笔逾期或时间线错位。')
        )
  )
}

function SyncModal(props) {
  var busyState = useState('')
  var busy = busyState[0]
  var setBusy = busyState[1]
  var pendingState = useState(null)
  var pending = pendingState[0]
  var setPending = pendingState[1]
  var configState = useState(null)
  var config = configState[0]
  var setConfig = configState[1]
  var folderState = useState('')
  var folder = folderState[0]
  var setFolder = folderState[1]
  var fileRef = useRef(null)

  useEffect(function () {
    api.syncConfig().then(function (data) {
      setConfig(data)
      setFolder(data.configured || data.root || '')
    }).catch(function () {
      setConfig({ root: '读取失败' })
    })
  }, [])

  async function doExport() {
    if (busy) return
    setBusy('export')
    try {
      var bundle = await api.exportBundle(props.projectId)
      var name = ((props.project && props.project.title) || 'story').replace(/[\\/:*?"<>|]/g, '-')
      downloadText(name + '.storyloom.json', JSON.stringify(bundle, null, 2), 'application/json')
      props.onToast({ kind: 'ok', text: '同步包已导出。请通过私密渠道传到另一台设备。' })
    } catch (err) {
      props.onToast({ kind: 'error', text: '导出失败：' + (err && err.message ? err.message : '未知错误') })
    } finally {
      setBusy('')
    }
  }

  async function switchFolder(mode) {
    if (busy) return
    var value = String(folder || '').trim()
    if (!value) {
      props.onToast({ kind: 'error', text: '先填写同步文件夹路径。' })
      return
    }
    setBusy(mode)
    try {
      var result = await api.switchSyncFolder(value, mode)
      props.onSwitched(result)
      props.onClose()
      props.onToast({ kind: 'ok', text: mode === 'copy' ? '已把当前世界复制到同步文件夹。' : '已切换到同步文件夹。' })
    } catch (err) {
      props.onToast({ kind: 'error', text: '切换失败：' + (err && err.message ? err.message : '未知错误') })
      setBusy('')
    }
  }

  async function resetFolder() {
    if (busy) return
    setBusy('reset')
    try {
      var result = await api.resetSyncFolder()
      props.onSwitched(result)
      props.onClose()
      props.onToast({ kind: 'ok', text: '已恢复默认数据位置。' })
    } catch (err) {
      props.onToast({ kind: 'error', text: '恢复失败：' + (err && err.message ? err.message : '未知错误') })
      setBusy('')
    }
  }

  function chooseFile(file) {
    if (!file) return
    var reader = new FileReader()
    reader.onload = function () {
      try {
        var bundle = JSON.parse(String(reader.result || '{}'))
        if (!bundle || bundle.format !== 'dsh-story-loom/sync') {
          props.onToast({ kind: 'error', text: '这不是织世同步包。' })
          return
        }
        setPending({ bundle: bundle, name: file.name, size: file.size })
      } catch (err) {
        props.onToast({ kind: 'error', text: '同步包不是合法 JSON。' })
      }
    }
    reader.onerror = function () { props.onToast({ kind: 'error', text: '读取文件失败。' }) }
    reader.readAsText(file)
  }

  async function doImport() {
    if (!pending || busy) return
    setBusy('import')
    try {
      var result = await api.importBundle(pending.bundle)
      props.onImported(result)
      props.onClose()
      props.onToast({ kind: 'ok', text: '同步完成：' + result.state.project.title })
    } catch (err) {
      props.onToast({ kind: 'error', text: '导入失败：' + (err && err.message ? err.message : '未知错误') })
      setBusy('')
    }
  }

  return h(
    Modal,
    {
      title: '同步到另一台设备',
      subtitle: '不经过服务器：共享文件夹自动同步，或导出文件手动传。',
      width: 'narrow',
      onClose: props.onClose,
      footer: [h('div', { key: 'space', className: 'sl-spacer' }), h('button', { key: 'close', type: 'button', className: 'sl-btn', onClick: props.onClose }, '关闭')]
    },
    h(
      'div',
      null,
      h(
        'div',
        { className: 'sl-sync-folder' },
        h('div', { className: 'sl-settings-section', style: { marginBottom: 10 } },
          h('h4', null, '实时同步文件夹'),
          h('p', null, '两台设备指向同一个 iCloud / OneDrive / Syncthing 文件夹。面板每 3 秒检查一次更新。'),
          h('div', { className: 'sl-path-code' }, config ? config.root : '读取中…'),
          h('input', {
            className: 'sl-input',
            style: { marginTop: 7 },
            value: folder,
            placeholder: '例如 ~/Library/Mobile Documents/com~apple~CloudDocs/织世同步',
            onChange: function (event) { setFolder(event.target.value) }
          }),
          h(
            'div',
            { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 7 } },
            h('button', { type: 'button', className: 'sl-btn primary small', onClick: function () { switchFolder('copy') }, disabled: !!busy }, busy === 'copy' ? '复制中…' : '复制当前世界到这里'),
            h('button', { type: 'button', className: 'sl-btn small', onClick: function () { switchFolder('use') }, disabled: !!busy }, busy === 'use' ? '切换中…' : '使用这里已有的数据'),
            config && config.configured
              ? h('button', { type: 'button', className: 'sl-btn small ghost', onClick: resetFolder, disabled: !!busy }, '恢复默认位置')
              : null
          ),
          h('div', { className: 'sl-settings-note', style: { marginTop: 7 } }, '第一台设备选「复制到这里」；第二台设备填同一个文件夹，选「使用已有数据」。之后两台都不要改这个位置。'),
          h('div', { className: 'sl-settings-note', style: { marginTop: 6, color: 'var(--sl-accent)' } }, '不要在两台设备上同时改。等一台显示「已同步」后，再换另一台。')
        )
      ),
      h('div', { className: 'sl-sync-divider' }, '或者：一次性传输'),
      h(
        'div',
        { className: 'sl-sync-card' },
        h('div', { className: 'sl-sync-icon' }, h(Icon, { name: 'download', size: 18 })),
        h('div', { style: { flex: 1, minWidth: 0 } }, h('b', null, '导出同步包'), h('p', null, '包含当前世界的全部档案、地图/图片和文风指南，生成一个 .storyloom.json 文件。')),
        h('button', { type: 'button', className: 'sl-btn primary', onClick: doExport, disabled: !!busy }, busy === 'export' ? '导出中…' : '导出')
      ),
      h(
        'div',
        { className: 'sl-sync-card' },
        h('div', { className: 'sl-sync-icon' }, h(Icon, { name: 'upload', size: 18 })),
        h('div', { style: { flex: 1, minWidth: 0 } }, h('b', null, '导入同步包'), h('p', null, '选择另一台设备导出的文件。同名项目会被覆盖，本机会先备份当前版本。')),
        h(
          'button',
          { type: 'button', className: 'sl-btn', onClick: function () { fileRef.current && fileRef.current.click() }, disabled: !!busy },
          pending ? '重新选择' : '选择文件'
        ),
        h('input', {
          ref: fileRef,
          type: 'file',
          accept: '.json,.storyloom,application/json',
          style: { display: 'none' },
          onChange: function (event) { chooseFile(event.target.files && event.target.files[0]); event.target.value = '' }
        })
      ),
      pending
        ? h('div', { className: 'sl-sync-pending' }, h(Icon, { name: 'archive', size: 13 }), h('span', null, pending.name + ' · ' + Math.round(pending.size / 1024) + ' KB'), h('button', { type: 'button', className: 'sl-btn small primary', onClick: doImport, disabled: !!busy }, busy === 'import' ? '导入中…' : '导入这个包'))
        : null,
      h('div', { className: 'sl-settings-note', style: { marginTop: 10 } }, '同步包是明文，包含完整作品数据。请用 AirDrop、U 盘或你自己的私有云传输，不要发到公开群/仓库。'),
      h('div', { className: 'sl-faint', style: { fontSize: 9.5, marginTop: 6 } }, '当前世界：' + ((props.project && props.project.title) || '未命名') + ' · 修订 ' + (props.revision == null ? '?' : props.revision) + ' · 自动检查 3 秒'),
      busy ? h('div', { className: 'sl-faint', style: { fontSize: 10, marginTop: 6 } }, '处理中…') : null
    )
  )
}


/* ---- 60-reader.js ---- */
/* 织世 · 只读查阅端（左侧主面板） */

var PANEL_ID = 'story-loom'

function StoryPanelIcon(props) {
  var size = props && props.size ? props.size : 18
  return h(
    'svg',
    { width: size, height: size, viewBox: '0 0 18 18', fill: 'none', 'aria-hidden': 'true' },
    h('rect', { x: 2.2, y: 2.2, width: 13.6, height: 13.6, rx: 3.2, stroke: 'currentColor', strokeWidth: 1.3, opacity: 0.9 }),
    h('path', { d: 'M5.4 6.2h7.2M5.4 9h5.4M5.4 11.8h3.6', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' })
  )
}

function readerStatusOf(entry, board) {
  return fieldValue(entry, 'status') || fieldValue(entry, 'danger') || fieldValue(entry, 'force') || fieldValue(entry, 'level')
}

function ReaderRefChip(props) {
  return h(
    'button',
    {
      type: 'button',
      className: 'sl-reader-ref',
      onClick: function () { props.onOpen(props.entry) },
      title: props.entry ? '打开「' + props.entry.name + '」' : ''
    },
    h(Icon, { name: 'link', size: 11 }),
    props.entry ? props.entry.name : '（已删除）'
  )
}

function ReaderFieldValue(props) {
  var field = props.field
  var value = props.value
  var state = props.state
  var map = entryMap(state)
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) return h('span', { className: 'sl-reader-muted' }, '—')
  if (field.type === 'ref') {
    var target = map[value]
    return target ? h(ReaderRefChip, { entry: target, onOpen: props.onOpenEntry }) : h('span', { className: 'sl-reader-muted' }, '（已删除）')
  }
  if (field.type === 'refs') {
    return h(
      'span',
      { className: 'sl-reader-refs' },
      refIds(value).map(function (id) {
        var target = map[id]
        return target
          ? h(ReaderRefChip, { key: id, entry: target, onOpen: props.onOpenEntry })
          : h('span', { key: id, className: 'sl-reader-muted' }, '（已删除）')
      })
    )
  }
  if (field.type === 'relations') {
    var relations = Array.isArray(value) ? value : []
    if (!relations.length) return h('span', { className: 'sl-reader-muted' }, '—')
    return h(
      'div',
      { className: 'sl-reader-relations' },
      relations.map(function (rel, index) {
        var target = map[rel.targetId]
        return h(
          'div',
          { key: rel.id || index, className: 'sl-reader-relation' },
          target ? h(ReaderRefChip, { entry: target, onOpen: props.onOpenEntry }) : h('span', { className: 'sl-reader-muted' }, '（已删除）'),
          rel.type ? h('b', null, rel.type) : null,
          rel.note ? h('span', null, rel.note) : null
        )
      })
    )
  }
  if (field.type === 'tags') {
    return h('span', { className: 'sl-reader-tags' }, (value || []).map(function (tag) { return h(Tag, { key: tag }, tag) }))
  }
  if (field.type === 'checkbox') return h('span', null, value ? '是' : '否')
  if (field.type === 'number') return h('span', { className: 'sl-reader-number' }, String(value))
  var text = String(value)
  return h('span', { className: 'sl-reader-text' }, text)
}

function ReaderEntry(props) {
  var state = props.state
  var entry = props.entry
  var board = props.board
  if (!entry || !board) return null
  var map = entryMap(state)
  var issues = (props.lint ? props.lint.issues : []).filter(function (issue) { return issue.entryId === entry.id })
  var status = readerStatusOf(entry, board)
  var visibleFields = board.fields.filter(function (field) {
    if (field.hidden) return false
    var value = fieldValue(entry, field.id)
    return !(value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))
  })
  function openWiki(event) {
    var target = event.target.closest ? event.target.closest('[data-wikilink]') : null
    if (!target) return
    var name = target.getAttribute('data-wikilink')
    var found = state.entries.find(function (candidate) { return candidate.name === name })
    if (found) props.onOpenEntry(found)
  }
  function copyEntry() {
    var lines = ['# ' + entry.name]
    if (entry.subtitle) lines.push('', entry.subtitle)
    if (entry.tags && entry.tags.length) lines.push('', '标签：' + entry.tags.join('、'))
    if (visibleFields.length) {
      lines.push('')
      visibleFields.forEach(function (field) {
        var value = fieldValue(entry, field.id)
        var rendered = ''
        if (field.type === 'ref') rendered = refName(map, value)
        else if (field.type === 'refs') rendered = refNames(map, value).join('、')
        else if (field.type === 'relations') rendered = (value || []).map(function (rel) { return refName(map, rel.targetId) + (rel.type ? '（' + rel.type + '）' : '') }).join('；')
        else if (Array.isArray(value)) rendered = value.join('、')
        else rendered = String(value)
        lines.push('- ' + field.label + '：' + rendered)
      })
    }
    if (entry.body) lines.push('', entry.body)
    copyText(lines.join('\n')).then(function () { props.onToast({ kind: 'ok', text: '条目已复制。' }) })
  }
  return h(
    'aside',
    { className: 'sl-detail sl-reader-detail', 'aria-label': '条目详情' },
    h(
      'div',
      { className: 'sl-detail-head' },
      h(
        'div',
        { className: 'sl-detail-top' },
        h('div', { className: 'sl-detail-board' }, h(Icon, { name: board.icon || 'layers', size: 12 }), h('span', null, board.name), h('span', { className: 'sl-faint' }, '· 只读')),
        h(
          'div',
          { className: 'sl-detail-actions' },
          h('button', { type: 'button', className: 'sl-icon-btn', title: '复制条目 Markdown', onClick: copyEntry }, h(Icon, { name: 'copy', size: 14 })),
          h('button', { type: 'button', className: 'sl-icon-btn', title: '关闭', onClick: props.onClose }, h(Icon, { name: 'close', size: 16 }))
        )
      ),
      h('h2', { className: 'sl-reader-title' }, entry.name),
      entry.subtitle ? h('div', { className: 'sl-reader-subtitle' }, entry.subtitle) : null,
      h(
        'div',
        { className: 'sl-detail-meta' },
        status ? h(StatusPill, { value: status }) : null,
        entry.locked ? h(StatusPill, { value: '已锁定', tone: 'gold' }) : null,
        (entry.tags || []).map(function (tag) { return h(Tag, { key: tag }, tag) }),
        h('span', { className: 'sl-reader-sync' }, '更新于 ' + relativeTime(entry.updatedAt))
      )
    ),
    h(
      'div',
      { className: 'sl-detail-body' },
      entry.locked ? h('div', { className: 'sl-lock-note' }, h(Icon, { name: 'lock', size: 12 }), '这条设定已锁定。AI 修改前会先征得你的同意。') : null,
      visibleFields.length
        ? h(
            'div',
            { className: 'sl-reader-fields' },
            visibleFields.map(function (field) {
              return h(
                'div',
                { key: field.id, className: 'sl-reader-field' },
                h('div', { className: 'sl-reader-label' }, field.label),
                h('div', { className: 'sl-reader-value' }, h(ReaderFieldValue, { field: field, value: fieldValue(entry, field.id), state: state, onOpenEntry: props.onOpenEntry }))
              )
            })
          )
        : h('div', { className: 'sl-reader-muted', style: { fontSize: 10.5, padding: '4px 0 10px' } }, '这一条还没有结构化字段。'),
      entry.relations && entry.relations.length
        ? h(
            'div',
            { className: 'sl-reader-section' },
            h('div', { className: 'sl-reader-section-title' }, '关系'),
            h(
              'div',
              { className: 'sl-reader-relations' },
              entry.relations.map(function (rel, index) {
                var target = map[rel.targetId]
                return h(
                  'div',
                  { key: rel.id || index, className: 'sl-reader-relation' },
                  target ? h(ReaderRefChip, { entry: target, onOpen: props.onOpenEntry }) : h('span', { className: 'sl-reader-muted' }, '（已删除）'),
                  rel.type ? h('b', null, rel.type) : null,
                  rel.note ? h('span', null, rel.note) : null
                )
              })
            )
          )
        : null,
      entry.body
        ? h(
            'div',
            { className: 'sl-reader-section' },
            h('div', { className: 'sl-reader-section-title' }, '正文 / 笔记'),
            h('div', { className: 'sl-md sl-reader-body', onClick: openWiki, dangerouslySetInnerHTML: { __html: renderMarkdown(entry.body) } })
          )
        : null,
      issues.length
        ? h(
            'div',
            { className: 'sl-reader-section' },
            h('div', { className: 'sl-reader-section-title', style: { color: 'var(--sl-accent)' } }, '这条目的提醒'),
            issues.map(function (issue) {
              return h(
                'div',
                { key: issue.id || issue.code, className: 'sl-lint-issue sev-' + issue.severity },
                h(Icon, { name: issue.severity === 'error' ? 'error' : issue.severity === 'warn' ? 'warning' : 'info', size: 13 }),
                h('span', { className: 'sl-lint-issue-main' }, h('span', { className: 'sl-lint-issue-title' }, issue.title), h('span', { className: 'sl-lint-issue-detail' }, issue.detail))
              )
            })
          )
        : null
    ),
    h(
      'div',
      { className: 'sl-detail-foot' },
      h(Icon, { name: 'lock', size: 11 }),
      h('span', null, '只读档案 · 要改这条设定，直接在对话里说'),
      h('span', { className: 'sl-spacer', style: { flex: 1 } }),
      h('span', { className: 'sl-faint' }, entry.id)
    )
  )
}

function ReaderTopBar(props) {
  return h(
    'header',
    { className: 'sl-top' },
    h(
      'div',
      { className: 'sl-top-left' },
      h('button', { type: 'button', className: 'sl-icon-btn sl-hide-lg', title: '目录', onClick: props.onToggleNav }, h(Icon, { name: 'menu', size: 18 })),
      h('div', { className: 'sl-brand' }, h(Seal, { title: '织世 · Story Loom' }), h('div', { className: 'sl-brand-text' }, h('span', { className: 'sl-brand-name' }, '织世'), h('span', { className: 'sl-brand-sub' }, 'STORY LOOM · 只读'))),
      h('span', { className: 'sl-top-divider' }),
      h(
        'div',
        { className: 'sl-dropdown' },
        h(
          'button',
          { type: 'button', className: 'sl-project-btn', title: '切换世界', onClick: function () { props.setProjectMenuOpen(!props.projectMenuOpen) } },
          h(
            'span',
            { style: { minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' } },
            h('span', { className: 'sl-project-title' }, props.project ? props.project.title : '载入中'),
            props.project && (props.project.genre || props.project.subtitle) ? h('span', { className: 'sl-project-genre' }, props.project.genre || props.project.subtitle) : null
          ),
          h(Icon, { name: 'chevron-down', size: 13 })
        ),
        props.projectMenuOpen
          ? h(
              Portal,
              null,
              h('div', { className: 'sl-pop-layer', onMouseDown: function () { props.setProjectMenuOpen(false) } }),
              h(
                'div',
                { className: 'sl-popover', style: { position: 'fixed', left: 12, top: 58, width: 250 } },
                h('div', { className: 'sl-menu-label' }, '世界'),
                props.index.projects.map(function (project) {
                  return h(MenuItem, {
                    key: project.id,
                    icon: project.id === props.projectId ? 'check' : 'book',
                    active: project.id === props.projectId,
                    onClick: function () { props.setProjectMenuOpen(false); props.onSwitchProject(project.id) },
                    hint: formatDate(project.updatedAt)
                  }, project.title)
                }),
                h('div', { className: 'sl-menu-sep' }),
                h(MenuItem, { icon: 'info', onClick: function () { props.setProjectMenuOpen(false); props.onHelp() } }, '这个面板怎么用')
              )
            )
          : null
      )
    ),
    h(
      'button',
      { type: 'button', className: 'sl-search-trigger', onClick: props.onSearch, title: '搜索（⌘K）' },
      h(Icon, { name: 'search', size: 14 }),
      h('span', null, '搜索人物、设定、伏笔、正文…'),
      h('span', { className: 'sl-kbd' }, '⌘ K')
    ),
    h(
      'div',
      { className: 'sl-top-actions' },
      h('span', { className: 'sl-sync-state', title: '数据由 AI 写入，这里只读' }, h('i', { className: 'sl-dot' }), '只读 · ' + (props.lastSync ? formatDate(props.lastSync, true).slice(11) : '—')),
      h('button', { type: 'button', className: 'sl-icon-btn', title: '从磁盘同步', onClick: props.onRefresh }, h(Icon, { name: 'redo', size: 15 })),
      h(
        'button',
        { type: 'button', className: 'sl-lint-btn ' + (props.lint && props.lint.counts.error === 0 ? 'clean' : ''), title: '连续性检查', onClick: props.onLint },
        h(Icon, { name: 'scale', size: 13 }),
        h('span', null, '连续性'),
        h('span', { className: 'sl-lint-count' }, props.lint ? (props.lint.counts.error || props.lint.counts.warn || props.lint.counts.info) : '—')
      ),
      h('button', { type: 'button', className: 'sl-icon-btn', title: '同步到另一台设备', onClick: props.onSync }, h(Icon, { name: 'sync', size: 16 })),
      h('button', { type: 'button', className: 'sl-icon-btn', title: '使用说明', onClick: props.onHelp }, h(Icon, { name: 'help', size: 16 }))
    )
  )
}

function ReaderNav(props) {
  var state = props.state
  var groups = groupBoards(state)
  return h(
    'aside',
    { className: 'sl-nav' },
    h('div', { className: 'sl-nav-head' }, h('span', { className: 'sl-nav-label' }, '故事档案'), h('span', { className: 'sl-nav-count' }, state.entries.length + ' 条')),
    h(
      'div',
      { className: 'sl-nav-scroll' },
      h(
        'button',
        { type: 'button', className: 'sl-nav-dash ' + (props.selectedBoardId === DASHBOARD ? 'active' : ''), onClick: function () { props.onSelectBoard(DASHBOARD) } },
        h(Icon, { name: 'grid', size: 15 }),
        h('span', { className: 'sl-nav-text' }, '总览'),
        h('span', { className: 'sl-nav-count' }, '')
      ),
      groups.map(function (group) {
        return h(
          'div',
          { className: 'sl-nav-group', key: group.name },
          h('div', { className: 'sl-nav-group-head' }, h('span', null, group.name)),
          group.boards.map(function (board) {
            var count = state.entries.filter(function (entry) { return entry.boardId === board.id }).length
            var warn = props.lint ? props.lint.issues.filter(function (issue) { return issue.boardId === board.id }).length : 0
            return h(
              'button',
              {
                key: board.id,
                type: 'button',
                className: 'sl-nav-item ' + (props.selectedBoardId === board.id ? 'active' : ''),
                onClick: function () { props.onSelectBoard(board.id) }
              },
              h('span', { className: 'sl-nav-icon' }, h(Icon, { name: board.icon || 'layers', size: 14 })),
              h('span', { className: 'sl-nav-text' }, board.name),
              warn ? h('span', { className: 'sl-nav-badge', title: warn + ' 个提醒' }) : count ? h('span', { className: 'sl-nav-count' }, count) : null
            )
          })
        )
      })
    ),
    h(
      'div',
      { className: 'sl-nav-footer' },
      h(
        'button',
        { type: 'button', className: 'sl-nav-foot-btn', onClick: props.onShowLint },
        h(Icon, { name: 'scale', size: 14 }),
        h('span', null, '连续性检查'),
        h('span', { className: 'sl-nav-score ' + (props.lint ? (props.lint.score < 65 ? 'bad' : props.lint.score < 85 ? 'warn' : '') : '') }, props.lint ? props.lint.score : '—')
      ),
      h('button', { type: 'button', className: 'sl-nav-foot-btn', onClick: props.onHelp }, h(Icon, { name: 'help', size: 14 }), h('span', null, '使用说明'))
    )
  )
}

function ReaderBoardHeader(props) {
  var board = props.board
  if (!board) {
    return h(
      'div',
      { className: 'sl-board-head' },
      h(
        'div',
        { className: 'sl-board-heading' },
        h('div', { className: 'sl-breadcrumb' }, '织世 · 只读档案'),
        h('div', { className: 'sl-board-title-row' }, h('h1', { className: 'sl-board-title' }, '总览'), h(StatusPill, { value: '只读', tone: 'gray' })),
        h('div', { className: 'sl-board-desc' }, '世界、人物、伏笔与进度。你在对话里说设定，我写进档案；这里只负责随时翻。')
      ),
      h(
        'div',
        { className: 'sl-board-head-actions' },
        h('button', { type: 'button', className: 'sl-btn', onClick: function () { props.onSelectBoard('outline') } }, h(Icon, { name: 'branch', size: 13 }), '打开大纲'),
        h('button', { type: 'button', className: 'sl-btn', onClick: props.onLint }, h(Icon, { name: 'scale', size: 13 }), '连续性')
      )
    )
  }
  return h(
    'div',
    { className: 'sl-board-head' },
    h(
      'div',
      { className: 'sl-board-heading' },
      h('div', { className: 'sl-breadcrumb' }, board.group, h(Icon, { name: 'chevron-right', size: 10 }), VIEW_LABELS[board.kind] || '板块'),
      h('div', { className: 'sl-board-title-row' }, h('h1', { className: 'sl-board-title' }, board.name), h('span', { className: 'sl-count-note' }, props.count + ' 条'), h(StatusPill, { value: '只读', tone: 'gray' })),
      h('div', { className: 'sl-board-desc' }, board.description || '')
    ),
    h(
      'div',
      { className: 'sl-board-head-actions' },
      h('button', { type: 'button', className: 'sl-icon-btn', title: '从磁盘同步', onClick: props.onRefresh }, h(Icon, { name: 'redo', size: 15 }))
    )
  )
}

function ReaderToolbar(props) {
  return h(
    'div',
    { className: 'sl-toolbar' },
    h(
      'div',
      { className: 'sl-toolbar-left' },
      h('input', {
        className: 'sl-filter-input',
        value: props.query,
        placeholder: '筛选当前档案…',
        onChange: function (event) { props.setQuery(event.target.value) }
      }),
      h('span', { className: 'sl-count-note' }, props.query ? '筛出 ' + props.count + ' 条' : props.count + ' 条')
    ),
    h(
      'div',
      { className: 'sl-toolbar-right' },
      h('button', { type: 'button', className: 'sl-icon-btn', title: '从磁盘同步', onClick: props.onRefresh }, h(Icon, { name: 'redo', size: 14 }))
    )
  )
}

function ReaderDashboard(props) {
  var state = props.state
  var lint = props.lint
  var stats = props.stats
  var project = state.project
  var outline = sortOutline(state).filter(function (entry) { return fieldValue(entry, 'level') === '章' })
  var chapters = entriesOf(state, 'chapters').slice().sort(function (a, b) { return (chapterNo(a) || 0) - (chapterNo(b) || 0) })
  var openThreads = entriesOf(state, 'threads')
    .filter(function (entry) { return ['已回收', '废弃'].indexOf(String(fieldValue(entry, 'status') || '')) < 0 })
    .sort(function (a, b) {
      var rank = { 核心: 0, 重要: 1, 一般: 2 }
      return (rank[fieldValue(a, 'importance')] || 9) - (rank[fieldValue(b, 'importance')] || 9)
    })
  var characters = entriesOf(state, 'characters')
  var power = entriesOf(state, 'power').slice().sort(function (a, b) { return Number(fieldValue(a, 'rank')) - Number(fieldValue(b, 'rank')) })
  var recent = state.entries.slice().sort(function (a, b) { return String(b.updatedAt).localeCompare(String(a.updatedAt)) }).slice(0, 6)
  var empty = state.entries.length <= 2 && !(entriesOf(state, 'overview')[0] && fieldValue(entriesOf(state, 'overview')[0], 'coreConflict'))
  return h(
    'div',
    { className: 'sl-dash' },
    h(
      'section',
      { className: 'sl-hero' },
      h('div', { className: 'sl-hero-eyebrow' }, 'STORY LOOM · 只读世界档案'),
      h('h1', { className: 'sl-hero-title' }, project.title || '未命名世界'),
      h('div', { className: 'sl-hero-sub' }, [project.genre, project.subtitle].filter(Boolean).join(' · ') || '你负责讲，我负责记'),
      project.logline
        ? h('p', { className: 'sl-hero-logline' }, project.logline)
        : h('p', { className: 'sl-hero-logline empty' }, '还没有一句话故事。在对话里告诉我，我来补。'),
      h(
        'div',
        { className: 'sl-hero-actions' },
        h('button', { type: 'button', className: 'sl-btn primary', onClick: function () { props.onSelectBoard(openThreads.length ? 'threads' : 'characters') } }, h(Icon, { name: openThreads.length ? 'thread' : 'user', size: 14 }), openThreads.length ? '先看没回收的坑' : '先看人物'),
        h('button', { type: 'button', className: 'sl-btn', onClick: props.onLint }, h(Icon, { name: 'scale', size: 14 }), '连续性：' + (lint ? lint.score : '—')),
        h(
          'div',
          { className: 'sl-hero-meta' },
          h('div', null, h('b', null, nf(stats.words)), '已写字数'),
          h('div', null, h('b', null, stats.chapters), '章节档案'),
          h('div', null, h('b', null, stats.openThreads), '未回收伏笔')
        )
      )
    ),
    h(
      'div',
      { className: 'sl-stats' },
      h('div', { className: 'sl-stat' }, h('div', { className: 'sl-stat-value' }, nf(stats.entries)), h('div', { className: 'sl-stat-label' }, '档案条目')),
      h('div', { className: 'sl-stat' }, h('div', { className: 'sl-stat-value' }, stats.chapters + ' / ' + outline.length), h('div', { className: 'sl-stat-label' }, '章节进度')),
      h('div', { className: 'sl-stat' }, h('div', { className: 'sl-stat-value' }, nf(stats.openThreads)), h('div', { className: 'sl-stat-label' }, '没回收的坑')),
      h('div', { className: 'sl-stat' }, h('div', { className: 'sl-stat-value' }, lint ? lint.score : '—'), h('div', { className: 'sl-stat-label' }, '连续性评分'))
    ),
    empty
      ? h(
          SectionCard,
          { title: '这座世界还是空的', icon: 'compass' },
          h('p', { className: 'sl-faint', style: { fontSize: 11, lineHeight: 1.8, margin: '0 0 10px' } }, '把你已经有的想法告诉我：题材、主角、核心冲突、力量来源、想写的第一卷。我会拆成人物、设定、大纲和伏笔录进来。'),
          h('div', { style: { display: 'flex', gap: 7, flexWrap: 'wrap' } },
            h('button', { type: 'button', className: 'sl-btn small', onClick: function () { props.onSelectBoard('characters') } }, '先建人物'),
            h('button', { type: 'button', className: 'sl-btn small', onClick: function () { props.onSelectBoard('power') } }, '先排力量'),
            h('button', { type: 'button', className: 'sl-btn small', onClick: function () { props.onSelectBoard('outline') } }, '先搭大纲')
          )
        )
      : null,
    h(
      'div',
      { className: 'sl-grid' },
      h(
        SectionCard,
        { title: '写到哪了', icon: 'branch', action: h('button', { type: 'button', className: 'sl-card-link', onClick: function () { props.onSelectBoard('outline') } }, '大纲') },
        outline.length
          ? outline.slice(-6).map(function (entry) {
              return h(
                'button',
                { key: entry.id, type: 'button', className: 'sl-progress-row', style: { border: 0, background: 'transparent', textAlign: 'left', width: '100%' }, onClick: function () { props.onOpen(entry) } },
                h('span', { className: 'sl-progress-index' }, String(fieldValue(entry, 'number') || '').slice(0, 6)),
                h('span', { className: 'sl-progress-main' }, h('span', { className: 'sl-progress-title' }, entry.name), h('span', { className: 'sl-progress-sub' }, clipText(fieldValue(entry, 'logline') || fieldValue(entry, 'conflict') || '—', 54))),
                h(StatusPill, { value: fieldValue(entry, 'status') || '构思' })
              )
            })
          : h(EmptyState, { icon: 'branch', title: '还没有大纲', description: '告诉我卷章结构，我来搭。' })
      ),
      h(
        SectionCard,
        { title: '没回收的坑', icon: 'thread', action: h('button', { type: 'button', className: 'sl-card-link', onClick: function () { props.onSelectBoard('threads') } }, '全部') },
        openThreads.length
          ? openThreads.slice(0, 6).map(function (entry) {
              return h(
                'button',
                { key: entry.id, type: 'button', className: 'sl-thread-mini', style: { border: 0, background: 'transparent', textAlign: 'left', width: '100%' }, onClick: function () { props.onOpen(entry) } },
                h(StatusPill, { value: fieldValue(entry, 'status') || '待埋' }),
                h('span', { className: 'sl-thread-mini-main' }, h('span', { className: 'sl-thread-mini-title' }, entry.name), h('span', { className: 'sl-thread-mini-sub' }, clipText(fieldValue(entry, 'plan') || fieldValue(entry, 'known') || '还没有写计划', 60)))
              )
            })
          : h(EmptyState, { icon: 'thread', title: '没有未回收的坑', description: '你写正文，我会自动从里面扒。' })
      )
    ),
    h(
      'div',
      { className: 'sl-grid three' },
      h(
        SectionCard,
        { title: '连续性', icon: 'scale', action: h('button', { type: 'button', className: 'sl-card-link', onClick: props.onLint }, '报告') },
        h('div', { style: { display: 'flex', gap: 12, alignItems: 'center' } }, h(ScoreRing, { score: lint ? lint.score : 0 }), h('div', { style: { flex: 1, minWidth: 0 } }, h('div', { style: { fontSize: 11.5, fontWeight: 500 } }, lint ? (lint.counts.error ? '有 ' + lint.counts.error + ' 个硬矛盾' : '没有硬矛盾') : '尚未检查'), h('div', { className: 'sl-faint', style: { fontSize: 9.5, marginTop: 2 } }, lint ? 'warn ' + lint.counts.warn + ' · info ' + lint.counts.info : ''))),
        lint && lint.issues.length
          ? h('div', { style: { marginTop: 8 } }, lint.issues.slice(0, 3).map(function (issue) {
              return h('button', { key: issue.id || issue.code, type: 'button', className: 'sl-lint-issue sev-' + issue.severity, style: { marginBottom: 4 }, onClick: function () { props.onOpenEntryId(issue.entryId) } }, h(Icon, { name: issue.severity === 'error' ? 'error' : issue.severity === 'warn' ? 'warning' : 'info', size: 13 }), h('span', { className: 'sl-lint-issue-main' }, h('span', { className: 'sl-lint-issue-title' }, issue.title), h('span', { className: 'sl-lint-issue-detail' }, clipText(issue.detail, 80))))
            }))
          : h('div', { className: 'sl-faint', style: { fontSize: 10.5, marginTop: 8 } }, '目前没有发现明显矛盾。')
      ),
      h(
        SectionCard,
        { title: '人物', icon: 'user', action: h('button', { type: 'button', className: 'sl-card-link', onClick: function () { props.onSelectBoard('characters') } }, '全部') },
        characters.length
          ? h('div', { className: 'sl-dash-characters' }, characters.slice(0, 8).map(function (entry) {
              return h('button', { key: entry.id, type: 'button', className: 'sl-dash-char', onClick: function () { props.onOpen(entry) }, title: entry.name }, h('span', { className: 'sl-avatar ' + (String(fieldValue(entry, 'role')) === '反派' ? 'red' : String(fieldValue(entry, 'role')) === '主角' ? '' : 'gray') }, entryInitial(entry.name)), h('span', null, entry.name))
            }))
          : h(EmptyState, { icon: 'user', title: '还没有人物', description: '告诉我主角是谁，我来建。' })
      ),
      h(
        SectionCard,
        { title: '力量阶梯', icon: 'bolt', action: h('button', { type: 'button', className: 'sl-card-link', onClick: function () { props.onSelectBoard('power') } }, '展开') },
        power.length
          ? power.slice(-5).reverse().map(function (entry) {
              return h('button', { key: entry.id, type: 'button', className: 'sl-progress-row', style: { border: 0, background: 'transparent', textAlign: 'left', width: '100%' }, onClick: function () { props.onOpen(entry) } }, h('span', { className: 'sl-progress-index' }, String(fieldValue(entry, 'rank') || '?')), h('span', { className: 'sl-progress-main' }, h('span', { className: 'sl-progress-title' }, entry.name), h('span', { className: 'sl-progress-sub' }, clipText(fieldValue(entry, 'power') || '—', 48))), h('span', { className: 'sl-faint', style: { fontSize: 9 } }, (fieldValue(entry, 'representatives') || []).length + ' 人'))
            })
          : h(EmptyState, { icon: 'bolt', title: '还没有力量阶梯', description: '告诉我境界，我来排。' })
      )
    ),
    h(
      SectionCard,
      { title: '最近更新', icon: 'clock' },
      recent.map(function (entry) {
        var board = boardOf(state, entry.boardId)
        return h(
          'button',
          { key: entry.id, type: 'button', className: 'sl-progress-row', style: { border: 0, background: 'transparent', textAlign: 'left', width: '100%' }, onClick: function () { props.onOpen(entry) } },
          h('span', { className: 'sl-progress-index' }, relativeTime(entry.updatedAt)),
          h('span', { className: 'sl-progress-main' }, h('span', { className: 'sl-progress-title' }, entry.name), h('span', { className: 'sl-progress-sub' }, board ? board.name : '')),
          h(Icon, { name: 'chevron-right', size: 12 })
        )
      })
    )
  )
}

function ReaderHelp(props) {
  return h(
    Modal,
    {
      title: '织世 · 怎么用',
      subtitle: '这个面板只读。你负责讲，我负责记。',
      width: 'narrow',
      onClose: props.onClose,
      footer: [h('div', { key: 'space', className: 'sl-spacer' }), h('button', { key: 'ok', type: 'button', className: 'sl-btn primary', onClick: props.onClose }, '知道了')]
    },
    h(
      'div',
      { className: 'sl-reader-help' },
      h('p', null, '把设定直接发在对话里即可：人物、势力、地点、力量境界、时间点、大纲、想埋的坑。我会写进对应的板块。'),
      h('p', null, '你写正文时，不用自己填伏笔。把文章发我，我会从里面扒出新坑、新设定、时间点、人物状态变化，自动记账，然后跑连续性检查。'),
      h('p', null, '左侧「织世」入口随时打开查阅。档案会自动同步；也可以点右上角刷新。'),
      h('p', { className: 'sl-faint' }, '这个面板不提供编辑，是为了不让设定在两边打架。要改什么，直接说。')
    )
  )
}

function ReaderApp() {
  var bootState = useState(null)
  var boot = bootState[0]
  var setBoot = bootState[1]
  var projectIdState = useState('')
  var projectId = projectIdState[0]
  var setProjectId = projectIdState[1]
  var stateWrap = useState(null)
  var state = stateWrap[0]
  var setState = stateWrap[1]
  var revisionState = useState(0)
  var revision = revisionState[0]
  var setRevision = revisionState[1]
  var loadingState = useState(true)
  var loading = loadingState[0]
  var setLoading = loadingState[1]
  var fatalState = useState('')
  var fatal = fatalState[0]
  var setFatal = fatalState[1]
  var lintStateWrap = useState(null)
  var lint = lintStateWrap[0]
  var setLint = lintStateWrap[1]
  var selectedBoardState = useState(DASHBOARD)
  var selectedBoardId = selectedBoardState[0]
  var setSelectedBoardId = selectedBoardState[1]
  var selectedEntryState = useState('')
  var selectedEntryId = selectedEntryState[0]
  var setSelectedEntryId = selectedEntryState[1]
  var queryState = useState('')
  var query = queryState[0]
  var setQuery = queryState[1]
  var searchOpenState = useState(false)
  var searchOpen = searchOpenState[0]
  var setSearchOpen = searchOpenState[1]
  var lintOpenState = useState(false)
  var lintOpen = lintOpenState[0]
  var setLintOpen = lintOpenState[1]
  var helpOpenState = useState(false)
  var helpOpen = helpOpenState[0]
  var setHelpOpen = helpOpenState[1]
  var syncOpenState = useState(false)
  var syncOpen = syncOpenState[0]
  var setSyncOpen = syncOpenState[1]
  var projectMenuState = useState(false)
  var projectMenuOpen = projectMenuState[0]
  var setProjectMenuOpen = projectMenuState[1]
  var toastState = useState(null)
  var toast = toastState[0]
  var setToastState = toastState[1]
  var lastSyncState = useState('')
  var lastSync = lastSyncState[0]
  var setLastSync = lastSyncState[1]
  var navOpenState = useState(false)
  var navOpen = navOpenState[0]
  var setNavOpen = navOpenState[1]
  var initialRef = useRef(false)
  var revisionRef = useRef(0)
  var projectIdRef = useRef('')
  var stateRef = useRef(null)
  var toastTimerRef = useRef(null)
  var lintSeqRef = useRef(0)
  var selectedEntryRef = useRef('')

  stateRef.current = state
  selectedEntryRef.current = selectedEntryId
  revisionRef.current = revision
  projectIdRef.current = projectId

  function showToast(value) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToastState(value)
    toastTimerRef.current = setTimeout(function () { setToastState(null) }, 2800)
  }

  function persistPrefs(patch) {
    var prefs = readLastPrefs()
    var projects = prefs.projects || {}
    if (projectIdRef.current) projects[projectIdRef.current] = Object.assign({}, projects[projectIdRef.current] || {}, patch)
    prefs.projects = projects
    prefs.lastProjectId = projectIdRef.current || prefs.lastProjectId
    writeLastPrefs(prefs)
  }

  function selectBoard(id) {
    setNavOpen(false)
    setSelectedBoardId(id)
    setSelectedEntryId('')
    selectedEntryRef.current = ''
    setQuery('')
    if (id !== DASHBOARD) persistPrefs({ board: id, entry: '' })
  }

  function openEntry(entry) {
    if (!entry) return
    setNavOpen(false)
    setSelectedEntryId(entry.id)
    selectedEntryRef.current = entry.id
    setSelectedBoardId(entry.boardId)
    persistPrefs({ board: entry.boardId, entry: entry.id })
  }

  function openEntryId(id) {
    if (!id || !stateRef.current) return
    var entry = stateRef.current.entries.find(function (item) { return item.id === id })
    if (entry) openEntry(entry)
  }

  async function refreshLint(target, seq) {
    if (!projectIdRef.current || !target) return
    try {
      var result = await api.lint(projectIdRef.current, target)
      if (seq !== undefined && seq !== lintSeqRef.current) return
      setLint(result.lint)
    } catch (err) {
      /* 检查失败不打断阅读 */
    }
  }

  function applyLoaded(data, keepSelection) {
    if (!data || !data.state) throw new Error('服务返回了空项目')
    var next = data.state
    var previousEntry = keepSelection === false ? '' : selectedEntryRef.current
    stateRef.current = next
    setState(next)
    setRevision(next.revision || 0)
    revisionRef.current = next.revision || 0
    setLastSync(new Date().toISOString())
    setLoading(false)
    setFatal('')
    var prefs = readLastPrefs()
    var projectPrefs = (prefs.projects || {})[projectIdRef.current] || {}
    var boardOK = next.boards.some(function (board) { return board.id === projectPrefs.board })
    var boardId = boardOK ? projectPrefs.board : DASHBOARD
    if (previousEntry) {
      var found = next.entries.find(function (entry) { return entry.id === previousEntry })
      if (found) {
        boardId = found.boardId
        setSelectedEntryId(found.id)
      } else {
        setSelectedEntryId('')
      }
    } else {
      setSelectedEntryId('')
    }
    setSelectedBoardId(boardId)
    refreshLint(next, ++lintSeqRef.current)
  }

  async function loadProject(id, keepSelection) {
    var pid = id || projectIdRef.current
    if (!pid) return
    setLoading(true)
    setFatal('')
    try {
      var data = await api.getProject(pid)
      projectIdRef.current = pid
      setProjectId(pid)
      applyLoaded(data, keepSelection)
    } catch (err) {
      setLoading(false)
      setFatal(err && err.message ? err.message : String(err))
    }
  }

  async function bootstrapApp() {
    setLoading(true)
    setFatal('')
    try {
      var data = await api.bootstrap()
      setBoot(data)
      var prefs = readLastPrefs()
      var ids = (data.index.projects || []).map(function (project) { return project.id })
      var target = ids.indexOf(prefs.lastProjectId) >= 0 ? prefs.lastProjectId : data.activeProjectId || ids[0] || 'main'
      projectIdRef.current = target
      setProjectId(target)
      await loadProject(target, false)
    } catch (err) {
      setLoading(false)
      setFatal(err && err.message ? err.message : String(err))
    }
  }

  useEffect(function () {
    if (initialRef.current) return
    initialRef.current = true
    bootstrapApp()
  }, [])

  useEffect(function () {
    if (!state || !projectId) return undefined
    var seq = ++lintSeqRef.current
    var timer = setTimeout(function () { refreshLint(stateRef.current, seq) }, 900)
    return function () { clearTimeout(timer) }
  }, [state, projectId])

  useEffect(function () {
    if (!projectId) return undefined
    var cancelled = false
    async function check() {
      if (cancelled) return
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
      try {
        var data = await api.getProject(projectId)
        if (cancelled) return
        if (data.state.revision !== revisionRef.current) {
          applyLoaded(data, true)
          showToast({ kind: 'ok', text: '档案已同步。' })
        } else {
          setLastSync(new Date().toISOString())
        }
      } catch (err) {
        /* 网络抖动不打断阅读 */
      }
    }
    var timer = setInterval(check, 3000)
    function onVisible() {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', check)
    return function () {
      cancelled = true
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', check)
    }
  }, [projectId])

  useEffect(function () {
    function onKey(event) {
      var mod = event.metaKey || event.ctrlKey
      if (mod && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return function () { document.removeEventListener('keydown', onKey) }
  }, [])

  async function switchProject(id) {
    if (!id || id === projectIdRef.current) return
    try {
      await api.activateProject(id)
      var data = await api.bootstrap()
      setBoot(data)
      projectIdRef.current = id
      setProjectId(id)
      await loadProject(id, false)
    } catch (err) {
      showToast({ kind: 'error', text: '切换失败：' + (err && err.message ? err.message : '未知错误') })
    }
  }

  async function manualRefresh() {
    if (!projectIdRef.current) return
    try {
      var data = await api.getProject(projectIdRef.current)
      if (data.state.revision === revisionRef.current) {
        setLastSync(new Date().toISOString())
        showToast({ kind: 'ok', text: '已经是最新版本。' })
        return
      }
      applyLoaded(data, true)
      showToast({ kind: 'ok', text: '已同步最新档案。' })
    } catch (err) {
      showToast({ kind: 'error', text: '同步失败：' + (err && err.message ? err.message : '未知错误') })
    }
  }

  function handleImported(result) {
    if (!result || !result.state) return
    var id = result.state.project.id
    projectIdRef.current = id
    setProjectId(id)
    if (boot && result.index) setBoot(Object.assign({}, boot, { index: result.index }))
    applyLoaded({ state: result.state }, false)
  }

  var board = state ? boardOf(state, selectedBoardId) : null
  var allEntries = state && board ? entriesOf(state, board.id) : []
  var filteredEntries = allEntries
  if (query.trim()) {
    var q = query.trim().toLowerCase()
    filteredEntries = allEntries.filter(function (entry) {
      if (entry.name.toLowerCase().indexOf(q) >= 0) return true
      if ((entry.subtitle || '').toLowerCase().indexOf(q) >= 0) return true
      if ((entry.body || '').toLowerCase().indexOf(q) >= 0) return true
      if ((entry.tags || []).some(function (tag) { return tag.toLowerCase().indexOf(q) >= 0 })) return true
      if (board) {
        return board.fields.some(function (field) {
          var value = fieldValue(entry, field.id)
          return value && typeof value !== 'object' && String(value).toLowerCase().indexOf(q) >= 0
        })
      }
      return false
    })
  }
  if (board) {
    if (board.id === 'chapters') filteredEntries = filteredEntries.slice().sort(function (a, b) { return (Number(fieldValue(a, 'number')) || 0) - (Number(fieldValue(b, 'number')) || 0) })
    else if (board.id === 'timeline') filteredEntries = filteredEntries.slice().sort(function (a, b) { return (Number(fieldValue(a, 'sort')) || 0) - (Number(fieldValue(b, 'sort')) || 0) })
    else if (board.id === 'power') filteredEntries = filteredEntries.slice().sort(function (a, b) { return (Number(fieldValue(a, 'rank')) || 0) - (Number(fieldValue(b, 'rank')) || 0) })
    else if (board.id !== 'outline') filteredEntries = filteredEntries.slice().sort(function (a, b) { return String(b.updatedAt).localeCompare(String(a.updatedAt)) })
  }
  var selectedEntry = state && selectedEntryId ? state.entries.find(function (entry) { return entry.id === selectedEntryId }) : null
  var stats = state ? calcStats(state, lint) : { entries: 0, boards: 0, chapters: 0, words: 0, openThreads: 0, characters: 0, castAlive: 0, score: 0, errors: 0, warnings: 0 }

  if (loading && !state) {
    return h('div', { className: 'sl-app' }, h('div', { className: 'sl-loading' }, h(Seal), h(Spinner), h('span', null, '正在展开故事档案…')))
  }
  if (fatal && !state) {
    return h('div', { className: 'sl-app' }, h('div', { className: 'sl-error-panel' }, h('h3', null, '织世没能打开故事档案'), h('p', { className: 'sl-muted', style: { fontSize: 11.5, lineHeight: 1.7 } }, fatal), h('code', null, '/story-loom/api/bootstrap'), h('p', { className: 'sl-faint', style: { fontSize: 10.5, lineHeight: 1.7 } }, '如果这是刚安装的插件，请刷新一次页面，让左栏加载「织世」。'), h('button', { type: 'button', className: 'sl-btn primary', style: { marginTop: 12 }, onClick: bootstrapApp }, '重试')))
  }

  return h(
    'div',
    { className: 'sl-app sl-reader-app', 'data-nav-open': navOpen ? 'true' : 'false' },
    h(ReaderTopBar, {
      project: state.project,
      projectId: projectId,
      index: boot ? boot.index : { projects: [] },
      projectMenuOpen: projectMenuOpen,
      setProjectMenuOpen: setProjectMenuOpen,
      onSwitchProject: switchProject,
      onSearch: function () { setSearchOpen(true) },
      onRefresh: manualRefresh,
      onLint: function () { setLintOpen(true) },
      onSync: function () { setSyncOpen(true) },
      onHelp: function () { setHelpOpen(true) },
      onToggleNav: function () { setNavOpen(!navOpen) },
      lint: lint,
      lastSync: lastSync
    }),
    h(
      'div',
      { className: 'sl-body' },
      h('div', { className: 'sl-nav-scrim', onClick: function () { setNavOpen(false) } }),
      h(ReaderNav, {
        state: state,
        selectedBoardId: selectedBoardId,
        onSelectBoard: selectBoard,
        onShowLint: function () { setLintOpen(true) },
        onHelp: function () { setHelpOpen(true) },
        lint: lint
      }),
      h(
        'main',
        { className: 'sl-main' },
        h(ReaderBoardHeader, {
          board: board,
          count: selectedBoardId === DASHBOARD ? state.entries.length : allEntries.length,
          onSelectBoard: selectBoard,
          onLint: function () { setLintOpen(true) },
          onRefresh: manualRefresh
        }),
        selectedBoardId !== DASHBOARD && board ? h(ReaderToolbar, { query: query, setQuery: setQuery, count: filteredEntries.length, onRefresh: manualRefresh }) : null,
        h(
          'div',
          { className: 'sl-content' },
          selectedBoardId === DASHBOARD
            ? h(ReaderDashboard, {
                state: state,
                lint: lint,
                stats: stats,
                onSelectBoard: selectBoard,
                onOpen: openEntry,
                onOpenEntryId: openEntryId,
                onLint: function () { setLintOpen(true) }
              })
            : board
              ? h(BoardView, {
                  state: state,
                  board: board,
                  entries: filteredEntries,
                  lint: lint,
                  stats: stats,
                  selectedId: selectedEntryId,
                  readOnly: true,
                  onOpen: openEntry,
                  onNew: function () {},
                  onOpenBoard: selectBoard,
                  onQuickStatus: function () {},
                  onFieldChange: function () {},
                  onUploadMap: function () {},
                  onToast: showToast
                })
              : h(EmptyState, { icon: 'layers', title: '板块不存在', description: '它可能被删除了。', actions: h('button', { type: 'button', className: 'sl-btn primary', onClick: function () { selectBoard(DASHBOARD) } }, '回到总览') })
        )
      ),
      selectedEntry
        ? h(
            Fragment,
            null,
            h('div', { className: 'sl-detail-scrim', onClick: function () { setSelectedEntryId(''); selectedEntryRef.current = ''; persistPrefs({ entry: '' }) } }),
            h(ReaderEntry, {
              state: state,
              entry: selectedEntry,
              board: boardOf(state, selectedEntry.boardId),
              lint: lint,
              onClose: function () { setSelectedEntryId(''); selectedEntryRef.current = ''; persistPrefs({ entry: '' }) },
              onOpenEntry: openEntry,
              onToast: showToast
            })
          )
        : h(
            'aside',
            { className: 'sl-detail empty' },
            h('div', { className: 'sl-detail-placeholder' }, h(Seal), h('div', { style: { fontFamily: 'var(--sl-serif)', fontSize: 15, color: 'var(--sl-ink-2)' } }, '从左边挑一条档案'), h('p', null, '这里只读。要改设定，直接在对话里告诉我。'), h('button', { type: 'button', className: 'sl-btn small', onClick: function () { setHelpOpen(true) } }, '怎么用？'))
          )
    ),
    searchOpen ? h(SearchModal, {
      state: state,
      onClose: function () { setSearchOpen(false) },
      onOpen: openEntry
    }) : null,
    lintOpen ? h(LintModal, {
      state: state,
      lint: lint,
      onClose: function () { setLintOpen(false) },
      onRecheck: function () { refreshLint(stateRef.current, ++lintSeqRef.current) },
      onOpen: openEntry
    }) : null,
    helpOpen ? h(ReaderHelp, { onClose: function () { setHelpOpen(false) } }) : null,
    syncOpen ? h(SyncModal, {
      project: state.project,
      projectId: projectId,
      revision: revision,
      onClose: function () { setSyncOpen(false) },
      onImported: handleImported,
      onSwitched: function () { bootstrapApp() },
      onToast: showToast
    }) : null,
    h(Toast, { toast: toast })
  )
}

exports.__App = ReaderApp
exports.__Reader = ReaderApp


/* ---- 70-register.js ---- */
/* 织世 · 注册：左侧栏入口 + 中央主面板 */

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return
  var style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = CSS
  document.head.appendChild(style)
}

function apply(ctx) {
  ensureStyle()
  var disposers = []
  try {
    disposers.push(ctx.slots.inject('main', function () {
      return ctx.slots.register({ name: 'main', key: PANEL_ID }, ReaderApp)
    }))
    disposers.push(ctx.slots.inject('sidebar.panellist', function () {
      return ctx.slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 41,
        label: '织世'
      }, StoryPanelIcon)
    }))
  } catch (err) {
    console.warn('[dsh-story-loom] 主面板注册失败：' + (err && err.message))
  }
  return function () {
    for (var i = 0; i < disposers.length; i += 1) {
      try { disposers[i]() } catch (err) { /* noop */ }
    }
  }
}

exports.name = 'dsh-story-loom'
exports.inject = ['slots']
exports.apply = apply


    return module.exports;
  }
});
