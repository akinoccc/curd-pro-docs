## Hooks 设计：useCrud / useCrudActions 与领域 Hook 模式

本文件描述 Naive CRUD 的核心 Hook 设计，包括：

- 通用 CRUD Hook：`useCrud`
- 动作系统 Hook：`useCrudActions`
- 领域 Hook（表单联动等）的推荐模式

---

## 1. useCrud：列表 / 分页 / 查询逻辑

`useCrud` 是整个库的核心数据流 Hook，负责：

- 管理列表数据 `rows` 与总数 `total`
- 管理加载态 `loading`
- 管理分页参数 `page` / `pageSize`
- 管理查询条件 `query`
- 调用 `CrudAdapter.list` 完成服务端查询

### 1.1 类型定义

```ts
export interface UseCrudOptions<Row = any> {
  adapter: CrudAdapter<Row>
  initialQuery?: Record<string, any>
}

export interface UseCrudReturn<Row = any> {
  rows: Ref<Row[]>
  total: Ref<number>
  loading: Ref<boolean>
  query: Ref<Record<string, any>>
  page: Ref<number>
  pageSize: Ref<number>
  refresh: () => Promise<void>
  setQuery: (partial: Record<string, any>) => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
}

export function useCrud<Row = any>(
  options: UseCrudOptions<Row>,
): UseCrudReturn<Row> {
  // 实现细节留在代码中，此处仅描述接口
  throw new Error('implement in library')
}
```

### 1.2 基本用法示例

```ts
const adapter: CrudAdapter<ModelPolicy> = {
  async list(params) {
    const res = await policyApi.list(params)
    return { items: res.items, total: res.total }
  },
}

const crud = useCrud<ModelPolicy>({
  adapter,
  initialQuery: { archived: 1 },
})

// 在模板中与 CrudPage / CrudTable 搭配使用
```

---

## 2. useCrudActions：统一动作注册与分发

`useCrudActions` 提供一个简单的动作注册中心，用于在不同区域（toolbar、row-actions 等）统一管理按钮行为。

### 2.1 类型定义

```ts
export interface UseCrudActionsReturn<Row = any> {
  actions: Ref<CrudAction<Row>[]>
  register: (action: CrudAction<Row>) => void
  list: (area?: CrudActionArea) => CrudAction<Row>[]
}

export function useCrudActions<Row = any>(): UseCrudActionsReturn<Row> {
  const actions = ref<CrudAction<Row>[]>([])

  function register(action: CrudAction<Row>) {
    actions.value = actions.value.concat(action)
  }

  function list(area?: CrudActionArea) {
    if (!area) return actions.value
    return actions.value.filter(item => item.area === area)
  }

  return { actions, register, list }
}
```

### 2.2 注册与使用示例

```ts
const { register, list } = useCrudActions<ModelPolicy>()

// 注册一个工具栏导出按钮
register({
  id: 'toolbar.export',
  area: 'toolbar',
  label: $gettext('导出'),
  type: 'default',
  onClick: async ({ query }) => {
    await policyApi.export(query)
  },
})

// 在 CrudActions / CrudTable 内部根据 area 使用 list('toolbar') 获取动作列表
```

---

## 3. 领域 Hook 模式：以表单联动为例

除了通用 Hook 以外，业务领域往往需要大量联动逻辑（如身份证号自动填充生日/性别）。建议用**领域 Hook**承载这些逻辑，而不是塞进字段配置。

### 3.1 示例：身份证联动填充客户信息

```ts
// useClientFormEffects.ts
import type { Ref } from 'vue'
import idCard from 'idcard'
import { set } from 'lodash-es'
import type { ModelClient } from '@/schemas/client/client.fields'

export function useClientFormEffects(formModel: Ref<ModelClient>) {
  watch(
    () => formModel.value.id_number,
    (value) => {
      if (!value) return
      const info = idCard.info(value)
      if (!info.valid || info.cardType !== 1) return

      if (!formModel.value.birthdate && info.birthday) {
        const s = String(info.birthday)
        const birthdate = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
        set(formModel.value, 'birthdate', birthdate)
      }

      if (!formModel.value.gender && info.gender) {
        set(formModel.value, 'gender', info.gender === 'M' ? 1 : 2)
      }

      if (!formModel.value.residential_address) {
        const address =
          info.province.text + info.city.text + info.area.text
        set(formModel.value, 'residential_address', address)
      }

      if (!formModel.value.country) {
        set(formModel.value, 'country', 'CN')
      }
    },
  )
}
```

页面中使用：

```ts
const formModelRef = ref<ModelClient | null>(null)

function handleFormModelReady(model: ModelClient) {
  formModelRef.value = model
  const modelRef = ref(model)
  useClientFormEffects(modelRef)
}
```

### 3.2 设计原则

- 领域 Hook **不依赖具体 UI 组件**，只操作 `formModel` 等数据；
- Hook 名字以 `useXxxEffects` / `useXxxLogic` 命名，按业务模块归档（如 client / policy）；
- 复杂业务页可以组合多个领域 Hook：`usePolicyFormEffects` + `usePolicyPermissionEffects` 等。

---

## 4. 小结

- `useCrud` 负责数据流、状态与与适配器交互，是所有 CRUD 页的基础；
- `useCrudActions` 把零散按钮行为统一到 Action 系统中，为 `CrudActions` 等组件提供数据；
- 领域 Hook 则承载具体业务逻辑，保持 schema 与视图配置的简洁与可复用性。 


