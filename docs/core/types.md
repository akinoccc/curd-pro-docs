---
title: 类型
---

本页列出 `@fcurd/core` 最常用的公共类型（以便你快速完成类型建模）。

## 字段与列

- `CrudField<Row, FormModel, UiExt>`：字段定义（search/form/table/detail 复用）
- `CrudColumn<Row, UiExt>`：表格列定义（可选 `render(ctx)` 自定义）
- `CrudSort<Field>`：排序 `{ field, order }`

### FieldContext / CellContext

- `FieldContext<Row, FormModel>`：用于 `visibleIn.xxx(ctx)` 决定字段是否显示
- `CellContext<Row>`：用于 `CrudColumn.render(ctx)` 获取 `row/value/rowIndex`

## List / Form / Selection

- `UseCrudListReturn<Row, Query>`：`rows/total/loading/error/page/pageSize/query/sort + actions`
- `UseCrudFormReturn<Row>`：`model/mode/dirty/changedData/visibleFields + actions`
- `UseCrudSelectionReturn<Row>`：`selectedIds/selectedRows/selectedCount + actions`

## Actions

- `CrudAction<Row>`：单个动作（toolbar/row/batch）
- `ActionContext<Row>`：动作执行上下文（包含 selected/query/sort/page 等）

## 源码入口

所有类型都从 `@fcurd/core` 直接导出（使用者只需要关心包入口，不需要看内部源码路径）。

