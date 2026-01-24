import type { Ref, ShallowRef } from 'vue'

// CRUD adapter and list types

export interface CrudSort<Field extends string = string> {
  field: Field
  order: 'ascend' | 'descend'
}

export interface CrudListParams {
  page: number
  pageSize: number
  query: Record<string, any>
  sort?: CrudSort | null
  /**
   * 可选：用于取消请求（最后一次请求胜出）。
   * adapter 可选择性支持；不支持也不会影响功能。
   */
  signal?: AbortSignal
}

export interface CrudListResult<Row = any> {
  items: Row[]
  total: number
}

export interface CrudAdapter<
  Row = any,
  RowId extends string | number = string | number,
  Query extends Record<string, any> = Record<string, any>,
  CreateInput = Partial<Row>,
  UpdateInput = Partial<Row>,
  SortField extends string = string,
> {
  list: (params: CrudListParams & { query: Query, sort?: CrudSort<SortField> | null }) => Promise<CrudListResult<Row>>
  create?: (data: CreateInput) => Promise<Row>
  update?: (id: RowId, data: UpdateInput) => Promise<Row>
  remove?: (id: RowId) => Promise<void>
  /**
   * 从 row 中提取 id（用于 update/remove 等操作）。
   * 如果未提供，默认使用 `row.id`。
   */
  getId?: (row: Row) => RowId
}

// Field model

export type CrudSurface = 'search' | 'table' | 'form' | 'detail'

export interface CrudFieldContext<Row = any, FormModel = any> {
  surface: CrudSurface
  row?: Row
  formModel?: FormModel
  query: Record<string, any>
  user?: { roles: string[] }
  extra?: Record<string, any>
}

export interface CrudNaiveUi {
  /**
   * 控件层 props（会透传给 Naive 的控件组件，例如 NInput/NSelect 等）
   */
  controlProps?: Record<string, any>
  /**
   * 表格列 props（会透传给 Naive 的 NDataTable column）
   */
  columnProps?: Record<string, any>
  /**
   * 表单项容器 props（透传给 NFormItem）
   */
  formItemProps?: Record<string, any>
  /**
   * 搜索项容器 props（透传给 NFormItem）
   */
  searchItemProps?: Record<string, any>
  /**
   * 自定义渲染组件（覆盖 type）
   */
  component?: any
}

export interface CrudFieldUi {
  naive?: CrudNaiveUi
  extra?: Record<string, any>
}

export interface CrudColumnUi {
  naive?: Pick<CrudNaiveUi, 'columnProps'>
  extra?: Record<string, any>
}

export type CrudRuleTrigger = 'change' | 'blur' | 'input' | 'submit'

export interface CrudRuleContext<Row = any, FormModel = any> {
  value: any
  field: CrudField<Row, FormModel>
  model: Record<string, any>
  mode: 'create' | 'edit'
}

export type CrudRuleValidator<Row = any, FormModel = any> = (
  context: CrudRuleContext<Row, FormModel>,
) => boolean | string | Promise<boolean | string>

export interface CrudFieldRule<Row = any, FormModel = any> {
  trigger?: CrudRuleTrigger | CrudRuleTrigger[]
  required?: boolean
  message?: string
  validator?: CrudRuleValidator<Row, FormModel>
}

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
  rules?: CrudFieldRule<Row, FormModel>[]
  dictKey?: string
  ui?: CrudFieldUi
  visibleIn?: Partial<
    Record<CrudSurface, boolean | ((ctx: CrudFieldContext<Row, FormModel>) => boolean)>
  >
}

// Field registry

export interface FieldRegistry<Row = any, FormModel = any> {
  list: CrudField<Row, FormModel>[]
  byKey: Record<string, CrudField<Row, FormModel>>
}

export function createFieldRegistry<Row, FormModel>(
  fields: CrudField<Row, FormModel>[],
): FieldRegistry<Row, FormModel> {
  const byKey: Record<string, CrudField<Row, FormModel>> = {}
  for (const field of fields) {
    byKey[field.key] = field
  }
  return { list: fields, byKey }
}

// Table column model

export interface CrudTableColumn<Row = any> {
  field: CrudField<Row, any>
  width?: number
  minWidth?: number
  fixed?: 'left' | 'right'
  sortable?: boolean
  searchable?: 'input' | 'select' | 'dateRange' | false
  /**
   * 表格单元格自定义渲染（UI 无关）。
   *
   * - 优先级建议（由 UI 适配层实现）：slot > cellRender > cellComponent > 默认值
   */
  cellRender?: (ctx: CrudTableCellContext<Row>) => any
  /**
   * 表格单元格自定义组件（UI 无关）。
   * 具体 props 由 UI 适配层约定；默认会提供 ctx 中的字段。
   */
  cellProps?:
    | Record<string, any>
    | ((ctx: CrudTableCellContext<Row>) => Record<string, any>)
  /**
   * UI 透传配置（由具体 UI 适配层消费，例如 Naive 的 columnProps）
   */
  ui?: CrudColumnUi
}

export interface CrudTableCellContext<Row = any> {
  row: Row
  rowIndex: number
  field: CrudField<Row, any>
  value: any
}

// Action system

export type CrudActionArea
  = | 'search'
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

export interface CrudAction<Row = any> {
  id: string
  area: CrudActionArea
  label?: string
  icon?: any
  order?: number
  type?: 'primary' | 'default' | 'success' | 'warning' | 'error' | 'tertiary'
  visible?: (ctx: CrudActionContext<Row>) => boolean
  disabled?: (ctx: CrudActionContext<Row>) => boolean
  onClick: (ctx: CrudActionContext<Row>) => Promise<void> | void
}

// Control interfaces (standard props for adapters)

export interface BaseControlProps<Value = any> {
  'modelValue': Value
  'onUpdate:modelValue': (value: Value) => void
  'disabled'?: boolean
  'readonly'?: boolean
  'placeholder'?: string
  'field': CrudField<any, any>
}

export interface SelectControlProps<Value = string | number>
  extends BaseControlProps<Value | Value[]> {
  options: { label: string, value: Value }[]
  multiple?: boolean
  clearable?: boolean
}

// Dict center types

export interface DictItem {
  label: string
  value: string | number
}

export interface DictApi {
  getOptions: (key: string) => Promise<DictItem[]>
}

export interface DictCenter {
  load: (key: string) => Promise<{
    options: Ref<DictItem[]>
    loading: Ref<boolean>
    error: Ref<unknown | null>
  }>
  /**
   * 使缓存失效：传 key 只清某个，不传则清空全部
   */
  invalidate: (key?: string) => void
}

// Basic hooks types re-exported from here for convenience

export interface UseCrudOptions<
  Row = any,
  Query extends Record<string, any> = Record<string, any>,
  RowId extends string | number = string | number,
  CreateInput = Partial<Row>,
  UpdateInput = Partial<Row>,
  SortField extends string = string,
> {
  adapter: CrudAdapter<Row, RowId, Query, CreateInput, UpdateInput, SortField>
  initialQuery?: Query
  /**
   * 当 query/sort/page/pageSize 变化时是否自动刷新列表
   * - true：内部 watch 并触发 refresh（默认）
   * - false：仅手动调用 refresh
   */
  autoFetch?: boolean
  /**
   * 自动刷新防抖（毫秒）。仅对 autoFetch 生效。
   */
  debounceMs?: number
  /**
   * 自动刷新去重：当参数 key 未变化时，不重复请求。
   * refresh() 仍会强制请求。
   */
  dedupe?: boolean
  /**
   * 错误处理回调（可选）。
   * 如果提供，错误会被传递给此回调而不是仅记录到 error ref。
   */
  onError?: (error: unknown) => void
}

export interface UseCrudReturn<
  Row = any,
  Query extends Record<string, any> = Record<string, any>,
  SortField extends string = string,
> {
  rows: Ref<Row[]>
  total: Ref<number>
  loading: Ref<boolean>
  error: Ref<unknown>
  query: ShallowRef<Query>
  sort: ShallowRef<CrudSort<SortField> | null>
  page: Ref<number>
  pageSize: Ref<number>
  refresh: () => Promise<void>
  setQuery: (partial: Partial<Query>) => void
  setSort: (sort: CrudSort<SortField> | null) => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
}

export interface UseCrudActionsReturn<Row = any> {
  actions: Ref<CrudAction<Row>[]>
  register: (action: CrudAction<Row>) => void
  list: (area?: CrudActionArea) => CrudAction<Row>[]
}
