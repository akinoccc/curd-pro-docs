import type { UseCrudSelectionOptions, UseCrudSelectionReturn } from '../types'
import { computed, ref, watch } from 'vue'

/**
 * Core hook for CRUD selection management
 */
export function useCrudSelection<Row = any>(
  options: UseCrudSelectionOptions<Row>,
): UseCrudSelectionReturn<Row> {
  const { rows, getId = (row: Row) => (row as any)?.id } = options

  // State
  const selectedIds = ref<Set<string | number>>(new Set())

  // Computed: selected rows
  const selectedRows = computed<Row[]>(() => {
    const ids = selectedIds.value
    return rows.value.filter(row => ids.has(getId(row)))
  })

  // Computed: selected count
  const selectedCount = computed<number>(() => selectedIds.value.size)

  // Auto-prune: remove IDs that no longer exist in rows
  watch(
    rows,
    (newRows) => {
      const validIds = new Set(newRows.map(row => getId(row)))
      const current = selectedIds.value
      let changed = false

      current.forEach((id) => {
        if (!validIds.has(id)) {
          current.delete(id)
          changed = true
        }
      })

      if (changed) {
        selectedIds.value = new Set(current)
      }
    },
    { immediate: false },
  )

  // Actions
  function select(id: string | number): void {
    const newSet = new Set(selectedIds.value)
    newSet.add(id)
    selectedIds.value = newSet
  }

  function deselect(id: string | number): void {
    const newSet = new Set(selectedIds.value)
    newSet.delete(id)
    selectedIds.value = newSet
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
    const allIds = rows.value.map(row => getId(row))
    selectedIds.value = new Set(allIds)
  }

  function clear(): void {
    selectedIds.value = new Set()
  }

  function isSelected(id: string | number): boolean {
    return selectedIds.value.has(id)
  }

  return {
    selectedIds,
    selectedRows,
    selectedCount,
    select,
    deselect,
    toggle,
    selectAll,
    clear,
    isSelected,
  }
}
