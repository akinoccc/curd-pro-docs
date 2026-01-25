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
 * 根据字段定义快速生成列配置：
 * - 默认会吸收 `field.ui.column`（见 `controls.ts` 的 NaiveFieldUi.column）
 * - 可用 overrides 按 field.key 覆写
 * - 可用 defaults 提供全局默认
 *
 * 说明：
 * - `CrudTableColumn.ui` 在 core 中是“UI 透传位”，Naive 适配层会把它透传到 DataTableColumn。
 */
export function createNaiveColumns<Row = any>(
  fields: readonly CrudField<Row, any>[],
  options: CreateNaiveColumnsOptions<Row> = {},
): CrudTableColumn<Row>[] {
  const { overrides = {}, defaults = {} } = options

  return fields.map((field) => {
    const override = overrides[field.key] ?? {}
    const defaultsUi = (defaults.ui ?? {}) as Record<string, any>
    const overrideUi = ((override as any).ui ?? {}) as Record<string, any>
    const fieldUiColumn = ((field as any)?.ui?.column ?? {}) as Record<string, any>

    const merged: CrudTableColumn<Row> = {
      ...defaults,
      field,
      ...override,
      ui: {
        ...defaultsUi,
        ...fieldUiColumn,
        ...overrideUi,
      },
    }
    return merged
  })
}
