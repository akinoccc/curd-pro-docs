import type { CrudField, CrudTableColumn } from '@fcurd/core'

interface CreateNaiveColumnsOptions<Row = any> {
  /**
   * 针对单个字段的列覆写（按字段 key）
   */
  overrides?: Record<
    string,
    Partial<CrudTableColumn<Row>> & { naiveColumn?: Record<string, any> }
  >
  /**
   * 默认列配置
   */
  defaults?: Partial<CrudTableColumn<Row>>
}

/**
 * 根据字段定义快速生成 Naive UI 列，优先使用字段上的 ui.naiveColumn，
 * 其次使用 overrides，再落到 defaults。
 */
export function createNaiveColumns<Row = any>(
  fields: CrudField<Row, any>[],
  options: CreateNaiveColumnsOptions<Row> = {},
): CrudTableColumn<Row>[] {
  const { overrides = {}, defaults = {} } = options

  return fields.map((field) => {
    const override = overrides[field.key] ?? {}
    const naiveColumn = field.ui?.naiveColumn ?? override.naiveColumn
    const merged: CrudTableColumn<Row> = {
      ...defaults,
      field,
      ...override,
    }

    if (naiveColumn) {
      merged.ui = {
        ...(merged.ui ?? {}),
        naiveColumn,
      }
    }

    return merged
  })
}
