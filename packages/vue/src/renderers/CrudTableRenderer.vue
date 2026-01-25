<script setup lang="ts">
import type { CrudTableColumn, UseCrudReturn } from '@fcurd/core'
import { computed } from 'vue'
import { useCrudContext } from '../useCrudContext'

interface CrudTableRendererProps<Row = any> {
  columns?: readonly CrudTableColumn<Row>[]
  crud?: UseCrudReturn<Row>
}

const props = defineProps<CrudTableRendererProps<any>>()

const ctx = useCrudContext<any>()
const crud = (props.crud ?? ctx.crud) as UseCrudReturn<any> | undefined

const columns = computed(() => (props.columns ?? ctx.columns ?? []) as CrudTableColumn<any>[])

const effectiveColumns = computed(() => {
  const all = columns.value
  return all.filter((column) => {
    const field = column.field
    const visible = field.visibleIn?.table
    if (visible === undefined)
      return false
    if (typeof visible === 'boolean')
      return visible
    if (!crud)
      return true
    return visible({
      surface: 'table',
      query: crud.query.value,
      extra: ctx.extra ?? {},
      user: ctx.user,
    } as any)
  })
})
</script>

<template>
  <slot
    :crud="crud"
    :columns="effectiveColumns"
    :selection="ctx.selection"
    :selected-rows="ctx.selectedRows"
    :get-id="ctx.getId"
  />
</template>
