<script setup lang="ts" generic="Row, Query extends Record<string, unknown>">
import type { CrudField, UseCrudListReturn } from '@fcurd/core'
import type { FormProps } from 'naive-ui'
import { filterFieldsBySurface } from '@fcurd/core'
import { NButton, NForm, NFormItem, NSpace } from 'naive-ui'
import { computed, h, reactive, watch } from 'vue'
import { componentMap, getFieldLabel, resolveControlProps, resolveFormItemProps } from '../adapter'

interface Props {
  /** CRUD list state from useCrudList */
  list: UseCrudListReturn<Row, Query>
  /** Field definitions */
  fields: CrudField<Row>[]
  /** Form props passthrough */
  formProps?: FormProps
  /** Whether to show reset button */
  showReset?: boolean
  /** Whether to show search button */
  showSearch?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showReset: true,
  showSearch: true,
})

// Filter fields visible in search
const searchFields = computed(() => {
  return filterFieldsBySurface(props.fields, 'search', {
    query: props.list.query.value as Record<string, unknown>,
  })
})

// Local search model (synced with list.query)
const searchModel = reactive<Record<string, unknown>>({})

// Sync from list.query to searchModel
watch(
  () => props.list.query.value,
  (query) => {
    Object.keys(searchModel).forEach((key) => {
      delete searchModel[key]
    })
    Object.assign(searchModel, query)
  },
  { immediate: true, deep: true },
)

// Handle search
function handleSearch() {
  props.list.setQuery(searchModel as Partial<Query>)
}

// Handle reset
function handleReset() {
  Object.keys(searchModel).forEach((key) => {
    delete searchModel[key]
  })
  props.list.reset()
}

// Render field control
function renderControl(field: CrudField<Row>) {
  const component = componentMap[field.type] ?? componentMap.text
  const controlProps = resolveControlProps(field as any, 'search')

  return h(component, {
    'modelValue': searchModel[field.key],
    'onUpdate:modelValue': (value: unknown) => {
      searchModel[field.key] = value
    },
    'field': field,
    'surface': 'search',
    ...controlProps,
  })
}
</script>

<template>
  <div class="crud-search">
    <NForm
      inline
      label-placement="left"
      v-bind="formProps"
      @submit.prevent="handleSearch"
    >
      <NFormItem
        v-for="field in searchFields"
        :key="field.key"
        :label="getFieldLabel(field)"
        v-bind="resolveFormItemProps(field as any, 'search')"
      >
        <slot
          :name="`search-${field.key}`"
          :field="field"
          :model="searchModel"
        >
          <component :is="() => renderControl(field)" />
        </slot>
      </NFormItem>

      <NFormItem v-if="showSearch || showReset">
        <NSpace>
          <NButton
            v-if="showSearch"
            type="primary"
            attr-type="submit"
          >
            搜索
          </NButton>
          <NButton
            v-if="showReset"
            @click="handleReset"
          >
            重置
          </NButton>
        </NSpace>
      </NFormItem>
    </NForm>
  </div>
</template>

<style scoped>
.crud-search {
  margin-bottom: 16px;
}
</style>
