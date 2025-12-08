<script setup lang="ts">
import { NInput } from 'naive-ui'
import type { NaiveTextFieldProps } from './controls'

const props = defineProps<NaiveTextFieldProps>()
</script>

<template>
  <NInput
    :value="props.modelValue ?? ''"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :placeholder="props.placeholder ?? props.field.label()"
    @update:value="val => props['onUpdate:modelValue'](val)"
  />
</template>
