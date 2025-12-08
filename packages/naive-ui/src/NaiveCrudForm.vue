<script setup lang="ts">
import { computed, inject, reactive, watch } from 'vue'
import type { CrudField } from '@fcurd/core'
import { CrudControlMapSymbol } from '@fcurd/vue'
import {
  NButton,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NModal,
  NSpace,
} from 'naive-ui'

interface NaiveCrudFormProps<Row = any> {
  modelValue?: boolean
  formMode?: 'modal' | 'drawer' | 'inline'
  row?: Row | null
  fields?: CrudField<Row, Row>[]
  layout?: any
  title?: string | ((payload: { mode: 'create' | 'edit'; row?: Row | null }) => string)
  resetOnClose?: boolean
}

interface NaiveCrudFormEmits<Row = any> {
  (e: 'update:modelValue', visible: boolean): void
  (e: 'submit', payload: { mode: 'create' | 'edit'; data: Partial<Row> }): void
  (e: 'success', payload: { mode: 'create' | 'edit'; data: Row }): void
  (e: 'error', error: unknown): void
  (e: 'open', payload: { mode: 'create' | 'edit'; row?: Row | null }): void
  (e: 'close'): void
  (e: 'form-model-ready', model: Row, mode: 'create' | 'edit'): void
}

const props = defineProps<NaiveCrudFormProps<any>>()
const emit = defineEmits<NaiveCrudFormEmits<any>>()

const controlMap = inject(CrudControlMapSymbol)

const visible = computed<boolean>({
  get() {
    return props.modelValue ?? false
  },
  set(value: boolean) {
    emit('update:modelValue', value)
  },
})

const mode = computed<'create' | 'edit'>(() => (props.row ? 'edit' : 'create'))

const effectiveFormMode = computed<'modal' | 'drawer' | 'inline'>(() => props.formMode ?? 'modal')

const formModel = reactive<Record<string, any>>({})

function initFormModel(): void {
  Object.keys(formModel).forEach((key) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete formModel[key]
  })
  if (props.row) {
    Object.assign(formModel, props.row)
  }
  emit('form-model-ready', formModel as any, mode.value)
}

watch(
  () => props.row,
  () => {
    initFormModel()
  },
  { immediate: true },
)

watch(
  () => visible.value,
  (value) => {
    if (value) {
      emit('open', { mode: mode.value, row: props.row ?? null })
    }
    else {
      emit('close')
      if (props.resetOnClose) initFormModel()
    }
  },
)

function handleSubmit(): void {
  emit('submit', { mode: mode.value, data: { ...formModel } })
}

// success/error 由上层调用 adapter 后再 emit 回来，这里只提供事件占位
</script>

<template>
  <!-- inline 模式：直接渲染在页面中 -->
  <div
    v-if="effectiveFormMode === 'inline'"
    class="fcurd-form fcurd-form--naive"
  >
    <header v-if="title" class="fcurd-form__header">
      <h3 class="fcurd-form__title">
        {{ typeof title === 'function' ? title({ mode, row }) : title }}
      </h3>
    </header>

    <NForm
      class="fcurd-form__body"
      :model="formModel"
      size="small"
      label-placement="left"
      label-align="right"
      @submit.prevent="handleSubmit"
    >
      <slot
        :form-model="formModel"
        :mode="mode"
        :submit="handleSubmit"
      >
        <div v-if="controlMap">
          <NFormItem
            v-for="field in fields || []"
            :key="field.key"
            :label="field.label()"
            class="fcurd-form__item"
          >
            <component
              :is="controlMap[field.type] || controlMap.text"
              v-model="formModel[field.key]"
              :field="field"
            />
          </NFormItem>
        </div>
      </slot>

      <footer class="fcurd-form__footer">
        <slot
          name="footer"
          :mode="mode"
          :submitting="false"
          :submit="handleSubmit"
          :reset="initFormModel"
        >
          <NSpace :size="8" justify="end">
            <NButton attr-type="button" @click="visible = false">
              取消
            </NButton>
            <NButton type="primary" attr-type="submit">
              保存
            </NButton>
          </NSpace>
        </slot>
      </footer>
    </NForm>
  </div>

  <!-- modal 模式：使用 Naive UI 的 NModal -->
  <NModal
    v-else-if="effectiveFormMode === 'modal'"
    v-model:show="visible"
    preset="dialog"
    :title="typeof title === 'function' ? title({ mode, row }) : title"
    class="fcurd-form-modal"
  >
    <NForm
      class="fcurd-form__body"
      :model="formModel"
      size="small"
      label-placement="top"
      @submit.prevent="handleSubmit"
    >
      <slot
        :form-model="formModel"
        :mode="mode"
        :submit="handleSubmit"
      >
        <div v-if="controlMap">
          <NFormItem
            v-for="field in fields || []"
            :key="field.key"
            :label="field.label()"
            class="fcurd-form__item"
          >
            <component
              :is="controlMap[field.type] || controlMap.text"
              v-model="formModel[field.key]"
              :field="field"
            />
          </NFormItem>
        </div>
      </slot>

      <footer class="fcurd-form__footer">
        <slot
          name="footer"
          :mode="mode"
          :submitting="false"
          :submit="handleSubmit"
          :reset="initFormModel"
        >
          <NSpace :size="8" justify="end">
            <NButton attr-type="button" @click="visible = false">
              取消
            </NButton>
            <NButton type="primary" attr-type="submit">
              保存
            </NButton>
          </NSpace>
        </slot>
      </footer>
    </NForm>
  </NModal>

  <!-- drawer 模式：使用 Naive UI 的 NDrawer -->
  <NDrawer
    v-else
    v-model:show="visible"
    :width="420"
    placement="right"
    class="fcurd-form-drawer"
  >
    <NDrawerContent
      :title="typeof title === 'function' ? title({ mode, row }) : title"
    >
      <NForm
        class="fcurd-form__body"
        :model="formModel"
        size="small"
        label-placement="top"
        @submit.prevent="handleSubmit"
      >
        <slot
          :form-model="formModel"
          :mode="mode"
          :submit="handleSubmit"
        >
          <div v-if="controlMap">
            <NFormItem
              v-for="field in fields || []"
              :key="field.key"
              :label="field.label()"
              class="fcurd-form__item"
            >
              <component
                :is="controlMap[field.type] || controlMap.text"
                v-model="formModel[field.key]"
                :field="field"
              />
            </NFormItem>
          </div>
        </slot>

        <footer class="fcurd-form__footer">
          <slot
            name="footer"
            :mode="mode"
            :submitting="false"
            :submit="handleSubmit"
            :reset="initFormModel"
          >
            <NSpace :size="8" justify="end">
              <NButton attr-type="button" @click="visible = false">
                取消
              </NButton>
              <NButton type="primary" attr-type="submit">
                保存
              </NButton>
            </NSpace>
          </slot>
        </footer>
      </NForm>
    </NDrawerContent>
  </NDrawer>
</template>

