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
