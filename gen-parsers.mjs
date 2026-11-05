// 把 src/parsers.ts 編成一段純 JS（只有函式宣告），存成 src/parsers.gen.ts 的字串常數。
// 兩個 App 都在 WebView 裡執行這段字串，所以解析器不會受各 App 的 TypeScript 轉譯方式影響。
import { buildSync } from "esbuild";
import fs from "node:fs";
const r = buildSync({ entryPoints: ["src/parsers.ts"], bundle: false, format: "esm", target: "es2020", write: false, charset: "utf8", legalComments: "none" });
let js = r.outputFiles[0].text.replace(/^export\s+/gm, "").replace(/^export\s*\{[^}]*\};?\s*$/gm, "");
fs.writeFileSync("src/parsers.gen.ts", "// 自動產生，請勿手改：由 gen-parsers.mjs 從 src/parsers.ts 編譯\nexport const PARSERS_JS: string = " + JSON.stringify(js) + ";\n");
console.log("parsers.gen.ts", js.length, "chars");
