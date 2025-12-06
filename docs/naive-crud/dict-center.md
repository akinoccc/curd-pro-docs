## 字典中心（Dict Center）设计

本文件详细说明 CRUD 库中的 **字典中心（Dict Center）** 设计，用于统一管理枚举 / 字典数据（如性别、国家、保单状态、支付方式等），并与字段定义解耦。

目标：

- **集中管理** 字典定义与加载逻辑，避免在各页面重复 import 常量/手写 options。
- **按需懒加载** 字典数据，避免一次性全部加载占用内存。
- **与字段解耦**：字段只记录 `dictKey`，不直接依赖具体枚举常量。
- 提供统一的 `useDict` Hook，与 `Control Map` 配合，为 `select` 等控件提供 options。

---

## 1. 设计思路

字典中心分为三层：

- **字典接口层（DictApi）**：定义如何根据 `key` 获取一组字典项。
- **运行时 Hook 层（useDict）**：负责懒加载、缓存、loading/error 状态管理。
- **字段与控件层**：
  - `CrudField` 上通过 `dictKey` 指明要用哪个字典；
  - 控件（如 `SelectField`）通过 `useDict` 按需加载对应字典。

---

## 2. 核心类型与 Hook 接口

### 2.1 字典项与 API 接口

```ts
export interface DictItem {
  label: string
  value: string | number
}

export interface DictApi {
  getOptions: (key: string) => Promise<DictItem[]>
}
```

### 2.2 useDict Hook：懒加载 + 缓存

```ts
export function useDict(dictApi: DictApi) {
  const cache = new Map<string, Ref<DictItem[]>>()
  const loadingMap = new Map<string, Ref<boolean>>()
  const errorMap = new Map<string, Ref<unknown | null>>()

  async function load(key: string) {
    if (!cache.has(key))
      cache.set(key, ref<DictItem[]>([]))
    if (!loadingMap.has(key))
      loadingMap.set(key, ref(false))
    if (!errorMap.has(key))
      errorMap.set(key, ref<unknown | null>(null))

    const optionsRef = cache.get(key)!
    const loading = loadingMap.get(key)!
    const error = errorMap.get(key)!

    if (optionsRef.value.length === 0 && !loading.value) {
      loading.value = true
      error.value = null
      try {
        optionsRef.value = await dictApi.getOptions(key)
      }
      catch (e) {
        error.value = e
      }
      finally {
        loading.value = false
      }
    }

    return { options: optionsRef, loading, error }
  }

  return { load }
}
```

特点：

- 同一个 key 只会在**首次使用**时触发加载，后续复用缓存。
- 通过 `loading` / `error` 支持组件层友好展示加载中/错误状态。

---

## 3. 在字段定义中使用 `dictKey`

在 `CrudField` 接口中增加可选字段 `dictKey?: string`，用于指明字段所使用的字典 key：

```ts
export interface CrudField<Row = any, FormModel = any> {
  key: string
  label: () => string
  type: 'text' | 'select' | 'date' | 'money' | 'custom'
  dictKey?: string
  // ...
}
```

示例：保单字段定义中使用 `dictKey`：

```ts
// policy.fields.ts
import type { CrudField } from 'libs/crud-naive'

export interface ModelPolicy {
  id: number
  status: number
  currency: string
}

export const policyFields: CrudField<ModelPolicy, ModelPolicy>[] = [
  {
    key: 'status',
    label: () => $gettext('状态'),
    type: 'select',
    dictKey: 'PolicyStatus',
    visibleIn: { table: true, search: true, form: true },
  },
  {
    key: 'currency',
    label: () => $gettext('币种'),
    type: 'select',
    dictKey: 'CurrencyType',
    visibleIn: { table: true, search: true, form: true },
  },
]
```

字段只关心「我要用哪个字典」，并不直接 import `PolicyStatus` / `CurrencyType`。

---

## 4. 在控件渲染层使用 useDict

以 `SelectField` 为例，通过 `useDict` 加载 options：

```vue
<!-- SelectField.vue（简化示例） -->
<script setup lang="ts">
import type { CrudField } from 'libs/crud-naive'
import type { DictItem, DictApi } from '@/libs/dict/types'
import { useDict } from '@/libs/dict/useDict'

interface Props {
  field: CrudField<any, any>
  modelValue: string | number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string | number | null): void }>()

const dictApi = inject<DictApi>(DictApiSymbol)!
const { load } = useDict(dictApi)

const optionsRef = ref<DictItem[]>([])
const loading = ref(false)

onMounted(async () => {
  if (!props.field.dictKey) return
  const { options, loading: ld } = await load(props.field.dictKey)
  optionsRef.value = options.value
  loading.value = ld.value
})
</script>

<template>
  <n-select
    :value="modelValue"
    :options="optionsRef"
    :loading="loading"
    @update:value="val => emit('update:modelValue', val)"
  />
</template>
```

这样，`select` 控件无需关心字典从哪里来，只需要知道 `field.dictKey` 和统一的 `useDict` 调用方式。

---

## 5. 字典中心实现示例

一个典型的业务实现可以同时支持“静态枚举 + 后端字典接口”：

```ts
// dictApi.ts
import type { DictApi, DictItem } from '@/libs/dict/types'
import { PolicyStatus, CurrencyType } from '~/constants/policy'
import { request } from '~/api/request'

function maskToItems(mask: Record<string, () => string>): DictItem[] {
  return Object.entries(mask).map(([value, labelFn]) => ({
    value,
    label: labelFn(),
  }))
}

const staticMaps: Record<string, () => DictItem[]> = {
  PolicyStatus: () => maskToItems(PolicyStatus),
  CurrencyType: () => maskToItems(CurrencyType),
}

export const dictApi: DictApi = {
  async getOptions(key: string): Promise<DictItem[]> {
    if (staticMaps[key])
      return staticMaps[key]()

    // 兜底：从后端拉取通用字典（例如 /api/dicts?key=xxx）
    const res = await request.get<{ items: DictItem[] }>('/api/dicts', {
      params: { key },
    })
    return res.items
  },
}
```

在应用入口或 CRUD 上下文中统一 provide `dictApi`：

```ts
// main.ts 或 CrudProvider 外层
const app = createApp(App)
app.provide(DictApiSymbol, dictApi)
```

这样：

- 静态枚举（如保单状态、币种）直接在前端构造；
- 动态枚举（如产品列表）可由后端返回；
- 所有 select 字段通过 `dictKey + useDict` 使用同一套访问方式。

---

## 6. 按模块拆分字典，防止配置膨胀

为防止“字典注册中心变成一个巨大文件”，可以按业务模块拆分：

- `dict/policy.ts`：保单相关字典（状态、币种、续保计划等）
- `dict/client.ts`：客户相关字典（性别、婚姻状态、教育程度等）
- `dict/common.ts`：通用字典（国家/地区、是/否等）

再由一个总入口汇总：

```ts
// dict/index.ts
import { policyDictApi } from './policy'
import { clientDictApi } from './client'
import { commonDictApi } from './common'

export const dictApi: DictApi = {
  async getOptions(key: string) {
    // 优先在各模块内查找
    if (policyDictApi.canHandle(key))
      return policyDictApi.getOptions(key)
    if (clientDictApi.canHandle(key))
      return clientDictApi.getOptions(key)
    if (commonDictApi.canHandle(key))
      return commonDictApi.getOptions(key)

    // 兜底：走通用后端接口
    return commonDictApi.getOptionsFromServer(key)
  },
}
```

通过“集中访问 + 分模块实现”的方式，既保证了使用上的统一，又避免了单文件配置膨胀。 


