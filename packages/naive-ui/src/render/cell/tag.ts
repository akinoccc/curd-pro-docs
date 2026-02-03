import type { CrudTableCellContext } from '@fcurd/core'
import type { TagProps } from 'naive-ui'
import type { CellRenderFactoryOptions } from './shared'
import { NTag } from 'naive-ui'
import { h } from 'vue'
import { isEmptyValue, toText } from './shared'

export interface CellBooleanTagOptions extends CellRenderFactoryOptions {
  trueText?: string
  falseText?: string
  trueType?: TagProps['type']
  falseType?: TagProps['type']
  nullText?: string
  nullType?: TagProps['type']
  /**
   * Tag 尺寸
   * @default 'small'
   */
  size?: TagProps['size']
}

/**
 * 布尔值渲染成 Tag（常用于 enabled/disabled）
 */
export function cellBooleanTag<Row = any>(
  options: CellBooleanTagOptions = {},
): (ctx: CrudTableCellContext<Row>) => any {
  const {
    placeholder = '-',
    trueText = '是',
    falseText = '否',
    trueType = 'success',
    falseType = 'default',
    nullText = placeholder,
    nullType = 'default',
    size = 'small',
  } = options

  return (ctx) => {
    const v = ctx.value
    if (v === true) {
      return h(NTag, { type: trueType, size }, { default: () => trueText })
    }
    if (v === false) {
      return h(NTag, { type: falseType, size }, { default: () => falseText })
    }
    return h(NTag, { type: nullType, size }, { default: () => nullText })
  }
}

export interface EnumOption {
  value: string | number
  label: string
  tagType?: TagProps['type']
}

export interface CellEnumLabelOptions extends CellRenderFactoryOptions {
  /**
   * value -> label 映射（优先级高于 options）
   */
  map?: Record<string, string> | Record<number, string>
  /**
   * options（可直接复用 naive-ui 的 SelectOption 结构）
   */
  options?: { value?: any, label?: any }[]
}

/**
 * 枚举值渲染成 label（例如 status/category）
 */
export function cellEnumLabel<Row = any>(
  options: CellEnumLabelOptions,
): (ctx: CrudTableCellContext<Row>) => any {
  const { placeholder = '-', map, options: opts } = options

  const mapFromOptions = new Map<any, string>()
  for (const it of (opts ?? [])) {
    if (it.value === null || it.value === undefined)
      continue
    mapFromOptions.set(it.value, String(it.label ?? it.value))
  }

  return (ctx) => {
    if (isEmptyValue(ctx.value))
      return placeholder
    const key = ctx.value as any
    const mapped = map
      ? (map as any)[String(key)] ?? (map as any)[key]
      : undefined
    return mapped ?? mapFromOptions.get(key) ?? toText(key)
  }
}

export interface CellEnumTagOptions extends CellEnumLabelOptions {
  /**
   * value -> tagType 映射
   */
  typeMap?: Record<string, TagProps['type']> | Record<number, TagProps['type']>
  /**
   * 默认 tagType（当没有匹配时）
   */
  defaultType?: TagProps['type']
  /**
   * Tag 尺寸
   * @default 'small'
   */
  size?: TagProps['size']
}

/**
 * 枚举值渲染成 Tag（例如状态：草稿/启用/禁用）
 */
export function cellEnumTag<Row = any>(
  options: CellEnumTagOptions,
): (ctx: CrudTableCellContext<Row>) => any {
  const { placeholder = '-', typeMap, defaultType = 'default', size = 'small' } = options
  const labelRender = cellEnumLabel<Row>(options)

  return (ctx) => {
    if (isEmptyValue(ctx.value))
      return placeholder
    const key = ctx.value as any
    const type = typeMap
      ? (typeMap as any)[String(key)] ?? (typeMap as any)[key] ?? defaultType
      : defaultType
    return h(NTag, { type, size }, { default: () => labelRender(ctx) })
  }
}
