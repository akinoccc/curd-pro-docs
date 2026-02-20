---
title: 嵌套搜索 query
---

# 嵌套搜索 query

## 问题

`useCrudList` 的 `query` 是一个扁平对象。但很多时候你希望搜索条件和其他查询参数分开，例如：

```ts
// 扁平结构：搜索条件和其他参数混在一起
{ name: 'foo', status: 'enabled', tab: 'active' }

// 嵌套结构：搜索条件收纳到 query.search 下
{ search: { name: 'foo', status: 'enabled' }, tab: 'active' }
```

## 解决方案：searchQueryKey

`CrudSearch` 和 `AutoCrud` 都支持 `searchQueryKey`（或对应的 `search-query-key` prop），它决定搜索条件写到 `query` 的哪个子路径下。

### 不设置 searchQueryKey（默认：扁平结构）

```vue
<CrudSearch :list="list" :fields="fields" />
```

搜索条件直接写入 `query` 根级别：

```ts
list.query.value // { name: 'foo', status: 'enabled' }
```

### 设置 searchQueryKey="search"（嵌套结构）

```vue
<CrudSearch :list="list" :fields="fields" query-key="search" />
```

搜索条件写入 `query.search`：

```ts
list.query.value // { search: { name: 'foo', status: 'enabled' } }
```

### AutoCrud 用法

```vue
<AutoCrud
  :adapter="adapter"
  :fields="fields"
  :columns="columns"
  search-query-key="search"
/>
```

## 与类型定义配合

建议你在 `Query` 类型中声明嵌套结构：

```ts
interface MyQuery {
  search?: {
    name?: string | null
    status?: string | null
  }
}

const list = useCrudList<MyRow, MyQuery>({
  adapter,
  initialQuery: { search: {} },
})
```

这样 adapter 的 `list(params)` 收到的 `params.query` 就是带类型的嵌套结构，后端可以直接从 `query.search` 中取值。

## 与路由同步配合

嵌套 query 和 `routeSync` 完全兼容。整个 `query` 对象（包含嵌套的 `search`）会被序列化到 URL：

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

URL 结果：`?q={"search":{"name":"foo","status":"enabled"}}`
