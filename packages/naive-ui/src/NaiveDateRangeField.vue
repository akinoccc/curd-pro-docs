<script setup lang="ts">
import type { CrudSurface, NaiveCrudField } from './controls'
import { NDatePicker } from 'naive-ui'
import { computed } from 'vue'
import { resolveNaiveSurfaceProps } from './controls'

interface NaiveDateRangeFieldProps {
  field?: NaiveCrudField<any, any, 'dateRange'>
  surface?: CrudSurface
}

const props = defineProps<NaiveDateRangeFieldProps>()
const modelValue = defineModel<[string, string] | null>()

const surface = computed<CrudSurface>(() => props.surface ?? 'form')
const controlProps = computed<Record<string, any>>(() => {
  return resolveNaiveSurfaceProps(props.field?.ui?.control as any, surface.value)
})

const valueTs = computed<[number, number] | null>(() => {
  if (!modelValue.value || modelValue.value.length !== 2)
    return null
  const [start, end] = modelValue.value
  const s = start ? Date.parse(start) : Number.NaN
  const e = end ? Date.parse(end) : Number.NaN
  if (!Number.isFinite(s) || !Number.isFinite(e))
    return null
  return [s, e]
})

function handleUpdate(ts: [number, number] | null): void {
  if (!ts) {
    modelValue.value = null
    return
  }
  modelValue.value = [new Date(ts[0]).toISOString(), new Date(ts[1]).toISOString()]
}
</script>

<template>
  <NDatePicker
    :value="valueTs"
    :placeholder="(controlProps as any).placeholder ?? field?.label()"
    clearable
    v-bind="controlProps"
    @update:value="handleUpdate"
  />
</template>
