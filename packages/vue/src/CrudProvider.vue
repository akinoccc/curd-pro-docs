<script setup lang="ts">
import { provide, ref } from 'vue'
import type {
  CrudAction,
  CrudField,
  CrudTableColumn,
  DictApi,
  UseCrudActionsReturn,
  UseCrudReturn,
} from '@fcurd/core'
import {
  CrudActionsSymbol,
  CrudColumnsSymbol,
  CrudControlMapSymbol,
  CrudExtraSymbol,
  CrudFieldsSymbol,
  CrudInstanceSymbol,
  CrudSelectionSymbol,
  CrudUserSymbol,
  DictApiSymbol,
  type CrudControlMap,
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
}

const props = defineProps<CrudProviderProps<any>>()

const selection = ref<any[]>([])

provide(CrudInstanceSymbol, props.crud)
if (props.fields) provide(CrudFieldsSymbol, props.fields as CrudField<any, any>[])
if (props.columns) provide(CrudColumnsSymbol, props.columns as CrudTableColumn<any>[])
if (props.user) provide(CrudUserSymbol, props.user)
if (props.extra) provide(CrudExtraSymbol, props.extra)

provide(CrudControlMapSymbol, props.controlMap)

if (props.dictApi) provide(DictApiSymbol, props.dictApi)

if (props.actions) {
  provide(CrudActionsSymbol, props.actions as any)
}

provide(CrudSelectionSymbol, selection as any)
</script>

<template>
  <slot />
</template>
