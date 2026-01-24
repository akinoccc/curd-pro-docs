<script setup lang="ts">
import type { NaiveTextFieldProps } from './controls'
import { NInput } from 'naive-ui'
import { computed } from 'vue'

const props = defineProps<NaiveTextFieldProps>()
const modelValue = defineModel<string | null>()
const controlProps = computed<Record<string, any>>(
  () => props.field.ui?.naive?.controlProps ?? {},
)

const inputType = computed(() => {
  switch (props.field.type) {
    case 'textarea':
      return 'textarea'
    default:
      return 'text'
  }
})
</script>

<template>
  <NInput
    v-model:value="modelValue"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :placeholder="props.placeholder ?? props.field.label()"
    :autosize="props.field.type === 'textarea'"
    :resizable="props.field.type === 'textarea'"
    :type="inputType"
    v-bind="controlProps"
  />
</template>
