<script setup lang="ts">
import type { NaiveCrudField } from '../adapter'
import { NInput } from 'naive-ui'
import { computed } from 'vue'
import { resolveControlProps } from '../adapter'

interface Props {
  field?: NaiveCrudField
  surface?: 'form' | 'search'
}

const props = withDefaults(defineProps<Props>(), {
  surface: 'form',
})
const modelValue = defineModel<string | null>()

const controlProps = computed(() => {
  if (!props.field)
    return {}
  return resolveControlProps(props.field, props.surface)
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

const isTextarea = computed(() => props.field?.type === 'textarea')
</script>

<template>
  <NInput
    v-model:value="modelValue"
    :placeholder="placeholder"
    :type="isTextarea ? 'textarea' : 'text'"
    :autosize="isTextarea"
    :resizable="isTextarea"
    v-bind="controlProps"
  />
</template>
