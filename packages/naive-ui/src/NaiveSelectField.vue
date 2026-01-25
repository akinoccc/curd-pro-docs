<script setup lang="ts">
import type { CrudSurface, NaiveCrudField } from './controls'
import { NSelect } from 'naive-ui'
import { computed } from 'vue'
import { resolveNaiveSurfaceProps } from './controls'

interface NaiveSelectFieldProps {
  field?: NaiveCrudField<any, any, 'select'>
  surface?: CrudSurface
}

const props = defineProps<NaiveSelectFieldProps>()
const modelValue = defineModel<string | number | (string | number)[] | null>()

const surface = computed<CrudSurface>(() => props.surface ?? 'form')
const controlProps = computed<Record<string, any>>(() => {
  return resolveNaiveSurfaceProps(props.field?.ui?.control as any, surface.value)
})
</script>

<template>
  <NSelect
    v-model:value="modelValue"
    :placeholder="(controlProps as any).placeholder ?? props.field?.label()"
    v-bind="controlProps"
    style="min-width: 140px;"
  />
</template>
