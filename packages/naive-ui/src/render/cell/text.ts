import type { CrudTableCellContext } from '@uozi/vito-core'
import type { CellRenderFactoryOptions } from './shared'
import { NEllipsis } from 'naive-ui'
import { h } from 'vue'
import { isEmptyValue, toText } from './shared'

/**
 * 纯文本（可选：空值占位）
 */
export function cellText<Row = any>(
  options: CellRenderFactoryOptions = {},
): (ctx: CrudTableCellContext<Row>) => any {
  const { placeholder = '-' } = options
  return (ctx) => {
    if (isEmptyValue(ctx.value))
      return placeholder
    return toText(ctx.value)
  }
}

export interface CellEllipsisOptions extends CellRenderFactoryOptions {
  /**
   * 行数（1=单行省略）
   * @default 1
   */
  lineClamp?: number
  /**
   * hover 时显示 tooltip
   * @default true
   */
  tooltip?: boolean
}

/**
 * 省略显示（NEllipsis）
 */
export function cellEllipsis<Row = any>(
  options: CellEllipsisOptions = {},
): (ctx: CrudTableCellContext<Row>) => any {
  const { placeholder = '-', lineClamp = 1, tooltip = true } = options
  return (ctx) => {
    if (isEmptyValue(ctx.value))
      return placeholder
    const text = toText(ctx.value)
    return h(
      NEllipsis,
      { tooltip, lineClamp },
      { default: () => text },
    )
  }
}
