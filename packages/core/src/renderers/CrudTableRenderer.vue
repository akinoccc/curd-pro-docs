<script setup lang="ts">
import type { CrudTableColumn, UseCrudReturn } from '../crud/models'
import { computed } from 'vue'
import { useCrudContext } from '../context/useCrudContext'
import { useEffectiveColumns } from '../fields/useEffectiveColumns'
import type { CrudController } from '../controller/useCrudController'

interface CrudTableRendererProps<Row = any> {
  /**
   * Optional: explicitly provide controller (no Provider needed).
   */
  controller?: CrudController<Row, any, any>
  columns?: readonly CrudTableColumn<Row>[]
  crud?: UseCrudReturn<Row>
}

const props = defineProps<CrudTableRendererProps<any>>()

const ctx = useCrudContext<any>({ controller: props.controller as any })
const crud = (props.crud ?? ctx.crud) as UseCrudReturn<any> | undefined

const columns = computed(() => (props.columns ?? ctx.columns ?? []) as CrudTableColumn<any>[])
const effectiveColumns = useEffectiveColumns<any>({
  controller: props.controller as any,
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
