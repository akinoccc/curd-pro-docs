import type { ComputedRef, Ref } from 'vue'
import type { CrudAction, CrudField, CrudTableColumn, UseCrudActionsReturn, UseCrudReturn } from '../crud/models'
import type { CrudUiDriver } from '../ui/ui-driver'
import type { CrudController } from '../controller/useCrudController'
import type { CrudControlMap } from './symbols'
import { computed, inject, ref } from 'vue'
import {
  CrudActionsSymbol,
  CrudColumnsSymbol,
  CrudControlMapSymbol,
  CrudControllerSymbol,
  CrudExtraSymbol,
  CrudFieldsSymbol,
  CrudGetIdSymbol,
  CrudInstanceSymbol,
  CrudSelectedIdsSymbol,
  CrudSelectedRowsSymbol,
  CrudSelectionSymbol,
  CrudUiDriverSymbol,
  CrudUserSymbol,
} from './symbols'

export interface UseCrudContextReturn<Row = any> {
  controller?: CrudController<Row, any, any>
  crud?: UseCrudReturn<Row, any, any>
  fields?: readonly CrudField<Row, any>[]
  columns?: readonly CrudTableColumn<Row>[]
  actions?: UseCrudActionsReturn<Row> | CrudAction<Row>[]
  user?: { roles: string[] }
  extra?: Record<string, any>
  controlMap?: CrudControlMap
  getId: (row: Row) => string | number
  selection: Ref<Set<string | number>>
  selectedIds: ComputedRef<(string | number)[]>
  selectedRows: ComputedRef<Row[]>
  uiDriver?: CrudUiDriver
}

export function useCrudContext<Row = any>(options: { controller?: CrudController<Row, any, any> } = {}): UseCrudContextReturn<Row> {
  const injectedController = inject(CrudControllerSymbol, undefined) as CrudController<Row, any, any> | undefined
  const controller = options.controller ?? injectedController

  const crud = controller?.crud ?? (inject(CrudInstanceSymbol, undefined) as UseCrudReturn<Row, any, any> | undefined)
  const fields = controller?.fields ?? (inject(CrudFieldsSymbol, undefined) as readonly CrudField<Row, any>[] | undefined)
  const columns = controller?.columns?.value ?? (inject(CrudColumnsSymbol, undefined) as readonly CrudTableColumn<Row>[] | undefined)
  const actions = (controller?.actions?.value as any) ?? (inject(CrudActionsSymbol, undefined) as UseCrudActionsReturn<Row> | CrudAction<Row>[] | undefined)
  const user = inject(CrudUserSymbol, undefined)
  const extra = inject(CrudExtraSymbol, undefined)
  const controlMap = inject(CrudControlMapSymbol, undefined)
  const uiDriver = inject(CrudUiDriverSymbol, undefined)

  const getId = (controller?.getId as any) ?? (inject(CrudGetIdSymbol, (row: any) => row?.id as string | number) as (row: Row) => string | number)

  const selection = (controller?.selection as any) ?? inject(CrudSelectionSymbol, ref<Set<string | number>>(new Set()))
  const selectedIdsInjected = inject(CrudSelectedIdsSymbol, undefined) as ComputedRef<(string | number)[]> | undefined
  const selectedIds = (controller?.selectedIds as any) ?? (selectedIdsInjected ?? computed<(string | number)[]>(() => Array.from(selection.value)))
  const selectedRowsInjected = inject(CrudSelectedRowsSymbol, undefined) as ComputedRef<Row[]> | undefined
  const selectedRows = (controller?.selectedRows as any) ?? (selectedRowsInjected ?? computed<Row[]>(() => {
    if (!crud)
      return []
    const list = crud.rows?.value ?? []
    const ids = selection.value
    return (list as any[]).filter(row => ids.has(getId(row))) as Row[]
  }))

  return {
    controller,
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
    uiDriver,
  }
}
