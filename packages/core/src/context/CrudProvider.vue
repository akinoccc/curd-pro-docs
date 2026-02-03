<script setup lang="ts">
import type { CrudRuntime } from '../runtime/types'
import { provideCrudRuntime } from '../runtime/useCrudRuntime'

interface CrudProviderProps {
  runtime: CrudRuntime<any, any, any, any, any, any>
}

const props = defineProps<CrudProviderProps>()

provideCrudRuntime(props.runtime as any)
</script>

<template>
  <slot />
</template>
