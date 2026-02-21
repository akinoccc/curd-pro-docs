---
title: useCrudActions
---

# useCrudActions

管理动作集合（toolbar / row / batch），提供注册、注销和按区域过滤的能力。

## 基本用法

```ts
import { presetActions, useCrudActions } from '@fcurd/core'

const { actions, getByArea, register, unregister } = useCrudActions<MyRow>({
  actions: [
    presetActions.create({ onClick: openCreate }),
    presetActions.edit({ onClick: openEdit }),
    presetActions.delete({ adapter, getId: row => row.id }),
  ],
})

// 按区域获取
const toolbarActions = getByArea('toolbar') // [create]
const rowActions = getByArea('row') // [edit, delete]
```

## Options

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `actions` | `CrudAction<Row>[]` | `[]` | 初始 action 列表 |

## 返回值

| 属性/方法 | 类型 | 说明 |
|---|---|---|
| `actions` | `Ref<CrudAction<Row>[]>` | 所有已注册的 actions |
| `getByArea` | `(area: 'toolbar' \| 'row' \| 'batch') => CrudAction[]` | 按区域过滤并排序 |
| `register` | `(action: CrudAction<Row>) => void` | 注册一个 action（同 id 则覆盖） |
| `unregister` | `(id: string) => void` | 注销一个 action |

## presetActions 工厂

`@fcurd/core` 提供 5 个预设 action 工厂：

### presetActions.create

| 参数 | 类型 | 说明 |
|---|---|---|
| `label` | `string` | 按钮文本（默认 `'新增'`） |
| `onClick` | `() => void` | 点击回调 |

返回：`area: 'toolbar'`, `order: 0`, `type: 'primary'`

### presetActions.edit

| 参数 | 类型 | 说明 |
|---|---|---|
| `label` | `string` | 按钮文本（默认 `'编辑'`） |
| `onClick` | `(row: Row) => void` | 点击回调，接收当前行 |

返回：`area: 'row'`, `order: 0`, `type: 'default'`

### presetActions.delete

| 参数 | 类型 | 说明 |
|---|---|---|
| `label` | `string` | 按钮文本（默认 `'删除'`） |
| `adapter` | `CrudAdapter<Row>` | 用于调用 `adapter.remove()` |
| `getId` | `(row: Row) => string \| number` | 提取行 ID（默认 `row.id`） |
| `confirm` | `boolean \| string` | 确认配置（默认 `'确定要删除此记录吗？'`） |
| `onSuccess` | `() => void` | 删除成功回调 |
| `onError` | `(error: unknown) => void` | 删除失败回调 |

返回：`area: 'row'`, `order: 10`, `type: 'error'`。删除后自动调用 `ctx.refresh()`。

### presetActions.batchDelete

| 参数 | 类型 | 说明 |
|---|---|---|
| `label` | `string` | 按钮文本（默认 `'批量删除'`） |
| `adapter` | `CrudAdapter<Row>` | 用于调用 `adapter.remove()` |
| `getId` | `(row: Row) => string \| number` | 提取行 ID |
| `confirm` | `boolean \| string` | 确认配置 |
| `onSuccess` | `() => void` | 成功回调 |
| `onError` | `(error: unknown) => void` | 失败回调 |

返回：`area: 'batch'`, `order: 0`, `type: 'error'`。`visible` 条件为 `selectedIds.length > 0`。

### presetActions.export

| 参数 | 类型 | 说明 |
|---|---|---|
| `label` | `string` | 按钮文本（默认 `'导出'`） |
| `adapter` | `CrudAdapter<Row>` | 用于调用 `adapter.export()` |
| `filename` | `string` | 下载文件名 |
| `handleExport` | `(result, filename?) => void` | UI 层提供的下载处理函数 |
| `onSuccess` | `() => void` | 成功回调 |
| `onError` | `(error: unknown) => void` | 失败回调 |

返回：`area: 'toolbar'`, `order: 100`。`visible` 条件为 `adapter.export` 存在。

## 完整示例

<<< @/examples/use-crud-actions.ts

详见 [自定义 Actions](/guide/custom-actions)。
