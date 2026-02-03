<script setup lang="ts">
import type { CrudField } from '../crud/models'
import type { CrudRuntime } from '../runtime/types'
import { computed, provide, reactive, ref, watch } from 'vue'
import { CrudFormModelSymbol, CrudFormModeSymbol } from '../context/symbols'
import { useCrudContext } from '../context/useCrudContext'
import { useEffectiveFields } from '../fields/useEffectiveFields'

interface CrudFormRendererProps<Row = any> {
  /**
   * Optional: explicitly provide runtime (no Provider needed).
   */
  runtime?: CrudRuntime<Row, any, any, any, any, any>
  row?: Row | null
  fields?: CrudField<Row, Row>[]
}

interface CrudFormRendererEmits<Row = any> {
  (e: 'formModelReady', model: Row, mode: 'create' | 'edit'): void
}

const props = defineProps<CrudFormRendererProps<any>>()
const emit = defineEmits<CrudFormRendererEmits<any>>()

const ctx = useCrudContext<any>({ runtime: props.runtime as any })

const mode = computed<'create' | 'edit'>(() => (props.row ? 'edit' : 'create'))

const formModel = reactive<Record<string, any>>({})

provide(CrudFormModelSymbol, formModel)
provide(CrudFormModeSymbol, mode as any)

const initialSnapshot = ref<Record<string, any>>({})

function resetSnapshot(): void {
  initialSnapshot.value = { ...formModel }
}

const changedKeys = computed<string[]>(() => {
  const before = initialSnapshot.value ?? {}
  const after = formModel

  const keys = new Set<string>([
    ...Object.keys(before),
    ...Object.keys(after),
  ])

  const changed: string[] = []
  keys.forEach((key) => {
    const a = (before as any)[key]
    const b = (after as any)[key]
    if (a !== b)
      changed.push(key)
  })
  return changed
})

const changedData = computed<Record<string, any>>(() => {
  const after = formModel
  const data: Record<string, any> = {}
  for (const key of changedKeys.value)
    data[key] = (after as any)[key]
  return data
})

const dirty = computed<boolean>(() => changedKeys.value.length > 0)

function initFormModel(): void {
  Object.keys(formModel).forEach((key) => {
    delete formModel[key]
  })
  if (props.row)
    Object.assign(formModel, props.row)
  resetSnapshot()
  emit('formModelReady', formModel as any, mode.value)
}

watch(
  () => props.row,
  () => initFormModel(),
  { immediate: true },
)

const effectiveFields = useEffectiveFields<any, any>({
  surface: 'form',
  runtime: props.runtime as any,
  fields: () => (props.fields ?? ctx.fields ?? []) as CrudField<any, any>[],
  row: () => (props.row ?? undefined) as any,
  formModel: () => formModel,
  query: () => (ctx.crud?.query.value ?? {}) as Record<string, any>,
})
</script>

<template>
  <slot
    :mode="mode"
    :form-model="formModel"
    :fields="effectiveFields"
    :init-form-model="initFormModel"
    :dirty="dirty"
    :changed-keys="changedKeys"
    :changed-data="changedData"
    :reset-snapshot="resetSnapshot"
  />
</template>
