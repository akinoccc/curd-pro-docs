<script setup lang="ts">
import type { DictItem } from '@fcurd/core'
import type { NaiveSelectFieldProps } from './controls'
import { DictCenterSymbol } from '@fcurd/vue'
import { NSelect } from 'naive-ui'
import { computed, inject, ref, watch } from 'vue'

const props = defineProps<NaiveSelectFieldProps>()
const modelValue = defineModel<string | number | (string | number)[] | null>()
const dictCenter = inject(DictCenterSymbol)
const optionsRef = ref<DictItem[]>(props.options ?? [])
const loading = ref(false)
const error = ref<unknown | null>(null)

const controlProps = computed<Record<string, any>>(
  () => props.field.ui?.naive?.controlProps ?? {},
)

watch(
  () => [props.field.dictKey, props.options] as const,
  async () => {
    error.value = null
    if (!props.field.dictKey || !dictCenter) {
      optionsRef.value = props.options ?? []
      return
    }
    loading.value = true
    try {
      const { options, error: dictError } = await dictCenter.load(props.field.dictKey)
      optionsRef.value = options.value
      error.value = dictError.value
    }
    finally {
      loading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <NSelect
    v-model:value="modelValue"
    :options="optionsRef"
    :multiple="props.multiple"
    :clearable="props.clearable"
    :disabled="props.disabled"
    :placeholder="props.placeholder ?? props.field.label()"
    :loading="loading"
    v-bind="controlProps"
    style="min-width: 120px;"
  />
</template>
