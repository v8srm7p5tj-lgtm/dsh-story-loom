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
