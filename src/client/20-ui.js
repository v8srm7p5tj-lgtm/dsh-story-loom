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
