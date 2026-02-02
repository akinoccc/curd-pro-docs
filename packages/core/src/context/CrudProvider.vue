<script setup
  lang="ts"
  generic="Row, Query extends Record<string, any> = Record<string, any>, SortField extends string = string"
>
import type {
  CrudAction,
  CrudField,
  CrudTableColumn,
  UseCrudActionsReturn,
  UseCrudReturn,
} from '../crud/models'
import type { CrudUiDriver } from '../ui/ui-driver'
import type { CrudController } from '../controller/useCrudController'
import type { CrudControlMap } from './symbols'
import { provide } from 'vue'
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
import { useCrudSelection } from '../selection/useCrudSelection'

interface CrudProviderProps<
  Row = any,
  Query extends Record<string, any> = Record<string, any>,
  SortField extends string = string,
> {
  /**
   * Preferred: provide a controller (new API).
   */
  controller?: CrudController<Row, Query, SortField>
  /**
   * Legacy props (kept for migration).
   */
  crud?: UseCrudReturn<Row, Query, SortField>
  fields?: readonly CrudField<Row, any>[]
  columns?: readonly CrudTableColumn<Row>[]
  actions?: CrudAction<Row>[] | UseCrudActionsReturn<Row>
  user?: { roles: string[] }
  extra?: Record<string, any>
  controlMap: CrudControlMap
  uiDriver?: CrudUiDriver
  getId?: (row: Row) => string | number
}

const props = defineProps<CrudProviderProps<Row, Query, SortField>>()

const crud = props.controller?.crud ?? props.crud
if (!crud) {
  throw new Error('[fcurd] CrudProvider requires either `controller` or `crud`.')
}

const getId = props.getId ?? props.controller?.getId ?? ((row: any) => row?.id as string | number)
const selectionApi = props.controller
  ? {
      selection: props.controller.selection,
      selectedIds: props.controller.selectedIds,
      selectedRows: props.controller.selectedRows,
      clearSelection: props.controller.clearSelection,
    }
  : useCrudSelection<Row>({
      rows: crud.rows as any,
      getId,
    })

provide(CrudControllerSymbol, props.controller as any)
provide(CrudInstanceSymbol, crud as any)
if (props.fields)
  provide(CrudFieldsSymbol, props.fields as CrudField<any, any>[])
if (props.columns)
  provide(CrudColumnsSymbol, props.columns as CrudTableColumn<any>[])
if (props.user)
  provide(CrudUserSymbol, props.user)
provide(CrudExtraSymbol, {
  ...(props.extra ?? {}),
  selection: selectionApi.selection,
  selectedIds: selectionApi.selectedIds,
  selectedRows: selectionApi.selectedRows,
  clearSelection: selectionApi.clearSelection,
})

provide(CrudControlMapSymbol, props.controlMap)
provide(CrudGetIdSymbol, getId)

if (props.uiDriver)
  provide(CrudUiDriverSymbol, props.uiDriver)

if (props.actions) {
  provide(CrudActionsSymbol, props.actions as any)
}

provide(CrudSelectionSymbol, selectionApi.selection)
provide(CrudSelectedIdsSymbol, selectionApi.selectedIds)
provide(CrudSelectedRowsSymbol, selectionApi.selectedRows)
</script>

<template>
  <slot />
</template>
