import type { ComputedRef } from 'vue'
import type { CrudConfig } from './symbols'
import { computed, inject } from 'vue'
import { CrudConfigSymbol, defaultCrudConfig } from './symbols'

export function useCrudConfig(): ComputedRef<CrudConfig> {
  const injected = inject(CrudConfigSymbol, undefined)
  return computed(() => injected?.value ?? defaultCrudConfig)
}
