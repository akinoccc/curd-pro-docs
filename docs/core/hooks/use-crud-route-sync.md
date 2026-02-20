---
title: useCrudRouteSync
---

`useCrudRouteSync` 用于把 `useCrudList` 的 `query` 同步到 URL（以及从 URL 还原），让"可分享链接 / 刷新不丢条件"成为默认能力。

## 行为要点

- **从路由读取**：初始化时读取 `route.query[queryKey]` 并反序列化写回 `setQuery`
- **写回路由**：监听 `query`，防抖后 `router.replace({ query })`
- **可定制**：`serialize/deserialize/debounceMs/queryKey`

## 最小示例（直接使用 core hook）

::: code-group
<<< @/examples/use-crud-route-sync.vue [route-sync]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-types.ts [类型定义]
:::

## 组件示例（AutoCrud 一行开启）

在 `AutoCrud` 上加上 `route-sync` 和 `route-query-key` 即可：

```vue
<AutoCrud
  :adapter="adapter"
  :fields="demoFields"
  :columns="demoColumns"
  search-query-key="search"
  route-sync
  route-query-key="q"
/>
```

> `route-sync` 需要组件运行在 `vue-router` 上下文里（能拿到 `useRoute/useRouter`）。
