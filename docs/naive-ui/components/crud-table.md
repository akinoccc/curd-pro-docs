---
title: CrudTable
---

`CrudTable` 是 `NDataTable + NPagination` 的封装，配合 `useCrudList` 做远端分页/排序，配合 `useCrudSelection` 做勾选。

## Props（常用）

- `list`：`UseCrudListReturn<Row, any>`（必填）
- `columns`：`CrudColumn<Row>[]`（必填）
- `selection?`：`UseCrudSelectionReturn<Row>`（传入即开启勾选列）
- `rowKey?`：行 key（建议传 `adapter.getId`）
- `showActionsColumn`：是否显示操作列（需提供 `row-actions` slot）
- `paginationProps?`：透传到 `NPagination`
- `tableProps?`：透传到 `NDataTable`

## 排序行为

`NDataTable` 的 sorter 变化会被转换为 core 的 `CrudSort`，并调用 `list.setSort(sort)`。

## Slots

- `cell-${key}` / `cell_${key}`：自定义单元格
- `row-actions`：行操作渲染
- `table-header`：表格上方区域

## 示例

::: code-group
<<< @/examples/crud-compose-basic.vue [页面]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-types.ts [类型定义]
:::
