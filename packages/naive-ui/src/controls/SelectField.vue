<script setup lang="ts">
import type { NaiveCrudField } from '../adapter'
import { NSelect } from 'naive-ui'
import { computed } from 'vue'
import { resolveControlProps } from '../adapter'

interface Props {
  field?: NaiveCrudField
  surface?: 'editForm' | 'searchForm'
}

const props = withDefaults(defineProps<Props>(), {
  surface: 'editForm',
})
const modelValue = defineModel<string | number | (string | number)[] | null>()

const controlProps = computed<Record<string, any>>(() => {
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
</script>

<template>
  <NSelect
    v-model:value="modelValue"
    :placeholder="placeholder"
    v-bind="controlProps"
    style="min-width: 140px;"
  />
</template>
