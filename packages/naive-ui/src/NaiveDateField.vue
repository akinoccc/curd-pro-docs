<script setup lang="ts">
import { computed } from 'vue'
import { NDatePicker } from 'naive-ui'
import type { BaseControlProps } from '@fcurd/core'

interface NaiveDateFieldProps extends BaseControlProps<string | null> {
  type?: 'date' | 'datetime'
}

const modelValue = defineModel<string | null>()
const props = defineProps<NaiveDateFieldProps>()

const controlProps = computed<Record<string, any>>(
  () => props.field.ui?.naiveProps ?? {},
)
</script>

<template>
  <NDatePicker
    :value="modelValue ? Date.parse(modelValue) : null"
    :type="props.type === 'datetime' ? 'datetime' : 'date'"
    :disabled="props.disabled"
    :placeholder="props.placeholder ?? props.field.label()"
    v-bind="controlProps"
    @update:value="ts => (modelValue = ts ? new Date(ts).toISOString() : null)"
  />
</template>
