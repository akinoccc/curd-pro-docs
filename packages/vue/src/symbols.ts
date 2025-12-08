import type { InjectionKey, Ref, Component } from 'vue'
import type {
  CrudAction,
  CrudField,
  CrudTableColumn,
  DictApi,
  UseCrudActionsReturn,
  UseCrudReturn,
} from '@fcurd/core'

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
export const CrudActionsSymbol: InjectionKey<UseCrudActionsReturn<any> | CrudAction<any>[]> =
  Symbol('fcurd:actions')
export const CrudControlMapSymbol: InjectionKey<CrudControlMap> = Symbol('fcurd:controlMap')
export const CrudUserSymbol: InjectionKey<{ roles: string[] } | undefined> = Symbol('fcurd:user')
export const CrudExtraSymbol: InjectionKey<Record<string, any> | undefined> = Symbol('fcurd:extra')
export const DictApiSymbol: InjectionKey<DictApi | undefined> = Symbol('fcurd:dictApi')
export const CrudSelectionSymbol: InjectionKey<Ref<any[]>> = Symbol('fcurd:selection')
