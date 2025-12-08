import type { App } from 'vue'
import { createDiscreteApi, NButton, NConfigProvider, NDataTable, NForm, NFormItem, NInput } from 'naive-ui'

export function createNaiveUiApp(app: App): void {
  // 简单注册部分常用组件，示例足够
  app.component('NButton', NButton)
  app.component('NForm', NForm)
  app.component('NFormItem', NFormItem)
  app.component('NInput', NInput)
  app.component('NDataTable', NDataTable)
  app.component('NConfigProvider', NConfigProvider)

  createDiscreteApi(['message'])
}
