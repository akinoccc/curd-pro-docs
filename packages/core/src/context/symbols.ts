import type {
  CrudAction,
  CrudField,
  CrudTableColumn,
  UseCrudActionsReturn,
  UseCrudReturn,
} from '@fcurd/core'
import type { Component, ComputedRef, InjectionKey, Ref } from 'vue'
import type { CrudUiDriver } from '../ui/ui-driver'

export interface CrudControlMap {
  text: Component
  textarea: Component
  select: Component
  date: Component
  datetime?: Component
  dateRange?: Component
  datetimeRange?: Component
  switch?: Component
  number: Component
  money?: Component
  custom?: Component
}

export interface CrudContext<Row = any> {
  crud: UseCrudReturn<Row, any, any>
  fields?: readonly CrudField<Row, any>[]
  columns?: readonly CrudTableColumn<Row>[]
  actions?: CrudAction<Row>[]
  user?: { roles: string[] }
  extra?: Record<string, any>
  controlMap: CrudControlMap
}

export const CrudInstanceSymbol: InjectionKey<UseCrudReturn<any, any, any>> = Symbol('fcurd:crud')
export const CrudFieldsSymbol: InjectionKey<readonly CrudField<any, any>[]> = Symbol('fcurd:fields')
export const CrudColumnsSymbol: InjectionKey<readonly CrudTableColumn<any>[]> = Symbol('fcurd:columns')
export const CrudActionsSymbol: InjectionKey<UseCrudActionsReturn<any> | CrudAction<any>[]>
  = Symbol('fcurd:actions')
export const CrudControlMapSymbol: InjectionKey<CrudControlMap> = Symbol('fcurd:controlMap')
export const CrudUserSymbol: InjectionKey<{ roles: string[] } | undefined> = Symbol('fcurd:user')
export const CrudExtraSymbol: InjectionKey<Record<string, any> | undefined> = Symbol('fcurd:extra')
export const CrudGetIdSymbol: InjectionKey<(row: any) => string | number> = Symbol('fcurd:getId')
export const CrudSelectionSymbol: InjectionKey<Ref<Set<string | number>>> = Symbol('fcurd:selection')
export const CrudSelectedRowsSymbol: InjectionKey<ComputedRef<any[]>> = Symbol('fcurd:selectedRows')

// 表单上下文（可选）：仅在某些 UI 适配层（例如 naive-ui）提供
export const CrudFormModelSymbol: InjectionKey<Record<string, any> | undefined> = Symbol('fcurd:formModel')
export const CrudFormModeSymbol: InjectionKey<Ref<'create' | 'edit'> | undefined> = Symbol('fcurd:formMode')

// UI Driver（可选）：用于把渲染策略集中到一个适配点
export const CrudUiDriverSymbol: InjectionKey<CrudUiDriver | undefined> = Symbol('fcurd:uiDriver')


