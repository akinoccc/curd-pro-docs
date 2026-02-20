---
title: useCrudRouteSync
---

# useCrudRouteSync

将 `useCrudList` 的 `query` 状态同步到 URL query（以及从 URL 还原），实现"可分享链接 / 刷新不丢条件"。

## 基本用法

```ts
import { useCrudList, useCrudRouteSync } from '@fcurd/core'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const list = useCrudList<MyRow, MyQuery>({ adapter })

useCrudRouteSync({
  query: list.query,
  setQuery: list.setQuery,
  router,
  route,
  queryKey: 'q',
})
```

## Options

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `query` | `Ref<Query>` | — | 来自 `useCrudList` 的 query ref（必填） |
| `setQuery` | `(partial: Partial<Query>, options?: SetQueryOptions) => void` | — | 来自 `useCrudList` 的 setQuery（必填） |
| `router` | `Router` | — | vue-router 的 router 实例 |
| `route` | `RouteLocationNormalized` | — | vue-router 的 route 实例 |
| `queryKey` | `string` | `'q'` | URL query 参数名 |
| `serialize` | `(query: Query) => string` | `JSON.stringify` | 自定义序列化 |
| `deserialize` | `(str: string) => Partial<Query>` | `JSON.parse` | 自定义反序列化 |
| `debounceMs` | `number` | `300` | 写入 URL 的防抖延迟（ms） |
| `syncFromRouteMode` | `'replace' \| 'merge'` | `'replace'` | 从 URL 还原时的写回策略（默认以 URL 为准，避免旧 key 残留） |

## 返回值

| 方法 | 签名 | 说明 |
|---|---|---|
| `syncFromRoute` | `() => void` | 手动从路由读取 query |
| `syncToRoute` | `() => void` | 手动将 query 写入路由 |

## 行为说明

1. **初始化**：调用时立即从 `route.query[queryKey]` 读取并反序列化，写回 `setQuery`（默认 replace）
2. **写入 URL**：监听 `query`（deep watch），防抖后调用 `router.replace({ query })`
3. **防循环**：从路由读取时设置内部标记 `isSyncingFromRoute`，避免写回时触发 watch 循环
4. **空值清理**：深度裁剪空值后若 query 为空（`undefined/null/''/[]/{}` 递归裁剪），自动从 URL 删除该参数（保留 `0/false`）
5. **只替换不跳转**：使用 `router.replace` 而不是 `router.push`，不会产生浏览器历史记录

## 在 AutoCrud 中使用

`AutoCrud` 内置了 `useCrudRouteSync`，只需设置 prop 即可：

```vue
<AutoCrud
  :adapter="adapter"
  :fields="fields"
  :columns="columns"
  route-sync
  route-query-key="q"
/>
```

详见 [路由同步](/guide/route-sync)。

## 完整示例

::: code-group
<<< @/examples/use-crud-route-sync.vue [route-sync]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-types.ts [类型定义]
:::
