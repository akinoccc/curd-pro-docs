<script setup lang="ts">
import { computed, inject, reactive, watch } from 'vue'
import type { CrudField } from '@fcurd/core'
import { CrudControlMapSymbol } from './symbols'

interface CrudFormProps<Row = any> {
  modelValue?: boolean
  formMode?: 'modal' | 'drawer' | 'inline'
  row?: Row | null
  fields?: CrudField<Row, Row>[]
  layout?: any
  title?: string | ((payload: { mode: 'create' | 'edit'; row?: Row | null }) => string)
  resetOnClose?: boolean
}

interface CrudFormEmits<Row = any> {
  (e: 'update:modelValue', visible: boolean): void
  (e: 'submit', payload: { mode: 'create' | 'edit'; data: Partial<Row> }): void
  (e: 'success', payload: { mode: 'create' | 'edit'; data: Row }): void
  (e: 'error', error: unknown): void
  (e: 'open', payload: { mode: 'create' | 'edit'; row?: Row | null }): void
  (e: 'close'): void
  (e: 'form-model-ready', model: Row, mode: 'create' | 'edit'): void
}

const props = withDefaults(defineProps<CrudFormProps<any>>(), {
  formMode: 'modal',
})
const emit = defineEmits<CrudFormEmits<any>>()

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
  <div v-if="formMode === 'inline' ? true : visible" class="fcurd-form">
    <header v-if="title" class="fcurd-form__header">
      <h3 class="fcurd-form__title">
        {{ typeof title === 'function' ? title({ mode, row }) : title }}
      </h3>
    </header>

    <form class="fcurd-form__body" @submit.prevent="handleSubmit">
      <slot
        :form-model="formModel"
        :mode="mode"
        :submit="handleSubmit"
      >
        <div v-if="controlMap">
          <div
            v-for="field in fields || []"
            :key="field.key"
            class="fcurd-form__item"
          >
            <label class="fcurd-form__label">
              {{ field.label() }}
            </label>
            <component
              :is="controlMap[field.type] || controlMap.text"
              v-model="formModel[field.key]"
              :field="field"
            />
          </div>
        </div>
      </slot>

      <footer class="fcurd-form__footer">
        <slot
          name="footer"
          :mode="formMode"
          :submitting="false"
          :submit="handleSubmit"
          :reset="initFormModel"
        />
      </footer>
    </form>
  </div>
</template>
