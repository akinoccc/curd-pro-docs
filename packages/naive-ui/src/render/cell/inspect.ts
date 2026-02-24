import type { CrudTableCellContext } from '@uozi/vito-core'
import type { PopoverProps } from 'naive-ui'
import type { CellRenderFactoryOptions } from './shared'
import { NCode, NEllipsis, NPopover } from 'naive-ui'
import { h } from 'vue'
import { isEmptyValue } from './shared'

export interface CellJsonPopoverOptions extends CellRenderFactoryOptions {
  /**
   * Popover 透传
   */
  popoverProps?: Partial<PopoverProps>
  /**
   * 触发内容最大长度（用于预览）
   * @default 60
   */
  previewMaxLen?: number
}

/**
 * JSON 悬浮预览（NPopover + NCode）
 */
export function cellJsonPopover<Row = any>(
  options: CellJsonPopoverOptions = {},
): (ctx: CrudTableCellContext<Row>) => any {
  const { placeholder = '-', popoverProps, previewMaxLen = 60 } = options

  return (ctx) => {
    if (isEmptyValue(ctx.value))
      return placeholder
    let code = ''
    try {
      code = typeof ctx.value === 'string' ? ctx.value : JSON.stringify(ctx.value, null, 2)
    }
    catch {
      code = String(ctx.value)
    }

    const preview = code.length > previewMaxLen ? `${code.slice(0, previewMaxLen)}…` : code

    return h(
      NPopover,
      { trigger: 'hover', placement: 'top', ...(popoverProps ?? {}) },
      {
        trigger: () => h(NEllipsis, { tooltip: false, lineClamp: 1 }, { default: () => preview }),
        default: () => h(NCode, { code, language: 'json', wordWrap: true }),
      },
    )
  }
}
