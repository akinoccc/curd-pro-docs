---
title: useCrudList
---

`useCrudList` 负责列表数据：分页、排序、查询状态与拉取。

## 行为要点

- **自动拉取**：默认 `autoFetch=true`，当 `query/sort/page/pageSize` 变化时自动触发
- **去重**：默认 `dedupe=true`，相同 key 的请求会被抑制
- **Abort**：发起新请求前会 abort 上一个请求（若环境支持 `AbortController`）
- **最后一次请求胜出**：内部用序列号忽略过期响应
- **reset**：回到 `initialQuery/initialPage/initialPageSize` 并强制刷新

## 组合示例：手动搭建 Search/Table/Form

下面示例展示 `useCrudList/useCrudForm/useCrudSelection` 的典型组合。

::: code-group
<<< @/examples/crud-compose-basic.vue [页面]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-types.ts [类型定义]
:::
