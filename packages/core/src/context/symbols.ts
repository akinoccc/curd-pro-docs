import type { Component, InjectionKey, Ref } from 'vue'
import type { CrudRuntime } from '../runtime/types'

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

export const CrudRuntimeSymbol: InjectionKey<CrudRuntime<any, any, any, any, any, any>> = Symbol('fcurd:runtime')

// 表单上下文（可选）：仅在某些 UI 适配层（例如 naive-ui）提供
export const CrudFormModelSymbol: InjectionKey<Record<string, any> | undefined> = Symbol('fcurd:formModel')
export const CrudFormModeSymbol: InjectionKey<Ref<'create' | 'edit'> | undefined> = Symbol('fcurd:formMode')
