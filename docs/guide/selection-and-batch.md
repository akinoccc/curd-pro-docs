---
title: 选择与批量操作
---

# 选择与批量操作

## 开启行选择

在 `AutoCrud` 上设置 `showSelection`：

```vue
<AutoCrud
  :adapter="adapter"
  :fields="fields"
  :columns="columns"
  show-selection
/>
```

开启后，表格左侧会出现复选框列，选中行后底部会显示批量操作区。

## 默认批量操作

如果 adapter 实现了 `remove` 方法且未禁用删除，`AutoCrud` 会自动添加"批量删除"操作——仅在有选中项时显示。

## 自定义批量操作

通过 `actions` prop 传入 `area: 'batch'` 的操作：

```ts
import { presetActions } from '@uozi/vito-core'
import type { CrudAction } from '@uozi/vito-core'

const actions: CrudAction<MyRow>[] = [
  presetActions.create({ onClick: openCreate }),
  presetActions.edit({ onClick: openEdit }),
  presetActions.delete({ adapter }),
  presetActions.batchDelete({ adapter }),
  // 自定义批量操作
  {
    id: 'batchApprove',
    label: '批量审核',
    area: 'batch',
    type: 'success',
    visible: ctx => ctx.selectedIds.length > 0,
    onClick: async (ctx) => {
      await Promise.all(
        ctx.selectedIds.map(id => api.approve(id)),
      )
      ctx.clearSelection()
      await ctx.refresh()
    },
  },
]
```

```vue
<AutoCrud
  :adapter="adapter"
  :fields="fields"
  :columns="columns"
  :actions="actions"
  show-selection
/>
```

## ActionContext 中的选择信息

所有 action 的 `onClick` / `visible` / `disabled` 回调都会收到 `ActionContext`，其中包含：

| 属性 | 类型 | 说明 |
|---|---|---|
| `selectedRows` | `Row[]` | 当前选中的行对象数组 |
| `selectedIds` | `(string \| number)[]` | 当前选中的行 ID 数组 |
| `clearSelection` | `() => void` | 清空选择 |

你可以利用这些信息控制操作的可见性和行为：

```ts
{
  id: 'batchExport',
  label: '导出选中项',
  area: 'batch',
  visible: ctx => ctx.selectedIds.length > 0,
  disabled: ctx => ctx.selectedIds.length > 1000,
  onClick: async (ctx) => {
    await exportSelected(ctx.selectedRows)
  },
}
```

## 跨页选择

`useCrudSelection` 内部使用 `selectedIds`（Set）和 `selectedRowMap`（Map）两层结构：

- **selectedIds** — 记录所有选中行的 ID，翻页后仍保留
- **selectedRowMap** — 缓存每个选中行的完整对象快照

当用户在第 1 页选中了 3 行，翻到第 2 页又选中了 2 行，`selectedIds` 会包含全部 5 个 ID。切换回第 1 页时，之前的勾选状态自动恢复。

::: tip
跨页选择需要 `rowKey` 能稳定标识每行（通常是数据库主键）。确保 adapter 的 `getId` 或 `AutoCrud` 的 `rowKey` 返回唯一且不变的值。
:::

## useCrudSelection 手动使用

在 Hooks 组合模式下，你可以直接操作选择状态：

```ts
import { useCrudList, useCrudSelection } from '@uozi/vito-core'

const list = useCrudList({ adapter })
const selection = useCrudSelection({
  rows: list.rows,
  getId: row => row.id,
})

// 操作 API
selection.select(1)           // 选中 ID=1
selection.deselect(1)         // 取消选中 ID=1
selection.toggle(2)           // 切换 ID=2 的选中状态
selection.selectAll()         // 选中当前页所有行
selection.clear()             // 清空所有选择
selection.isSelected(1)       // 检查 ID=1 是否选中

// 只读状态
selection.selectedIds.value   // Set<string | number>
selection.selectedRows.value  // Row[]
selection.selectedCount.value // number
```

## batch-actions Slot

如果需要自定义批量操作区的渲染，可以使用 `batch-actions` slot：

```vue
<AutoCrud :adapter="adapter" :fields="fields" :columns="columns" show-selection>
  <template #batch-actions="{ selection, actions, renderActionButton }">
    <NSpace>
      <span>已选 {{ selection.selectedCount.value }} 项</span>
      <NButton size="small" @click="selection.clear()">清除</NButton>
      <template v-for="action in actions" :key="action.id">
        <component :is="() => renderActionButton(action)" />
      </template>
    </NSpace>
  </template>
</AutoCrud>
```
