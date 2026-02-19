import type { CrudColumn, CrudField } from '../types'
import { getFieldLabel } from './fields'

/**
 * Define columns with type inference
 */
export function defineColumns<
  Row = any,
  const Columns extends CrudColumn<Row>[] = CrudColumn<Row>[],
>(columns: Columns): Columns {
  return columns
}

/**
 * Create columns from fields with optional overrides
 */
export function createColumnsFromFields<Row = any>(
  fields: CrudField<Row>[],
  options?: {
    overrides?: Partial<Record<string, Partial<CrudColumn<Row>>>>
    defaults?: Partial<CrudColumn<Row>>
    filter?: (field: CrudField<Row>) => boolean
  },
): CrudColumn<Row>[] {
  const { overrides = {}, defaults = {}, filter } = options ?? {}

  const visibleFields = filter
    ? fields.filter(filter)
    : fields.filter((f) => {
        const tableVisible = f.visibleIn?.table
        return tableVisible !== false
      })

  return visibleFields.map((field) => {
    const override = overrides[field.key] ?? {}
    return {
      key: field.key,
      label: () => getFieldLabel(field),
      ...defaults,
      ...override,
    }
  })
}
