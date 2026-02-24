import type { CrudAdapter } from '@uozi/vito-core'
import { presetActions, useCrudActions } from '@uozi/vito-core'

export interface Row {
  id: number
  name: string
}

export function createActions(adapter: CrudAdapter<Row>) {
  const { actions, getByArea, register } = useCrudActions<Row>({
    actions: [
      presetActions.create({
        onClick: () => {
          // 打开创建表单（由你的 UI 决定）
        },
      }),
      presetActions.export({
        adapter,
        handleExport: (result) => {
          // UI 层负责下载（例如 @uozi/vito-naive-ui 的 handleExportResult）
          console.log(result)
        },
      }),
    ],
  })

  register({
    id: 'custom',
    label: '自定义动作',
    area: 'toolbar',
    order: 50,
    confirm: '确定要执行吗？',
    onClick: async (ctx) => {
      console.log(ctx.selectedIds, ctx.query)
      await ctx.refresh()
    },
  })

  return {
    actions,
    getToolbarActions: () => getByArea('toolbar'),
    getRowActions: () => getByArea('row'),
    getBatchActions: () => getByArea('batch'),
  }
}
