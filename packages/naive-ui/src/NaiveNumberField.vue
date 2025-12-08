<script setup lang="ts">
import { NInputNumber } from 'naive-ui'
import type { BaseControlProps } from '@fcurd/core'

interface NaiveNumberFieldProps extends BaseControlProps<number | null> {
  min?: number
  max?: number
  step?: number
}

const props = defineProps<NaiveNumberFieldProps>()
</script>

<template>
  <NInputNumber
    :value="props.modelValue ?? null"
    :min="props.min"
    :max="props.max"
    :step="props.step"
    :disabled="props.disabled"
    :placeholder="props.placeholder ?? props.field.label()"
    @update:value="val => props['onUpdate:modelValue'](val as number | null)"
  />
</template>
