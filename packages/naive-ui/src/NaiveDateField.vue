<script setup lang="ts">
import type { BaseControlProps } from '@fcurd/core'
import { NDatePicker } from 'naive-ui'
import { computed } from 'vue'

interface NaiveDateFieldProps extends BaseControlProps<string | null> {
  type?: 'date' | 'datetime'
}

const props = defineProps<NaiveDateFieldProps>()
const modelValue = defineModel<string | null>()
const controlProps = computed<Record<string, any>>(
  () => props.field.ui?.naive?.controlProps ?? {},
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
