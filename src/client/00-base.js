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
