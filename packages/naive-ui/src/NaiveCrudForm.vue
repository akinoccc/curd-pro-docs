<script setup lang="ts">
import { computed, inject, reactive, ref, watch } from 'vue'
import type { CrudField, CrudFieldRule } from '@fcurd/core'
import { CrudControlMapSymbol } from '@fcurd/vue'
import {
  NButton,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NModal,
  NSpace,
  type FormInst,
  type FormItemRule,
  type FormRules,
} from 'naive-ui'

interface NaiveCrudFormProps<Row = any> {
  modelValue?: boolean
  formMode?: 'modal' | 'drawer' | 'inline'
  row?: Row | null
  fields?: CrudField<Row, Row>[]
  layout?: any
  title?: string | ((payload: { mode: 'create' | 'edit'; row?: Row | null }) => string)
  resetOnClose?: boolean
  formProps?: Record<string, any>
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
const formRef = ref<FormInst | null>(null)

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
const formPropsWithoutRules = computed<Record<string, any>>(() => {
  const { rules, ...rest } = props.formProps ?? {}
  return rest
})

function toNaiveTriggers(rule: CrudFieldRule<any, any>): ('blur' | 'change' | 'input')[] {
  const triggers = Array.isArray(rule.trigger) ? rule.trigger : rule.trigger ? [rule.trigger] : []
  return triggers
    .filter(
      (trigger): trigger is 'blur' | 'change' | 'input' =>
        trigger === 'blur' || trigger === 'change' || trigger === 'input',
    )
}

function mapToNaiveRule(
  rule: CrudFieldRule<any, any>,
  field: CrudField<any, any>,
): FormItemRule {
  const message = rule.message ?? `${field.label()}为必填项`
  const triggers = toNaiveTriggers(rule)
  const baseRule: FormItemRule = {
    required: rule.required,
    message,
  }
  if (triggers.length) {
    baseRule.trigger = triggers
  }
  const validator = rule.validator
  if (validator) {
    baseRule.validator = async (_r, value) => {
      const result = await validator({
        value,
        field,
        model: formModel,
        mode: mode.value,
      })
      if (result === true || result === undefined) return
      if (result === false) throw new Error(message)
      if (typeof result === 'string') throw new Error(result)
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
  for (const field of props.fields || []) {
    const selfRules = field.rules ?? []
    if (!selfRules.length) continue
    rules[field.key] = selfRules.map(rule => mapToNaiveRule(rule, field))
  }
  return rules
})

const mergedFormRules = computed<FormRules>(() =>
  mergeRules(builtinFormRules.value, props.formProps?.rules as FormRules | undefined),
)

function initFormModel(): void {
  Object.keys(formModel).forEach((key) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete formModel[key]
  })
  if (props.row) {
    Object.assign(formModel, props.row)
  }
  formRef.value?.restoreValidation()
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

async function validateOnSubmit(): Promise<boolean> {
  if (!formRef.value) return true
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
  if (!valid) return
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
      ref="formRef"
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
            v-for="field in fields || []"
            :key="field.key"
            :label="field.label()"
          :required="field.required"
            :path="field.key"
            class="fcurd-form__item"
            v-bind="field.ui?.formItemProps"
          >
            <component
              :is="controlMap[field.type] || controlMap.text"
              v-model="formModel[field.key]"
              :field="field"
              v-bind="field.ui?.naiveProps"
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
      ref="formRef"
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
            v-for="field in fields || []"
            :key="field.key"
            :label="field.label()"
          :required="field.required"
            :path="field.key"
            class="fcurd-form__item"
            v-bind="field.ui?.formItemProps"
          >
            <component
              :is="controlMap[field.type] || controlMap.text"
              v-model="formModel[field.key]"
              :field="field"
              v-bind="field.ui?.naiveProps"
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
        ref="formRef"
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
              v-for="field in fields || []"
              :key="field.key"
              :label="field.label()"
          :required="field.required"
            :path="field.key"
              class="fcurd-form__item"
              v-bind="field.ui?.formItemProps"
            >
              <component
                :is="controlMap[field.type] || controlMap.text"
                v-model="formModel[field.key]"
                :field="field"
                v-bind="field.ui?.naiveProps"
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

