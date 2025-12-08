import type { Ref } from 'vue'

// CRUD adapter and list types

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
  // cellComponent 在核心层保持 any，具体由 UI 适配层约束
  cellComponent?: any
}

// Action system

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
  modelValue: Value
  'onUpdate:modelValue': (value: Value) => void
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  field: CrudField<any, any>
}

export interface SelectControlProps<Value = string | number>
  extends BaseControlProps<Value | Value[]> {
  options: { label: string; value: Value }[]
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

// Basic hooks types re-exported from here for convenience

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

export interface UseCrudActionsReturn<Row = any> {
  actions: Ref<CrudAction<Row>[]>
  register: (action: CrudAction<Row>) => void
  list: (area?: CrudActionArea) => CrudAction<Row>[]
}
