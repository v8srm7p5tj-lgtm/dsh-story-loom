/**
 * 把 src/client/*.js 拼成一个 DSH 客户端 bundle。
 * 不引入构建器：所有源文件共享同一个闭包，直接按顺序拼接。
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(root, 'src', 'client')
const files = (await fs.readdir(srcDir)).filter((name) => name.endsWith('.js')).sort()
const parts = []
for (const file of files) {
  const code = await fs.readFile(path.join(srcDir, file), 'utf8')
  parts.push(`/* ---- ${file} ---- */\n${code}`)
}

const banner = `/* dsh-story-loom · 织世 · built ${new Date().toISOString()} */`
const output = `${banner}
window.__ModuleLoader__.load({
  id: "dsh-story-loom",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    var react = require("react");
    var reactDom = require("react-dom");
    var h = react.createElement;
    var Fragment = react.Fragment;
    var useState = react.useState;
    var useEffect = react.useEffect;
    var useLayoutEffect = react.useLayoutEffect;
    var useMemo = react.useMemo;
    var useCallback = react.useCallback;
    var useRef = react.useRef;

${parts.join('\n\n')}

    return module.exports;
  }
});
`

await fs.mkdir(path.join(root, 'lib'), { recursive: true })
await fs.writeFile(path.join(root, 'lib', 'client.js'), output, 'utf8')
console.log(`built lib/client.js · ${files.length} sources · ${(output.length / 1024).toFixed(1)} KB`)
