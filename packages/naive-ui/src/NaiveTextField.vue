<script setup lang="ts">
import { computed } from 'vue'
import { NInput } from 'naive-ui'
import type { NaiveTextFieldProps } from './controls'

const modelValue = defineModel<string | null>()
const props = defineProps<NaiveTextFieldProps>()

const controlProps = computed<Record<string, any>>(
  () => props.field.ui?.naiveProps ?? {},
)
</script>

<template>
  <NInput
    v-model:value="modelValue"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :placeholder="props.placeholder ?? props.field.label()"
    v-bind="controlProps"
  />
</template>
