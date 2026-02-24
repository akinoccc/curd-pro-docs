---
title: 从 Fields 生成 Columns
---

# 从 Fields 生成 Columns

当你已经定义了 `fields`，很多情况下表格列可以从字段定义中自动推导出来。`@uozi/vito-core` 提供了 `createColumnsFromFields` 工具函数来简化这一过程。

## 基本用法

```ts
import { createColumnsFromFields, defineFields } from '@uozi/vito-core'

const fields = defineFields([
  { key: 'name', label: '名称', type: 'text', visibleIn: { table: true } },
  { key: 'status', label: '状态', type: 'select', visibleIn: { table: true } },
  { key: 'remark', label: '备注', type: 'textarea', visibleIn: { table: false } },
])

// 一行代码生成列——自动排除 visibleIn.table === false 的字段
const columns = createColumnsFromFields(fields)
// 结果：[{ key: 'name', label: '名称' }, { key: 'status', label: '状态' }]
```

## 使用 overrides 定制特定列

通过 `overrides` 可以为特定列添加宽度、排序、渲染器等配置：

```ts
import { cellEnumTag, cellMoney } from '@uozi/vito-naive-ui'

const columns = createColumnsFromFields(fields, {
  overrides: {
    name: { width: 200, sortable: true },
    status: {
      width: 120,
      render: cellEnumTag({
        options: statusOptions,
        typeMap: { draft: 'warning', enabled: 'success' },
      }),
    },
    amount: {
      width: 120,
      render: cellMoney(),
    },
  },
})
```

`overrides` 的 key 对应字段的 `key`，值为 `Partial<CrudColumn>` 会浅合并到自动生成的列定义上。

## 使用 defaults 设置默认属性

`defaults` 会应用到所有生成的列上（`overrides` 的优先级更高）：

```ts
const columns = createColumnsFromFields(fields, {
  defaults: { minWidth: 100 },
  overrides: {
    name: { width: 200 },
  },
})
```

## 自定义过滤逻辑

默认过滤逻辑是排除 `visibleIn.table === false` 的字段。你可以通过 `filter` 完全自定义：

```ts
const columns = createColumnsFromFields(fields, {
  filter: (field) => {
    // 只展示 search 和 table 都可见的字段
    return field.visibleIn?.searchForm !== false && field.visibleIn?.table !== false
  },
})
```

## 何时使用

| 场景 | 推荐方式 |
|---|---|
| 字段和列几乎一致，列只需少量定制 | `createColumnsFromFields` + `overrides` |
| 列需要大量自定义（render、fixed、特殊排列） | 手动 `defineColumns` |
| 快速原型 / 简单 CRUD | `createColumnsFromFields`（甚至不传 options） |

::: tip
`AutoCrud` 在未传入 `columns` prop 时，内部也会自动调用 `createColumnsFromFields(fields)` 生成列。如果你只使用 `AutoCrud` 且不需要列定制（如 render），可以完全省略 `columns`。
:::
