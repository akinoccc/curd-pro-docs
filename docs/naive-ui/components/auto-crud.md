---
title: AutoCrud
---

`AutoCrud` 是一个组合组件：Search + Table + Form + Actions + Selection（可选）+ Route Sync（可选）。

## Props（常用）

- `adapter`：`CrudAdapter<Row, Query>`（必填）
- `fields`：`CrudField<Row>[]`（必填）
- `columns?`：`CrudColumn<Row>[]`（默认从 fields 生成）
- `searchFields?`：搜索字段（默认用 fields）
- `searchQueryKey?`：把搜索条件写入 `query[searchQueryKey]`（例如 `'search'`）
- `actions?`：自定义 actions（与默认 actions 合并，`id` 相同则覆盖）
- `formMode`：`'modal' | 'drawer'`
- `showSelection`：是否开启勾选
- `showActionsColumn`：是否显示"操作列"
- `routeSync`：是否开启 URL query 同步（需在 Router 上下文）
- `routeQueryKey`：URL query key（默认 `'q'`）

默认 actions：会根据 adapter 是否具备 `create/update/remove/export` 自动启用对应按钮。

## Emits

- `submit({ mode, data })`
- `success({ mode, data })`
- `error(error)`

## Expose

- `list/selection/form`
- `refresh/openCreate/openEdit`

## Slots（常用）

- `toolbar`：工具栏区域（默认渲染 toolbar actions）
- `before-table`：表格前插槽
- `batch-actions`：批量操作区（selection>0 时出现）
- `row-actions`：行操作区（可拿到 `defaultButtons`）
- `cell-${key}`：自定义单元格（也兼容 `cell_${key}`）
- `field-${key}`：自定义表单字段
- `search-${key}`：自定义搜索字段

## 示例

::: code-group
<<< @/examples/auto-crud-basic.vue [页面]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-schema.ts [fields & columns]
<<< @/examples/basic-types.ts [类型定义]
:::
