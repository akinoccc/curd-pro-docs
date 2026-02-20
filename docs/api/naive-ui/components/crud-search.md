---
title: CrudSearch
---

# CrudSearch

搜索表单组件，将 `fields` 渲染为 Naive UI 的内联表单，并把搜索结果写回 `useCrudList` 的 `query`。

## Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `list` | `UseCrudListReturn<Row, Query>` | — | 列表状态（必填） |
| `fields` | `CrudField<Row>[]` | — | 字段定义（必填） |
| `queryKey` | `string` | — | 搜索条件写入 `query[key]`（不设置则扁平写入 query 根） |
| `formProps` | `FormProps` | — | 透传到 `NForm` |
| `showSearch` | `boolean` | `true` | 是否显示"搜索"按钮 |
| `showReset` | `boolean` | `true` | 是否显示"重置"按钮 |

## 行为说明

### 字段过滤

只渲染 `visibleIn.search` 为 `true`（或函数返回 `true`）的字段。通过 `filterFieldsBySurface(fields, 'search')` 实现。

### 搜索流程

1. 组件维护一个内部 `searchModel` 对象，初始时从 `list.query` 同步
2. 用户修改表单 → 更新 `searchModel`
3. 点击"搜索" → 将 `searchModel` 通过 `list.setQuery()` 写回（如果设置了 `queryKey`，则写到 `query[queryKey]` 下）
4. `setQuery` 自动将 `page` 重置为 1

### 重置流程

点击"重置" → 清空 `searchModel` → 调用 `list.reset()`（回到 initialQuery 并刷新）

### queryKey 行为

| queryKey | 搜索时 setQuery 的参数 |
|---|---|
| 未设置 | `setQuery({ name: '...', status: '...' })` |
| `'search'` | `setQuery({ search: { name: '...', status: '...' } })` |

## Slots

| Slot | Props | 说明 |
|---|---|---|
| `search-${key}` | `{ field, model }` | 自定义某个搜索字段的渲染 |

```vue
<CrudSearch :list="list" :fields="fields" query-key="search">
  <template #search-dateRange="{ model }">
    <NDatePicker v-model:value="model.dateRange" type="daterange" />
  </template>
</CrudSearch>
```

## 示例

::: code-group
<<< @/examples/crud-compose-basic.vue [页面]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-types.ts [类型定义]
:::
