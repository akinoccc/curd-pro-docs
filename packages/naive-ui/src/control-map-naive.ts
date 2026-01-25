import type { CrudControlMap } from '@fcurd/core'
import NaiveDateField from './NaiveDateField.vue'
import NaiveDateRangeField from './NaiveDateRangeField.vue'
import NaiveNumberField from './NaiveNumberField.vue'
import NaiveSelectField from './NaiveSelectField.vue'
import NaiveSwitchField from './NaiveSwitchField.vue'
import NaiveTextField from './NaiveTextField.vue'

export const naiveControlMap: CrudControlMap = {
  text: NaiveTextField,
  textarea: NaiveTextField,
  select: NaiveSelectField,
  date: NaiveDateField,
  datetime: NaiveDateField,
  dateRange: NaiveDateRangeField,
  datetimeRange: NaiveDateRangeField,
  number: NaiveNumberField,
  switch: NaiveSwitchField,
  money: NaiveNumberField,
  custom: NaiveTextField,
}
