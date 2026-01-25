<script setup lang="ts">
import type { CrudSurface, NaiveCrudField } from './controls'
import { NSwitch } from 'naive-ui'
import { computed } from 'vue'
import { resolveNaiveSurfaceProps } from './controls'

interface NaiveSwitchFieldProps {
  field?: NaiveCrudField<any, any, 'switch'>
  surface?: CrudSurface
}

const props = defineProps<NaiveSwitchFieldProps>()
const modelValue = defineModel<boolean | null>()
const surface = computed<CrudSurface>(() => props.surface ?? 'form')
const controlProps = computed<Record<string, any>>(() => {
  return resolveNaiveSurfaceProps(props.field?.ui?.control as any, surface.value)
})
</script>

<template>
  <NSwitch
    :value="modelValue ?? false"
    v-bind="controlProps"
    @update:value="v => (modelValue = v)"
  />
</template>
