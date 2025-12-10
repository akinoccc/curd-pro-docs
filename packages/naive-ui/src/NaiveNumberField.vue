<script setup lang="ts">
import { computed } from 'vue'
import { NInputNumber } from 'naive-ui'
import type { BaseControlProps } from '@fcurd/core'

interface NaiveNumberFieldProps extends BaseControlProps<number | null> {
  min?: number
  max?: number
  step?: number
}

const modelValue = defineModel<number | null>()
const props = defineProps<NaiveNumberFieldProps>()

const controlProps = computed<Record<string, any>>(
  () => props.field.ui?.naiveProps ?? {},
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
