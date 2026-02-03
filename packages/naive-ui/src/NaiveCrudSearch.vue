<script setup lang="ts">
import type { CrudField } from '@fcurd/core'
import type { FormProps } from 'naive-ui'
import {
  CrudActionButtonsRenderer,
  CrudSearchRenderer,
  useCrudUiResolvers,
  useCrudContext,
} from '@fcurd/core'
import { NButton, NForm, NFormItem, NSpace } from 'naive-ui'

interface NaiveCrudSearchProps<Row = any> {
  fields?: readonly CrudField<Row, any>[]
  formProps?: FormProps
}

const props = defineProps<NaiveCrudSearchProps<any>>()

const ctx = useCrudContext<any>()
const controlMap = ctx.controlMap
const { resolveControl, resolveFormItemProps } = useCrudUiResolvers('search')
</script>

<template>
  <div class="fcurd-search fcurd-search--naive">
    <CrudSearchRenderer
      v-slot="{ formModel, fields: effectiveFields, submit, reset }"
      :fields="props.fields"
    >
      <slot
        :form-model="formModel"
        :submit="submit"
        :reset="reset"
      >
        <NForm
          v-if="controlMap"
          class="fcurd-search__auto"
          :model="formModel"
          label-placement="top"
          label-align="left"
          v-bind="props.formProps"
          @submit.prevent="submit"
        >
          <div class="fcurd-search__fields">
            <NFormItem
              v-for="field in effectiveFields"
              :key="field.key"
              :label="field.label()"
              class="fcurd-search__item"
              :show-feedback="false"
              :show-feedback-wrapper="false"
              v-bind="resolveFormItemProps(field)"
            >
              <component
                :is="resolveControl(field).component"
                v-model="formModel[field.key]"
                surface="search"
                v-bind="resolveControl(field).bind"
                class="fcurd-search__control"
              />
            </NFormItem>
          </div>
          <div class="fcurd-search__actions">
            <NSpace :size="8">
              <CrudActionButtonsRenderer area="search" />

              <NButton
                attr-type="button"
                @click="reset"
              >
                重置
              </NButton>
              <NButton
                type="primary"
                attr-type="submit"
                @click="submit"
              >
                查询
              </NButton>
            </NSpace>
          </div>
        </NForm>
      </slot>
    </CrudSearchRenderer>
  </div>
</template>

<style scoped>
.fcurd-search--naive :deep(.n-form-item-label) {
  --n-label-font-size: 13px;
}

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
