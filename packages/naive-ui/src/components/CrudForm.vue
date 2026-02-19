<script setup lang="ts" generic="Row">
import type { CrudField, UseCrudFormReturn } from '@fcurd/core'
import type { DrawerContentProps, DrawerProps, FormInst, FormProps, ModalProps } from 'naive-ui'
import { NButton, NDrawer, NDrawerContent, NForm, NFormItem, NModal, NSpace } from 'naive-ui'
import { computed, h, ref, useSlots } from 'vue'
import { componentMap, getFieldLabel, resolveControlProps, resolveFormItemProps } from '../adapter'

interface Props {
  /** Form state from useCrudForm */
  form: UseCrudFormReturn<Row>
  /** Field definitions */
  fields: CrudField<Row>[]
  /** Form display mode */
  displayMode?: 'modal' | 'drawer' | 'inline'
  /** Modal/drawer visibility */
  visible?: boolean
  /** Modal/drawer title */
  title?: string | ((mode: 'create' | 'edit') => string)
  /** Reset form on close */
  resetOnClose?: boolean
  /** Form props passthrough */
  formProps?: FormProps
  /** Modal props passthrough */
  modalProps?: ModalProps
  /** Drawer props passthrough */
  drawerProps?: DrawerProps
  /** Drawer content props passthrough */
  drawerContentProps?: DrawerContentProps
}

const props = withDefaults(defineProps<Props>(), {
  displayMode: 'modal',
  visible: false,
  resetOnClose: true,
})

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'submit', data: Partial<Row>): void
  (e: 'cancel'): void
}>()

const slots = useSlots()
const formRef = ref<FormInst | null>(null)

// Computed visible state
const isVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

// Computed title
const dialogTitle = computed(() => {
  if (typeof props.title === 'function') {
    return props.title(props.form.mode.value)
  }
  if (props.title) {
    return props.title
  }
  return props.form.mode.value === 'edit' ? '编辑' : '新增'
})

// Handle close
function handleClose() {
  isVisible.value = false
  emit('cancel')
  if (props.resetOnClose) {
    props.form.reset()
    formRef.value?.restoreValidation?.()
  }
}

// Handle submit
async function handleSubmit() {
  if (formRef.value) {
    try {
      await formRef.value.validate()
    }
    catch {
      return
    }
  }

  const data = props.form.getSubmitData()
  emit('submit', data)
}

// Auto required rule helper
function buildRules(field: CrudField<Row>) {
  const formItemProps = resolveFormItemProps(field as any, 'form')
  const existingRules = formItemProps.rule

  if (!field.required) {
    return existingRules
  }

  const label = getFieldLabel(field)
  const requiredRule = {
    required: true,
    message: `${label}不能为空`,
    trigger: ['input', 'blur', 'change'],
  }

  if (!existingRules) {
    return [requiredRule]
  }

  const rules = Array.isArray(existingRules) ? existingRules : [existingRules]
  // Check if already has required rule
  const hasRequired = rules.some((r: any) => r?.required === true)
  if (hasRequired) {
    return rules
  }

  return [requiredRule, ...rules]
}

// Render field control
function renderControl(field: CrudField<Row>) {
  const component = componentMap[field.type] ?? componentMap.text
  const controlProps = resolveControlProps(field as any, 'form')
  const model = props.form.model as Record<string, unknown>

  return h(component, {
    'modelValue': model[field.key],
    'onUpdate:modelValue': (value: unknown) => {
      model[field.key] = value
    },
    'field': field,
    'surface': 'form',
    ...controlProps,
  })
}

// Render form body
function renderFormBody() {
  return h(
    NForm,
    {
      ref: formRef,
      model: props.form.model,
      ...props.formProps,
      onSubmit: (e: Event) => {
        e.preventDefault()
        void handleSubmit()
      },
    },
    () => [
      props.form.visibleFields.value.map((field) => {
        const slotName = `field-${field.key}`
        const fieldSlot = slots[slotName]
        const model = props.form.model as Record<string, unknown>

        return h(
          NFormItem,
          {
            key: field.key,
            label: getFieldLabel(field),
            path: field.key,
            required: field.required,
            rule: buildRules(field),
            ...resolveFormItemProps(field as any, 'form'),
          },
          () => fieldSlot
            ? fieldSlot({ field, model, mode: props.form.mode.value, value: model[field.key] })
            : renderControl(field),
        )
      }),
      // Footer
      h('div', { class: 'crud-form__footer' }, [
        slots.footer
          ? slots.footer({ mode: props.form.mode.value, dirty: props.form.dirty.value })
          : h(NSpace, { justify: 'end' }, () => [
              h(NButton, { onClick: handleClose }, () => '取消'),
              h(NButton, { type: 'primary', attrType: 'submit' }, () => '保存'),
            ]),
      ]),
    ],
  )
}
</script>

<template>
  <!-- Inline mode -->
  <div
    v-if="displayMode === 'inline'"
    class="crud-form crud-form--inline"
  >
    <component :is="() => renderFormBody()" />
  </div>

  <!-- Modal mode -->
  <NModal
    v-else-if="displayMode === 'modal'"
    v-model:show="isVisible"
    preset="dialog"
    :title="dialogTitle"
    v-bind="modalProps"
    @after-leave="handleClose"
  >
    <component :is="() => renderFormBody()" />
  </NModal>

  <!-- Drawer mode -->
  <NDrawer
    v-else
    v-model:show="isVisible"
    :width="420"
    placement="right"
    v-bind="drawerProps"
    @after-leave="handleClose"
  >
    <NDrawerContent
      :title="dialogTitle"
      v-bind="drawerContentProps"
    >
      <component :is="() => renderFormBody()" />
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
.crud-form__footer {
  margin-top: 24px;
}
</style>
