<script setup lang="ts">
import type { CrudField, UseCrudReturn } from '@fcurd/core'
import {
  CrudControlMapSymbol,
  CrudFieldsSymbol,
  CrudInstanceSymbol,
  useCrudSearchRouteSync,
} from '@fcurd/vue'
import { NButton, NForm, NFormItem, NSpace } from 'naive-ui'
import { computed, inject, reactive } from 'vue'

type NFormProps = InstanceType<typeof NForm>['$props']
interface ForwardSearchFormProps extends Omit<NFormProps, 'model'> {}

interface NaiveCrudSearchProps<Row = any> {
  fields?: readonly CrudField<Row, any>[]
  formProps?: ForwardSearchFormProps
}

const props = defineProps<NaiveCrudSearchProps<any>>()

const crud = inject(CrudInstanceSymbol) as UseCrudReturn<any> | undefined
const providedFields = inject(CrudFieldsSymbol) as readonly CrudField<any, any>[] | undefined
const controlMap = inject(CrudControlMapSymbol)

const effectiveFields = computed(() => {
  const all = (props.fields ?? providedFields ?? []) as readonly CrudField<any, any>[]
  return all.filter((field) => {
    const visible = field.visibleIn?.search
    if (visible === undefined)
      return false
    if (typeof visible === 'boolean')
      return visible
    if (!crud)
      return true
    return visible({
      surface: 'search',
      query: crud.query.value,
      extra: {},
    })
  })
})

const formModel = reactive<Record<string, any>>({})

const { handleSubmit, handleReset } = useCrudSearchRouteSync({
  crud,
  fields: () => effectiveFields.value,
  formModel,
  queryKey: 'search',
  clearMode: 'null',
})
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
            :show-feedback="false"
            :show-feedback-wrapper="false"
            v-bind="field.ui?.formItem?.search"
          >
            <component
              :is="(field.ui as any)?.component || controlMap[field.type] || controlMap.text"
              v-model="formModel[field.key]"
              :field="field"
              v-bind="(field.ui as any)?.control"
              class="fcurd-search__control"
            />
          </NFormItem>
        </div>
        <div class="fcurd-search__actions">
          <NSpace :size="8">
            <NButton
              attr-type="button"
              @click="handleReset"
            >
              重置
            </NButton>
            <NButton
              type="primary"
              attr-type="submit"
              @click="handleSubmit"
            >
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
  gap: 16px 24px;
  flex: 1;
}

.fcurd-search__item {
  width: fit-content;
  /* min-width: 100px; */
  /* min-width: 220px; */
}

.fcurd-search__actions {
  display: flex;
  gap: 8px;
}
</style>
