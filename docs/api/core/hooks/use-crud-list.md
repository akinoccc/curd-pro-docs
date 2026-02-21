---
title: useCrudList
---

# useCrudList

列表数据管理：分页、排序、查询状态、自动拉取、去重、Abort。

## 基本用法

```ts
import { useCrudList } from '@fcurd/core'

const list = useCrudList<MyRow, MyQuery>({
  adapter,
  initialQuery: { search: {} },
  initialPageSize: 20,
})

// 获取数据
list.rows.value // MyRow[]
list.total.value // number
list.loading.value // boolean

// 操作
list.setQuery({ search: { name: 'foo' } })
list.setPage(2)
list.setSort({ field: 'createdAt', order: 'descend' })
list.refresh()
list.reset()
```

## 交互示例

<demo vue="../../../demos/use-crud-list-basic.vue" />

## Options

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `adapter` | `CrudAdapter<Row, Query>` | — | 数据适配器（必填） |
| `initialQuery` | `Query` | `{}` | 初始查询对象 |
| `initialPage` | `number` | `1` | 初始页码 |
| `initialPageSize` | `number` | `20` | 初始每页条数 |
| `autoFetch` | `boolean` | `true` | 初始化拉取一次；且 query/sort/page/pageSize 变化时自动拉取 |
| `debounceMs` | `number` | `0` | 自动拉取的防抖延迟（ms） |
| `dedupe` | `boolean` | `true` | 相同参数的请求是否去重 |
| `onError` | `(error: unknown) => void` | — | 请求失败回调 |

## 返回值

### State

| 属性 | 类型 | 说明 |
|---|---|---|
| `rows` | `Ref<Row[]>` | 当前页数据 |
| `total` | `Ref<number>` | 总条数 |
| `loading` | `Ref<boolean>` | 是否加载中 |
| `error` | `Ref<unknown>` | 最近一次错误 |
| `page` | `Ref<number>` | 当前页码 |
| `pageSize` | `Ref<number>` | 每页条数 |
| `query` | `Ref<Query>` | 查询对象 |
| `sort` | `Ref<CrudSort \| null>` | 排序配置 |

### Actions

| 方法 | 签名 | 说明 |
|---|---|---|
| `refresh` | `() => Promise<void>` | 强制重新拉取（忽略 dedupe） |
| `setQuery` | `(partial: Partial<Query>, options?: SetQueryOptions) => void` | 更新查询条件并重置到第 1 页 |
| `setPage` | `(page: number) => void` | 设置页码 |
| `setPageSize` | `(size: number) => void` | 设置每页条数并重置到第 1 页 |
| `setSort` | `(sort: CrudSort \| null) => void` | 设置排序并重置到第 1 页 |
| `reset` | `() => void` | 回到 initialQuery/initialPage/initialPageSize 并强制刷新 |

## 行为说明

### autoFetch

默认开启。初始化会调度一次 `list` 请求；当 `query` / `sort` / `page` / `pageSize` 任一变化时，也会自动调度。配合 `debounceMs` 可以在高频变化时降频。

### dedupe（去重）

默认开启。会根据 `{ page, pageSize, query, sort }` 计算请求 key：
- 如果新 key 与上次完成的请求 key 相同，跳过
- 如果新 key 与正在进行的请求 key 相同，跳过
- `refresh()` 始终忽略去重

### Abort

发起新请求前会 `abort()` 上一个未完成的请求（如果环境支持 `AbortController`）。`list` 的 `signal` 参数来自这个 controller。

### 最后一次请求胜出

内部用递增序列号 (`requestSeq`) 标记每次请求。当响应返回时，如果序列号不是最新的，直接丢弃结果。这确保快速切换页面 / 排序时，只有最后一次请求的结果生效。

### setQuery 行为

`setQuery` 默认做 **浅合并**（`mode: 'merge'`）并将 `page` 重置为 1。\n+\n+你也可以传入 `options`：\n+- `mode: 'replace'` 完全替换 query\n+- `clearKeys` 先删除指定 key（常用于扁平搜索条件清空）\n+- `pruneEmpty` 深度裁剪空值（`undefined/null/''/[]/{}`），保留 `0/false`

## 完整示例

::: code-group
<<< @/examples/crud-compose-basic.vue [页面]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-types.ts [类型定义]
:::
