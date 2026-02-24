---
title: 自定义控件
---

# 自定义控件

`@uozi/vito-naive-ui` 内置了一组常用控件（text、number、select、date 等）。当内置控件无法满足需求时，有两种方式扩展。

## 方式一：通过 Slot 临时替换

使用 `field-{key}`（表单）或 `search-{key}`（搜索）slot 可以为某个字段提供完全自定义的渲染：

```vue
<AutoCrud :adapter="adapter" :fields="fields" :columns="columns">
  <!-- 自定义"头像"字段的表单控件 -->
  <template #field-avatar="{ model }">
    <NUpload
      :default-file-list="model.avatar ? [{ url: model.avatar }] : []"
      @finish="({ file }) => model.avatar = file.url"
    />
  </template>

  <!-- 自定义"标签"字段的搜索控件 -->
  <template #search-tags="{ model }">
    <NSelect
      v-model:value="model.tags"
      multiple
      :options="tagOptions"
    />
  </template>
</AutoCrud>
```

这种方式简单直接，适合特定页面的一次性定制。

## 方式二：通过 ui.component 注册自定义组件

如果某个控件在多个地方复用，可以创建独立组件并通过 `ui.component` 注册：

### 1. 创建控件组件

控件组件需要遵循以下约定：

```vue
<!-- RichTextField.vue -->
<script setup lang="ts">
import type { NaiveCrudField } from '@uozi/vito-naive-ui'

interface Props {
  field?: NaiveCrudField  // 字段定义
  surface?: 'editForm' | 'searchForm'  // 当前使用场景
}

defineProps<Props>()
const modelValue = defineModel<string | null>()
</script>

<template>
  <MyRichTextEditor v-model="modelValue" />
</template>
```

关键约定：

| Props | 类型 | 说明 |
|---|---|---|
| `field` | `NaiveCrudField` | 当前字段定义，可用于读取 label、ui 等信息 |
| `surface` | `'editForm' \| 'searchForm'` | 当前使用场景，可据此调整行为 |
| `modelValue` | 由 `defineModel` 定义 | 双向绑定的值 |

此外，`CrudForm` / `CrudSearch` 在渲染控件时还会透传 `resolveControlProps(field, surface)` 的结果作为额外 props，所以你通过 `ui.formControl` 配置的属性也会自动传到自定义组件上。

### 2. 在字段中注册

```ts
import RichTextField from './RichTextField.vue'

defineFields([
  {
    key: 'content',
    label: '文章内容',
    type: 'custom',
    ui: {
      component: RichTextField,
      formControl: { height: 300 },
      overrides: {
        editForm: { formControl: { toolbar: 'full' } },
        searchForm: { formControl: { toolbar: 'minimal' } },
      },
    },
  },
])
```

### 渲染优先级

对同一个字段，渲染优先级为：

1. **Slot**（`field-{key}` / `search-{key}`）— 最高
2. **ui.component** — 自定义组件
3. **componentMap[field.type]** — 内置控件

## 内置控件列表

| type | 组件 | 基于 |
|---|---|---|
| `text` | TextField | NInput |
| `textarea` | TextField | NInput[type=textarea] |
| `number` | NumberField | NInputNumber |
| `money` | NumberField | NInputNumber |
| `select` | SelectField | NSelect |
| `date` | DateField | NDatePicker |
| `datetime` | DateField | NDatePicker[type=datetime] |
| `dateRange` | DateRangeField | NDatePicker[type=daterange] |
| `datetimeRange` | DateRangeField | NDatePicker[type=datetimerange] |
| `switch` | SwitchField | NSwitch |

所有内置控件都遵循相同的 Props 约定（`field`、`surface`、`modelValue`），并会自动从 `field.label` 生成 placeholder。

## 完整示例：文件上传控件

```vue
<!-- UploadField.vue -->
<script setup lang="ts">
import type { NaiveCrudField } from '@uozi/vito-naive-ui'
import { resolveControlProps } from '@uozi/vito-naive-ui'
import { NUpload } from 'naive-ui'
import { computed } from 'vue'

interface Props {
  field?: NaiveCrudField
  surface?: 'editForm' | 'searchForm'
}

const props = withDefaults(defineProps<Props>(), {
  surface: 'editForm',
})
const modelValue = defineModel<string | null>()

const formControl = computed(() => {
  if (!props.field) return {}
  return resolveControlProps(props.field, props.surface)
})

function handleFinish({ file }: any) {
  modelValue.value = file.url
}
</script>

<template>
  <NUpload
    :action="formControl.action as string"
    :max="1"
    v-bind="formControl"
    @finish="handleFinish"
  >
    <NButton>上传文件</NButton>
  </NUpload>
</template>
```

使用：

```ts
import UploadField from './UploadField.vue'

defineFields([
  {
    key: 'attachment',
    label: '附件',
    type: 'custom',
    visibleIn: { searchForm: false },
    ui: {
      component: UploadField,
      formControl: { action: '/api/upload', accept: '.pdf,.doc' },
    },
  },
])
```
