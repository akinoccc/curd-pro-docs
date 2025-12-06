## 核心数据模型与类型设计（Core Models）

本文件系统性地描述 Naive CRUD 库的核心数据模型与类型约定，作为所有其他模块（组件、hooks、示例）的基础。

---

## 1. CRUD 适配器接口 `CrudAdapter`

适配器负责将前端 CRUD 逻辑与后端接口解耦，所有列表/增删改操作都经由适配器完成。

```ts
export interface CrudListParams {
  page: number
  pageSize: number
  query: Record<string, any>
  sort?: { field: string; order: 'ascend' | 'descend' } | null
}

export interface CrudListResult<Row = any> {
  items: Row[]
  total: number
}

export interface CrudAdapter<Row = any> {
  list(params: CrudListParams): Promise<CrudListResult<Row>>
  create?(data: Partial<Row>): Promise<Row>
  update?(id: string | number, data: Partial<Row>): Promise<Row>
  remove?(id: string | number): Promise<void>
}
```

设计要点：

- 页面侧只依赖 `CrudAdapter`，不依赖具体接口路径/参数格式；
- 后端变更时，仅需更新适配器实现。

---

## 2. 字段模型 `CrudField` 与上下文 `CrudFieldContext`

### 2.1 字段上下文

```ts
export type CrudSurface = 'search' | 'table' | 'form' | 'detail'

export interface CrudFieldContext<Row = any, FormModel = any> {
  surface: CrudSurface
  row?: Row
  formModel?: FormModel
  query: Record<string, any>
  user?: { roles: string[] }
  extra?: Record<string, any>
}
```

`CrudFieldContext` 表示“当前字段被渲染时所处的上下文”，主要用于控制显示隐藏、联动等逻辑。

### 2.2 字段模型

```ts
export interface CrudField<Row = any, FormModel = any> {
  key: string
  label: () => string
  type:
    | 'text'
    | 'textarea'
    | 'select'
    | 'date'
    | 'datetime'
    | 'switch'
    | 'number'
    | 'money'
    | 'custom'
  required?: boolean
  rules?: any[]
  dictKey?: string

  visibleIn?: Partial<
    Record<
      CrudSurface,
      boolean | ((ctx: CrudFieldContext<Row, FormModel>) => boolean)
    >
  >
}
```

设计要点：

- `CrudField` 只负责描述“字段是什么”，不直接写 UI 细节；
- `visibleIn` + `CrudFieldContext` 用于在不同 surface 下决定显示隐藏；
- `dictKey` 与字典中心（Dict Center）配合，用来获取 select 的 options。

---

## 3. 字段注册表 `FieldRegistry`

为避免在使用处频繁 `fields.find(...)`，统一用注册表进行 O(1) 访问。

```ts
export interface FieldRegistry<Row = any, FormModel = any> {
  list: CrudField<Row, FormModel>[]
  byKey: Record<string, CrudField<Row, FormModel>>
}

export function createFieldRegistry<Row, FormModel>(
  fields: CrudField<Row, FormModel>[],
): FieldRegistry<Row, FormModel> {
  const byKey: Record<string, CrudField<Row, FormModel>> = {}
  for (const field of fields)
    byKey[field.key] = field

  return { list: fields, byKey }
}
```

使用示例：

```ts
// client.fields.ts
export interface ModelClient { /* ... */ }

const fields: CrudField<ModelClient, ModelClient>[] = [
  { key: 'name', label: () => $gettext('姓名'), type: 'text', required: true },
  { key: 'english_name', label: () => $gettext('英文姓名'), type: 'text' },
]

export const clientFieldRegistry = createFieldRegistry<ModelClient, ModelClient>(fields)
export const clientFields = clientFieldRegistry.list
export const clientFieldByKey = clientFieldRegistry.byKey
```

视图配置中使用：

```ts
const clientTableColumns = [
  { field: clientFieldByKey.name, width: 150, sortable: true, searchable: 'input' },
  { field: clientFieldByKey.english_name, width: 150, searchable: 'input' },
]
```

---

## 4. 表格列模型 `CrudTableColumn`

```ts
export interface CrudTableColumn<Row = any> {
  field: CrudField<Row, any>
  width?: number
  minWidth?: number
  fixed?: 'left' | 'right'
  sortable?: boolean
  searchable?: 'input' | 'select' | 'dateRange' | false
  cellComponent?: any
}
```

设计要点：

- 列配置引用字段对象并附加表格视图信息；
- 复杂渲染交给 `cellComponent` 组件承载，避免列配置中出现大段 render 逻辑。

---

## 5. Action 系统模型 `CrudAction`

### 5.1 Action 区域与上下文

```ts
export type CrudActionArea =
  | 'search'
  | 'toolbar'
  | 'row:before'
  | 'row:after'
  | 'batch'
  | 'table:extra'

export interface CrudActionContext<Row = any> {
  row?: Row
  selectedRows: Row[]
  query: Record<string, any>
  extra?: Record<string, any>
}
```

### 5.2 Action 定义

```ts
export interface CrudAction<Row = any> {
  id: string
  area: CrudActionArea
  label?: string
  icon?: any
  order?: number
  type?:
    | 'primary'
    | 'default'
    | 'success'
    | 'warning'
    | 'error'
    | 'tertiary'

  visible?: (ctx: CrudActionContext<Row>) => boolean
  disabled?: (ctx: CrudActionContext<Row>) => boolean

  onClick: (ctx: CrudActionContext<Row>) => Promise<void> | void
}
```

说明：

- 所有按钮行为（新增、删除、导入、行内编辑、续保记录等）统一抽象为 `CrudAction`；
- 通过 `area` 将其分配到不同区域（搜索区按钮、工具栏按钮、行内按钮等）。

---

## 6. 小结

- `CrudAdapter` 抽象后端接口；
- `CrudField` + `FieldRegistry` 抽象领域字段与字段访问；
- `CrudTableColumn` 抽象表格视图；
- `CrudAction` 抽象所有按钮行为；
- 这些模型构成 Naive CRUD 的“领域语言”，其余 hooks、组件和示例均在此基础上构建。 


