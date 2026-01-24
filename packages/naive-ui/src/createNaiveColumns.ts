import type { CrudField, CrudTableColumn } from '@fcurd/core'

interface CreateNaiveColumnsOptions<Row = any> {
  /**
   * 针对单个字段的列覆写（按字段 key）
   */
  overrides?: Record<string, Partial<CrudTableColumn<Row>>>
  /**
   * 默认列配置
   */
  defaults?: Partial<CrudTableColumn<Row>>
}

/**
 * 根据字段定义快速生成 Naive UI 列，优先使用字段上的 ui.naive.columnProps，
 * 其次使用 overrides，再落到 defaults。
 */
export function createNaiveColumns<Row = any>(
  fields: readonly CrudField<Row, any>[],
  options: CreateNaiveColumnsOptions<Row> = {},
): CrudTableColumn<Row>[] {
  const { overrides = {}, defaults = {} } = options

  return fields.map((field) => {
    const override = overrides[field.key] ?? {}
    const merged: CrudTableColumn<Row> = {
      ...defaults,
      field,
      ...override,
    }

    const baseColumn = (field.ui as any)?.column
    const overrideColumn = (merged.ui as any)?.column
    const column = overrideColumn ?? baseColumn
    if (column) {
      merged.ui = {
        ...((merged.ui ?? {}) as any),
        column,
      }
    }

    return merged
  })
}
