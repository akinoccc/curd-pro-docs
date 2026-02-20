---
title: useCrudSelection
---

# useCrudSelection

行选择管理：选中集合、跨页选择、批量操作支持。

## 基本用法

```ts
import { useCrudList, useCrudSelection } from '@fcurd/core'

const list = useCrudList({ adapter })
const selection = useCrudSelection({
  rows: list.rows,
  getId: row => row.id,
})

selection.toggle(1) // 切换选中
selection.select(2) // 选中
selection.deselect(1) // 取消选中
selection.selectAll() // 全选当前页
selection.clear() // 清空
selection.isSelected(2) // true
selection.selectedCount.value // 1
```

## 交互示例

<demo vue="../../../demos/use-crud-selection-basic.vue" />

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
| `selectedRows` | `ComputedRef<Row[]>` | 已选行的缓存快照（跨页保留；在翻页/刷新时会用当前页数据更新对应条目） |
| `selectedCount` | `ComputedRef<number>` | 选中行数 |

### Actions

| 方法 | 签名 | 说明 |
|---|---|---|
| `setSelectedIds` | `(ids: (string \| number)[]) => void` | 替换整个选中集合（UI 适配层使用） |
| `select` | `(id: string \| number) => void` | 选中一行 |
| `deselect` | `(id: string \| number) => void` | 取消选中 |
| `toggle` | `(id: string \| number) => void` | 切换选中状态 |
| `selectAll` | `() => void` | 选中当前页所有行 |
| `clear` | `() => void` | 清空所有选中 |
| `isSelected` | `(id: string \| number) => boolean` | 判断是否选中 |

## 行为说明

### 跨页选择

`selectedIds` 不会随翻页/刷新自动裁剪，因此可以自然支持“跨页勾选 → 批量操作”。

### selectedRows 缓存

`selectedRows` 维护 `id -> row` 的缓存：当你在某一页选中行时会缓存该行；后续翻页/刷新时，如果当前页包含已选中的 ID，会用最新的行对象覆盖缓存。\n\n注意：对于不在当前页的数据，`selectedRows` 可能是较早的快照；如果你需要绝对最新的数据，请以 `selectedIds` 重新向后端查询。

## 完整示例

::: code-group
<<< @/examples/auto-crud-basic.vue [页面]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-types.ts [类型定义]
:::
