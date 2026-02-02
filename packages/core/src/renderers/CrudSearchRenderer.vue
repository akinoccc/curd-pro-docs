<script setup lang="ts">
import type { CrudField, UseCrudReturn } from '@fcurd/core'
import type { CrudSearchCodec } from '../search/useCrudSearchRouteSync'
import { reactive } from 'vue'
import { useCrudContext } from '../context/useCrudContext'
import { useEffectiveFields } from '../fields/useEffectiveFields'
import { useCrudSearchRouteSync } from '../search/useCrudSearchRouteSync'
import type { CrudController } from '../controller/useCrudController'

interface CrudSearchRendererProps<Row = any> {
  /**
   * Optional: explicitly provide controller (no Provider needed).
   */
  controller?: CrudController<Row, any, any>
  /**
   * 搜索字段来源（未传则使用 CrudProvider 注入的 fields）
   */
  fields?: readonly CrudField<Row, any>[]
  /**
   * 可选：外部传入 reactive formModel（便于业务侧持有引用）
   */
  formModel?: Record<string, any>
  /**
   * 可选：指定 crud（未传则使用 CrudProvider 注入）
   */
  crud?: UseCrudReturn<Row>
  /**
   * queryKey（默认：search）
   */
  queryKey?: string
  /**
   * clear 策略（默认：null）
   */
  clearMode?: 'null' | 'delete'
  /**
   * search 编解码（默认 JSON）
   */
  codec?: CrudSearchCodec
}

const props = defineProps<CrudSearchRendererProps<any>>()

const ctx = useCrudContext<any>({ controller: props.controller as any })
const crud = (props.crud ?? ctx.crud) as UseCrudReturn<any> | undefined

const effectiveFields = useEffectiveFields<any, any>({
  surface: 'search',
  controller: props.controller as any,
  fields: () => (props.fields ?? ctx.fields ?? []) as readonly CrudField<any, any>[],
  query: () => (crud?.query.value ?? {}) as Record<string, any>,
})

const formModel = (props.formModel ?? reactive<Record<string, any>>({})) as Record<string, any>

const { handleSubmit, handleReset } = useCrudSearchRouteSync({
  crud,
  fields: () => effectiveFields.value as CrudField<any, any>[],
  formModel,
  queryKey: props.queryKey ?? 'search',
  clearMode: props.clearMode ?? 'null',
  codec: props.codec,
})
</script>

<template>
  <slot
    :crud="crud"
    :form-model="formModel"
    :fields="effectiveFields"
    :submit="handleSubmit"
    :reset="handleReset"
  />
</template>
