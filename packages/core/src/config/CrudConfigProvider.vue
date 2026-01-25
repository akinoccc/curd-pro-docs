<script setup lang="ts">
import type { CrudConfig, CrudConfigPatch } from './symbols'
import { computed, provide } from 'vue'
import { CrudConfigSymbol, defaultCrudConfig } from './symbols'

interface CrudConfigProviderProps {
  /**
   * 覆盖/扩展默认配置
   */
  config?: CrudConfigPatch
}

const props = defineProps<CrudConfigProviderProps>()

function mergeCrudConfig(base: CrudConfig, patch?: CrudConfigPatch): CrudConfig {
  if (!patch)
    return base
  return {
    ...base,
    date: {
      ...base.date,
      ...(patch.date ?? {}),
    },
  }
}

const merged = computed<CrudConfig>(() => mergeCrudConfig(defaultCrudConfig, props.config))

provide(CrudConfigSymbol, merged)
</script>

<template>
  <slot />
</template>
