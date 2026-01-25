import type { CrudAction, CrudField, CrudTableColumn, UseCrudActionsReturn, UseCrudReturn } from '@fcurd/core'
import type { ComputedRef, Ref } from 'vue'
import type { CrudControlMap } from './symbols'
import type { CrudUiDriver } from '../ui/ui-driver'
import { computed, inject, ref } from 'vue'
import {
  CrudActionsSymbol,
  CrudColumnsSymbol,
  CrudControlMapSymbol,
  CrudExtraSymbol,
  CrudFieldsSymbol,
  CrudGetIdSymbol,
  CrudInstanceSymbol,
  CrudSelectedRowsSymbol,
  CrudSelectionSymbol,
  CrudUiDriverSymbol,
  CrudUserSymbol,
} from './symbols'

export interface UseCrudContextReturn<Row = any> {
  crud?: UseCrudReturn<Row, any, any>
  fields?: readonly CrudField<Row, any>[]
  columns?: readonly CrudTableColumn<Row>[]
  actions?: UseCrudActionsReturn<Row> | CrudAction<Row>[]
  user?: { roles: string[] }
  extra?: Record<string, any>
  controlMap?: CrudControlMap
  getId: (row: Row) => string | number
  selection: Ref<Set<string | number>>
  selectedRows?: ComputedRef<Row[]>
  uiDriver?: CrudUiDriver
}

export function useCrudContext<Row = any>(): UseCrudContextReturn<Row> {
  const crud = inject(CrudInstanceSymbol, undefined) as UseCrudReturn<Row, any, any> | undefined
  const fields = inject(CrudFieldsSymbol, undefined) as readonly CrudField<Row, any>[] | undefined
  const columns = inject(CrudColumnsSymbol, undefined) as readonly CrudTableColumn<Row>[] | undefined
  const actions = inject(CrudActionsSymbol, undefined) as UseCrudActionsReturn<Row> | CrudAction<Row>[] | undefined
  const user = inject(CrudUserSymbol, undefined)
  const extra = inject(CrudExtraSymbol, undefined)
  const controlMap = inject(CrudControlMapSymbol, undefined)
  const uiDriver = inject(CrudUiDriverSymbol, undefined)

  const getId = inject(CrudGetIdSymbol, (row: any) => row?.id as string | number) as (row: Row) => string | number

  const selection = inject(CrudSelectionSymbol, ref<Set<string | number>>(new Set()))
  const selectedRowsInjected = inject(CrudSelectedRowsSymbol, undefined) as ComputedRef<Row[]> | undefined
  const selectedRows = selectedRowsInjected ?? computed<Row[]>(() => {
    if (!crud)
      return []
    const list = crud.rows?.value ?? []
    const ids = selection.value
    return (list as any[]).filter(row => ids.has(getId(row))) as Row[]
  })

  return {
    crud,
    fields,
    columns,
    actions,
    user,
    extra,
    controlMap,
    getId,
    selection,
    selectedRows,
    uiDriver,
  }
}


