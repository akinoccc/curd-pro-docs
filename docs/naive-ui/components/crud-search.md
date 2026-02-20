---
title: CrudSearch
---

`CrudSearch` 把 `fields` 渲染成一个 Naive 的内联搜索表单，并把结果写回 `useCrudList` 的 `query`。

## Props（常用）

- `list`：`UseCrudListReturn<Row, Query>`（必填）
- `fields`：`CrudField<Row>[]`（必填）
- `queryKey?`：把搜索条件写到 `query[queryKey]`（例如 `'search'`）
- `showSearch`：是否显示"搜索"按钮
- `showReset`：是否显示"重置"按钮
- `formProps?`：透传到 `NForm`

## Slots

- `search-${key}`：自定义某个搜索字段的渲染

## 示例

::: code-group
<<< @/examples/crud-compose-basic.vue [页面]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-types.ts [类型定义]
:::
