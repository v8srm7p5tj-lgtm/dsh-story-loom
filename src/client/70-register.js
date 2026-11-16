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
