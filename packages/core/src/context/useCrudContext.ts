import type { ComputedRef, Ref } from 'vue'
import type { CrudAction, CrudField, CrudTableColumn, UseCrudReturn } from '../crud/models'
import type { CrudRuntime } from '../runtime/types'
import type { CrudUiDriver } from '../ui/ui-driver'
import type { CrudControlMap } from './symbols'
import { computed, inject, ref } from 'vue'
import { CrudRuntimeSymbol } from './symbols'

export interface UseCrudContextReturn<Row = any> {
  runtime: CrudRuntime<Row, any, any, any, any, any>
  crud: UseCrudReturn<Row, any, any>
  fields: CrudField<Row, any>[]
  columns: CrudTableColumn<Row>[]
  actions: CrudAction<Row>[]

  user?: { roles: string[] }
  extra?: Record<string, any>

  // UI attachments (optional)
  controlMap?: CrudControlMap
  uiDriver?: CrudUiDriver

  getId: (row: Row) => string | number
  selection: Ref<Set<string | number>>
  selectedIds: ComputedRef<(string | number)[]>
  selectedRows: ComputedRef<Row[]>
  clearSelection: () => void
}

export function useCrudContext<Row = any>(
  options: { runtime?: CrudRuntime<Row, any, any, any, any, any> } = {},
): UseCrudContextReturn<Row> {
  const injectedRuntime = inject(CrudRuntimeSymbol, undefined) as CrudRuntime<Row, any, any, any, any, any> | undefined
  const runtime = (options.runtime ?? injectedRuntime) as CrudRuntime<Row, any, any, any, any, any> | undefined
  if (!runtime)
    throw new Error('[fcurd] Missing CrudRuntime. Did you forget to wrap with <CrudProvider :runtime="..."> ?')

  const crud = runtime.crud as UseCrudReturn<Row, any, any>
  const fields = runtime.fields ?? ([] as CrudField<Row, any>[])
  const columns = (runtime.columns?.value ?? []) as CrudTableColumn<Row>[]
  const actions = (runtime.actions?.value ?? []) as CrudAction<Row>[]

  const user = runtime.user
  const extra = runtime.extra
  const controlMap = runtime.ui?.controlMap
  const uiDriver = runtime.ui?.uiDriver

  const getId = (runtime.getId as any) ?? ((row: any) => row?.id as string | number)

  const selection = (runtime.selection as any) ?? ref<Set<string | number>>(new Set())
  const selectedIds = (runtime.selectedIds as any) ?? computed<(string | number)[]>(() => Array.from(selection.value))
  const selectedRows = (runtime.selectedRows as any) ?? computed<Row[]>(() => [])
  const clearSelection = (runtime.clearSelection as any) ?? (() => {})

  return {
    runtime,
    crud,
    fields,
    columns,
    actions,
    user,
    extra,
    controlMap,
    getId,
    selection,
    selectedIds,
    selectedRows,
    clearSelection,
    uiDriver,
  }
}
