<script setup lang="ts">
import type { CrudSurface, NaiveCrudField } from './controls'
import { NInput } from 'naive-ui'
import { computed } from 'vue'
import { resolveNaiveSurfaceProps } from './controls'

interface NaiveTextFieldProps {
  field?: NaiveCrudField<any, any, 'text' | 'textarea'>
  surface?: CrudSurface
}

const props = defineProps<NaiveTextFieldProps>()
const modelValue = defineModel<string | null>()
const surface = computed<CrudSurface>(() => props.surface ?? 'form')
const controlProps = computed<Record<string, any>>(() => {
  return resolveNaiveSurfaceProps(props.field?.ui?.control as any, surface.value)
})
</script>

<template>
  <NInput
    v-model:value="modelValue"
    :placeholder="(controlProps as any).placeholder ?? field?.label()"
    :autosize="field?.type === 'textarea'"
    :resizable="field?.type === 'textarea'"
    :type="field?.type === 'textarea' ? 'textarea' : 'text'"
    v-bind="controlProps"
  />
</template>
