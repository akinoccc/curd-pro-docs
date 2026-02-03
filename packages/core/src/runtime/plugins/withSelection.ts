import { computed } from 'vue'
import { useCrudSelection } from '../../selection/useCrudSelection'
import type { CrudPlugin } from '../types'

export function withSelection<Row = any>(): CrudPlugin<Row, any, any, any, any, any> {
  return (runtime) => {
    const selectionApi = useCrudSelection<Row>({
      rows: runtime.crud.rows as any,
      getId: runtime.getId as any,
    })

    runtime.selection = selectionApi.selection as any
    runtime.selectedIds = selectionApi.selectedIds as any
    runtime.selectedRows = selectionApi.selectedRows as any
    runtime.clearSelection = selectionApi.clearSelection

    // Backfill computed selectedRows if needed (defensive).
    if (!runtime.selectedRows) {
      runtime.selectedRows = computed(() => {
        const ids = runtime.selection?.value ?? new Set()
        const list = runtime.crud.rows.value ?? []
        return (list as any[]).filter(r => ids.has(runtime.getId(r as any)))
      }) as any
    }
  }
}


