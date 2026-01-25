<script setup lang="ts">
import type { CrudSurface, NaiveCrudField } from './controls'
import { NInputNumber } from 'naive-ui'
import { computed } from 'vue'
import { resolveNaiveSurfaceProps } from './controls'

interface NaiveNumberFieldProps {
  field?: NaiveCrudField<any, any, 'number' | 'money'>
  surface?: CrudSurface
}

const props = defineProps<NaiveNumberFieldProps>()
const modelValue = defineModel<number | null>()
const surface = computed<CrudSurface>(() => props.surface ?? 'form')
const controlProps = computed<Record<string, any>>(() => {
  return resolveNaiveSurfaceProps(props.field?.ui?.control as any, surface.value)
})
</script>

<template>
  <NInputNumber
    v-model:value="modelValue"
    :placeholder="(controlProps as any).placeholder ?? field?.label()"
    v-bind="controlProps"
  />
</template>
