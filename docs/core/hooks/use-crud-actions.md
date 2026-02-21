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
  传入 `actions` 时会与默认 actions 合并（`id` 相同则覆盖），可用于“只覆盖某一个默认 action”。
完整示例见：[`AutoCrud` 组件](/naive-ui/components/auto-crud)
