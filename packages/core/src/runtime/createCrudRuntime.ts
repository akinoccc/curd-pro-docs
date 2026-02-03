import { ref } from 'vue'
import type { CrudConfig } from '../config/symbols'
import type { CrudAdapter, CrudField, CrudTableColumn } from '../crud/models'
import { useCrud } from '../crud/useCrud'
import type { CrudControlMap } from '../context/symbols'
import type { CrudUiDriver } from '../ui/ui-driver'
import type { CrudRuntime } from './types'

export interface CreateCrudRuntimeOptions<
  Row = any,
  RowId extends string | number = string | number,
  Query extends Record<string, any> = Record<string, any>,
  CreateInput = Partial<Row>,
  UpdateInput = Partial<Row>,
  SortField extends string = string,
> {
  adapter: CrudAdapter<Row, RowId, Query, CreateInput, UpdateInput, SortField>
  fields: readonly CrudField<Row, any>[]
  columns?: readonly CrudTableColumn<Row>[]

  // Pass-through for useCrud
  initialQuery?: Query
  autoFetch?: boolean
  debounceMs?: number
  dedupe?: boolean
  onError?: (error: unknown) => void

  // Optional runtime contexts
  config?: CrudConfig
  user?: { roles: string[] }
  extra?: Record<string, any>

  // Optional UI attachments (usually set by UI packages)
  ui?: {
    controlMap?: CrudControlMap
    uiDriver?: CrudUiDriver
  }
}

export function createCrudRuntime<
  Row = any,
  RowId extends string | number = string | number,
  Query extends Record<string, any> = Record<string, any>,
  CreateInput = Partial<Row>,
  UpdateInput = Partial<Row>,
  SortField extends string = string,
>(
  options: CreateCrudRuntimeOptions<Row, RowId, Query, CreateInput, UpdateInput, SortField>,
): CrudRuntime<Row, RowId, Query, CreateInput, UpdateInput, SortField> {
  const crud = useCrud<Row, Query, RowId, CreateInput, UpdateInput, SortField>({
    adapter: options.adapter,
    initialQuery: options.initialQuery,
    autoFetch: options.autoFetch,
    debounceMs: options.debounceMs,
    dedupe: options.dedupe,
    onError: options.onError,
  })

  const getId = (options.adapter.getId ?? ((row: any) => row?.id as RowId)) as (row: Row) => RowId

  const runtime: CrudRuntime<Row, RowId, Query, CreateInput, UpdateInput, SortField> = {
    adapter: options.adapter,
    crud,
    fields: options.fields,
    columns: ref((options.columns ?? []) as readonly CrudTableColumn<Row>[]),
    getId,
    config: options.config,
    user: options.user,
    extra: options.extra,
    ui: options.ui,
    use(plugin) {
      plugin(runtime)
      return runtime
    },
  }

  return runtime
}


