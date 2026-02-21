---
title: 工具函数
---

# 工具函数

`@fcurd/core` 的工具函数用于类型推导和字段/列的常用转换。

## defineFields

保留字面量类型，减少泛型显式声明。

```ts
function defineFields<Row, FormModel, const Fields extends CrudField<Row, FormModel>[]>(
  fields: Fields
): Fields
```

**用法**：

```ts
import { defineFields } from '@fcurd/core'

const fields = defineFields<MyRow>([
  { key: 'name', label: '名称', type: 'text', visibleIn: { searchForm: true, editForm: true } },
  { key: 'status', label: '状态', type: 'select', visibleIn: { searchForm: true, editForm: true } },
])
// fields 保留字面量类型，IDE 能推导出 key 的具体值
```

::: tip
在 `@fcurd/naive-ui` 中也有同名的 `defineFields`，它的 `UiExt` 默认绑定为 `NaiveFieldUi`，使用 Naive UI 时推荐用 naive-ui 版本。
:::

## defineColumns

保留字面量类型。

```ts
function defineColumns<Row, const Columns extends CrudColumn<Row>[]>(
  columns: Columns
): Columns
```

## createColumnsFromFields

从字段定义自动生成表格列。只包含 `visibleIn.table !== false` 的字段。

```ts
function createColumnsFromFields<Row>(
  fields: CrudField<Row>[],
  options?: { includeKeys?: string[] }
): CrudColumn<Row>[]
```

| 参数 | 类型 | 说明 |
|---|---|---|
| `fields` | `CrudField<Row>[]` | 字段定义数组 |
| `options.includeKeys` | `string[]` | 只包含指定 key 的列 |

## filterFieldsBySurface

按 `visibleIn` 规则过滤字段。

```ts
function filterFieldsBySurface<Row>(
  fields: CrudField<Row>[],
  surface: 'searchForm' | 'table' | 'editForm' | 'detail',
  ctx?: Partial<FieldContext<Row>>
): CrudField<Row>[]
```

| 参数 | 类型 | 说明 |
|---|---|---|
| `fields` | `CrudField<Row>[]` | 字段定义数组 |
| `surface` | `string` | 目标 surface |
| `ctx` | `Partial<FieldContext>` | 传给 `visibleIn` 函数的上下文 |

## getFieldLabel

提取字段的 label 字符串（处理 label 是函数的情况）。

```ts
function getFieldLabel(field: CrudField): string
```

## 示例

::: code-group
<<< @/examples/basic-schema.ts [fields & columns]
<<< @/examples/basic-types.ts [类型定义]
:::
