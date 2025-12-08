import type { BaseControlProps, SelectControlProps } from '@fcurd/core'

export type NaiveTextFieldProps = BaseControlProps<string | null>
export type NaiveTextareaFieldProps = BaseControlProps<string | null>
export type NaiveSelectFieldProps = SelectControlProps<string | number>
