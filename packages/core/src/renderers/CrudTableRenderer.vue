<script setup lang="ts">
import type { CrudTableColumn, UseCrudReturn } from '../crud/models'
import { computed } from 'vue'
import { useCrudContext } from '../context/useCrudContext'
import { useEffectiveColumns } from '../fields/useEffectiveColumns'
import type { CrudRuntime } from '../runtime/types'

interface CrudTableRendererProps<Row = any> {
  /**
   * Optional: explicitly provide runtime (no Provider needed).
   */
  runtime?: CrudRuntime<Row, any, any, any, any, any>
  columns?: readonly CrudTableColumn<Row>[]
  crud?: UseCrudReturn<Row>
}

const props = defineProps<CrudTableRendererProps<any>>()

const ctx = useCrudContext<any>({ runtime: props.runtime as any })
const crud = (props.crud ?? ctx.crud) as UseCrudReturn<any> | undefined

const columns = computed(() => (props.columns ?? ctx.columns ?? []) as CrudTableColumn<any>[])
const effectiveColumns = useEffectiveColumns<any>({
  runtime: props.runtime as any,
  columns: () => columns.value,
})
</script>

<template>
  <slot
    :crud="crud"
    :columns="effectiveColumns"
    :selection="ctx.selection"
    :selected-ids="ctx.selectedIds"
    :selected-rows="ctx.selectedRows"
    :get-id="ctx.getId"
  />
</template>
