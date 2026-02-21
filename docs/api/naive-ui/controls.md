---
title: Controls 控件
---

# Controls 控件

内置字段控件位于 `@fcurd/naive-ui`，通常你不需要手动引入——`componentMap` 会根据 `field.type` 自动选择。

## 内置控件列表

| 控件 | 对应 field.type | 底层 Naive 组件 |
|---|---|---|
| `TextField` | `text` / `textarea` | `NInput` |
| `NumberField` | `number` / `money` | `NInputNumber` |
| `SelectField` | `select` | `NSelect` |
| `DateField` | `date` / `datetime` | `NDatePicker` |
| `DateRangeField` | `dateRange` / `datetimeRange` | `NDatePicker[type=daterange/datetimerange]` |
| `SwitchField` | `switch` | `NSwitch` |

## 共同约定

每个控件都遵循同一组约定：

1. **`defineModel()`** — 作为 `v-model` 接口（Vue 3.4+）
2. **`field` prop** — 接收 `NaiveCrudField`，用于读取 `ui` 配置
3. **`surface` prop** — `'editForm' | 'searchForm'`，决定使用哪个场景的覆盖配置
4. **`resolveControlProps(field, surface)`** — 内部调用，合并 `field.ui.controlProps` 基础值和 `field.ui.overrides[surface].controlProps` 覆盖

## 使用方式

大多数情况下你只需在字段定义的 `ui` 中配置 props，不需要直接引用控件组件：

```ts
import type { NaiveCrudField } from '@fcurd/naive-ui'

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '启用', value: 'enabled' },
  { label: '禁用', value: 'disabled' },
]

const fields: NaiveCrudField[] = [
  {
    key: 'name',
    label: '名称',
    type: 'text',
    ui: {
      controlProps: {
        placeholder: '请输入名称',
        clearable: true,
        maxlength: 100,
        showCount: true,
      },
    },
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    ui: {
      options: statusOptions,
      controlProps: { clearable: true },
    },
  },
  {
    key: 'amount',
    label: '金额',
    type: 'money',
    ui: {
      controlProps: { min: 0, step: 0.01, precision: 2 },
    },
  },
]
```

## 自定义控件

两种方式替换默认控件：

### 方式一：通过 `ui.component`

```ts
import MyCustomSelect from './MyCustomSelect.vue'

{
  key: 'category',
  label: '分类',
  type: 'custom',
  ui: {
    component: MyCustomSelect,
  },
}
```

自定义组件需要支持 `v-model`（`defineModel()`）。

### 方式二：通过 slot

```vue
<AutoCrud :adapter="adapter" :fields="fields" :columns="columns">
  <template #field-category="{ model }">
    <MyCustomSelect v-model="model.category" />
  </template>
</AutoCrud>
```

Slot 方式更灵活，可以访问完整的 slot props。
