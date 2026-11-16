import test from 'node:test'
import assert from 'node:assert/strict'
import { scanHooks, textStats } from '../lib/extract.js'

const sample = `第二章 · 黑礁灯塔

雾从海面爬上来。

沈雾没有回头。她听见水底有人叫她的名字。

顾临问她：“你怕什么？”

她没有回答。她的影子比平时慢了一步。

灯塔三十年没有亮过，可今晚，钟声从礁石缝里传出来。
`

test('scanHooks finds unresolved questions, secrets and anomalies', () => {
  const hooks = scanHooks(sample)
  assert.ok(hooks.length >= 3)
  assert.ok(hooks.some((item) => item.text.includes('名字')))
  assert.ok(hooks.some((item) => item.text.includes('影子')))
  assert.ok(hooks.some((item) => item.text.includes('钟声')))
  const first = hooks[0]
  assert.ok(first.score > 0)
  assert.ok(Array.isArray(first.reasons) && first.reasons.length > 0)
  assert.ok(first.line > 0)
})

test('textStats counts CJK characters', () => {
  const stats = textStats(sample)
  assert.ok(stats.chinese > 20)
  assert.ok(stats.paragraphs >= 5)
})
