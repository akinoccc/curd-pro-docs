import type { ComputedRef, Ref } from 'vue'
import type { CrudConfig } from '../config/symbols'
import type { CrudControlMap } from '../context/symbols'
import type {
  CrudAction,
  CrudAdapter,
  CrudField,
  CrudTableColumn,
  UseCrudReturn,
} from '../crud/models'
import type { CrudUiDriver } from '../ui/ui-driver'

export interface CrudRuntime<
  Row = any,
  RowId extends string | number = string | number,
  Query extends Record<string, any> = Record<string, any>,
  CreateInput = Partial<Row>,
  UpdateInput = Partial<Row>,
  SortField extends string = string,
> {
  adapter: CrudAdapter<Row, RowId, Query, CreateInput, UpdateInput, SortField>
  crud: UseCrudReturn<Row, Query, SortField>

  fields: readonly CrudField<Row, any>[]
  columns: Ref<readonly CrudTableColumn<Row>[]>
  getId: (row: Row) => RowId

  // Optional global configuration (from CrudConfigProvider)
  config?: CrudConfig

  // Optional runtime contexts
  user?: { roles: string[] }
  extra?: Record<string, any>

  // Optional UI attachments (typically provided by UI packages)
  ui?: {
    controlMap?: CrudControlMap
    uiDriver?: CrudUiDriver
  }

  // Optional capabilities added by plugins
  selection?: Ref<Set<RowId>>
  selectedIds?: ComputedRef<RowId[]>
  selectedRows?: ComputedRef<Row[]>
  clearSelection?: () => void

  actions?: ComputedRef<CrudAction<Row>[]>

  // Plugin system
  use: (plugin: CrudPlugin<Row, RowId, Query, CreateInput, UpdateInput, SortField>) => CrudRuntime<Row, RowId, Query, CreateInput, UpdateInput, SortField>
}

export type CrudPlugin<
  Row = any,
  RowId extends string | number = string | number,
  Query extends Record<string, any> = Record<string, any>,
  CreateInput = Partial<Row>,
  UpdateInput = Partial<Row>,
  SortField extends string = string,
> = (runtime: CrudRuntime<Row, RowId, Query, CreateInput, UpdateInput, SortField>) => void
