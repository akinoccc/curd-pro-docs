<script setup
  lang="ts"
  generic="Row, RowId extends string | number = string | number, Query extends Record<string, any> = Record<string, any>, CreateInput = Partial<Row>, UpdateInput = Partial<Row>, SortField extends string = string"
>
import type {
  CrudAdapter,
  CrudField,
  CrudTableColumn,
  DictApi,
  UseCrudReturn,
} from '@fcurd/core'
import type { FunctionalComponent } from 'vue'
import { useCrud } from '@fcurd/core'
import {
  CrudProvider,
} from '@fcurd/vue'
import { NButton, NCard, NPopconfirm } from 'naive-ui'
import { computed, h, onMounted, ref, useSlots } from 'vue'
import { naiveControlMap } from './control-map-naive'
import NaiveCrudForm from './NaiveCrudForm.vue'
import NaiveCrudSearch from './NaiveCrudSearch.vue'
import NaiveCrudTable from './NaiveCrudTable.vue'

type NDataTableProps = InstanceType<(typeof import('naive-ui'))['NDataTable']>['$props']
type NPaginationProps = InstanceType<(typeof import('naive-ui'))['NPagination']>['$props']
type NFormProps = InstanceType<(typeof import('naive-ui'))['NForm']>['$props']
type NModalProps = InstanceType<(typeof import('naive-ui'))['NModal']>['$props']
type NDrawerProps = InstanceType<(typeof import('naive-ui'))['NDrawer']>['$props']
type NDrawerContentProps = InstanceType<(typeof import('naive-ui'))['NDrawerContent']>['$props']

interface ForwardDataTableProps extends Omit<NDataTableProps, 'columns' | 'data'> {}
interface ForwardPaginationProps extends Omit<NPaginationProps, 'page' | 'pageSize' | 'itemCount'> {}
interface ForwardSearchFormProps extends Omit<NFormProps, 'model'> {}
interface ForwardCrudFormProps extends Omit<NFormProps, 'model' | 'rules'> {}
interface ForwardModalProps extends Omit<NModalProps, 'show'> {}
interface ForwardDrawerProps extends Omit<NDrawerProps, 'show'> {}
interface ForwardDrawerContentProps extends Omit<NDrawerContentProps, 'title'> {}

interface NaiveAutoCrudUiProps {
  table?: {
    dataTableProps?: ForwardDataTableProps
    paginationProps?: ForwardPaginationProps
  }
  search?: {
    formProps?: ForwardSearchFormProps
  }
  form?: {
    formProps?: ForwardCrudFormProps
    modalProps?: ForwardModalProps
    drawerProps?: ForwardDrawerProps
    drawerContentProps?: ForwardDrawerContentProps
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
  dictApi?: DictApi
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

const crud: UseCrudReturn<Row, Query, SortField> = useCrud<Row, Query, RowId, CreateInput, UpdateInput, SortField>({
  adapter: props.adapter,
})
const slots = useSlots()
const forwardedTableSlotNames = computed(() => Object.keys(slots).filter(name => name !== 'row-actions'))
const forwardedFormSlotNames = computed(() => {
  return Object.keys(slots).filter(name =>
    name.startsWith('field-') || name.startsWith('field_'),
  )
})

onMounted(() => {
  void crud.refresh()
})

// 允许业务侧在不侵入 slot 的情况下刷新列表/写查询
// （例如：操作按钮在外部组件里触发、或 mutation 成功后需要刷新）
defineExpose({
  crud,
  refresh: crud.refresh,
  setQuery: crud.setQuery,
})

const visible = ref(false)
const editingRow = ref<Row | null>(null)

const mode = computed<'create' | 'edit'>(() => (editingRow.value ? 'edit' : 'create'))

interface RowActionProps {
  row: Row
}

const EditAction: FunctionalComponent<RowActionProps> = (p) => {
  if (props.disableEdit)
    return null

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
  if (props.disableDelete || !props.adapter.remove)
    return null

  const getId = props.adapter.getId ?? ((row: any) => row?.id as RowId)
  const rowId = getId(p.row)

  return h(
    NPopconfirm,
    {
      onPositiveClick: () => {
        void props.adapter
          .remove?.(rowId)
          .then(() => crud.refresh())
          .catch((err) => {
            emit('error', err)
          })
      },
    },
    {
      trigger: () => h(
        NButton,
        {
          tertiary: true,
          type: 'error',
          size: 'small',
        },
        {
          default: () => '删除',
        },
      ),
      default: () => '确定要删除这条记录吗？',
    },
  )
}

function openCreate(): void {
  editingRow.value = null
  visible.value = true
}

function openEdit(row: any): void {
  editingRow.value = row as Row
  visible.value = true
}

function handleClose(): void {
  visible.value = false
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
  <CrudProvider
    :crud="crud"
    :fields="fields"
    :columns="tableColumns"
    :control-map="naiveControlMap"
    :dict-api="dictApi"
    :get-id="adapter.getId ?? ((row: any) => row?.id as RowId)"
  >
    <NCard title="列表">
      <template #header-extra>
        <section class="fcurd-page__toolbar">
          <slot
            name="toolbar"
            :crud="crud"
            :open-create="openCreate"
          >
            <NButton
              v-if="!disableAdd"
              type="primary"
              @click="openCreate"
            >
              新增
            </NButton>
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
          :show-actions-column="showActionsColumn"
          :data-table-props="ui?.table?.dataTableProps"
          :pagination-props="ui?.table?.paginationProps"
        >
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
              <component
                :is="EditAction"
                :row="row"
              />
              <component
                :is="DeleteAction"
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
  margin-top: 12px;
  margin-bottom: 12px;
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
