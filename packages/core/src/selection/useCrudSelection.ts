import type { ComputedRef, Ref, ShallowRef } from 'vue'
import { computed, ref, shallowRef, watch } from 'vue'

export interface UseCrudSelectionOptions<Row = any> {
  /**
   * Current page rows.
   */
  rows: Ref<Row[]> | ShallowRef<Row[]>
  /**
   * Extract row id.
   */
  getId: (row: Row) => string | number
}

export interface UseCrudSelectionReturn<Row = any> {
  selection: Ref<Set<string | number>>
  selectedIds: ComputedRef<(string | number)[]>
  /**
   * Cross-page selected row snapshots (last known row).
   */
  selectedRows: ComputedRef<Row[]>
  clearSelection: () => void
}

export function useCrudSelection<Row = any>(
  options: UseCrudSelectionOptions<Row>,
): UseCrudSelectionReturn<Row> {
  const { rows, getId } = options

  const selection = ref<Set<string | number>>(new Set())
  const selectedIds = computed<(string | number)[]>(() => Array.from(selection.value))

  // Keep row snapshots for cross-page selection.
  const selectedRowMap = shallowRef<Map<string | number, Row>>(new Map())

  function syncSelectedRowMap(): void {
    const ids = selection.value
    const map = selectedRowMap.value

    // Remove unchecked.
    for (const id of Array.from(map.keys())) {
      if (!ids.has(id))
        map.delete(id)
    }

    // Update snapshots from current page.
    const list = rows.value ?? []
    for (const row of list as any[]) {
      const id = getId(row as any)
      if (ids.has(id))
        map.set(id, row as any)
    }
  }

  watch(
    [selectedIds, () => rows.value],
    () => syncSelectedRowMap(),
    { immediate: true, deep: false },
  )

  const selectedRows = computed<Row[]>(() => {
    const map = selectedRowMap.value
    return selectedIds.value
      .map(id => map.get(id))
      .filter(Boolean) as Row[]
  })

  function clearSelection(): void {
    selection.value = new Set()
    selectedRowMap.value.clear()
  }

  return {
    selection,
    selectedIds,
    selectedRows,
    clearSelection,
  }
}


