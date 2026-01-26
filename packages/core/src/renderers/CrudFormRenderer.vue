<script setup lang="ts">
import type { CrudField } from '../crud/models'
import { computed, provide, reactive, watch } from 'vue'
import { CrudFormModelSymbol, CrudFormModeSymbol } from '../context/symbols'
import { useCrudContext } from '../context/useCrudContext'
import { useEffectiveFields } from '../fields/useEffectiveFields'

interface CrudFormRendererProps<Row = any> {
  row?: Row | null
  fields?: readonly CrudField<Row, Row>[]
}

interface CrudFormRendererEmits<Row = any> {
  (e: 'formModelReady', model: Row, mode: 'create' | 'edit'): void
}

const props = defineProps<CrudFormRendererProps<any>>()
const emit = defineEmits<CrudFormRendererEmits<any>>()

const ctx = useCrudContext<any>()

const mode = computed<'create' | 'edit'>(() => (props.row ? 'edit' : 'create'))

const formModel = reactive<Record<string, any>>({})

provide(CrudFormModelSymbol, formModel)
provide(CrudFormModeSymbol, mode as any)

function initFormModel(): void {
  Object.keys(formModel).forEach((key) => {
    delete formModel[key]
  })
  if (props.row)
    Object.assign(formModel, props.row)
  emit('formModelReady', formModel as any, mode.value)
}

watch(
  () => props.row,
  () => initFormModel(),
  { immediate: true },
)

const effectiveFields = useEffectiveFields<any, any>({
  surface: 'form',
  fields: () => (props.fields ?? ctx.fields ?? []) as readonly CrudField<any, any>[],
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
  />
</template>
