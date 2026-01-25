import type { CrudField, CrudFieldContext, CrudSurface } from '@fcurd/core'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { useCrudContext } from '../context/useCrudContext'

export interface UseEffectiveFieldsOptions<Row = any, FormModel = any> {
  surface: CrudSurface
  /**
   * 字段来源（props 优先，未传则使用 CrudProvider 注入的 fields）
   */
  fields?: () => readonly CrudField<Row, FormModel, any>[]
  /**
   * row（表单 edit / 详情等场景可选）
   */
  row?: () => Row | undefined
  /**
   * formModel（表单场景可选）
   */
  formModel?: () => FormModel | undefined
  /**
   * query 来源（默认使用 crud.query.value；没有 crud 时为空对象）
   */
  query?: () => Record<string, any>
  /**
   * extra 上下文（默认使用 CrudProvider 注入）
   */
  extra?: () => Record<string, any> | undefined
  /**
   * user 上下文（默认使用 CrudProvider 注入）
   */
  user?: () => { roles: string[] } | undefined
}

export function useEffectiveFields<Row = any, FormModel = any>(
  options: UseEffectiveFieldsOptions<Row, FormModel>,
): ComputedRef<CrudField<Row, FormModel, any>[]> {
  const ctx = useCrudContext<Row>()

  const fieldsSource = options.fields ?? (() => (ctx.fields ?? []) as readonly CrudField<Row, FormModel, any>[])
  const querySource = options.query ?? (() => (ctx.crud?.query.value ?? {}) as Record<string, any>)
  const extraSource = options.extra ?? (() => ctx.extra)
  const userSource = options.user ?? (() => ctx.user)

  return computed(() => {
    const list = (fieldsSource() ?? []) as readonly CrudField<Row, FormModel, any>[]
    const surface = options.surface

    return list.filter((field) => {
      const visible = field.visibleIn?.[surface]
      if (visible === undefined)
        return false
      if (typeof visible === 'boolean')
        return visible

      const context: CrudFieldContext<Row, FormModel> = {
        surface,
        row: options.row?.(),
        formModel: options.formModel?.(),
        query: querySource(),
        user: userSource(),
        extra: extraSource(),
      }

      return visible(context)
    }) as CrudField<Row, FormModel, any>[]
  })
}
