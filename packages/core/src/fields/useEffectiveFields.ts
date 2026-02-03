import type { CrudField, CrudFieldContext, CrudSurface } from '@fcurd/core'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { useCrudContext } from '../context/useCrudContext'
import type { CrudRuntime } from '../runtime/types'

export interface UseEffectiveFieldsOptions<Row = any, FormModel = any> {
  surface: CrudSurface
  /**
   * Optional: explicitly provide runtime (no Provider needed).
   */
  runtime?: CrudRuntime<Row, any, any, any, any, any>
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
  const ctx = useCrudContext<Row>({ runtime: options.runtime as any })

  const fieldsSource = options.fields ?? (() => (ctx.fields ?? []) as readonly CrudField<Row, FormModel, any>[])
  const querySource = options.query ?? (() => (ctx.crud?.query.value ?? {}) as Record<string, any>)
  const extraSource = options.extra ?? (() => ctx.extra)
  const userSource = options.user ?? (() => ctx.user)

  return computed(() => {
    const list = (fieldsSource() ?? []) as readonly CrudField<Row, FormModel, any>[]
    const surface = options.surface

    return list.filter((field) => {
      const visible = field.visibleIn?.[surface]
      // breaking change: 默认可见（更符合“快速起步”的直觉）
      if (visible === undefined)
        return true
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
