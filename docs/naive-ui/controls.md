---
title: Controls
---

内置字段控件位于 `@fcurd/naive-ui/controls`，通常你不需要手动引入它们——`componentMap` 会根据 `field.type` 自动选择。

## 内置控件列表

- `TextField`：`text/textarea`
- `NumberField`：`number/money`
- `SelectField`：`select`
- `SwitchField`：`switch`
- `DateField`：`date/datetime`
- `DateRangeField`：`dateRange/datetimeRange`

## 共同约定（关键）

每个控件都遵循同一组约定：

- 用 `defineModel()` 作为 v-model 接口（Vue 3.4+）
- 接收 `field?: NaiveCrudField` 与 `surface?: 'form' | 'search'`
- 通过 `resolveControlProps(field, surface)` 合并 `field.ui.control`（含 `form/search` 分面覆盖）

## 使用方式（你不需要直接用控件）

大多数情况下你只要在 field 上配置 `ui`：

```ts
import type { NaiveCrudField } from '@fcurd/naive-ui'

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '启用', value: 'enabled' },
  { label: '禁用', value: 'disabled' },
]

const fields: NaiveCrudField[] = [
  {
    key: 'status',
    label: '状态',
    type: 'select',
    ui: {
      options: statusOptions,
      control: { options: statusOptions, clearable: true },
    },
  },
]
```

