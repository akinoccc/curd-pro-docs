---
title: useCrudSelection
---

`useCrudSelection` 管理"选择集"（常用于表格勾选 + 批量操作）。

## 行为要点

- `selectedIds`：`Set<string | number>`（用 `getId(row)` 计算）
- `selectedRows`：从当前 `rows` 中派生（只会包含当前页存在的行）
- **自动修剪**：当 `rows` 变化时，会移除不再存在的 id

## 最小示例

```ts
import { useCrudList, useCrudSelection } from '@fcurd/core'

const list = useCrudList({ adapter })
const selection = useCrudSelection({
  rows: list.rows,
  getId: row => row.id,
})

selection.toggle(1)
selection.clear()
```

## 组合示例（完整）

::: code-group
<<< @/examples/auto-crud-basic.vue [页面]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-schema.ts [fields & columns]
<<< @/examples/basic-types.ts [类型定义]
:::
