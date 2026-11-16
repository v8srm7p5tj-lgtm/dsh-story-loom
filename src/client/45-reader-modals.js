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
