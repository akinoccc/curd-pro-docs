---
title: 路由同步
---

# 路由同步

路由同步让搜索条件、分页等状态写入 URL query，实现"可分享链接"和"刷新不丢条件"。

## 方式一：AutoCrud 一行开启

在 `AutoCrud` 上加两个 prop 即可：

```vue
<AutoCrud
  :adapter="adapter"
  :fields="fields"
  :columns="columns"
  search-query-key="search"
  route-sync
  route-query-key="q"
/>
```

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `routeSync` | `boolean` | `false` | 开启路由同步 |
| `routeQueryKey` | `string` | `'q'` | URL query 参数名 |

开启后，URL 会变为 `?q={"search":{"name":"xxx"}}` 这样的形式。刷新页面后条件自动还原。

::: warning
`routeSync` 需要组件运行在 `vue-router` 上下文里（能拿到 `useRoute` / `useRouter`）。
:::

## 方式二：手动使用 useCrudRouteSync

当你使用 hooks 自由组合时，可以直接调用 `useCrudRouteSync`：

::: code-group
<<< @/examples/use-crud-route-sync.vue [route-sync]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-types.ts [类型定义]
:::

## 配置项

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `query` | `Ref<Query>` | — | 来自 `useCrudList` 的 query ref |
| `setQuery` | `(partial: Partial<Query>) => void` | — | 来自 `useCrudList` 的 setQuery |
| `router` | `Router` | — | vue-router 的 router 实例 |
| `route` | `RouteLocationNormalized` | — | vue-router 的 route 实例 |
| `queryKey` | `string` | `'q'` | URL query 参数名 |
| `serialize` | `(query: Query) => string` | `JSON.stringify` | 自定义序列化 |
| `deserialize` | `(str: string) => Partial<Query>` | `JSON.parse` | 自定义反序列化 |
| `debounceMs` | `number` | `300` | 写入 URL 的防抖延迟（ms） |

## 行为说明

1. **初始化**：组件挂载时从 `route.query[queryKey]` 读取并反序列化，写回 `setQuery`
2. **写入 URL**：监听 `query` 变化，防抖后调用 `router.replace({ query })`
3. **防循环**：从路由读取时会设置标记，避免写回时触发 watch 循环
4. **空值清理**：当 query 为空对象时，自动删除 URL 中的 queryKey 参数

## 自定义序列化

默认使用 `JSON.stringify` / `JSON.parse`。如果你想用更紧凑的格式（如 `qs` 库），可以传入自定义函数：

```ts
import qs from 'qs'

useCrudRouteSync({
  query: list.query,
  setQuery: list.setQuery,
  router,
  route,
  serialize: q => qs.stringify(q),
  deserialize: s => qs.parse(s),
})
```
