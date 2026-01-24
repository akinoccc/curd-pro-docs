<script setup lang="ts">
import type {
  CrudAction,
  CrudField,
  CrudTableColumn,
  DictApi,
  DictCenter,
  UseCrudActionsReturn,
  UseCrudReturn,
} from '@fcurd/core'
import type { CrudControlMap } from './symbols'
import { createDictCenter } from '@fcurd/core'
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
  CrudUserSymbol,
  DictApiSymbol,
  DictCenterSymbol,
} from './symbols'

interface CrudProviderProps<Row = any> {
  crud: UseCrudReturn<Row>
  fields?: CrudField<Row, any>[]
  columns?: CrudTableColumn<Row>[]
  actions?: CrudAction<Row>[] | UseCrudActionsReturn<Row>
  user?: { roles: string[] }
  extra?: Record<string, any>
  controlMap: CrudControlMap
  dictApi?: DictApi
  dictCenter?: DictCenter
  getId?: (row: Row) => string | number
}

const props = defineProps<CrudProviderProps<any>>()

const getId = props.getId ?? ((row: any) => row?.id as string | number)
const selection = ref<Set<string | number>>(new Set())
const selectedRows = computed<any[]>(() => {
  const ids = selection.value
  const list = props.crud?.rows?.value ?? []
  return list.filter(row => ids.has(getId(row)))
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

if (props.dictApi)
  provide(DictApiSymbol, props.dictApi)

if (props.dictCenter) {
  provide(DictCenterSymbol, props.dictCenter)
}
else if (props.dictApi) {
  provide(DictCenterSymbol, createDictCenter(props.dictApi))
}

if (props.actions) {
  provide(CrudActionsSymbol, props.actions as any)
}

provide(CrudSelectionSymbol, selection)
provide(CrudSelectedRowsSymbol, selectedRows)
</script>

<template>
  <slot />
</template>
