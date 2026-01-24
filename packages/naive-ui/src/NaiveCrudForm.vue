<script setup lang="ts">
import type { CrudField, CrudFieldRule } from '@fcurd/core'
import type { FormInst, FormItemRule, FormRules } from 'naive-ui'
import { normalizeFieldRules } from '@fcurd/core'
import { CrudControlMapSymbol, CrudFormModelSymbol, CrudFormModeSymbol } from '@fcurd/vue'
import {

  NButton,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NModal,
  NSpace,
} from 'naive-ui'
import { computed, inject, provide, reactive, ref, useSlots, watch } from 'vue'

type NFormProps = InstanceType<typeof NForm>['$props']
type NModalProps = InstanceType<typeof NModal>['$props']
type NDrawerProps = InstanceType<typeof NDrawer>['$props']
type NDrawerContentProps = InstanceType<typeof NDrawerContent>['$props']

interface ForwardCrudFormProps extends Omit<NFormProps, 'model' | 'rules'> {
  rules?: FormRules
}
interface ForwardModalProps extends Omit<NModalProps, 'show'> {}
interface ForwardDrawerProps extends Omit<NDrawerProps, 'show'> {}
interface ForwardDrawerContentProps extends Omit<NDrawerContentProps, 'title'> {}

interface NaiveCrudFormProps<Row = any> {
  modelValue?: boolean
  formMode?: 'modal' | 'drawer' | 'inline'
  row?: Row | null
  fields?: CrudField<Row, Row>[]
  layout?: any
  title?: string | ((payload: { mode: 'create' | 'edit', row?: Row | null }) => string)
  resetOnClose?: boolean
  formProps?: ForwardCrudFormProps
  modalProps?: ForwardModalProps
  drawerProps?: ForwardDrawerProps
  drawerContentProps?: ForwardDrawerContentProps
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

const controlMap = inject(CrudControlMapSymbol)
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

const formModel = reactive<Record<string, any>>({})

// 向自定义表单控件暴露当前 formModel/mode，便于跨字段联动（例如：选图标时同步设置主题色）
provide(CrudFormModelSymbol, formModel)
provide(CrudFormModeSymbol, mode as any)
const formPropsWithoutRules = computed<Record<string, any>>(() => {
  const { rules, ...rest } = props.formProps ?? {}
  return rest
})

const effectiveFields = computed(() => {
  const list = (props.fields ?? []) as CrudField<any, any>[]
  return list.filter((field) => {
    const visible = field.visibleIn?.form
    if (visible === undefined)
      return false
    if (typeof visible === 'boolean')
      return visible
    return visible({
      surface: 'form',
      row: props.row ?? undefined,
      formModel,
      query: {},
      extra: {},
    })
  })
})

function toNaiveTriggers(rule: CrudFieldRule<any, any>): ('blur' | 'change' | 'input')[] {
  const triggers = Array.isArray(rule.trigger) ? rule.trigger : rule.trigger ? [rule.trigger] : []
  return triggers
    .filter(
      (trigger): trigger is 'blur' | 'change' | 'input' =>
        trigger === 'blur' || trigger === 'change' || trigger === 'input',
    )
}

function isEmptyForRequired(value: unknown): boolean {
  if (value === null || value === undefined)
    return true
  if (typeof value === 'string')
    return value.length === 0
  if (typeof value === 'number')
    return Number.isNaN(value)
  if (Array.isArray(value))
    return value.length === 0
  if (value instanceof Set || value instanceof Map)
    return value.size === 0
  return false
}

function mapToNaiveRule(
  rule: CrudFieldRule<any, any>,
  field: CrudField<any, any>,
): FormItemRule {
  const message = rule.message ?? `${field.label()}为必填项`
  const triggers = toNaiveTriggers(rule)
  const baseRule: FormItemRule = {
    message,
  }
  if (triggers.length) {
    baseRule.trigger = triggers
  }
  const validator = rule.validator
  if (rule.required || validator) {
    // 统一必填判空逻辑，避免 0/false 等值被误判为空（尤其是数字输入场景）
    baseRule.validator = async (_r, value) => {
      if (rule.required && isEmptyForRequired(value))
        throw new Error(message)
      if (!validator)
        return
      const result = await validator({
        value,
        field,
        model: formModel,
        mode: mode.value,
      })
      if (result === true || result === undefined)
        return
      if (result === false)
        throw new Error(message)
      if (typeof result === 'string')
        throw new Error(result)
      throw new Error(message)
    }
  }
  return baseRule
}

function mergeRules(builtin: FormRules, external?: FormRules): FormRules {
  const merged: FormRules = external ? { ...external } : {}
  for (const [key, value] of Object.entries(builtin)) {
    merged[key] = [
      ...((external?.[key] as FormItemRule[]) ?? []),
      ...(value as FormItemRule[]),
    ]
  }
  return merged
}

const builtinFormRules = computed<FormRules>(() => {
  const rules: FormRules = {}
  for (const field of effectiveFields.value) {
    const normalized = normalizeFieldRules(field, mode.value)
    if (!normalized.length)
      continue
    rules[field.key] = normalized.map(rule => mapToNaiveRule(rule, field))
  }
  return rules
})

const mergedFormRules = computed<FormRules>(() =>
  mergeRules(builtinFormRules.value, props.formProps?.rules as FormRules | undefined),
)

function getFieldSlotName(fieldKey: string): string | null {
  // 兼容两种命名：
  // - #field-xxx（推荐）
  // - #field_xxx（业务侧常见写法）
  const candidates = [
    `field-${fieldKey}`,
    `field_${fieldKey}`,
  ]
  for (const name of candidates) {
    if (slots[name])
      return name
  }
  return null
}

function initFormModel(): void {
  Object.keys(formModel).forEach((key) => {
    delete formModel[key]
  })
  if (props.row) {
    Object.assign(formModel, props.row)
  }
  formRef.value?.restoreValidation()
  emit('formModelReady', formModel as any, mode.value)
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
      if (props.resetOnClose)
        initFormModel()
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

async function handleSubmit(): Promise<void> {
  const valid = await validateOnSubmit()
  if (!valid)
    return
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
      :rules="mergedFormRules"
      v-bind="formPropsWithoutRules"
      @submit.prevent="handleSubmit"
    >
      <slot
        :form-model="formModel"
        :mode="mode"
        :submit="handleSubmit"
      >
        <div v-if="controlMap">
          <NFormItem
            v-for="field in effectiveFields"
            :key="field.key"
            :label="field.label()"
            :required="field.required"
            :path="field.key"
            class="fcurd-form__item"
            v-bind="field.ui?.naive?.formItemProps"
          >
            <slot
              v-if="getFieldSlotName(field.key)"
              :name="getFieldSlotName(field.key)!"
              :field="field"
              :model="formModel"
              :mode="mode"
              :row="row"
              :value="formModel[field.key]"
            />
            <component
              :is="field.ui?.naive?.component || controlMap[field.type] || controlMap.text"
              v-else
              v-model="formModel[field.key]"
              :field="field"
              v-bind="field.ui?.naive?.controlProps"
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
  >
    <NForm
      ref="formRef"
      class="fcurd-form__body py-2"
      :model="formModel"
      size="small"
      label-placement="top"
      :rules="mergedFormRules"
      v-bind="formPropsWithoutRules"
      @submit.prevent="handleSubmit"
    >
      <slot
        :form-model="formModel"
        :mode="mode"
        :submit="handleSubmit"
      >
        <div v-if="controlMap">
          <NFormItem
            v-for="field in effectiveFields"
            :key="field.key"
            :label="field.label()"
            :required="field.required"
            :path="field.key"
            class="fcurd-form__item"
            v-bind="field.ui?.naive?.formItemProps"
          >
            <slot
              v-if="getFieldSlotName(field.key)"
              :name="getFieldSlotName(field.key)!"
              :field="field"
              :model="formModel"
              :mode="mode"
              :row="row"
              :value="formModel[field.key]"
            />
            <component
              :is="field.ui?.naive?.component || controlMap[field.type] || controlMap.text"
              v-else
              v-model="formModel[field.key]"
              :field="field"
              v-bind="field.ui?.naive?.controlProps"
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
  >
    <NDrawerContent
      v-bind="props.drawerContentProps"
      :title="typeof title === 'function' ? title({ mode, row }) : title"
    >
      <NForm
        ref="formRef"
        class="fcurd-form__body"
        :model="formModel"
        size="small"
        label-placement="top"
        :rules="mergedFormRules"
        v-bind="formPropsWithoutRules"
        @submit.prevent="handleSubmit"
      >
        <slot
          :form-model="formModel"
          :mode="mode"
          :submit="handleSubmit"
        >
          <div v-if="controlMap">
            <NFormItem
              v-for="field in effectiveFields"
              :key="field.key"
              :label="field.label()"
              :required="field.required"
              :path="field.key"
              class="fcurd-form__item"
              v-bind="field.ui?.naive?.formItemProps"
            >
              <slot
                v-if="getFieldSlotName(field.key)"
                :name="getFieldSlotName(field.key)!"
                :field="field"
                :model="formModel"
                :mode="mode"
                :row="row"
                :value="formModel[field.key]"
              />
              <component
                :is="field.ui?.naive?.component || controlMap[field.type] || controlMap.text"
                v-else
                v-model="formModel[field.key]"
                :field="field"
                v-bind="field.ui?.naive?.controlProps"
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
</template>
