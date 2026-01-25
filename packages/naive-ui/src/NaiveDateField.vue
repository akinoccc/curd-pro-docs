<script setup lang="ts">
import type { CrudSurface, NaiveCrudField } from './controls'
import { NDatePicker } from 'naive-ui'
import { computed } from 'vue'
import { resolveNaiveSurfaceProps } from './controls'

interface NaiveDateFieldProps {
  field?: NaiveCrudField<any, any, 'date'>
  surface?: CrudSurface
}

const props = defineProps<NaiveDateFieldProps>()
const modelValue = defineModel<string | null>()
const surface = computed<CrudSurface>(() => props.surface ?? 'form')
const controlProps = computed<Record<string, any>>(() => {
  return resolveNaiveSurfaceProps(props.field?.ui?.control as any, surface.value)
})
</script>

<template>
  <NDatePicker
    :value="modelValue ? Date.parse(modelValue) : null"
    :placeholder="(controlProps as any).placeholder ?? field?.label()"
    v-bind="controlProps"
    @update:value="ts => (modelValue = ts ? new Date(ts).toISOString() : null)"
  />
</template>
