<script setup lang="ts">
import type { NaiveCrudField } from '../adapter'
import { NSwitch } from 'naive-ui'
import { computed } from 'vue'
import { resolveControlProps } from '../adapter'

interface Props {
  field?: NaiveCrudField
  surface?: 'form' | 'search'
}

const props = withDefaults(defineProps<Props>(), {
  surface: 'form',
})
const modelValue = defineModel<boolean>()

const controlProps = computed(() => {
  if (!props.field)
    return {}
  return resolveControlProps(props.field, props.surface)
})
</script>

<template>
  <NSwitch
    v-model:value="modelValue"
    v-bind="controlProps"
  />
</template>
