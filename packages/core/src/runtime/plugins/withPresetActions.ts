import type { CrudConfig } from '../../config/symbols'
import type { CrudAction, CrudAdapter } from '../../crud/models'
import type { CrudPlugin, CrudRuntime } from '../types'
import { computed } from 'vue'
import { createCrudPresetActions } from '../../actions/presets'

export interface WithPresetActionsOptions<
  Row = any,
  RowId extends string | number = string | number,
  Query extends Record<string, any> = Record<string, any>,
  CreateInput = Partial<Row>,
  UpdateInput = Partial<Row>,
  SortField extends string = string,
> {
  openCreate: () => void
  openEdit: (row: Row) => void

  disableAdd?: boolean
  disableEdit?: boolean
  disableDelete?: boolean
  disableExport?: boolean

  config?: CrudConfig
  actions?: CrudAction<Row>[] | any
}

export function withPresetActions<
  Row = any,
  RowId extends string | number = string | number,
  Query extends Record<string, any> = Record<string, any>,
  CreateInput = Partial<Row>,
  UpdateInput = Partial<Row>,
  SortField extends string = string,
>(
  options: WithPresetActionsOptions<Row, RowId, Query, CreateInput, UpdateInput, SortField>,
): CrudPlugin<Row, RowId, Query, CreateInput, UpdateInput, SortField> {
  return (runtime: CrudRuntime<Row, RowId, Query, CreateInput, UpdateInput, SortField>) => {
    runtime.actions = computed<CrudAction<Row>[]>(() => {
      return createCrudPresetActions<Row, RowId, Query, CreateInput, UpdateInput, SortField>({
        adapter: runtime.adapter as CrudAdapter<Row, RowId, Query, CreateInput, UpdateInput, SortField>,
        crud: runtime.crud as any,
        openCreate: options.openCreate,
        openEdit: options.openEdit,
        disableAdd: options.disableAdd,
        disableEdit: options.disableEdit,
        disableDelete: options.disableDelete,
        disableExport: options.disableExport,
        config: options.config ?? runtime.config,
        actions: options.actions as any,
      })
    })
  }
}
