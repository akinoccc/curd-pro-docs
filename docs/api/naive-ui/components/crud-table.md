---
title: CrudTable
---

# CrudTable

数据表格 + 分页组件，封装 `NDataTable` + `NPagination`，配合 `useCrudList` 做远端分页 / 排序，配合 `useCrudSelection` 做行勾选。

## Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `list` | `UseCrudListReturn<Row, any>` | — | 列表状态（必填） |
| `columns` | `CrudColumn<Row>[]` | — | 列定义（必填） |
| `selection` | `UseCrudSelectionReturn<Row>` | — | 选择状态（传入则开启勾选列） |
| `rowKey` | `(row: Row) => string \| number` | — | 行 key 获取函数（建议传 `adapter.getId`） |
| `showActionsColumn` | `boolean` | `false` | 是否显示操作列（需提供 `row-actions` slot） |
| `actionsColumnTitle` | `string` | `'操作'` | 操作列标题 |
| `actionsColumnWidth` | `number` | `120` | 操作列宽度 |
| `tableProps` | `Record<string, unknown>` | — | 透传到 `NDataTable` |
| `paginationProps` | `PaginationProps` | — | 透传到 `NPagination` |
| `getRowActionsSlotProps` | `(row: Row) => Record<string, unknown>` | — | 为 `row-actions` slot 注入额外 props |

## Emits

| 事件 | 参数 | 说明 |
|---|---|---|
| `sort` | `CrudSort \| null` | 排序变化 |

## 行为说明

### 排序

`NDataTable` 的 sorter 变化会被转换为 core 的 `CrudSort`，并调用 `list.setSort(sort)`。远端排序模式（`remote`）。

### 分页

- `NPagination` 的页码/每页条数变化调用 `list.setPage()` / `list.setPageSize()`
- 默认显示每页条数选择器（`showSizePicker`），可选值 `[10, 20, 50, 100]`

### 勾选

传入 `selection` prop 时，自动添加勾选列。勾选变化同步到 `selection.select()` / `selection.clear()`。

### 操作列

当 `showActionsColumn` 为 `true` 且提供了 `row-actions` slot 时，自动添加固定在右侧的操作列。

## Slots

| Slot | Props | 说明 |
|---|---|---|
| `cell-${key}` | `{ row, value, rowIndex }` | 自定义单元格 |
| `row-actions` | `{ row, rowIndex, ...extraProps }` | 行操作区 |
| `table-header` | `{ list, selection }` | 表格上方区域 |

## 示例

::: code-group
<<< @/examples/crud-compose-basic.vue [页面]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-types.ts [类型定义]
:::
