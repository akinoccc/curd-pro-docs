<script setup lang="ts">
import { NDatePicker } from 'naive-ui'
import type { BaseControlProps } from '@fcurd/core'

interface NaiveDateFieldProps extends BaseControlProps<string | null> {
  type?: 'date' | 'datetime'
}

const props = defineProps<NaiveDateFieldProps>()
</script>

<template>
  <NDatePicker
    :value="props.modelValue ? Date.parse(props.modelValue) : null"
    :type="props.type === 'datetime' ? 'datetime' : 'date'"
    :disabled="props.disabled"
    :placeholder="props.placeholder ?? props.field.label()"
    @update:value="ts => props['onUpdate:modelValue'](ts ? new Date(ts).toISOString() : null)"
  />
</template>
