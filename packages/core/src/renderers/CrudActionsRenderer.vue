<script setup lang="ts">
import type { CrudAction, CrudActionArea, CrudActionContext } from '../crud/models'
import { computed } from 'vue'
import { useCrudContext } from '../context/useCrudContext'

interface CrudActionsRendererProps<Row = any> {
  actions?: CrudAction<Row>[]
  area?: CrudActionArea
  row?: Row
}

const props = defineProps<CrudActionsRendererProps<any>>()

const ctx = useCrudContext<any>()

const actionsSource = computed(() => props.actions ?? ctx.actions)

const actionContext = computed<CrudActionContext<any>>(() => {
  return {
    row: props.row,
    selectedRows: (ctx.selectedRows?.value ?? []) as any[],
    selectedIds: (ctx.selectedIds?.value ?? []) as any[],
    clearSelection: ctx.clearSelection,
    query: (ctx.crud?.query.value ?? {}) as Record<string, any>,
    extra: ctx.extra,
  }
})

const effectiveActions = computed<CrudAction<any>[]>(() => {
  const source = actionsSource.value
  const area = props.area
  const list: CrudAction<any>[] = Array.isArray(source)
    ? (area ? source.filter(a => a.area === area) : source)
    : []

  const currentCtx = actionContext.value
  return list.filter((action) => {
    if (typeof action.visible === 'function')
      return Boolean(action.visible(currentCtx))
    return true
  })
})
</script>

<template>
  <slot
    :actions="effectiveActions"
    :ctx="actionContext"
  />
</template>
