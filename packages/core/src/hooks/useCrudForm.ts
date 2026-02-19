import type { CrudField, FieldContext, UseCrudFormOptions, UseCrudFormReturn } from '../types'
import { computed, reactive, ref } from 'vue'

/**
 * Core hook for CRUD form state management
 */
export function useCrudForm<Row = any>(
  options: UseCrudFormOptions<Row>,
): UseCrudFormReturn<Row> {
  const { fields, initialData } = options

  // State
  const model = reactive<Partial<Row>>({}) as Partial<Row>
  const mode = ref<'create' | 'edit'>('create')
  const initialSnapshot = ref<Partial<Row>>({})

  // Initialize model
  function initModel(data?: Partial<Row>): void {
    // Clear existing
    Object.keys(model).forEach((key) => {
      delete (model as Record<string, unknown>)[key]
    })
    // Apply new data
    if (data) {
      Object.assign(model, data)
    }
    // Take snapshot
    initialSnapshot.value = { ...model }
  }

  // Initialize with initialData if provided
  if (initialData) {
    initModel(initialData)
  }

  // Computed: changed keys
  const changedKeys = computed<string[]>(() => {
    const before = initialSnapshot.value ?? {}
    const after = model as Record<string, unknown>
    const keys = new Set<string>([
      ...Object.keys(before),
      ...Object.keys(after),
    ])

    const changed: string[] = []
    keys.forEach((key) => {
      const a = (before as Record<string, unknown>)[key]
      const b = after[key]
      if (a !== b)
        changed.push(key)
    })
    return changed
  })

  // Computed: changed data (only changed fields)
  const changedData = computed<Partial<Row>>(() => {
    const after = model as Record<string, unknown>
    const data: Record<string, unknown> = {}
    for (const key of changedKeys.value)
      data[key] = after[key]
    return data as Partial<Row>
  })

  // Computed: dirty flag
  const dirty = computed<boolean>(() => changedKeys.value.length > 0)

  // Computed: visible fields (filtered by visibleIn.form)
  const visibleFields = computed<CrudField<Row>[]>(() => {
    return fields.filter((field) => {
      const formVisible = field.visibleIn?.form
      if (formVisible === undefined || formVisible === true)
        return true
      if (formVisible === false)
        return false
      if (typeof formVisible === 'function') {
        const ctx: FieldContext<Row, any> = {
          surface: 'form',
          formModel: model,
        }
        return formVisible(ctx as any)
      }
      return true
    })
  })

  // Actions
  function reset(data?: Partial<Row>): void {
    initModel(data)
  }

  function setMode(newMode: 'create' | 'edit'): void {
    mode.value = newMode
  }

  function getSubmitData(): Partial<Row> {
    // create: return full model
    // edit: return only changed data
    if (mode.value === 'create') {
      return { ...model } as Partial<Row>
    }
    return changedData.value
  }

  return {
    model: model as UseCrudFormReturn<Row>['model'],
    mode,
    dirty,
    changedKeys,
    changedData,
    visibleFields,
    reset,
    setMode,
    getSubmitData,
  }
}
