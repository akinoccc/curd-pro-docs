declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // 这里用宽松类型避免声明文件生成时被 SFC 推断类型卡住
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>
  export default component
}
