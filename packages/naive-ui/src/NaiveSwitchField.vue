<script setup lang="ts">
import type { BaseControlProps } from '@fcurd/core'
import { NSwitch } from 'naive-ui'
import { computed } from 'vue'

interface NaiveSwitchFieldProps extends BaseControlProps<boolean | null> {}

const props = defineProps<NaiveSwitchFieldProps>()
const modelValue = defineModel<boolean | null>()
const controlProps = computed<Record<string, any>>(
  () => props.field.ui?.naive?.controlProps ?? {},
)
</script>

<template>
  <NSwitch
    :value="modelValue ?? false"
    :disabled="props.disabled"
    v-bind="controlProps"
    @update:value="v => (modelValue = v)"
  />
</template>
