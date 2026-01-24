import type { CrudField, CrudFieldRule, CrudRuleTrigger } from './models'

export interface ValidateFieldsOptions {
  mode?: 'create' | 'edit'
  trigger?: CrudRuleTrigger
}

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string[]>
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined)
    return []
  return Array.isArray(value) ? value : [value]
}

function isEmptyValue(value: any): boolean {
  if (value === null || value === undefined)
    return true
  if (typeof value === 'string')
    return value.trim() === ''
  if (Array.isArray(value))
    return value.length === 0
  return false
}

function matchTrigger(rule: CrudFieldRule<any, any>, trigger?: CrudRuleTrigger): boolean {
  if (!trigger)
    return true
  const ruleTriggers = toArray(rule.trigger)
  if (ruleTriggers.length === 0)
    return true
  return ruleTriggers.includes(trigger)
}

export function normalizeFieldRules<Row, FormModel>(
  field: CrudField<Row, FormModel>,
  mode: 'create' | 'edit',
): CrudFieldRule<Row, FormModel>[] {
  const rules: CrudFieldRule<Row, FormModel>[] = []
  if (field.required) {
    rules.push({
      required: true,
      message: `${field.label()}为必填项`,
      trigger: ['change', 'submit'],
    })
  }
  if (field.rules?.length) {
    rules.push(...field.rules)
  }
  // 允许根据模式定制校验（目前未使用 mode，但预留扩展）
  return rules
}

export async function validateFields<Row, FormModel>(
  fields: CrudField<Row, FormModel>[],
  model: Record<string, any>,
  options?: ValidateFieldsOptions,
): Promise<ValidationResult> {
  const { mode = 'create', trigger } = options ?? {}
  const errors: Record<string, string[]> = {}

  for (const field of fields) {
    const value = model[field.key]
    const rules = normalizeFieldRules(field, mode).filter(rule => matchTrigger(rule, trigger))

    for (const rule of rules) {
      const messages = errors[field.key] || []
      const message = rule.message ?? `${field.label()}不合法`

      if (rule.required && isEmptyValue(value)) {
        messages.push(message)
        errors[field.key] = messages
        continue
      }

      if (rule.validator) {
        const result = await rule.validator({
          value,
          model,
          field,
          mode,
        })
        if (result === true || result === undefined)
          continue
        if (result === false) {
          messages.push(message)
          errors[field.key] = messages
          continue
        }
        if (typeof result === 'string') {
          messages.push(result)
          errors[field.key] = messages
          continue
        }
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
