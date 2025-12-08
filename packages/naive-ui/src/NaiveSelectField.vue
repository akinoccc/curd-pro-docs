<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
import { NSelect } from 'naive-ui'
import type { NaiveSelectFieldProps } from './controls'
import { DictApiSymbol } from '@fcurd/vue'
import { useDict } from '@fcurd/core'

const props = defineProps<NaiveSelectFieldProps>()

const dictApi = inject(DictApiSymbol)
const optionsRef = ref(props.options)
const loading = ref(false)

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
    :value="props.modelValue"
    :options="optionsRef"
    :multiple="props.multiple"
    :clearable="props.clearable"
    :disabled="props.disabled"
    :placeholder="props.placeholder ?? props.field.label()"
    :loading="loading"
    @update:value="val => props['onUpdate:modelValue'](val as any)"
  />
</template>
