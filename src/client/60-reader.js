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
