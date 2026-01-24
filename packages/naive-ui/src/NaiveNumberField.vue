<script setup lang="ts">
import type { BaseControlProps } from '@fcurd/core'
import { NInputNumber } from 'naive-ui'
import { computed } from 'vue'

interface NaiveNumberFieldProps extends BaseControlProps<number | null> {
  min?: number
  max?: number
  step?: number
}

const props = defineProps<NaiveNumberFieldProps>()
const modelValue = defineModel<number | null>()
const controlProps = computed<Record<string, any>>(
  () => props.field.ui?.control ?? {},
)
</script>

<template>
  <NInputNumber
    v-model:value="modelValue"
    :min="props.min"
    :max="props.max"
    :step="props.step"
    :disabled="props.disabled"
    :placeholder="props.placeholder ?? props.field.label()"
    v-bind="controlProps"
  />
</template>
