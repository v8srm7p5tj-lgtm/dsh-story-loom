/**
 * 织世 · 正文线索扫描
 *
 * 这不是语义理解，只做「值得拿给作者/模型复核的句子」的粗筛。
 * 真正的伏笔判断仍由 agent 读上下文后完成；这个模块负责把候选句、
 * 行号和命中原因摊开，避免漏读。
 */

const HOOK_PATTERNS = [
  { re: /[？?]/, score: 12, reason: '问句 / 未解问题' },
  { re: /秘密|隐瞒|瞒着|没有告诉|不能说|不愿说|说不出口|谎/, score: 18, reason: '秘密 / 隐瞒' },
  { re: /消失|失踪|不见|死了|尸体|血迹|无影|没有影子|没有脸|没有名字/, score: 16, reason: '消失 / 死亡 / 异常' },
  { re: /记住|忘记|名字|影子|梦|预言|诅咒|契约|代价|钥匙|门|钟|信|照片|婚约|献祭/, score: 13, reason: '意象 / 契约 / 记忆' },
  { re: /将来|以后|总有一天|迟早|下一次|等到|终有一天|早晚/, score: 12, reason: '未来兑现' },
  { re: /不知道|不明白|为什么|究竟|到底|怎么会|难道/, score: 10, reason: '未知 / 疑问' },
  { re: /回头|别回头|不要|千万别|不能|禁止|不许/, score: 9, reason: '禁令 / 危险' },
  { re: /却|竟然|居然|反而|偏偏|原来|终于/, score: 7, reason: '反转 / 揭示' },
  { re: /名字|身份|血|眼睛|影子|雾|海|潮|梦|钟声/, score: 5, reason: '核心意象' }
]

const SKIP_RE = /^(第[一二三四五六七八九十百千0-9]+[章节卷幕]|楔子|序章|尾声|后记|\s*$|#{1,6}\s)/

function splitCandidates(text) {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n')
  const out = []
  let buffer = ''
  let startLine = 0
  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i]
    const line = raw.trim()
    if (!line) {
      if (buffer) {
        out.push({ text: buffer.trim(), line: startLine })
        buffer = ''
      }
      continue
    }
    if (line.length > 220) {
      if (buffer) {
        out.push({ text: buffer.trim(), line: startLine })
        buffer = ''
      }
      const sentences = line.split(/(?<=[。！？!?…])/)
      let cursor = line
      for (const sentence of sentences) {
        const s = sentence.trim()
        if (s) out.push({ text: s, line: i + 1 })
        cursor = cursor.slice(sentence.length)
      }
      continue
    }
    if (!buffer) startLine = i + 1
    if (buffer) buffer += ' '
    buffer += line
    if (buffer.length > 160) {
      out.push({ text: buffer.trim(), line: startLine })
      buffer = ''
    }
  }
  if (buffer) out.push({ text: buffer.trim(), line: startLine })
  return out
}

export function scanHooks(text, options = {}) {
  const limit = Math.max(1, Math.min(80, Number(options.limit) || 30))
  const items = []
  const seen = new Set()
  for (const candidate of splitCandidates(text)) {
    const line = candidate.text
    if (SKIP_RE.test(line)) continue
    if (line.length < 8) continue
    let score = 0
    const reasons = []
    for (const pattern of HOOK_PATTERNS) {
      if (pattern.re.test(line)) {
        score += pattern.score
        reasons.push(pattern.reason)
      }
    }
    if (!score) continue
    const key = line.slice(0, 60)
    if (seen.has(key)) continue
    seen.add(key)
    items.push({
      text: line,
      line: candidate.line,
      score,
      reasons: Array.from(new Set(reasons))
    })
  }
  items.sort((a, b) => b.score - a.score || a.line - b.line)
  return items.slice(0, limit)
}

export function textStats(text) {
  const value = String(text || '')
  const chinese = (value.match(/[\u4e00-\u9fff]/g) || []).length
  const words = (value.match(/[A-Za-z0-9]+/g) || []).length
  return {
    chars: value.length,
    chinese,
    words,
    cjkWords: chinese + words,
    paragraphs: value.split(/\n\s*\n/).filter((part) => part.trim()).length
  }
}
