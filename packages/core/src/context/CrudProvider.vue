<script setup
  lang="ts"
  generic="Row, Query extends Record<string, any> = Record<string, any>, SortField extends string = string"
>
import type {
  CrudAction,
  CrudField,
  CrudTableColumn,
  UseCrudActionsReturn,
  UseCrudReturn,
} from '../crud/models'
import type { CrudUiDriver } from '../ui/ui-driver'
import type { CrudControlMap } from './symbols'
import { computed, provide, ref, shallowRef, watch } from 'vue'
import {
  CrudActionsSymbol,
  CrudColumnsSymbol,

  CrudControlMapSymbol,
  CrudExtraSymbol,
  CrudFieldsSymbol,
  CrudGetIdSymbol,
  CrudInstanceSymbol,
  CrudSelectedIdsSymbol,
  CrudSelectedRowsSymbol,
  CrudSelectionSymbol,
  CrudUiDriverSymbol,
  CrudUserSymbol,
} from './symbols'

interface CrudProviderProps<
  Row = any,
  Query extends Record<string, any> = Record<string, any>,
  SortField extends string = string,
> {
  crud: UseCrudReturn<Row, Query, SortField>
  fields?: readonly CrudField<Row, any>[]
  columns?: readonly CrudTableColumn<Row>[]
  actions?: CrudAction<Row>[] | UseCrudActionsReturn<Row>
  user?: { roles: string[] }
  extra?: Record<string, any>
  controlMap: CrudControlMap
  uiDriver?: CrudUiDriver
  getId?: (row: Row) => string | number
}

const props = defineProps<CrudProviderProps<Row, Query, SortField>>()

const getId = props.getId ?? ((row: any) => row?.id as string | number)
const selection = ref<Set<string | number>>(new Set())
const selectedIds = computed<(string | number)[]>(() => Array.from(selection.value))

// 跨分页 selection：保存 row 快照
const selectedRowMap = shallowRef<Map<string | number, Row>>(new Map())

function syncSelectedRowMap(): void {
  const ids = selection.value
  const map = selectedRowMap.value

  // 移除取消勾选的
  for (const id of Array.from(map.keys())) {
    if (!ids.has(id))
      map.delete(id)
  }

  // 用当前页 rows 补齐/更新已勾选项
  const list = props.crud?.rows?.value ?? []
  for (const row of list as any[]) {
    const id = getId(row as any)
    if (ids.has(id))
      map.set(id, row as any)
  }
}

watch(
  [selectedIds, () => props.crud?.rows?.value],
  () => syncSelectedRowMap(),
  { immediate: true, deep: false },
)

const selectedRows = computed<any[]>(() => {
  const map = selectedRowMap.value
  return selectedIds.value
    .map(id => map.get(id))
    .filter(Boolean) as any[]
})

function clearSelection(): void {
  selection.value = new Set()
  selectedRowMap.value.clear()
}

provide(CrudInstanceSymbol, props.crud)
if (props.fields)
  provide(CrudFieldsSymbol, props.fields as CrudField<any, any>[])
if (props.columns)
  provide(CrudColumnsSymbol, props.columns as CrudTableColumn<any>[])
if (props.user)
  provide(CrudUserSymbol, props.user)
provide(CrudExtraSymbol, {
  ...(props.extra ?? {}),
  selection,
  selectedIds,
  selectedRows,
  clearSelection,
})

provide(CrudControlMapSymbol, props.controlMap)
provide(CrudGetIdSymbol, getId)

if (props.uiDriver)
  provide(CrudUiDriverSymbol, props.uiDriver)

if (props.actions) {
  provide(CrudActionsSymbol, props.actions as any)
}

provide(CrudSelectionSymbol, selection)
provide(CrudSelectedIdsSymbol, selectedIds)
provide(CrudSelectedRowsSymbol, selectedRows)
</script>

<template>
  <slot />
</template>
