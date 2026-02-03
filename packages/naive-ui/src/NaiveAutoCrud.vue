<script setup
  lang="ts"
  generic="Row, RowId extends string | number = string | number, Query extends Record<string, any> = Record<string, any>, CreateInput = Partial<Row>, UpdateInput = Partial<Row>, SortField extends string = string"
>
import type {
  CrudAction,
  CrudAdapter,
  CrudField,
  CrudTableColumn,
  UseCrudActionsReturn,
} from '@fcurd/core'
import type { DataTableProps, DrawerContentProps, DrawerProps, FormProps, ModalProps, PaginationProps } from 'naive-ui'
import type { FunctionalComponent } from 'vue'
import { createCrudRuntime, CrudActionButtonsRenderer, CrudProvider, useCrudConfig, withPresetActions, withSelection } from '@fcurd/core'
import { NCard } from 'naive-ui'
import { computed, h, onMounted, ref, useSlots } from 'vue'
import { naiveControlMap } from './control-map-naive'
import { naiveUiDriver } from './naive-ui-driver'
import NaiveCrudForm from './NaiveCrudForm.vue'
import NaiveCrudSearch from './NaiveCrudSearch.vue'
import NaiveCrudTable from './NaiveCrudTable.vue'

interface NaiveAutoCrudUiProps {
  table?: {
    dataTableProps?: DataTableProps
    paginationProps?: PaginationProps
    /**
     * Naive selection 列透传配置：
     * - 例如 { multiple: false, disabled: (row) => boolean }
     */
    selectionColumn?: Record<string, any>
  }
  search?: {
    formProps?: FormProps
  }
  form?: {
    formProps?: FormProps
    modalProps?: ModalProps
    drawerProps?: DrawerProps
    drawerContentProps?: DrawerContentProps
  }
}

interface NaiveAutoCrudProps<
  Row = any,
  RowId extends string | number = string | number,
  Query extends Record<string, any> = Record<string, any>,
  CreateInput = Partial<Row>,
  UpdateInput = Partial<Row>,
  SortField extends string = string,
> {
  adapter: CrudAdapter<Row, RowId, Query, CreateInput, UpdateInput, SortField>
  fields: readonly CrudField<Row, any>[]
  tableColumns?: readonly CrudTableColumn<Row>[]
  searchFields?: readonly CrudField<Row, any>[]
  actions?: CrudAction<Row>[] | UseCrudActionsReturn<Row>
  disableSearch?: boolean
  disableAdd?: boolean
  disableEdit?: boolean
  disableDelete?: boolean
  disableExport?: boolean
  formMode?: 'modal' | 'drawer' | 'inline'
  showSelection?: boolean
  showActionsColumn?: boolean
  ui?: NaiveAutoCrudUiProps
}

interface NaiveAutoCrudEmits<Row = any> {
  (e: 'formModelReady', model: Row, mode: 'create' | 'edit'): void
  (e: 'submit', payload: { mode: 'create' | 'edit', data: Partial<Row> }): void
  (e: 'success', payload: { mode: 'create' | 'edit', data: Row }): void
  (e: 'error', error: unknown): void
  (e: 'open', mode: 'create' | 'edit', row?: Row | null): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<NaiveAutoCrudProps<Row, RowId, Query, CreateInput, UpdateInput, SortField>>(), {
  showSelection: false,
  showActionsColumn: true,
})
const emit = defineEmits<NaiveAutoCrudEmits<Row>>()

const slots = useSlots()
const forwardedTableSlotNames = computed(() => {
  const excluded = new Set(['row-actions', 'table-actions', 'actions-header'])
  return Object.keys(slots).filter(name => !excluded.has(name))
})
const forwardedFormSlotNames = computed(() => {
  return Object.keys(slots).filter(name =>
    name.startsWith('field-') || name.startsWith('field_'),
  )
})

const visible = ref(false)
const editingRow = ref<Row | null>(null)

const mode = computed<'create' | 'edit'>(() => (editingRow.value ? 'edit' : 'create'))

const crudConfig = useCrudConfig()

function openCreate(): void {
  editingRow.value = null
  visible.value = true
}

function openEdit(row: any): void {
  editingRow.value = row as Row
  visible.value = true
}

const runtime = createCrudRuntime<Row, RowId, Query, CreateInput, UpdateInput, SortField>({
  adapter: props.adapter,
  fields: props.fields,
  columns: (props.tableColumns ?? []) as any,
  ui: { uiDriver: naiveUiDriver as any, controlMap: naiveControlMap as any },
  extra: { onError: (err: any) => emit('error', err) },
})
  .use(withSelection())
  .use(withPresetActions<Row, RowId, Query, CreateInput, UpdateInput, SortField>({
    openCreate,
    openEdit,
    disableAdd: props.disableAdd,
    disableEdit: props.disableEdit,
    disableDelete: props.disableDelete,
    disableExport: props.disableExport,
    config: crudConfig.value,
    actions: props.actions as any,
  }))

const crud = runtime.crud

onMounted(() => {
  void crud.refresh()
})

// 允许业务侧在不侵入 slot 的情况下刷新列表/写查询
defineExpose({
  runtime,
  crud,
  refresh: crud.refresh,
  setQuery: crud.setQuery,
})

interface RowActionProps {
  row: Row
}

const EditAction: FunctionalComponent<RowActionProps> = (p) => {
  const list = (runtime.actions?.value ?? []) as CrudAction<Row>[]
  const a = list.find(x => x.id === 'edit')
  if (!a)
    return null
  return h(CrudActionButtonsRenderer as any, { actions: [a], area: a.area, row: p.row } as any)
}

const DeleteAction: FunctionalComponent<RowActionProps> = (p) => {
  const list = (runtime.actions?.value ?? []) as CrudAction<Row>[]
  const a = list.find(x => x.id === 'delete')
  if (!a)
    return null
  return h(CrudActionButtonsRenderer as any, { actions: [a], area: a.area, row: p.row } as any)
}

function handleClose(): void {
  visible.value = false
  emit('close')
}

async function handleSubmit(payload: { mode: 'create' | 'edit', data: any }): Promise<void> {
  const { mode: submitMode, data } = payload
  emit('submit', payload)
  try {
    // 不做字段筛选：表单模型里有什么就提交什么（由上层/后端自行校验与忽略）
    const submitData = { ...(data ?? {}) }
    if (submitMode === 'create' && props.adapter.create) {
      const created = await props.adapter.create(submitData)
      emit('success', { mode: submitMode, data: created })
    }
    if (submitMode === 'edit' && props.adapter.update) {
      const getId = props.adapter.getId ?? ((row: any) => row?.id as RowId)
      const id = editingRow.value ? getId(editingRow.value) : undefined
      if (id === undefined) {
        throw new Error('无法获取要更新的记录 ID')
      }
      const updated = await props.adapter.update(id, submitData)
      emit('success', { mode: submitMode, data: updated })
    }
    await crud.refresh()
    visible.value = false
  }
  catch (error) {
    emit('error', error)
  }
}

function handleOpenEvent(payload: { mode: 'create' | 'edit', row?: any | null }): void {
  emit('open', payload.mode, payload.row ?? null)
}

function handleFormModelReady(model: any, currentMode: 'create' | 'edit'): void {
  emit('formModelReady', model, currentMode)
}
</script>

<template>
  <CrudProvider :runtime="runtime">
    <NCard title="列表">
      <template #header-extra>
        <section class="fcurd-page__toolbar">
          <slot
            name="toolbar"
            :crud="crud"
            :open-create="openCreate"
          >
            <CrudActionButtonsRenderer area="toolbar" />
          </slot>
        </section>
      </template>

      <section
        v-if="!disableSearch"
        class="fcurd-page__search"
      >
        <NaiveCrudSearch
          :fields="searchFields || fields"
          :form-props="ui?.search?.formProps"
        />
      </section>

      <section
        v-if="$slots.beforeTable"
        class="fcurd-page__before-table"
      >
        <slot
          name="beforeTable"
          :crud="crud"
        />
      </section>

      <section class="fcurd-page__table">
        <NaiveCrudTable
          :columns="tableColumns"
          :show-selection="showSelection"
          :selection-column="ui?.table?.selectionColumn"
          :show-actions-column="showActionsColumn"
          :data-table-props="ui?.table?.dataTableProps"
          :pagination-props="ui?.table?.paginationProps"
        >
          <template #actions-header>
            <template v-if="$slots['actions-header']">
              <slot name="actions-header" />
            </template>
            <template v-else>
              操作
            </template>
          </template>

          <template #table-actions="slotProps">
            <template v-if="$slots['table-actions']">
              <slot
                name="table-actions"
                v-bind="slotProps"
              />
            </template>
            <template v-else>
              <CrudActionButtonsRenderer area="batch" />

              <CrudActionButtonsRenderer area="table:extra" />
            </template>
          </template>

          <!-- 全量透传外部传入的 slots（cell-xxx 等），但排除 row-actions 以便我们包装增强参数 -->
          <template
            v-for="name in forwardedTableSlotNames"
            :key="name"
            #[name]="slotProps"
          >
            <slot
              :name="name"
              v-bind="slotProps"
            />
          </template>

          <template #row-actions="{ row }">
            <template v-if="$slots['row-actions']">
              <slot
                name="row-actions"
                :row="row"
                :open-edit="openEdit"
                :default-actions="{ Edit: EditAction, Delete: DeleteAction }"
                :crud="crud"
                :refresh="crud.refresh"
              />
            </template>
            <template v-else>
              <CrudActionButtonsRenderer
                area="row:before"
                :row="row"
              />

              <CrudActionButtonsRenderer
                area="row:after"
                :row="row"
              />
            </template>
          </template>
        </NaiveCrudTable>
      </section>

      <NaiveCrudForm
        v-model="visible"
        :row="editingRow"
        :fields="fields as any"
        :form-mode="formMode"
        :reset-on-close="true"
        :form-props="ui?.form?.formProps"
        :modal-props="ui?.form?.modalProps"
        :drawer-props="ui?.form?.drawerProps"
        :drawer-content-props="ui?.form?.drawerContentProps"
        @submit="handleSubmit"
        @close="handleClose"
        @open="handleOpenEvent"
        @form-model-ready="handleFormModelReady"
      >
        <template
          v-for="name in forwardedFormSlotNames"
          :key="name"
          #[name]="slotProps"
        >
          <slot
            :name="name"
            v-bind="slotProps"
          />
        </template>
      </NaiveCrudForm>
    </NCard>
  </CrudProvider>
</template>

<style scoped>
/* NaiveAutoCrud 默认页面布局样式（可被业务侧外层样式覆盖） */
.fcurd-page__toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 12px;
}

.fcurd-page__search {
  padding: 12px;
}

.fcurd-page__before-table {
  margin-bottom: 12px;
}

.fcurd-page__table {
  margin-top: 8px;
}

/* 暗色模式：尽量跟随 Naive UI 的暗色主题，但避免强耦合 */
@media (prefers-color-scheme: dark) {}

@media (max-width: 640px) {
  .fcurd-page__toolbar {
    justify-content: flex-start;
  }
}
</style>
