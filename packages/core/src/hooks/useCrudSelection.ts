import type { UseCrudSelectionOptions, UseCrudSelectionReturn } from '../types'
import { computed, shallowRef, watch } from 'vue'

/**
 * Core hook for CRUD selection management
 */
export function useCrudSelection<Row = any>(
  options: UseCrudSelectionOptions<Row>,
): UseCrudSelectionReturn<Row> {
  const { rows, getId = (row: Row) => (row as any)?.id } = options

  // State
  const selectedIds = shallowRef<Set<string | number>>(new Set())
  const selectedRowMap = shallowRef<Map<string | number, Row>>(new Map())

  // Computed: selected rows
  const selectedRows = computed<Row[]>(() => {
    const ids = selectedIds.value
    const map = selectedRowMap.value
    const result: Row[] = []
    ids.forEach((id) => {
      const row = map.get(id)
      if (row !== undefined)
        result.push(row)
    })
    return result
  })

  // Computed: selected count
  const selectedCount = computed<number>(() => selectedIds.value.size)

  function syncCacheFromRows(nextRows: Row[]): void {
    const ids = selectedIds.value
    if (ids.size === 0)
      return
    const map = new Map(selectedRowMap.value)
    for (const row of nextRows) {
      const id = getId(row)
      if (ids.has(id))
        map.set(id, row)
    }
    selectedRowMap.value = map
  }

  // Keep cache updated with latest row objects on each page
  watch(
    rows,
    (newRows) => {
      syncCacheFromRows(newRows)
    },
    { immediate: true },
  )

  // Keep cache in sync when selectedIds is replaced externally
  watch(
    selectedIds,
    (next) => {
      const map = new Map(selectedRowMap.value)
      for (const id of map.keys()) {
        if (!next.has(id))
          map.delete(id)
      }
      selectedRowMap.value = map
      syncCacheFromRows(rows.value)
    },
    { deep: false },
  )

  // Actions
  function setSelectedIds(ids: (string | number)[]): void {
    selectedIds.value = new Set(ids)
  }

  function select(id: string | number): void {
    const newSet = new Set(selectedIds.value)
    newSet.add(id)
    selectedIds.value = newSet

    // Cache row snapshot if it exists on current page
    const row = rows.value.find(r => getId(r) === id)
    if (row !== undefined) {
      const map = new Map(selectedRowMap.value)
      map.set(id, row)
      selectedRowMap.value = map
    }
  }

  function deselect(id: string | number): void {
    const newSet = new Set(selectedIds.value)
    newSet.delete(id)
    selectedIds.value = newSet

    const map = new Map(selectedRowMap.value)
    map.delete(id)
    selectedRowMap.value = map
  }

  function toggle(id: string | number): void {
    if (selectedIds.value.has(id)) {
      deselect(id)
    }
    else {
      select(id)
    }
  }

  function selectAll(): void {
    const map = new Map(selectedRowMap.value)
    const allIds: Array<string | number> = []
    for (const row of rows.value) {
      const id = getId(row)
      allIds.push(id)
      map.set(id, row)
    }
    selectedIds.value = new Set(allIds)
    selectedRowMap.value = map
  }

  function clear(): void {
    selectedIds.value = new Set()
    selectedRowMap.value = new Map()
  }

  function isSelected(id: string | number): boolean {
    return selectedIds.value.has(id)
  }

  return {
    selectedIds,
    selectedRows,
    selectedCount,
    setSelectedIds,
    select,
    deselect,
    toggle,
    selectAll,
    clear,
    isSelected,
  }
}
