---
title: 列表查询高级技巧
---

# 列表查询高级技巧

`useCrudList` 提供了丰富的查询控制能力。本文介绍 `setQuery` 的高级选项以及防抖、去重、请求取消等内置优化。

## setQuery 选项

`setQuery(partial, options?)` 的第二个参数支持以下选项：

```ts
interface SetQueryOptions {
  mode?: 'merge' | 'replace' // 合并模式，默认 'merge'
  clearKeys?: string[]        // 更新前先删除的键
  pruneEmpty?: boolean        // 是否深度清理空值
}
```

### mode：合并与替换

```ts
// merge（默认）：保留现有字段，合并新字段
list.setQuery({ status: 'active' })
// 现有 { name: 'foo' } → { name: 'foo', status: 'active' }

// replace：完全替换为新对象
list.setQuery({ status: 'active' }, { mode: 'replace' })
// 现有 { name: 'foo' } → { status: 'active' }
```

### clearKeys：先删后合

在合并前先删除指定的键，适合"切换筛选维度"的场景：

```ts
// 从"按名称搜索"切换到"按分类搜索"，先清理 name
list.setQuery(
  { category: 'A' },
  { clearKeys: ['name'] },
)
// 现有 { name: 'foo', page: 1 } → { page: 1, category: 'A' }
```

### pruneEmpty：深度清理空值

开启后会递归删除空字符串、`null`、`undefined`、空数组、空对象：

```ts
list.setQuery(
  { name: '', status: null, tags: [] },
  { pruneEmpty: true },
)
// 结果：所有空值字段被移除
```

保留 `0` 和 `false`——它们是有意义的值，不会被清理。

::: tip
`CrudSearch` 组件在调用 `setQuery` 时默认启用了 `pruneEmpty: true`，所以搜索条件中的空值不会传给 adapter。
:::

## setQuery 自动重置页码

调用 `setQuery` 后会自动将 `page` 重置为 1。同样，`setPageSize` 和 `setSort` 也会自动重置页码。这避免了"修改筛选条件后仍在第 3 页导致无数据"的常见问题。

## 防抖（debounceMs）

当查询变化频繁时（如输入框实时搜索），可以启用防抖减少请求：

```ts
const list = useCrudList({
  adapter,
  debounceMs: 300, // 300ms 内的连续变化只触发一次请求
})
```

防抖只影响由状态变化自动触发的请求。手动调用 `refresh()` 会立即执行，不受防抖限制。

## 请求去重（dedupe）

默认开启。当 `page`、`pageSize`、`query`、`sort` 组合未变化时，不会发出重复请求：

```ts
const list = useCrudList({
  adapter,
  dedupe: true, // 默认值
})

// 连续设置相同 query 不会触发多余请求
list.setQuery({ name: 'foo' })
list.setQuery({ name: 'foo' }) // 被去重，跳过
```

去重基于状态的 JSON 序列化结果。如果需要强制刷新，使用 `refresh()`。

## 请求取消（AbortController）

`useCrudList` 在发出新请求前会自动 abort 上一个未完成的请求：

```ts
// adapter.list 接收 signal
const adapter = {
  async list(params) {
    const res = await fetch('/api/list', {
      signal: params.signal, // 传递 AbortSignal
      // ...
    })
    return res.json()
  },
}
```

这确保了快速翻页或连续修改查询时，只有最后一次请求的结果会生效，避免"旧响应覆盖新数据"的竞态问题。

被 abort 的请求不会触发 `onError` 回调。

## 手动控制拉取（autoFetch）

默认情况下，`useCrudList` 会在初始化时自动拉取数据，并在 `query`/`page`/`pageSize`/`sort` 变化时自动重新拉取。设置 `autoFetch: false` 可以关闭自动拉取：

```ts
const list = useCrudList({
  adapter,
  autoFetch: false, // 不自动拉取
})

// 手动触发
await list.refresh()
```

适用场景：
- 需要等待其他异步数据（如权限检查）后再拉取
- 需要在 `setQuery` 之后精确控制拉取时机

## reset：重置所有状态

`reset()` 将查询条件、排序、分页全部恢复到初始值，并强制刷新：

```ts
list.reset()
// query → initialQuery
// sort → null
// page → initialPage
// pageSize → initialPageSize
// 立即强制刷新（忽略去重）
```

## onError 回调

通过 `onError` 统一处理列表请求的错误：

```ts
const list = useCrudList({
  adapter,
  onError: (err) => {
    message.error('数据加载失败')
    console.error(err)
  },
})
```

`error` ref 也会同步更新，可以在模板中显示错误状态。

## 生命周期清理

`useCrudList` 在组件卸载（`onScopeDispose`）时会自动：

- 清除待执行的防抖定时器
- abort 进行中的请求
- 重置内部状态

你不需要手动清理。
