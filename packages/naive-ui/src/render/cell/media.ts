import type { CrudTableCellContext } from '@fcurd/core'
import type { CellRenderFactoryOptions } from './shared'
import { NImage } from 'naive-ui'
import { h } from 'vue'

export interface CellImageOptions extends CellRenderFactoryOptions {
  width?: number
  height?: number
  /**
   * 图片预览（Naive NImage）
   * @default true
   */
  previewDisabled?: boolean
  /**
   * 自定义 URL 提取
   */
  getUrl?: (ctx: CrudTableCellContext<any>) => string | null
}

/**
 * 图片缩略图（NImage）
 */
export function cellImage<Row = any>(
  options: CellImageOptions = {},
): (ctx: CrudTableCellContext<Row>) => any {
  const {
    placeholder = '-',
    width = 32,
    height = 32,
    previewDisabled = true,
    getUrl,
  } = options

  return (ctx) => {
    const url = getUrl ? getUrl(ctx as any) : (typeof ctx.value === 'string' ? ctx.value : null)
    if (!url)
      return placeholder
    return h(NImage, { src: url, width, height, previewDisabled })
  }
}
