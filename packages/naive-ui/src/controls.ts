import type { CrudField } from '@fcurd/core'
import type { DatePickerProps, FormItemProps, InputNumberProps, InputProps, SelectProps, SwitchProps } from 'naive-ui'
import type { Component } from 'vue'

export type CrudFieldType = CrudField<any, any, any>['type']
export type CrudSurface = 'form' | 'search' | 'table' | 'detail'

export interface NaivePropsBySurface<T extends Record<string, any> = Record<string, any>> {
  form?: T
  search?: T
  table?: T
  detail?: T
}

export type NaiveSurfaceProps<T extends Record<string, any> = Record<string, any>>
  = T | NaivePropsBySurface<T>

/**
 * naive-ui 适配层字段 UI 配置（业务侧直接写在 field.ui 上）
 *
 * 目标：只记一个入口，不用区分 “controlProps / formItemProps / searchItemProps / columnProps” 等概念。
 */
interface NaiveControlPropsMap {
  text: Partial<InputProps>
  textarea: Partial<InputProps>
  select: Partial<SelectProps>
  date: Partial<DatePickerProps>
  datetime: Partial<DatePickerProps>
  dateRange: Partial<DatePickerProps>
  datetimeRange: Partial<DatePickerProps>
  number: Partial<InputNumberProps>
  money: Partial<InputNumberProps>
  switch: Partial<SwitchProps>
  custom: Record<string, any>
}

export interface NaiveFieldUiBase {
  /**
   * 容器层 props（透传给 NFormItem）
   *
   * - 表单场景：可直接透传 Naive 的 `FormItemProps`，例如在 `form.rule` 里放单条校验规则
   * - 搜索场景：同理透传到 `search`
   */
  formItem?: {
    form?: Partial<FormItemProps>
    search?: Partial<FormItemProps>
  }
  /**
   * 覆盖默认的控件组件（覆盖 field.type -> controlMap 的映射）
   */
  component?: Component | any
  /**
   * 是否将 `field` 作为 prop 传给控件组件
   * - 默认不传：当 component 是三方组件时，避免把 field 当作 attrs 透传到更底层
   * - 若自定义控件需要字段元信息，可显式开启
   *
   * 注意：内置控件（naiveControlMap）默认仍会收到 field。
   */
  passField?: boolean
}

export type NaiveFieldUi<TType extends CrudFieldType = CrudFieldType> = NaiveFieldUiBase & {
  /**
   * 控件层 props（透传给具体控件组件）
   * - 支持：对象（全场景通用）
   * - 支持：按场景拆分的对象（form/search/...）
   */
  control?:
    | NaiveSurfaceProps<(TType extends keyof NaiveControlPropsMap ? NaiveControlPropsMap[TType] : Record<string, any>) & Record<string, any>>
  /**
   * 表格列级别的 naive-ui DataTableColumn 透传配置
   * 说明：这里保持 any，避免在 core 层耦合 naive-ui 的类型。
   */
  column?: Record<string, any>
}

export type NaiveCrudField<Row = any, FormModel = any, TType extends CrudFieldType = CrudFieldType>
  = CrudField<Row, FormModel, NaiveFieldUi<TType>> & { type: TType }

export type NaiveCrudFieldUnion<Row = any, FormModel = any> = {
  [K in CrudFieldType]: NaiveCrudField<Row, FormModel, K>
}[CrudFieldType]

/**
 * 帮助函数：让业务侧在不改 core 的情况下获得 field.ui 的类型推断与补全
 */
export function defineNaiveField<Row = any, FormModel = any, TType extends CrudFieldType = CrudFieldType>(
  field: NaiveCrudField<Row, FormModel, TType>,
): NaiveCrudField<Row, FormModel, TType> {
  return field
}

export function defineNaiveFields<
  Row = any,
  FormModel = any,
  const Fields extends NaiveCrudFieldUnion<Row, FormModel>[] = NaiveCrudFieldUnion<Row, FormModel>[],
>(
  fields: Fields,
): Fields {
  return fields
}

function isSurfaceProps(value: any): value is NaivePropsBySurface<any> {
  if (!value || typeof value !== 'object')
    return false
  return 'form' in value || 'search' in value || 'table' in value || 'detail' in value
}

export function resolveNaiveSurfaceProps(
  props: NaiveSurfaceProps<any> | undefined,
  surface: CrudSurface,
): Record<string, any> {
  if (!props)
    return {}
  if (isSurfaceProps(props))
    return (props as any)[surface] ?? {}
  return props as any
}
