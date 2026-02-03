import type { Ref } from 'vue'
import type { CrudSort } from '../crud/models'
import type { CrudRuntime } from '../runtime/types'
import { computed } from 'vue'
import { useCrudContext } from '../context/useCrudContext'

export interface UseCrudTableSorterSyncReturn {
  onSorterChange: (payload: any) => void
  sort: Ref<CrudSort | null> | undefined
}

export function useCrudTableSorterSync(options: { runtime?: CrudRuntime<any, any, any, any, any, any> } = {}): UseCrudTableSorterSyncReturn {
  const ctx = useCrudContext<any>({ runtime: options.runtime as any })

  const sort = computed(() => (ctx.crud?.sort.value ?? null) as CrudSort | null) as any

  function fallbackDecode(payload: any): CrudSort | null {
    if (!payload)
      return null
    const order = payload.order
    if (order === false || order === undefined || order === null)
      return null
    const columnKey = payload.columnKey
    if (!columnKey)
      return null
    return { field: String(columnKey), order }
  }

  function onSorterChange(payload: any): void {
    const crud = ctx.crud
    if (!crud)
      return
    const decoded = ctx.uiDriver?.decodeTableSorter
      ? ctx.uiDriver.decodeTableSorter(payload)
      : fallbackDecode(payload)
    crud.setSort(decoded)
  }

  return {
    onSorterChange,
    sort: (ctx.crud?.sort as any) ?? undefined,
  }
}
