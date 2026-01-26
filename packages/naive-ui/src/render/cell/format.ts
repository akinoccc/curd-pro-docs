import type { CrudTableCellContext } from '@fcurd/core'
import type { CellRenderFactoryOptions } from './shared'
import { isEmptyValue } from './shared'

export interface CellDateTimeOptions extends CellRenderFactoryOptions {
  /**
   * 解析 value 的方式（默认兼容 Date / timestamp(ms) / ISO string）
   */
  parse?: (value: unknown) => Date | null
  /**
   * Intl.DateTimeFormat locales
   * @default 'zh-CN'
   */
  locale?: string
  /**
   * 日期/时间格式
   */
  formatOptions?: Intl.DateTimeFormatOptions
}

function defaultParseDate(value: unknown): Date | null {
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === 'number') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }
  if (typeof value === 'string') {
    const s = value.trim()
    if (!s)
      return null
    const n = Number(s)
    if (!Number.isNaN(n)) {
      const d = new Date(n)
      return Number.isNaN(d.getTime()) ? null : d
    }
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

/**
 * 日期时间格式化（基于 Intl.DateTimeFormat）
 */
export function cellDateTime<Row = any>(
  options: CellDateTimeOptions = {},
): (ctx: CrudTableCellContext<Row>) => any {
  const {
    placeholder = '-',
    parse = defaultParseDate,
    locale = 'zh-CN',
    formatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' },
  } = options

  const formatter = new Intl.DateTimeFormat(locale, formatOptions)

  return (ctx) => {
    if (isEmptyValue(ctx.value))
      return placeholder
    const d = parse(ctx.value)
    if (!d)
      return placeholder
    return formatter.format(d)
  }
}

export interface CellMoneyOptions extends CellRenderFactoryOptions {
  locale?: string
  currency?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

/**
 * 金额格式化（基于 Intl.NumberFormat）
 */
export function cellMoney<Row = any>(
  options: CellMoneyOptions = {},
): (ctx: CrudTableCellContext<Row>) => any {
  const {
    placeholder = '-',
    locale = 'zh-CN',
    currency = 'CNY',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  })

  return (ctx) => {
    const v = ctx.value
    if (isEmptyValue(v))
      return placeholder
    const n = typeof v === 'number' ? v : Number(v)
    if (Number.isNaN(n))
      return placeholder
    return formatter.format(n)
  }
}
