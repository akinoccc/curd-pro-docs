import type { ComputedRef } from 'vue'
import type { CrudFieldContext, CrudTableColumn } from '../crud/models'
import type { CrudRuntime } from '../runtime/types'
import { computed } from 'vue'
import { useCrudContext } from '../context/useCrudContext'

export interface UseEffectiveColumnsOptions<Row = any> {
  /**
   * Optional: explicitly provide runtime (no Provider needed).
   */
  runtime?: CrudRuntime<Row, any, any, any, any, any>
  columns?: () => CrudTableColumn<Row>[]
}

export function useEffectiveColumns<Row = any>(
  options: UseEffectiveColumnsOptions<Row> = {},
): ComputedRef<CrudTableColumn<Row>[]> {
  const ctx = useCrudContext<Row>({ runtime: options.runtime as any })
  const columnsSource = options.columns ?? (() => (ctx.columns ?? []) as CrudTableColumn<Row>[])

  return computed(() => {
    const all = (columnsSource() ?? []) as CrudTableColumn<Row>[]
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
