import type { CrudControlMap } from '@fcurd/vue'
import NaiveTextField from './NaiveTextField.vue'
import NaiveSelectField from './NaiveSelectField.vue'
import NaiveDateField from './NaiveDateField.vue'
import NaiveNumberField from './NaiveNumberField.vue'

export const naiveControlMap: CrudControlMap = {
  text: NaiveTextField,
  textarea: NaiveTextField,
  select: NaiveSelectField,
  date: NaiveDateField,
  datetime: NaiveDateField,
  number: NaiveNumberField,
  switch: NaiveNumberField,
  money: NaiveNumberField,
  custom: NaiveTextField,
}
