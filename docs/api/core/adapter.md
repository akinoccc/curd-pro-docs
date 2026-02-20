---
title: CrudAdapter
---

# CrudAdapter

`CrudAdapter` 是数据层接口——你只需要实现它，所有 UI 层就能复用同一套 CRUD 能力。

## 类型签名

```ts
interface CrudAdapter<Row = any, Query = Record<string, unknown>> {
  list: (params: ListParams<Query>) => Promise<ListResult<Row>>
  create?: (data: Partial<Row>) => Promise<Row>
  update?: (id: string | number, data: Partial<Row>) => Promise<Row>
  remove?: (id: string | number) => Promise<void>
  export?: (params: ExportParams<Query>) => Promise<ExportResult>
  getId?: (row: Row) => string | number
}
```

## 方法说明

| 方法 | 必选 | 说明 |
|---|---|---|
| `list` | 是 | 分页查询，返回 `{ items, total }` |
| `create` | 否 | 新增记录，返回创建后的完整行 |
| `update` | 否 | 更新记录，接收 id + 变更数据，返回更新后的完整行 |
| `remove` | 否 | 删除记录，接收 id |
| `export` | 否 | 导出数据，返回 `Blob` / `{ blob }` / `{ url }` |
| `getId` | 否 | 从行数据中提取唯一标识。默认回退到 `row.id` |

::: tip
`AutoCrud` 会根据 adapter 是否具备 `create` / `update` / `remove` / `export` 方法来自动启用或隐藏对应的操作按钮。
:::

## ListParams

`list` 方法接收的参数对象：

| 属性 | 类型 | 说明 |
|---|---|---|
| `page` | `number` | 当前页码（从 1 开始） |
| `pageSize` | `number` | 每页条数 |
| `query` | `Query` | 查询对象（结构由你的泛型定义） |
| `sort` | `CrudSort \| null` | 排序配置 `{ field, order }` |
| `signal` | `AbortSignal \| undefined` | 支持 abort（`useCrudList` 在新请求前会 abort 上一个） |

## ListResult

`list` 方法应返回：

| 属性 | 类型 | 说明 |
|---|---|---|
| `items` | `Row[]` | 当前页的数据 |
| `total` | `number` | 总条数（用于分页计算） |

## ExportParams

`export` 方法接收的参数对象：

| 属性 | 类型 | 说明 |
|---|---|---|
| `query` | `Query` | 当前查询条件 |
| `sort` | `CrudSort \| null` | 当前排序 |
| `signal` | `AbortSignal \| undefined` | abort 信号 |

## ExportResult

`export` 方法可返回以下三种形式之一：

| 形式 | 类型 | 说明 |
|---|---|---|
| Blob | `Blob` | 直接返回文件 Blob |
| Blob + 文件名 | `{ blob: Blob, filename?: string }` | 带文件名 |
| URL + 文件名 | `{ url: string, filename?: string }` | 后端下载地址 |

## 示例

::: code-group
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-types.ts [类型定义]
:::
