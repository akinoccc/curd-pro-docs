import type { BaseControlProps, CrudField, SelectControlProps } from '@fcurd/core'
import type { DatePickerProps, FormItemProps, InputNumberProps, InputProps, SelectProps, SwitchProps } from 'naive-ui'
import type { Component } from 'vue'

type CrudFieldType = CrudField<any, any, any>['type']

export type NaiveTextFieldProps = Omit<BaseControlProps<string | null>, 'field'> & {
  field: NaiveCrudField<any, any, 'text' | 'textarea'>
}
export type NaiveTextareaFieldProps = NaiveTextFieldProps
export type NaiveSelectFieldProps = Omit<SelectControlProps<string | number>, 'field'> & {
  field: NaiveCrudField<any, any, 'select'>
}

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
}

export type NaiveFieldUi<TType extends CrudFieldType = CrudFieldType> = NaiveFieldUiBase & {
  control?: TType extends keyof NaiveControlPropsMap ? NaiveControlPropsMap[TType] : Record<string, any>
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
  const Fields extends readonly NaiveCrudFieldUnion<Row, FormModel>[] = readonly NaiveCrudFieldUnion<Row, FormModel>[],
>(
  fields: Fields,
): Fields {
  return fields
}
