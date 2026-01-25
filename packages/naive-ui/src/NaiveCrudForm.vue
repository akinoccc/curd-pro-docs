<script setup lang="ts">
import type { CrudField } from '@fcurd/core'
import type { CrudControlMap } from '@fcurd/vue'
import type { DrawerContentProps, DrawerProps, FormInst, FormProps, ModalProps } from 'naive-ui'
import { CrudControlMapSymbol, CrudFormRenderer, resolveSlotName, useCrudContext } from '@fcurd/vue'
import {

  NButton,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NModal,
  NSpace,
} from 'naive-ui'
import { computed, inject, ref, useSlots, watch } from 'vue'

interface NaiveCrudFormProps<Row = any> {
  modelValue?: boolean
  formMode?: 'modal' | 'drawer' | 'inline'
  row?: Row | null
  fields?: CrudField<Row, Row>[]
  layout?: any
  title?: string | ((payload: { mode: 'create' | 'edit', row?: Row | null }) => string)
  resetOnClose?: boolean
  formProps?: FormProps
  modalProps?: ModalProps
  drawerProps?: DrawerProps
  drawerContentProps?: DrawerContentProps
}

interface NaiveCrudFormEmits<Row = any> {
  (e: 'update:modelValue', visible: boolean): void
  (e: 'submit', payload: { mode: 'create' | 'edit', data: Partial<Row> }): void
  (e: 'success', payload: { mode: 'create' | 'edit', data: Row }): void
  (e: 'error', error: unknown): void
  (e: 'open', payload: { mode: 'create' | 'edit', row?: Row | null }): void
  (e: 'close'): void
  (e: 'formModelReady', model: Row, mode: 'create' | 'edit'): void
}

const props = defineProps<NaiveCrudFormProps<any>>()
const emit = defineEmits<NaiveCrudFormEmits<any>>()

const ctx = useCrudContext<any>()
const controlMap = inject<CrudControlMap>(CrudControlMapSymbol)
const formRef = ref<FormInst | null>(null)
const slots = useSlots()

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

watch(
  () => visible.value,
  (value) => {
    if (value) {
      emit('open', { mode: mode.value, row: props.row ?? null })
    }
    else {
      emit('close')
      // resetOnClose 的语义：关闭后恢复初始表单模型
      // 由 renderless 组件提供 initFormModel，这里在 template 内绑定
    }
  },
)

async function validateOnSubmit(): Promise<boolean> {
  if (!formRef.value)
    return true
  try {
    await formRef.value.validate()
    return true
  }
  catch {
    return false
  }
}

function resolveFormItemProps(field: CrudField<any, any>): Record<string, any> {
  return ctx.uiDriver?.resolveFormItem?.({ surface: 'form', field })?.formItemProps ?? {}
}

function resolveControl(field: CrudField<any, any>): { component: any, bind: Record<string, any> } {
  const resolved = ctx.uiDriver?.resolveControl?.({
    surface: 'form',
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

// success/error 由上层调用 adapter 后再 emit 回来，这里只提供事件占位
</script>

<template>
  <CrudFormRenderer
    v-slot="{ formModel, fields: effectiveFields, initFormModel }"
    :row="row"
    :fields="fields as any"
    @form-model-ready="(model, m) => emit('formModelReady', model, m)"
  >
    <!-- inline 模式：直接渲染在页面中 -->
    <div
      v-if="effectiveFormMode === 'inline'"
      class="fcurd-form fcurd-form--naive"
    >
      <header
        v-if="title"
        class="fcurd-form__header"
      >
        <h3 class="fcurd-form__title">
          {{ typeof title === 'function' ? title({ mode, row }) : title }}
        </h3>
      </header>

      <NForm
        ref="formRef"
        class="fcurd-form__body"
        :model="formModel"
        v-bind="formProps"
        @submit.prevent="async () => {
          const valid = await validateOnSubmit()
          if (!valid) return
          emit('submit', { mode, data: { ...formModel } })
        }"
      >
        <slot
          :form-model="formModel"
          :mode="mode"
          :submit="() => emit('submit', { mode, data: { ...formModel } })"
        >
          <div v-if="controlMap">
            <NFormItem
              v-for="field in effectiveFields"
              :key="field.key"
              :label="field.label()"
              :required="field.required"
              :path="field.key"
              class="fcurd-form__item"
              v-bind="resolveFormItemProps(field)"
            >
              <slot
                v-if="resolveSlotName(slots, { prefix: 'field', key: field.key })"
                :name="resolveSlotName(slots, { prefix: 'field', key: field.key })!"
                :field="field"
                :model="formModel"
                :mode="mode"
                :row="row"
                :value="formModel[field.key]"
              />
              <component
                :is="resolveControl(field).component"
                v-else
                v-model="formModel[field.key]"
                surface="form"
                v-bind="resolveControl(field).bind"
              />
            </NFormItem>
          </div>
        </slot>

        <footer class="fcurd-form__footer">
          <slot
            name="footer"
            :mode="mode"
            :submitting="false"
            :submit="() => emit('submit', { mode, data: { ...formModel } })"
            :reset="() => { initFormModel(); formRef?.restoreValidation?.() }"
          >
            <NSpace
              :size="8"
              justify="end"
            >
              <NButton
                attr-type="button"
                @click="visible = false"
              >
                取消
              </NButton>
              <NButton
                type="primary"
                attr-type="submit"
              >
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
      v-bind="props.modalProps"
      v-model:show="visible"
      preset="dialog"
      :title="typeof title === 'function' ? title({ mode, row }) : title || mode === 'edit' ? '编辑' : '创建'"
      class="fcurd-form-modal"
      @after-leave="() => {
        if (props.resetOnClose) {
          initFormModel()
          formRef?.restoreValidation?.()
        }
      }"
    >
      <NForm
        ref="formRef"
        class="fcurd-form__body py-2"
        :model="formModel"
        v-bind="formProps"
        @submit.prevent="async () => {
          const valid = await validateOnSubmit()
          if (!valid) return
          emit('submit', { mode, data: { ...formModel } })
        }"
      >
        <slot
          :form-model="formModel"
          :mode="mode"
          :submit="() => emit('submit', { mode, data: { ...formModel } })"
        >
          <div v-if="controlMap">
            <NFormItem
              v-for="field in effectiveFields"
              :key="field.key"
              :label="field.label()"
              :required="field.required"
              :path="field.key"
              class="fcurd-form__item"
              v-bind="resolveFormItemProps(field)"
            >
              <slot
                v-if="resolveSlotName(slots, { prefix: 'field', key: field.key })"
                :name="resolveSlotName(slots, { prefix: 'field', key: field.key })!"
                :field="field"
                :model="formModel"
                :mode="mode"
                :row="row"
                :value="formModel[field.key]"
              />
              <component
                :is="resolveControl(field).component"
                v-else
                v-model="formModel[field.key]"
                surface="form"
                v-bind="resolveControl(field).bind"
              />
            </NFormItem>
          </div>
        </slot>

        <footer class="fcurd-form__footer">
          <slot
            name="footer"
            :mode="mode"
            :submitting="false"
            :submit="() => emit('submit', { mode, data: { ...formModel } })"
            :reset="() => { initFormModel(); formRef?.restoreValidation?.() }"
          >
            <NSpace
              :size="8"
              justify="end"
            >
              <NButton
                attr-type="button"
                @click="visible = false"
              >
                取消
              </NButton>
              <NButton
                type="primary"
                attr-type="submit"
              >
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
      v-bind="props.drawerProps"
      v-model:show="visible"
      :width="420"
      placement="right"
      class="fcurd-form-drawer"
      @after-leave="() => {
        if (props.resetOnClose) {
          initFormModel()
          formRef?.restoreValidation?.()
        }
      }"
    >
      <NDrawerContent
        v-bind="props.drawerContentProps"
        :title="typeof title === 'function' ? title({ mode, row }) : title"
      >
        <NForm
          ref="formRef"
          class="fcurd-form__body"
          :model="formModel"
          v-bind="formProps"
          @submit.prevent="async () => {
            const valid = await validateOnSubmit()
            if (!valid) return
            emit('submit', { mode, data: { ...formModel } })
          }"
        >
          <slot
            :form-model="formModel"
            :mode="mode"
            :submit="() => emit('submit', { mode, data: { ...formModel } })"
          >
            <div v-if="controlMap">
              <NFormItem
                v-for="field in effectiveFields"
                :key="field.key"
                :label="field.label()"
                :required="field.required"
                :path="field.key"
                class="fcurd-form__item"
                v-bind="resolveFormItemProps(field)"
              >
                <slot
                  v-if="resolveSlotName(slots, { prefix: 'field', key: field.key })"
                  :name="resolveSlotName(slots, { prefix: 'field', key: field.key })!"
                  :field="field"
                  :model="formModel"
                  :mode="mode"
                  :row="row"
                  :value="formModel[field.key]"
                />
                <component
                  :is="resolveControl(field).component"
                  v-else
                  v-model="formModel[field.key]"
                  surface="form"
                  v-bind="resolveControl(field).bind"
                />
              </NFormItem>
            </div>
          </slot>

          <footer class="fcurd-form__footer">
            <slot
              name="footer"
              :mode="mode"
              :submitting="false"
              :submit="() => emit('submit', { mode, data: { ...formModel } })"
              :reset="() => { initFormModel(); formRef?.restoreValidation?.() }"
            >
              <NSpace
                :size="8"
                justify="end"
              >
                <NButton
                  attr-type="button"
                  @click="visible = false"
                >
                  取消
                </NButton>
                <NButton
                  type="primary"
                  attr-type="submit"
                >
                  保存
                </NButton>
              </NSpace>
            </slot>
          </footer>
        </NForm>
      </NDrawerContent>
    </NDrawer>
  </CrudFormRenderer>
</template>
