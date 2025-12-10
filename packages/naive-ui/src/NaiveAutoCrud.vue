<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import type { FunctionalComponent } from 'vue'
import type {
  CrudAdapter,
  CrudField,
  CrudTableColumn,
  UseCrudReturn,
} from '@fcurd/core'
import { useCrud } from '@fcurd/core'
import {
  CrudProvider,
  CrudPage,
} from '@fcurd/vue'
import { NButton } from 'naive-ui'
import { naiveControlMap } from './control-map-naive'
import NaiveCrudSearch from './NaiveCrudSearch.vue'
import NaiveCrudTable from './NaiveCrudTable.vue'
import NaiveCrudForm from './NaiveCrudForm.vue'

interface NaiveAutoCrudProps<Row = any> {
  adapter: CrudAdapter<Row>
  fields: CrudField<Row, any>[]
  tableColumns?: CrudTableColumn<Row>[]
  searchFields?: CrudField<Row, any>[]
  disableAdd?: boolean
  disableEdit?: boolean
  disableDelete?: boolean
  disableExport?: boolean
  formMode?: 'modal' | 'drawer' | 'inline'
}

interface NaiveAutoCrudEmits<Row = any> {
  (e: 'form-model-ready', model: Row, mode: 'create' | 'edit'): void
  (e: 'submit', payload: { mode: 'create' | 'edit'; data: Partial<Row> }): void
  (e: 'success', payload: { mode: 'create' | 'edit'; data: Row }): void
  (e: 'error', error: unknown): void
  (e: 'open', mode: 'create' | 'edit', row?: Row | null): void
  (e: 'close'): void
}

const props = defineProps<NaiveAutoCrudProps<any>>()
const emit = defineEmits<NaiveAutoCrudEmits<any>>()

const crud: UseCrudReturn<any> = useCrud<any>({ adapter: props.adapter })

onMounted(() => {
  void crud.refresh()
})

const visible = ref(false)
const editingRow = ref<any | null>(null)

const mode = computed<'create' | 'edit'>(() => (editingRow.value ? 'edit' : 'create'))

interface RowActionProps {
  row: any
}

const EditAction: FunctionalComponent<RowActionProps> = (p) => {
  if (props.disableEdit) return null

  return h(
    NButton,
    {
      tertiary: true,
      size: 'small',
      onClick: () => openEdit(p.row),
    },
    {
      default: () => '编辑',
    },
  )
}

const DeleteAction: FunctionalComponent<RowActionProps> = (p) => {
  if (props.disableDelete || !props.adapter.remove) return null

  return h(
    NButton,
    {
      tertiary: true,
      type: 'error',
      size: 'small',
      onClick: () => {
        void props.adapter
          .remove?.((p.row as any).id)
          .then(() => crud.refresh())
      },
    },
    {
      default: () => '删除',
    },
  )
}

function openCreate(): void {
  editingRow.value = null
  visible.value = true
}

function openEdit(row: any): void {
  editingRow.value = row
  visible.value = true
}

function handleClose(): void {
  visible.value = false
}

async function handleSubmit(payload: { mode: 'create' | 'edit'; data: any }): Promise<void> {
  const { mode: submitMode, data } = payload
  emit('submit', payload)
  try {
    if (submitMode === 'create' && props.adapter.create) {
      const created = await props.adapter.create(data)
      emit('success', { mode: submitMode, data: created })
    }
    if (submitMode === 'edit' && props.adapter.update) {
      const id = (editingRow.value as any)?.id
      const updated = await props.adapter.update(id, data)
      emit('success', { mode: submitMode, data: updated })
    }
    await crud.refresh()
    visible.value = false
  }
  catch (error) {
    // eslint-disable-next-line no-console
    console.error('[fcurd] NaiveAutoCrud submit error', error)
    emit('error', error)
  }
}

function handleOpenEvent(payload: { mode: 'create' | 'edit'; row?: any | null }): void {
  emit('open', payload.mode, payload.row ?? null)
}

function handleCloseEvent(): void {
  emit('close')
}

function handleFormModelReady(model: any, currentMode: 'create' | 'edit'): void {
  emit('form-model-ready', model, currentMode)
}
</script>

<template>
  <CrudProvider
    :crud="crud"
    :fields="fields"
    :columns="tableColumns"
    :control-map="naiveControlMap"
  >
    <CrudPage>
      <template #toolbar>
        <slot
          name="toolbar"
          :crud="crud"
          :open-create="openCreate"
        >
          <NButton
            v-if="!disableAdd"
            type="primary"
            size="small"
            @click="openCreate"
          >
            新增
          </NButton>
        </slot>
      </template>

      <template #search>
        <NaiveCrudSearch :fields="searchFields || fields" />
      </template>

      <template #beforeTable v-if="$slots.beforeTable">
        <slot
          name="beforeTable"
          :crud="crud"
        />
      </template>

      <template #table>
        <NaiveCrudTable :columns="tableColumns" :show-actions-column="true">
          <template #table-actions="slotProps">
            <slot
              name="table-actions"
              v-bind="slotProps"
            />
          </template>

          <template #row-actions="{ row }">
            <slot
              name="row-actions"
              :row="row"
              :open-edit="openEdit"
               :default-actions="{
                 Edit: EditAction,
                 Delete: DeleteAction,
               }"
            >
              <EditAction :row="row" />
              <DeleteAction :row="row" />
            </slot>
          </template>
        </NaiveCrudTable>
      </template>
    </CrudPage>

    <NaiveCrudForm
      v-model="visible"
      :row="editingRow"
      :fields="fields as any"
      :form-mode="formMode"
      :reset-on-close="true"
      @submit="handleSubmit"
      @close="handleClose"
      @open="handleOpenEvent"
      @form-model-ready="handleFormModelReady"
    />
  </CrudProvider>
</template>

