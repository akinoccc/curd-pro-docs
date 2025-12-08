<script setup lang="ts">
import { computed, inject, reactive } from 'vue'
import type { CrudField, UseCrudReturn } from '@fcurd/core'
import {
  CrudControlMapSymbol,
  CrudFieldsSymbol,
  CrudInstanceSymbol,
} from './symbols'

interface CrudSearchProps<Row = any> {
  fields?: CrudField<Row, any>[]
}

const props = defineProps<CrudSearchProps<any>>()

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
  <div class="fcurd-search">
    <slot
      :form-model="formModel"
      :submit="handleSubmit"
      :reset="handleReset"
    >
      <div class="fcurd-search__auto" v-if="controlMap">
        <div
          v-for="field in effectiveFields"
          :key="field.key"
          class="fcurd-search__item"
        >
          <label class="fcurd-search__label">
            {{ field.label() }}
          </label>
          <component
            :is="controlMap[field.type] || controlMap.text"
            v-model="formModel[field.key]"
            :field="field"
          />
        </div>
        <div class="fcurd-search__actions">
          <slot
            name="actions"
            :submit="handleSubmit"
            :reset="handleReset"
          />
        </div>
      </div>
    </slot>
  </div>
</template>
