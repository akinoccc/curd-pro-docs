import type { CrudAction, CrudAdapter, UseCrudActionsOptions, UseCrudActionsReturn } from '../types'
import { ref } from 'vue'

/**
 * Core hook for CRUD action management
 */
export function useCrudActions<Row = any>(
  options: UseCrudActionsOptions<Row> = {},
): UseCrudActionsReturn<Row> {
  const { actions: initialActions = [] } = options

  // State
  const actions = ref<CrudAction<Row>[]>([...initialActions])

  // Get actions by area
  function getByArea(area: CrudAction['area']): CrudAction<Row>[] {
    return actions.value
      .filter(a => a.area === area)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }

  // Register a new action
  function register(action: CrudAction<Row>): void {
    const existing = actions.value.findIndex(a => a.id === action.id)
    if (existing >= 0) {
      actions.value[existing] = action
    }
    else {
      actions.value.push(action)
    }
  }

  // Unregister an action
  function unregister(id: string): void {
    const idx = actions.value.findIndex(a => a.id === id)
    if (idx >= 0) {
      actions.value.splice(idx, 1)
    }
  }

  return {
    actions,
    getByArea,
    register,
    unregister,
  }
}

// =============================================================================
// Preset Action Factories
// =============================================================================

export interface CreateActionOptions {
  label?: string
  onClick: () => void
}

export function createAction(options: CreateActionOptions): CrudAction {
  return {
    id: 'create',
    label: options.label ?? '新增',
    type: 'primary',
    area: 'toolbar',
    order: 0,
    onClick: options.onClick,
  }
}

export interface EditActionOptions<Row = any> {
  label?: string
  onClick: (row: Row) => void
}

export function editAction<Row = any>(options: EditActionOptions<Row>): CrudAction<Row> {
  return {
    id: 'edit',
    label: options.label ?? '编辑',
    type: 'default',
    area: 'row',
    order: 0,
    onClick: (ctx) => {
      if (ctx.row) {
        options.onClick(ctx.row)
      }
    },
  }
}

export interface DeleteActionOptions<Row = any> {
  label?: string
  adapter: CrudAdapter<Row>
  getId?: (row: Row) => string | number
  confirm?: boolean | string
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function deleteAction<Row = any>(options: DeleteActionOptions<Row>): CrudAction<Row> {
  const { adapter, getId = (row: Row) => (row as any)?.id, confirm = true } = options

  return {
    id: 'delete',
    label: options.label ?? '删除',
    type: 'error',
    area: 'row',
    order: 10,
    confirm: confirm === true ? '确定要删除此记录吗？' : confirm,
    onClick: async (ctx) => {
      if (!ctx.row || !adapter.remove)
        return

      try {
        const id = getId(ctx.row)
        await adapter.remove(id)
        await ctx.refresh()
        options.onSuccess?.()
      }
      catch (err) {
        options.onError?.(err)
      }
    },
  }
}

export interface BatchDeleteActionOptions<Row = any> {
  label?: string
  adapter: CrudAdapter<Row>
  getId?: (row: Row) => string | number
  confirm?: boolean | string
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function batchDeleteAction<Row = any>(options: BatchDeleteActionOptions<Row>): CrudAction<Row> {
  const { adapter, getId = (row: Row) => (row as any)?.id, confirm = true } = options

  return {
    id: 'batchDelete',
    label: options.label ?? '批量删除',
    type: 'error',
    area: 'batch',
    order: 0,
    confirm: confirm === true ? '确定要删除选中的记录吗？' : confirm,
    visible: ctx => ctx.selectedIds.length > 0,
    onClick: async (ctx) => {
      if (!adapter.remove || ctx.selectedIds.length === 0)
        return

      try {
        await Promise.all(ctx.selectedIds.map(id => adapter.remove!(id)))
        ctx.clearSelection()
        await ctx.refresh()
        options.onSuccess?.()
      }
      catch (err) {
        options.onError?.(err)
      }
    },
  }
}

export interface ExportActionOptions<Row = any> {
  label?: string
  adapter: CrudAdapter<Row>
  filename?: string
  onSuccess?: () => void
  onError?: (error: unknown) => void
  /** UI layer provides download handler */
  handleExport?: (result: any, filename?: string) => void
}

export function exportAction<Row = any>(options: ExportActionOptions<Row>): CrudAction<Row> {
  const { adapter } = options

  return {
    id: 'export',
    label: options.label ?? '导出',
    type: 'default',
    area: 'toolbar',
    order: 100,
    visible: () => typeof adapter.export === 'function',
    onClick: async (ctx) => {
      if (!adapter.export)
        return

      try {
        const result = await adapter.export({
          query: {} as any,
          sort: null,
        })
        options.handleExport?.(result, options.filename)
        options.onSuccess?.()
      }
      catch (err) {
        options.onError?.(err)
      }
    },
  }
}

/**
 * Preset action factories
 */
export const presetActions = {
  create: createAction,
  edit: editAction,
  delete: deleteAction,
  batchDelete: batchDeleteAction,
  export: exportAction,
}
