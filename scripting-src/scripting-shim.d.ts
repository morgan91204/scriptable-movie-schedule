// 只給本機型別檢查用（不會放進 Scripting 腳本資料夾）。Scripting 沒有公開 .d.ts，這裡把元件放寬成 any。
declare module "scripting" {
  type C = (props: any) => any
  export const Button: C, ContentUnavailableView: C, Form: C, HStack: C, Image: C, Label: C, LabeledContent: C, List: C,
    NavigationLink: C, NavigationStack: C, Picker: C, ProgressView: C, Section: C, Spacer: C, Text: C, TextField: C,
    Toggle: C, VStack: C
  export const Navigation: { present(o: { element: any }): Promise<void>; useDismiss(): () => void }
  export const Script: { exit(result?: any): void }
  export function useState<T>(init: T | (() => T)): [T, (v: T | ((prev: T) => T)) => void]
  export function useEffect(fn: () => void | (() => void), deps?: any[]): void
  export function useMemo<T>(fn: () => T, deps: any[]): T
}
declare namespace JSX {
  type Element = any
  interface IntrinsicAttributes { key?: string | number }
}
declare function fetch(url: string, init?: any): Promise<{ status: number; text(): Promise<string> }>
