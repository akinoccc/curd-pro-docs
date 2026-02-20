---
title: useCrudSelection
---

# useCrudSelection

行选择管理：选中集合、自动修剪、批量操作支持。

## 基本用法

```ts
import { useCrudList, useCrudSelection } from '@fcurd/core'

const list = useCrudList({ adapter })
const selection = useCrudSelection({
  rows: list.rows,
  getId: row => row.id,
})

selection.toggle(1)           // 切换选中
selection.select(2)           // 选中
selection.deselect(1)         // 取消选中
selection.selectAll()         // 全选当前页
selection.clear()             // 清空
selection.isSelected(2)       // true
selection.selectedCount.value // 1
```

## Options

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `rows` | `Ref<Row[]>` | — | 当前页数据（必填），通常来自 `useCrudList().rows` |
| `getId` | `(row: Row) => string \| number` | `row => row.id` | 从行数据中提取唯一 ID |

## 返回值

### State

| 属性 | 类型 | 说明 |
|---|---|---|
| `selectedIds` | `Ref<Set<string \| number>>` | 选中的 ID 集合 |
| `selectedRows` | `ComputedRef<Row[]>` | 从当前 `rows` 中派生的选中行（只包含当前页存在的行） |
| `selectedCount` | `ComputedRef<number>` | 选中行数 |

### Actions

| 方法 | 签名 | 说明 |
|---|---|---|
| `select` | `(id: string \| number) => void` | 选中一行 |
| `deselect` | `(id: string \| number) => void` | 取消选中 |
| `toggle` | `(id: string \| number) => void` | 切换选中状态 |
| `selectAll` | `() => void` | 选中当前页所有行 |
| `clear` | `() => void` | 清空所有选中 |
| `isSelected` | `(id: string \| number) => boolean` | 判断是否选中 |

## 行为说明

### 自动修剪

当 `rows` 变化时（比如翻页、刷新），会自动移除 `selectedIds` 中不再存在于 `rows` 的 ID。

### selectedRows 派生

`selectedRows` 是从当前 `rows` 中过滤出 `selectedIds` 匹配的行。如果一个 ID 在 `selectedIds` 中但不在当前 `rows` 中（比如来自其他页），它不会出现在 `selectedRows` 中。

## 完整示例

::: code-group
<<< @/examples/auto-crud-basic.vue [页面]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-types.ts [类型定义]
:::
