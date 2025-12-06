## 控件映射表（Control Map）设计与多 UI 库适配

本文件详细说明 CRUD 库中的 **Control Map 机制**，用于将领域字段与不同 UI 组件库（Naive UI / Ant Design Vue 等）解耦。

目标：

- CRUD 核心逻辑只依赖一套**标准控件接口**，不直接依赖任何具体 UI 组件库。
- 针对不同组件库，通过一层**适配器组件（Adapter）** 将标准接口映射到各自的 props/事件。
- 允许在项目或页面级别按需覆盖某些控件类型（例如统一使用自定义 `RemoteSelect`）。

---

## 1. 三层结构

表单控件整体拆成三层：

- **字段模型层（Field Meta）**
  - 由 `CrudField` 定义：`type`、`dictKey`、`required` 等。
  - 与 UI 库无关，只描述业务。

- **标准控件接口层（Control Interface）**
  - 为 CRUD 库内部渲染控件定义最小必要 props 形状。
  - 示例：`modelValue`、`onUpdate:modelValue`、`disabled`、`placeholder`、`options` 等。

- **UI 适配层（Adapter）**
  - 为每个 UI 库实现一套 **标准接口 → 具体组件** 的适配组件。
  - 如 `NaiveTextField`、`AntdTextField`，它们都实现同一接口，但内部用 `n-input` 或 `AInput`。

CRUD 库只依赖「标准控件接口 + Control Map」，不关心 UI 库细节。

---

## 2. 标准控件接口定义

### 2.1 通用基础接口

```ts
export interface BaseControlProps<Value = any> {
  modelValue: Value
  'onUpdate:modelValue': (value: Value) => void
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  field: CrudField<any, any> // 当前字段元信息
}
```

### 2.2 Select 扩展接口

```ts
export interface SelectControlProps<Value = string | number>
  extends BaseControlProps<Value | Value[]> {
  options: { label: string; value: Value }[]
  multiple?: boolean
  clearable?: boolean
}
```

可按需扩展更多：

- `DateControlProps`：包含日期类型、格式选项；
- `NumberControlProps`：包含 `min` / `max` / `step` 等。

---

## 3. Naive UI 适配器示例

### 3.1 文本输入适配器 `NaiveTextField`

```vue
<!-- NaiveTextField.vue -->
<script setup lang="ts">
import type { BaseControlProps } from '../control-types'

const props = defineProps<BaseControlProps<string | null>>()
</script>

<template>
  <n-input
    :value="props.modelValue ?? ''"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :placeholder="props.placeholder ?? props.field.label()"
    @update:value="val => props['onUpdate:modelValue'](val)"
  />
</template>
```

### 3.2 下拉选择适配器 `NaiveSelectField`

```vue
<!-- NaiveSelectField.vue -->
<script setup lang="ts">
import type { SelectControlProps } from '../control-types'

const props = defineProps<SelectControlProps>()
</script>

<template>
  <n-select
    :value="props.modelValue"
    :options="props.options"
    :multiple="props.multiple"
    :clearable="props.clearable"
    :disabled="props.disabled"
    :placeholder="props.placeholder ?? props.field.label()"
    @update:value="val => props['onUpdate:modelValue'](val)"
  />
</template>
```

这两个组件都实现了统一接口，只是内部依赖 Naive UI。

---

## 4. Ant Design Vue 适配器示例

### 4.1 文本输入适配器 `AntdTextField`

```vue
<!-- AntdTextField.vue -->
<script setup lang="ts">
import type { BaseControlProps } from '../control-types'
import { Input as AInput } from 'ant-design-vue'

const props = defineProps<BaseControlProps<string | null>>()

function handleChange(e: any) {
  props['onUpdate:modelValue'](e.target.value)
}
</script>

<template>
  <AInput
    :value="props.modelValue ?? ''"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :placeholder="props.placeholder ?? props.field.label()"
    @change="handleChange"
  />
</template>
```

### 4.2 下拉选择适配器 `AntdSelectField`

```vue
<!-- AntdSelectField.vue -->
<script setup lang="ts">
import type { SelectControlProps } from '../control-types'
import { Select as ASelect } from 'ant-design-vue'

const props = defineProps<SelectControlProps>()

function handleChange(val: any) {
  props['onUpdate:modelValue'](val)
}
</script>

<template>
  <ASelect
    :value="props.modelValue"
    :options="props.options"
    :mode="props.multiple ? 'multiple' : undefined"
    :allow-clear="props.clearable"
    :disabled="props.disabled"
    :placeholder="props.placeholder ?? props.field.label()"
    @change="handleChange"
  />
</template>
```

通过这种方式，同一个 CRUD 表单逻辑可以在 Naive UI / Antdv 间切换而不改字段定义或核心逻辑。

---

## 5. CrudControlMap 定义

Control Map 用于将字段 `type` 映射到具体适配器组件：

```ts
export interface CrudControlMap {
  text: Component      // 接收 BaseControlProps<string | null>
  textarea: Component
  select: Component    // 接收 SelectControlProps
  date: Component
  number: Component
  // ...
}
``>

以 Naive UI 为例：

```ts
// control-map-naive.ts
import NaiveTextField from './naive/NaiveTextField.vue'
import NaiveSelectField from './naive/NaiveSelectField.vue'
// ...

export const naiveControlMap: CrudControlMap = {
  text: NaiveTextField,
  textarea: NaiveTextField,
  select: NaiveSelectField,
  date: NaiveDateField,
  number: NaiveNumberField,
}
```

Antdv 版本类似：

```ts
// control-map-antd.ts
import AntdTextField from './antd/AntdTextField.vue'
import AntdSelectField from './antd/AntdSelectField.vue'
// ...

export const antdControlMap: CrudControlMap = {
  text: AntdTextField,
  textarea: AntdTextField,
  select: AntdSelectField,
  date: AntdDateField,
  number: AntdNumberField,
}
```

---

## 6. 在 CrudProvider 中注入 Control Map

在 `CrudProvider` 中合并默认 Control Map 与业务覆盖：

```ts
interface CrudProviderProps<Row = any> {
  crud: UseCrudReturn<Row>
  fields?: CrudField<Row, any>[]
  controlMap?: Partial<CrudControlMap>
}

const defaultControlMap = naiveControlMap // 默认使用 Naive 版本

const mergedControlMap = computed<CrudControlMap>(() => ({
  ...defaultControlMap,
  ...props.controlMap,
}))

provide(CrudControlMapSymbol, mergedControlMap)
```

业务侧选择 UI 库或覆盖某些类型：

```vue
<!-- 使用 Naive UI -->
<CrudProvider
  :crud="crud"
  :fields="clientFields"
  :control-map="naiveControlMap"
/>

<!-- 使用 Ant Design Vue -->
<CrudProvider
  :crud="crud"
  :fields="clientFields"
  :control-map="antdControlMap"
/>
```

也可以只覆盖个别控件类型：

```ts
const customControlMap = {
  select: MyRemoteSelectField, // 覆盖默认 select
}
```

---

## 7. 在 CrudForm / AutoCrud 中消费 Control Map

示例：在 `CrudForm` 内根据字段类型选择控件：

```vue
<!-- CrudForm.vue 内部伪代码 -->
<script setup lang="ts">
const controlMap = inject(CrudControlMapSymbol)!

function resolveControl(field: CrudField) {
  const type = field.type ?? 'text'
  return controlMap[type]
}
</script>

<template>
  <n-form>
    <n-form-item
      v-for="field in fields"
      :key="field.key"
      :label="field.label()"
    >
      <component
        :is="resolveControl(field)"
        v-model="formModel[field.key]"
        :field="field"
        :disabled="formDisabled"
      />
    </n-form-item>
  </n-form>
</template>
```

这样：

- 字段定义只关心业务含义与类型；
- CRUD 表单渲染逻辑只关心「字段类型 → 控件类型」；
- UI 组件库的差异全部在适配层（Control Map + Adapter）中解决。 


