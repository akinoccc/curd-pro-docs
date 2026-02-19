<script setup lang="ts">
import type { NaiveCrudField } from '../adapter'
import { NDatePicker } from 'naive-ui'
import { computed } from 'vue'
import { resolveControlProps } from '../adapter'

interface Props {
  field?: NaiveCrudField
  surface?: 'form' | 'search'
}

const props = withDefaults(defineProps<Props>(), {
  surface: 'form',
})
const modelValue = defineModel<number | null>()

const controlProps = computed(() => {
  if (!props.field)
    return {}
  return resolveControlProps(props.field, props.surface)
})

const dateType = computed(() => {
  if (props.field?.type === 'datetime')
    return 'datetime'
  return 'date'
})

const placeholder = computed(() => {
  const raw = controlProps.value.placeholder
  if (typeof raw === 'string')
    return raw
  if (props.field) {
    const label = typeof props.field.label === 'function' ? props.field.label() : props.field.label
    return label
  }
  return undefined
})
</script>

<template>
  <NDatePicker
    v-model:value="modelValue"
    :type="dateType"
    :placeholder="placeholder"
    v-bind="controlProps"
  />
</template>
