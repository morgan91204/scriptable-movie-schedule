// 主程式不載入 DOM 型別（會和 Scriptable 的 Request、Image 等衝突）。
// 解析器另外用 tsconfig.parsers.json 搭配 DOM 型別做完整檢查，這裡只放寬讓主程式能編譯。
type Document = any;
type Element = any;
interface ArrayConstructor {
  from(x: any): any[];
}
