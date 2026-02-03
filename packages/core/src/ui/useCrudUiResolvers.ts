import type { CrudField, CrudSurface } from '../crud/models'
import { useCrudContext } from '../context/useCrudContext'

export interface ResolvedControl {
  component: any
  bind: Record<string, any>
}

/**
 * Unified UI resolver for control + form-item props.
 * Keep UI logic in one place to avoid duplicated rules in UI packages.
 */
export function useCrudUiResolvers<Row = any>(surface: CrudSurface) {
  const ctx = useCrudContext<Row>()

  function resolveFormItemProps(field: CrudField<any, any>): Record<string, any> {
    return ctx.uiDriver?.resolveFormItem?.({ surface, field } as any)?.formItemProps ?? {}
  }

  function resolveControl(field: CrudField<any, any>): ResolvedControl {
    const controlMap: any = ctx.controlMap as any
    const resolved = ctx.uiDriver?.resolveControl?.({
      surface,
      field,
      controlMap,
    } as any)
    const component = resolved?.component ?? controlMap?.[field.type] ?? controlMap?.text
    const bind = {
      ...(resolved?.controlProps ?? {}),
      ...((resolved?.passField ?? false) ? { field } : {}),
    }
    return { component, bind }
  }

  return {
    resolveControl,
    resolveFormItemProps,
  }
}


