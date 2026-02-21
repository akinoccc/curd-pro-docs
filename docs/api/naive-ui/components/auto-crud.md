---
title: AutoCrud
---

# AutoCrud

一体化 CRUD 组件：Search + Table + Form + Actions + Selection + Route Sync。

## Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `adapter` | `CrudAdapter<Row, Query>` | — | 数据适配器（必填） |
| `fields` | `CrudField<Row>[]` | — | 字段定义（必填） |
| `columns` | `CrudColumn<Row>[]` | 由 fields 生成 | 表格列定义 |
| `searchFields` | `CrudField<Row>[]` | 使用 fields | 搜索字段（可独立于 fields 定义搜索表单） |
| `searchQueryKey` | `string` | — | 搜索条件写入 `query[key]`（不设置则扁平写入 query 根） |
| `actions` | `CrudAction<Row>[]` | 自动生成 | 自定义 actions（与默认 actions 合并，`id` 相同则覆盖） |
| `formMode` | `'modal' \| 'drawer'` | `'modal'` | 表单显示模式 |
| `showSelection` | `boolean` | `false` | 是否开启行勾选 |
| `showActionsColumn` | `boolean` | `true` | 是否显示操作列 |
| `disableCreate` | `boolean` | `false` | 禁用新增按钮 |
| `disableEdit` | `boolean` | `false` | 禁用编辑按钮 |
| `disableDelete` | `boolean` | `false` | 禁用删除按钮 |
| `disableExport` | `boolean` | `false` | 禁用导出按钮 |
| `title` | `string` | `'列表'` | 卡片标题 |
| `paginationProps` | `PaginationProps` | — | 透传到 `NPagination` |
| `routeSync` | `boolean` | `false` | 开启 URL query 同步 |
| `routeQueryKey` | `string` | `'q'` | URL query 参数名 |

### 默认 Actions 行为

当未传入 `actions` prop 时，`AutoCrud` 会根据 adapter 能力自动生成：

| 条件 | 生成的 Action |
|---|---|
| `adapter.create` 存在且 `disableCreate` 为 false | `presetActions.create` (toolbar) |
| `adapter.update` 存在且 `disableEdit` 为 false | `presetActions.edit` (row) |
| `adapter.remove` 存在且 `disableDelete` 为 false | `presetActions.delete` (row) |
| `adapter.export` 存在且 `disableExport` 为 false | `presetActions.export` (toolbar) |

## Emits

| 事件 | 参数 | 说明 |
|---|---|---|
| `submit` | `{ mode: 'create' \| 'edit', data: Partial<Row> }` | 表单提交前触发 |
| `success` | `{ mode: 'create' \| 'edit', data: Row }` | 表单提交成功 |
| `error` | `error: unknown` | 任何错误（list 请求、表单提交等） |

## Expose

通过 `ref` 访问内部实例：

```ts
const crudRef = ref<InstanceType<typeof AutoCrud>>()

crudRef.value?.list // UseCrudListReturn
crudRef.value?.selection // UseCrudSelectionReturn
crudRef.value?.form // UseCrudFormReturn
crudRef.value?.refresh() // 刷新列表
crudRef.value?.openCreate() // 打开新增表单
crudRef.value?.openEdit(row) // 打开编辑表单
```

| 属性/方法 | 类型 | 说明 |
|---|---|---|
| `list` | `UseCrudListReturn` | 列表状态 |
| `selection` | `UseCrudSelectionReturn` | 选择状态 |
| `form` | `UseCrudFormReturn` | 表单状态 |
| `refresh` | `() => Promise<void>` | 刷新列表 |
| `openCreate` | `() => void` | 打开新增表单 |
| `openEdit` | `(row: Row) => void` | 打开编辑表单 |

## Slots

### 字段级 Slots

| Slot | Props | 说明 |
|---|---|---|
| `cell-${key}` | `{ row, value, rowIndex }` | 自定义表格单元格 |
| `field-${key}` | `{ field, model, mode, value }` | 自定义表单字段 |
| `search-${key}` | `{ field, model }` | 自定义搜索字段 |

### 布局 Slots

| Slot | Props | 说明 |
|---|---|---|
| `toolbar` | `{ list, selection, openCreate }` | 工具栏区域 |
| `before-table` | `{ list, selection }` | 表格前区域 |
| `batch-actions` | `{ list, selection, actions, renderActionButton }` | 批量操作区 |
| `row-actions` | `{ row, rowIndex, openEdit, actions, defaultButtons }` | 行操作区 |
| `search` | `{ list, fields }` | 替换整个搜索组件 |
| `table` | `{ list, columns, selection, rowKey, ... }` | 替换整个表格组件 |
| `form` | `{ form, fields, visible, setVisible, mode, editingRow, submit }` | 替换整个表单组件 |

### row-actions 的 defaultButtons

`row-actions` slot 提供 `defaultButtons` 对象，包含预设按钮的函数式组件：

```vue
<template #row-actions="{ row, defaultButtons }">
  <NSpace>
    <component
      :is="defaultButtons.Edit"
      :row="row"
    />
    <component
      :is="defaultButtons.Delete"
      :row="row"
    />
    <NButton
      size="small"
      @click="doSomething(row)"
    >
      自定义
    </NButton>
  </NSpace>
</template>
```

| 按钮 | 说明 |
|---|---|
| `defaultButtons.Edit` | 编辑按钮（对应 `presetActions.edit`） |
| `defaultButtons.Delete` | 删除按钮（对应 `presetActions.delete`） |
| `defaultButtons.View` | 查看按钮（对应 `presetActions.view`，如果存在） |

## 示例

### 交互示例

<demo
  vue="../../../examples/auto-crud-basic.vue"
  vueFiles="['../../../examples/auto-crud-basic.vue','../../../examples/basic-adapter.ts','../../../examples/basic-schema.ts','../../../examples/basic-types.ts']"
/>

::: code-group
<<< @/examples/auto-crud-basic.vue [页面]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-schema.ts [fields & columns]
<<< @/examples/basic-types.ts [类型定义]
:::
