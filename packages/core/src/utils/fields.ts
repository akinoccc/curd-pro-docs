import type { CrudField, FieldContext } from '../types'

/**
 * Define fields with type inference
 */
export function defineFields<
  Row = any,
  FormModel = Row,
  const Fields extends CrudField<Row, FormModel>[] = CrudField<Row, FormModel>[],
>(fields: Fields): Fields {
  return fields
}

/**
 * Filter fields by surface visibility
 */
export function filterFieldsBySurface<Row = any, FormModel = Row>(
  fields: CrudField<Row, FormModel>[],
  surface: FieldContext['surface'],
  ctx?: Partial<FieldContext<Row, FormModel>>,
): CrudField<Row, FormModel>[] {
  return fields.filter((field) => {
    const visibility = field.visibleIn?.[surface]

    if (visibility === undefined || visibility === true)
      return true
    if (visibility === false)
      return false

    if (typeof visibility === 'function') {
      const fullCtx: FieldContext<Row, FormModel> = {
        surface,
        row: ctx?.row,
        formModel: ctx?.formModel,
        query: ctx?.query,
      }
      return visibility(fullCtx)
    }

    return true
  })
}

/**
 * Get field label (resolve function if needed)
 */
export function getFieldLabel(field: CrudField): string {
  if (typeof field.label === 'function') {
    return field.label()
  }
  return field.label
}
