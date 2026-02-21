---
title: useCrudActions
---

`useCrudActions` 用于管理动作集合（toolbar/row/batch），并提供一组可复用的预设 action 工厂 `presetActions`。

## presetActions

- `presetActions.create`
- `presetActions.edit`
- `presetActions.delete`
- `presetActions.batchDelete`
- `presetActions.export`

## 最小示例

<<< @/examples/use-crud-actions.ts

## 在 Naive UI 组件里怎么用

- `AutoCrud` 默认会根据 adapter 能力生成 `create/edit/delete/export`（并处理 confirm + refresh）。
  想完全接管时，直接传入 `actions` 覆盖默认行为。
完整示例见：[`AutoCrud` 组件](/naive-ui/components/auto-crud)
