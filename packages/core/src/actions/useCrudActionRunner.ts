import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import type { CrudAction, CrudActionContext, CrudActionArea, UseCrudActionsReturn } from '../crud/models'
import type { CrudUiDriver } from '../ui/ui-driver'

export interface CrudActionSource<Row = any> {
  actions?: CrudAction<Row>[] | UseCrudActionsReturn<Row> | ComputedRef<CrudAction<Row>[]>
}

export interface UseCrudActionRunnerOptions<Row = any> {
  actions?: CrudAction<Row>[] | UseCrudActionsReturn<Row> | ComputedRef<CrudAction<Row>[]>
  area?: CrudActionArea
  ctx: ComputedRef<CrudActionContext<Row>>
  uiDriver?: CrudUiDriver
  onError?: (error: unknown) => void
}

export interface UseCrudActionRunnerReturn<Row = any> {
  actions: ComputedRef<CrudAction<Row>[]>
  run: (action: CrudAction<Row>) => Promise<void>
}

function isActionRegistry(value: any): value is UseCrudActionsReturn<any> {
  return Boolean(value && typeof value === 'object' && typeof value.list === 'function')
}

function isComputedRef(value: any): value is ComputedRef<any> {
  return Boolean(value && typeof value === 'object' && typeof value.value !== 'undefined')
}

export function useCrudActionRunner<Row = any>(
  options: UseCrudActionRunnerOptions<Row>,
): UseCrudActionRunnerReturn<Row> {
  const { ctx, uiDriver } = options

  const actions = computed<CrudAction<Row>[]>(() => {
    const source = options.actions
    const area = options.area

    const raw = isComputedRef(source) ? source.value : source
    const list: CrudAction<Row>[] = isActionRegistry(raw)
      ? (raw.list(area) as CrudAction<Row>[])
      : Array.isArray(raw)
        ? (area ? raw.filter(a => a?.area === area) : raw)
        : []

    const currentCtx = ctx.value
    return list
      .filter(Boolean)
      .filter((action) => {
      if (typeof action.visible === 'function')
        return Boolean(action.visible(currentCtx as any))
      return true
    })
  })

  async function confirmIfNeeded(action: CrudAction<Row>, currentCtx: CrudActionContext<Row>): Promise<boolean> {
    if (!action.confirm)
      return true
    if (uiDriver?.confirmAction) {
      try {
        const ok = await uiDriver.confirmAction({ action, ctx: currentCtx } as any)
        return Boolean(ok)
      }
      catch {
        return false
      }
    }
    // NOTE: We intentionally do not fallback to window.confirm in core runner.
    // If no driver confirm exists, treat as cancelled to avoid implicit browser coupling.
    return false
  }

  async function run(action: CrudAction<Row>): Promise<void> {
    const currentCtx = ctx.value
    const disabled = action.disabled?.(currentCtx as any) ?? false
    if (disabled)
      return

    const ok = await confirmIfNeeded(action, currentCtx)
    if (!ok)
      return

    try {
      const result = await action.onClick(currentCtx as any)
      if (action.result === 'export' && result && uiDriver?.handleExportResult) {
        const filename = (action.meta as any)?.filename
        await uiDriver.handleExportResult(result as any, filename ? { filename } : undefined)
      }
    }
    catch (err) {
      options.onError?.(err)
    }
  }

  return {
    actions,
    run,
  }
}


