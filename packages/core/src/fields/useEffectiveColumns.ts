import type { CrudFieldContext, CrudTableColumn } from '@fcurd/core'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { useCrudContext } from '../context/useCrudContext'

export interface UseEffectiveColumnsOptions<Row = any> {
  columns?: () => readonly CrudTableColumn<Row>[]
}

export function useEffectiveColumns<Row = any>(
  options: UseEffectiveColumnsOptions<Row> = {},
): ComputedRef<CrudTableColumn<Row>[]> {
  const ctx = useCrudContext<Row>()
  const columnsSource = options.columns ?? (() => (ctx.columns ?? []) as readonly CrudTableColumn<Row>[])

  return computed(() => {
    const all = (columnsSource() ?? []) as readonly CrudTableColumn<Row>[]
    return all.filter((column) => {
      const field = column.field
      const visible = field.visibleIn?.table
      // breaking change: 默认可见（更符合“快速起步”的直觉）
      if (visible === undefined)
        return true
      if (typeof visible === 'boolean')
        return visible
      const context: CrudFieldContext<Row, any> = {
        surface: 'table',
        query: (ctx.crud?.query.value ?? {}) as Record<string, any>,
        user: ctx.user,
        extra: ctx.extra,
      }
      return visible(context)
    }) as CrudTableColumn<Row>[]
  })
}
