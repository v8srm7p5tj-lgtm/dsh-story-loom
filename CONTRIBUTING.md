# Contributing

感谢你愿意一起把「织世」做得更好。

## 开发

```bash
node build.mjs
node --test test/*.test.mjs
```

- `src/client/` 是浏览器端源码，构建后生成 `lib/client.js`。
- `lib/` 是 Host 端与数据引擎；不要直接手改生成文件。
- 所有写操作走 `lib/store.js`，保持 revision 乐观锁和备份。
- 新增检查规则时，在 `lib/canon.js` 的 `lintState` 里加，并补 `test/core.test.mjs`。
- 新增正文线索规则时，在 `lib/extract.js` 的 `HOOK_PATTERNS` 里加，并补 `test/extract.test.mjs`。

## 提交前

1. `node build.mjs`
2. `node --test test/*.test.mjs`
3. 确认没有把 `story-loom/` 里的个人数据带进仓库。

## 设计原则

- 面板只读。编辑通过对话 / CLI / Host API 完成。
- 板块是数据，不是代码；作者可以随时加「图鉴」「案件卷宗」。
- 先保证不崩，再谈写得漂亮。
