import type {
  CrudAction,
  CrudField,
  CrudTableColumn,
  DictApi,
  DictCenter,
  UseCrudActionsReturn,
  UseCrudReturn,
} from '@fcurd/core'
import type { Component, ComputedRef, InjectionKey, Ref } from 'vue'

export interface CrudControlMap {
  text: Component
  textarea: Component
  select: Component
  date: Component
  datetime?: Component
  switch?: Component
  number: Component
  money?: Component
  custom?: Component
}

export interface CrudContext<Row = any> {
  crud: UseCrudReturn<Row>
  fields?: CrudField<Row, any>[]
  columns?: CrudTableColumn<Row>[]
  actions?: CrudAction<Row>[]
  user?: { roles: string[] }
  extra?: Record<string, any>
  controlMap: CrudControlMap
  dictApi?: DictApi
}

export const CrudInstanceSymbol: InjectionKey<UseCrudReturn<any>> = Symbol('fcurd:crud')
export const CrudFieldsSymbol: InjectionKey<CrudField<any, any>[]> = Symbol('fcurd:fields')
export const CrudColumnsSymbol: InjectionKey<CrudTableColumn<any>[]> = Symbol('fcurd:columns')
export const CrudActionsSymbol: InjectionKey<UseCrudActionsReturn<any> | CrudAction<any>[]>
  = Symbol('fcurd:actions')
export const CrudControlMapSymbol: InjectionKey<CrudControlMap> = Symbol('fcurd:controlMap')
export const CrudUserSymbol: InjectionKey<{ roles: string[] } | undefined> = Symbol('fcurd:user')
export const CrudExtraSymbol: InjectionKey<Record<string, any> | undefined> = Symbol('fcurd:extra')
export const DictApiSymbol: InjectionKey<DictApi | undefined> = Symbol('fcurd:dictApi')
export const DictCenterSymbol: InjectionKey<DictCenter | undefined> = Symbol('fcurd:dictCenter')
export const CrudGetIdSymbol: InjectionKey<(row: any) => string | number> = Symbol('fcurd:getId')
export const CrudSelectionSymbol: InjectionKey<Ref<Set<string | number>>> = Symbol('fcurd:selection')
export const CrudSelectedRowsSymbol: InjectionKey<ComputedRef<any[]>> = Symbol('fcurd:selectedRows')

// 表单上下文（可选）：仅在某些 UI 适配层（例如 naive-ui）提供
export const CrudFormModelSymbol: InjectionKey<Record<string, any> | undefined> = Symbol('fcurd:formModel')
export const CrudFormModeSymbol: InjectionKey<Ref<'create' | 'edit'> | undefined> = Symbol('fcurd:formMode')
