import type { CrudTableColumn } from '@fcurd/core'
import type { ComputedRef, VNodeChild } from 'vue'
import { computed } from 'vue'
import { useCrudContext } from '../context/useCrudContext'
import { resolveSlotName } from '../slots/useSlotNameResolver'
import type { CrudRuntime } from '../runtime/types'

export interface UseCrudTableUiColumnsOptions<Row = any> {
  columns: ComputedRef<CrudTableColumn<Row>[]>
  /**
   * Optional: explicitly provide runtime (no Provider needed).
   */
  runtime?: CrudRuntime<Row, any, any, any, any, any>
  slots?: any
  showSelection?: boolean
  selectionColumn?: Record<string, any>
  showActionsColumn?: boolean
}

export function useCrudTableUiColumns<Row = any>(
  options: UseCrudTableUiColumnsOptions<Row>,
): ComputedRef<any[]> {
  const ctx = useCrudContext<Row>({ runtime: options.runtime as any })

  return computed(() => {
    const driver = ctx.uiDriver
    const columns = options.columns.value ?? []

    // fallback：没有 driver 时，退化成最基础的列结构（仅用于不注入 driver 的场景）
    if (!driver?.mapTableColumns) {
      return columns.map((c) => {
        return {
          key: c.field.key,
          title: c.field.label(),
        }
      })
    }

    const slots = options.slots

    function renderCell(args: {
      column: CrudTableColumn<Row>
      row: any
      rowIndex: number
      value: any
      fallback: () => VNodeChild
    }): VNodeChild {
      const { column, row, rowIndex, value, fallback } = args
      const field = column.field

      const cellSlotName = resolveSlotName(slots, { prefix: 'cell', key: field.key })
      const cellSlot = cellSlotName ? slots?.[cellSlotName] : undefined
      if (cellSlot) {
        const content = cellSlot({ row, field, rowIndex })
        return Array.isArray(content) ? content[0] : content
      }

      if (typeof column.cellRender === 'function') {
        const content = column.cellRender({
          row,
          rowIndex,
          field,
          value,
        } as any)
        return Array.isArray(content) ? content[0] : content
      }

      return fallback()
    }

    const actionsHeaderSlot = slots?.['actions-header']
    const rowActionsSlot = slots?.['row-actions']

    return driver.mapTableColumns({
      columns,
      sort: (ctx.crud?.sort.value ?? null) as any,
      showSelection: options.showSelection,
      selectionColumn: options.selectionColumn,
      showActionsColumn: options.showActionsColumn,
      selection: ctx.selection,
      getId: ctx.getId as any,
      renderActionsHeader: actionsHeaderSlot
        ? () => {
            const content = actionsHeaderSlot()
            return Array.isArray(content) ? content[0] : content
          }
        : undefined,
      renderRowActions: rowActionsSlot
        ? (row: any) => {
            const content = rowActionsSlot({ row })
            return Array.isArray(content) ? content[0] : content
          }
        : undefined,
      renderCell: (p) => {
        return renderCell({
          ...p,
          fallback: () => p.value as any,
        })
      },
    })
  })
}
