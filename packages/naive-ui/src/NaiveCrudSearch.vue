<script setup lang="ts">
import type { CrudField } from '@fcurd/core'
import type { CrudControlMap } from '@fcurd/vue'
import type { FormProps } from 'naive-ui'
import {
  CrudActionsRenderer,
  CrudControlMapSymbol,
  CrudSearchRenderer,
  useCrudContext,
} from '@fcurd/vue'
import { NButton, NForm, NFormItem, NPopconfirm, NSpace } from 'naive-ui'
import { inject } from 'vue'

interface NaiveCrudSearchProps<Row = any> {
  fields?: readonly CrudField<Row, any>[]
  formProps?: FormProps
}

const props = defineProps<NaiveCrudSearchProps<any>>()

const ctx = useCrudContext<any>()
const controlMap = inject<CrudControlMap>(CrudControlMapSymbol)

function resolveFormItemProps(field: CrudField<any, any>): Record<string, any> {
  return ctx.uiDriver?.resolveFormItem?.({ surface: 'search', field })?.formItemProps ?? {}
}

function resolveControl(field: CrudField<any, any>): { component: any, bind: Record<string, any> } {
  const resolved = ctx.uiDriver?.resolveControl?.({
    surface: 'search',
    field,
    controlMap: controlMap as any,
  })
  const component = resolved?.component ?? (controlMap as any)?.[field.type] ?? (controlMap as any)?.text
  const bind = {
    ...(resolved?.controlProps ?? {}),
    ...((resolved?.passField ?? false) ? { field } : {}),
  }
  return { component, bind }
}
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
              <CrudActionsRenderer
                v-slot="{ actions, ctx: actionCtx }"
                area="search"
              >
                <template
                  v-for="action in actions"
                  :key="action.id"
                >
                  <NPopconfirm
                    v-if="action.confirm"
                    @positive-click="action.onClick(actionCtx)"
                  >
                    <template #trigger>
                      <NButton
                        :type="(action.type === 'tertiary' ? undefined : action.type) as any"
                        :tertiary="action.type === 'tertiary'"
                        :disabled="action.disabled?.(actionCtx) ?? false"
                      >
                        {{ action.label ?? action.id }}
                      </NButton>
                    </template>
                    {{ typeof action.confirm === 'object' ? (action.confirm.content ?? '确定要执行此操作吗？') : '确定要执行此操作吗？' }}
                  </NPopconfirm>
                  <NButton
                    v-else
                    :type="(action.type === 'tertiary' ? undefined : action.type) as any"
                    :tertiary="action.type === 'tertiary'"
                    :disabled="action.disabled?.(actionCtx) ?? false"
                    @click="action.onClick(actionCtx)"
                  >
                    {{ action.label ?? action.id }}
                  </NButton>
                </template>
              </CrudActionsRenderer>

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
