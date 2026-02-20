---
title: CrudAdapter
---

`CrudAdapter` 是数据层接口：你只需要实现它，UI 层就能复用同一套 CRUD 能力。

## 接口要点

- **必选**：`list(params) -> { items, total }`
- **可选**：`create/update/remove/export`
- **建议实现**：`getId(row)`（让 selection、更新、删除更可靠）

## ListParams / ListResult

- `page/pageSize`：分页
- `query`：查询对象（结构由你定义）
- `sort`：`{ field, order }`
- `signal`：支持 Abort（`useCrudList` 会在新请求前 abort 上一个）

## ExportResult

`export()` 可以返回三种形式之一：

- `Blob`
- `{ blob, filename? }`
- `{ url, filename? }`

## 示例：最小内存 CRUD Adapter

::: code-group
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-types.ts [类型定义]
:::
