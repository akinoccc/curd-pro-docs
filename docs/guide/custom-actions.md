---
title: 自定义 Actions
---

# 自定义 Actions

## 概述

`CrudAction` 描述一个操作按钮，通过 `area` 指定它出现在哪个位置：

| area | 位置 | 典型用途 |
|---|---|---|
| `toolbar` | 工具栏（表格上方） | 新增、导出、批量导入 |
| `row` | 每行操作列 | 编辑、删除、查看详情 |
| `batch` | 批量操作区（选中行时出现） | 批量删除、批量审核 |

## 预设 Actions

`@uozi/vito-core` 提供 5 个预设工厂函数，`AutoCrud` 会根据 adapter 能力自动使用它们：

```ts
import { presetActions } from '@uozi/vito-core'

presetActions.create({ onClick: () => { /* 打开创建表单 */ } })
presetActions.edit({ onClick: (row) => { /* 打开编辑表单 */ } })
presetActions.delete({ adapter, getId: row => row.id })
presetActions.batchDelete({ adapter })
presetActions.export({ adapter, handleExport: handleExportResult })
```

每个工厂返回一个 `CrudAction` 对象，你可以在此基础上覆盖任意属性。

## 在 AutoCrud 中局部覆盖 actions（推荐）

`AutoCrud` 默认会根据 adapter 能力自动生成 `create/edit/delete/export` 等预设 actions。

当你传入 `actions` prop 时，`AutoCrud` 会将其与默认 actions **做合并（merge）**，规则如下：

- `id` 相同：使用你传入的 action **覆盖**默认 action（可用于“只改删除确认文案/点击行为”等）
- `id` 不同：作为新 action **追加**（可用于新增导入/审核等按钮）

```vue
<AutoCrud
  :adapter="adapter"
  :fields="fields"
  :columns="columns"
  :actions="customActions"
/>
```

```ts
const baseDelete = presetActions.delete({
  adapter,
  getId: row => row.id,
})

const customActions: CrudAction<MyRow>[] = [
  // 只覆盖默认 delete（id 相同会覆盖）
  {
    ...baseDelete,
    confirm: '确定要作废这条记录吗？',
    onClick: async (ctx) => {
      // 例如：埋点、权限校验、二次确认等
      await baseDelete.onClick(ctx)
    },
  },
  // 追加一个全新的 toolbar action（id 不同会追加）
  {
    id: 'import',
    label: '批量导入',
    area: 'toolbar',
    order: 10,
    onClick: async () => {
      /* 打开导入弹窗 */
    },
  },
]
```

### 如何“移除/禁用”默认 actions（不新增字段）

- 想禁用默认的 create/edit/delete/export：使用 `AutoCrud` 已有的 `disableCreate/disableEdit/disableDelete/disableExport`
- 想隐藏某个默认 action：可以用同 `id` 覆盖并设置 `visible: () => false`

## 使用 useCrudActions 动态管理

当你使用 hooks 组合方式时，`useCrudActions` 提供动态注册和按区域过滤的能力：

```ts
import { presetActions, useCrudActions } from '@uozi/vito-core'

const { actions, getByArea, register, unregister } = useCrudActions<MyRow>({
  actions: [
    presetActions.create({ onClick: openCreate }),
    presetActions.edit({ onClick: openEdit }),
  ],
})

// 动态注册
register({
  id: 'approve',
  label: '审核',
  area: 'row',
  order: 5,
  type: 'success',
  visible: ctx => ctx.row?.status === 'pending',
  onClick: async (ctx) => {
    await api.approve(ctx.row!.id)
    await ctx.refresh()
  },
})

// 动态移除
unregister('approve')

// 按区域获取
const toolbarActions = getByArea('toolbar')
const rowActions = getByArea('row')
const batchActions = getByArea('batch')
```

## ActionContext

每个 action 的 `onClick` / `visible` / `disabled` 都会收到 `ActionContext`：

| 属性 | 类型 | 说明 |
|---|---|---|
| `row` | `Row \| undefined` | 行操作时的当前行 |
| `selectedRows` | `Row[]` | 当前选中的行 |
| `selectedIds` | `(string \| number)[]` | 当前选中的行 ID |
| `query` | `Record<string, unknown>` | 当前查询条件 |
| `sort` | `CrudSort \| null` | 当前排序 |
| `page` | `number` | 当前页码 |
| `pageSize` | `number` | 当前每页条数 |
| `refresh` | `() => Promise<void>` | 刷新列表 |
| `clearSelection` | `() => void` | 清空选择 |

## confirm 确认

设置 `confirm` 属性，点击时会弹出确认框：

```ts
{
  id: 'delete',
  label: '删除',
  area: 'row',
  confirm: '确定要删除此记录吗？',  // string: 自定义确认文案
  // confirm: true,                  // boolean: 使用默认文案
  onClick: async (ctx) => { /* ... */ },
}
```

在 `@uozi/vito-naive-ui` 中，确认框使用 Naive UI 的 `NDialog`（通过 `confirmAction()` 工具函数）。

## visible / disabled 条件

```ts
{
  id: 'batchDelete',
  label: '批量删除',
  area: 'batch',
  visible: (ctx) => ctx.selectedIds.length > 0,
  disabled: (ctx) => ctx.selectedIds.length > 100,
  onClick: async (ctx) => { /* ... */ },
}
```

- `visible` 返回 `false` 时按钮不渲染
- `disabled` 返回 `true` 时按钮禁用（但仍然可见）

## 排序

`order` 属性决定同一区域内按钮的排列顺序（升序）。预设 actions 的 order：

| 预设 | order |
|---|---|
| `create` | 0 |
| `edit` | 0 |
| `delete` | 10 |
| `batchDelete` | 0 |
| `export` | 100 |
