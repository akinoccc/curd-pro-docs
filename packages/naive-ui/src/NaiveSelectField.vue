<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue'
import { NSelect } from 'naive-ui'
import type { NaiveSelectFieldProps } from './controls'
import { DictApiSymbol } from '@fcurd/vue'
import { useDict } from '@fcurd/core'

const modelValue = defineModel<string | number | (string | number)[] | null>()
const props = defineProps<NaiveSelectFieldProps>()

const dictApi = inject(DictApiSymbol)
const optionsRef = ref(props.options)
const loading = ref(false)

const controlProps = computed<Record<string, any>>(
  () => props.field.ui?.naiveProps ?? {},
)

onMounted(async () => {
  if (!dictApi || !props.field.dictKey) return
  const { load } = useDict(dictApi)
  loading.value = true
  try {
    const { options } = await load(props.field.dictKey)
    optionsRef.value = options.value
  }
  finally {
    loading.value = false
  }
})
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
  />
</template>
