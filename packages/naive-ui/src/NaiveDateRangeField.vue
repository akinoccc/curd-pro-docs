<script setup lang="ts">
import type { BaseControlProps } from '@fcurd/core'
import { NDatePicker } from 'naive-ui'
import { computed } from 'vue'

interface NaiveDateRangeFieldProps extends BaseControlProps<[string, string] | null> {
  type?: 'date' | 'datetime'
}

const props = defineProps<NaiveDateRangeFieldProps>()
const modelValue = defineModel<[string, string] | null>()
const controlProps = computed<Record<string, any>>(
  () => props.field.ui?.naive?.controlProps ?? {},
)

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
    :type="props.type === 'datetime' ? 'datetimerange' : 'daterange'"
    :disabled="props.disabled"
    clearable
    v-bind="controlProps"
    @update:value="handleUpdate"
  />
</template>
