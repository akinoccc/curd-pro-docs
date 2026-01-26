export interface CellRenderFactoryOptions {
  /**
   * 空值占位符（null/undefined/''）
   * @default '-'
   */
  placeholder?: string
}

export function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || value === ''
}

export function toText(value: unknown): string {
  if (value === null || value === undefined)
    return ''
  if (typeof value === 'string')
    return value
  if (typeof value === 'number' || typeof value === 'bigint' || typeof value === 'boolean')
    return String(value)
  try {
    return JSON.stringify(value)
  }
  catch {
    return String(value)
  }
}
