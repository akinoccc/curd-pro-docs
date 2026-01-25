import type { CrudSort } from '@fcurd/core'
import type { Ref } from 'vue'
import { computed } from 'vue'
import { useCrudContext } from './useCrudContext'

export interface UseCrudTableSorterSyncReturn {
  onSorterChange: (payload: any) => void
  sort: Ref<CrudSort | null> | undefined
}

export function useCrudTableSorterSync(): UseCrudTableSorterSyncReturn {
  const ctx = useCrudContext<any>()

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
