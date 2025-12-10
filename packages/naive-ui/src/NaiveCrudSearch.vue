<script setup lang="ts">
import { computed, inject, reactive } from 'vue'
import type { CrudField, UseCrudReturn } from '@fcurd/core'
import {
  CrudControlMapSymbol,
  CrudFieldsSymbol,
  CrudInstanceSymbol,
} from '@fcurd/vue'
import { NButton, NForm, NFormItem, NSpace } from 'naive-ui'

interface NaiveCrudSearchProps<Row = any> {
  fields?: CrudField<Row, any>[]
  formProps?: Record<string, any>
}

const props = defineProps<NaiveCrudSearchProps<any>>()

const crud = inject(CrudInstanceSymbol) as UseCrudReturn<any> | undefined
const providedFields = inject(CrudFieldsSymbol) as CrudField<any, any>[] | undefined
const controlMap = inject(CrudControlMapSymbol)

const effectiveFields = computed(() => {
  const all = (props.fields ?? providedFields ?? []) as CrudField<any, any>[]
  return all.filter((field) => {
    const visible = field.visibleIn?.search
    if (visible === undefined) return true
    if (typeof visible === 'boolean') return visible
    if (!crud) return true
    return visible({
      surface: 'search',
      query: crud.query.value,
      extra: {},
    })
  })
})

const formModel = reactive<Record<string, any>>({})

function applyFromCrud(): void {
  if (!crud) return
  Object.assign(formModel, crud.query.value)
}

applyFromCrud()

function handleSubmit(): void {
  if (!crud) return
  crud.setQuery({ ...formModel })
}

function handleReset(): void {
  Object.keys(formModel).forEach((key) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete formModel[key]
  })
  if (crud) crud.setQuery({})
}
</script>

<template>
  <div class="fcurd-search fcurd-search--naive">
    <slot
      :form-model="formModel"
      :submit="handleSubmit"
      :reset="handleReset"
    >
      <NForm
        v-if="controlMap"
        class="fcurd-search__auto"
        :model="formModel"
        size="small"
        label-placement="left"
        label-align="right"
        v-bind="props.formProps"
        @submit.prevent="handleSubmit"
      >
        <div class="fcurd-search__fields">
          <NFormItem
            v-for="field in effectiveFields"
            :key="field.key"
            :label="field.label()"
            class="fcurd-search__item"
            v-bind="field.ui?.searchItemProps"
          >
            <component
              :is="controlMap[field.type] || controlMap.text"
              v-model="formModel[field.key]"
              :field="field"
              v-bind="field.ui?.naiveProps"
            />
          </NFormItem>
        </div>
        <div class="fcurd-search__actions">
          <NSpace :size="8">
            <NButton attr-type="button" @click="handleReset">
              重置
            </NButton>
            <NButton type="primary" attr-type="submit" @click="handleSubmit">
              查询
            </NButton>
          </NSpace>
        </div>
      </NForm>
    </slot>
  </div>
</template>

<style scoped>
.fcurd-search--naive {
  width: 100%;
}

.fcurd-search__auto {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 8px 24px;
}

.fcurd-search__fields {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  flex: 1;
}

.fcurd-search__item {
  min-width: 220px;
}

.fcurd-search__actions {
  display: flex;
  gap: 8px;
}
</style>

