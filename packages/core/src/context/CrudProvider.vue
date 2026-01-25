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
import { computed, provide, ref } from 'vue'
import {
  CrudActionsSymbol,
  CrudColumnsSymbol,

  CrudControlMapSymbol,
  CrudExtraSymbol,
  CrudFieldsSymbol,
  CrudGetIdSymbol,
  CrudInstanceSymbol,
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
const selectedRows = computed<any[]>(() => {
  const ids = selection.value
  const list = props.crud?.rows?.value ?? []
  return list.filter((row: any) => ids.has(getId(row)))
})

provide(CrudInstanceSymbol, props.crud)
if (props.fields)
  provide(CrudFieldsSymbol, props.fields as CrudField<any, any>[])
if (props.columns)
  provide(CrudColumnsSymbol, props.columns as CrudTableColumn<any>[])
if (props.user)
  provide(CrudUserSymbol, props.user)
if (props.extra)
  provide(CrudExtraSymbol, props.extra)

provide(CrudControlMapSymbol, props.controlMap)
provide(CrudGetIdSymbol, getId)

if (props.uiDriver)
  provide(CrudUiDriverSymbol, props.uiDriver)

if (props.actions) {
  provide(CrudActionsSymbol, props.actions as any)
}

provide(CrudSelectionSymbol, selection)
provide(CrudSelectedRowsSymbol, selectedRows)
</script>

<template>
  <slot />
</template>
