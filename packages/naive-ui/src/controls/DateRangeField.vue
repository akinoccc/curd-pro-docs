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
const modelValue = defineModel<[number, number] | null>()

const controlProps = computed(() => {
  if (!props.field)
    return {}
  return resolveControlProps(props.field, props.surface)
})

const dateType = computed(() => {
  if (props.field?.type === 'datetimeRange')
    return 'datetimerange'
  return 'daterange'
})
</script>

<template>
  <NDatePicker
    v-model:value="modelValue"
    :type="dateType"
    v-bind="controlProps"
  />
</template>
