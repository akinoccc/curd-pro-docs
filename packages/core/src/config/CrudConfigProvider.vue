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
    actions: {
      ...base.actions,
      ...(patch.actions ?? {}),
      create: {
        ...base.actions.create,
        ...(patch.actions?.create ?? {}),
      },
      export: {
        ...base.actions.export,
        ...(patch.actions?.export ?? {}),
      },
      edit: {
        ...base.actions.edit,
        ...(patch.actions?.edit ?? {}),
      },
      delete: {
        ...base.actions.delete,
        ...(patch.actions?.delete ?? {}),
      },
    },
  }
}

const merged = computed<CrudConfig>(() => mergeCrudConfig(defaultCrudConfig, props.config))

provide(CrudConfigSymbol, merged)
</script>

<template>
  <slot />
</template>
