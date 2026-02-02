import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import type {
  CrudAction,
  CrudAdapter,
  CrudField,
  CrudTableColumn,
  UseCrudActionsReturn,
  UseCrudReturn,
} from '../crud/models'
import { useCrud } from '../crud/useCrud'
import type { CrudUiDriver } from '../ui/ui-driver'
import { createCrudPresetActions } from '../actions/presets'
import { useCrudSelection } from '../selection/useCrudSelection'
import type { CrudConfig } from '../config/symbols'

export interface CrudController<Row = any, Query extends Record<string, any> = Record<string, any>, SortField extends string = string> {
  crud: UseCrudReturn<Row, Query, SortField>
  fields: readonly CrudField<Row, any>[]
  columns: ComputedRef<readonly CrudTableColumn<Row>[]>
  actions: ComputedRef<CrudAction<Row>[]>

  getId: (row: Row) => string | number
  selection: ReturnType<typeof useCrudSelection<Row>>['selection']
  selectedIds: ReturnType<typeof useCrudSelection<Row>>['selectedIds']
  selectedRows: ReturnType<typeof useCrudSelection<Row>>['selectedRows']
  clearSelection: ReturnType<typeof useCrudSelection<Row>>['clearSelection']
}

export interface UseCrudControllerOptions<
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
  actions?: CrudAction<Row>[] | UseCrudActionsReturn<Row>
  uiDriver?: CrudUiDriver
  config?: CrudConfig

  openCreate: () => void
  openEdit: (row: Row) => void

  disableAdd?: boolean
  disableEdit?: boolean
  disableDelete?: boolean
  disableExport?: boolean
}

export function useCrudController<
  Row = any,
  RowId extends string | number = string | number,
  Query extends Record<string, any> = Record<string, any>,
  CreateInput = Partial<Row>,
  UpdateInput = Partial<Row>,
  SortField extends string = string,
>(
  options: UseCrudControllerOptions<Row, RowId, Query, CreateInput, UpdateInput, SortField>,
): CrudController<Row, Query, SortField> {
  const crud: UseCrudReturn<Row, Query, SortField> = useCrud<Row, Query, RowId, CreateInput, UpdateInput, SortField>({
    adapter: options.adapter,
  })

  const getId = options.adapter.getId ?? ((row: any) => row?.id as string | number)

  const selectionApi = useCrudSelection<Row>({
    rows: crud.rows as any,
    getId,
  })

  const columns = computed(() => (options.columns ?? []) as readonly CrudTableColumn<Row>[])

  const actions = computed<CrudAction<Row>[]>(() => {
    // NOTE: Presets still generate executable actions for now; action runner refactor happens later.
    return createCrudPresetActions<Row, RowId, Query, CreateInput, UpdateInput, SortField>({
      adapter: options.adapter,
      crud,
      openCreate: options.openCreate,
      openEdit: options.openEdit,
      disableAdd: options.disableAdd,
      disableEdit: options.disableEdit,
      disableDelete: options.disableDelete,
      disableExport: options.disableExport,
      config: options.config,
      actions: options.actions as any,
    })
  })

  return {
    crud,
    fields: options.fields,
    columns,
    actions,
    getId,
    selection: selectionApi.selection,
    selectedIds: selectionApi.selectedIds,
    selectedRows: selectionApi.selectedRows,
    clearSelection: selectionApi.clearSelection,
  }
}


