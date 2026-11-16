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
