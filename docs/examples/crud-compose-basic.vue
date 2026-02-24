<script setup lang="ts">
import type { CrudAdapter } from '@uozi/vito-core'
import type { DemoQuery, DemoRow } from './basic-types'
import { useCrudForm, useCrudList, useCrudSelection } from '@uozi/vito-core'
import { CrudForm, CrudSearch, CrudTable, defineColumns, defineFields } from '@uozi/vito-naive-ui'
import { NButton, NCard, NSpace } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { createBasicAdapter } from './basic-adapter'

const { adapter } = createBasicAdapter()

const fields = defineFields<DemoRow>([
  { key: 'name', label: '名称', type: 'text', required: true, visibleIn: { searchForm: true, table: true, editForm: true } },
  { key: 'status', label: '状态', type: 'select', visibleIn: { searchForm: true, table: true, editForm: true } },
  { key: 'amount', label: '金额', type: 'number', visibleIn: { searchForm: false, table: true, editForm: true } },
])

const columns = defineColumns<DemoRow>([
  { key: 'name', label: '名称', sortable: true, width: 220 },
  { key: 'status', label: '状态', width: 120 },
  { key: 'amount', label: '金额', sortable: true, width: 120 },
])

const list = useCrudList<DemoRow, DemoQuery>({
  adapter: adapter as CrudAdapter<DemoRow, DemoQuery>,
  initialQuery: { search: {} },
})

const selection = useCrudSelection<DemoRow>({
  rows: list.rows,
  getId: adapter.getId,
})

const form = useCrudForm<DemoRow>({
  fields: fields as any,
})

const visible = ref(false)
const editing = ref<DemoRow | null>(null)

function openCreate() {
  editing.value = null
  form.setMode('create')
  form.reset()
  visible.value = true
}

function openEdit(row: DemoRow) {
  editing.value = row
  form.setMode('edit')
  form.reset(row)
  visible.value = true
}

async function handleSubmit(data: Partial<DemoRow>) {
  if (form.mode.value === 'create')
    await adapter.create?.(data as any)
  else if (editing.value)
    await adapter.update?.(editing.value.id, data as any)

  visible.value = false
  await list.refresh()
}

onMounted(() => {
  void list.refresh()
})
</script>

<template>
  <NCard title="手动组合：CrudSearch + CrudTable + CrudForm">
    <template #header-extra>
      <NSpace>
        <NButton
          type="primary"
          @click="openCreate"
        >
          新增
        </NButton>
      </NSpace>
    </template>

    <CrudSearch
      :list="list"
      :fields="(fields as any)"
      query-key="search"
    />

    <CrudTable
      :list="list"
      :columns="columns"
      :selection="selection"
      :row-key="(row: DemoRow) => row.id"
      show-actions-column
    >
      <template #row-actions="{ row }">
        <NSpace>
          <NButton
            size="small"
            @click="openEdit(row)"
          >
            编辑
          </NButton>
        </NSpace>
      </template>
    </CrudTable>

    <CrudForm
      v-model:visible="visible"
      :form="form"
      :fields="(fields as any)"
      display-mode="modal"
      @submit="handleSubmit"
    />
  </NCard>
</template>
