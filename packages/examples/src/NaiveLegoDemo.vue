<script setup lang="ts">
import { ref } from 'vue'
import type { CrudAdapter, CrudField, CrudTableColumn } from '@fcurd/core'
import { useCrud } from '@fcurd/core'
import { CrudPage, CrudProvider } from '@fcurd/vue'
import { NaiveCrudSearch, NaiveCrudTable, naiveControlMap } from '@fcurd/naive-ui'
import { NButton } from 'naive-ui'

interface LegoClient {
  id: number
  name: string
  status: number
}

console.log('NaiveLegoDemo')

const legoFields: CrudField<LegoClient, LegoClient>[] = [
  {
    key: 'name',
    label: () => '姓名',
    type: 'text',
    required: true,
    visibleIn: { table: true, search: true, form: true },
  },
  {
    key: 'status',
    label: () => '状态',
    type: 'select',
    dictKey: 'ClientStatus',
    visibleIn: { table: true, search: true, form: true },
  },
]

const legoColumns: CrudTableColumn<LegoClient>[] = [
  { field: legoFields[0], width: 150, searchable: 'input' },
  { field: legoFields[1], width: 120, searchable: 'select' },
]

let legoIdSeed = 4
const legoMockData: LegoClient[] = [
  {
    id: 1,
    name: '乐高门店 A',
    status: 1,
  },
  {
    id: 2,
    name: '乐高门店 B',
    status: 0,
  },
  {
    id: 3,
    name: '乐高渠道 C',
    status: 1,
  },
]

const legoAdapter: CrudAdapter<LegoClient> = {
  async list(params) {
    const { page, pageSize, query } = params
    const filtered = legoMockData.filter((item) => {
      if (query.name && !item.name.includes(query.name)) return false
      if (query.status != null && query.status !== '') {
        return String(item.status) === String(query.status)
      }
      return true
    })
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return {
      items: filtered.slice(start, end),
      total: filtered.length,
    }
  },
  async create(data) {
    const row: LegoClient = {
      id: legoIdSeed++,
      name: data.name ?? '',
      status: (data.status as number | undefined) ?? 1,
    }
    legoMockData.push(row)
    return row
  },
  async update(id, data) {
    const index = legoMockData.findIndex(item => item.id === id)
    if (index >= 0) {
      legoMockData[index] = { ...legoMockData[index], ...data } as LegoClient
    }
    return legoMockData[index]
  },
  async remove(id) {
    const index = legoMockData.findIndex(item => item.id === id)
    if (index >= 0) legoMockData.splice(index, 1)
  },
}

const crud = useCrud<LegoClient>({
  adapter: legoAdapter,
})

const dictApi = {
  async getOptions(key: string) {
    if (key === 'ClientStatus') {
      return [
        { label: '启用', value: 1 },
        { label: '停用', value: 0 },
      ]
    }
    return []
  },
}

const editingRow = ref<LegoClient | null>(null)
const formVisible = ref(false)

function openCreate(): void {
  editingRow.value = null
  formVisible.value = true
}

function openEdit(row: LegoClient): void {
  editingRow.value = row
  formVisible.value = true
}

async function handleSave(payload: { mode: 'create' | 'edit'; data: Partial<LegoClient> }): Promise<void> {
  if (payload.mode === 'create') {
    await legoAdapter.create?.(payload.data)
  }
  if (payload.mode === 'edit' && editingRow.value) {
    await legoAdapter.update?.(editingRow.value.id, payload.data)
  }
  formVisible.value = false
  await crud.refresh()
}
</script>

<template>
  <div>
    <!-- 标题由 App.vue 统一提供，这里仅保留内容 -->
    <CrudProvider
      :crud="crud"
      :fields="legoFields"
      :columns="legoColumns"
      :control-map="naiveControlMap"
      :dict-api="dictApi"
    >
      <CrudPage :crud="crud">
        <template #toolbar>
          <NButton type="primary" size="small" @click="openCreate">
            新增
          </NButton>
        </template>

        <template #search>
          <NaiveCrudSearch :fields="legoFields" />
        </template>

        <template #table>
          <NaiveCrudTable
            :columns="legoColumns"
            :show-selection="true"
            :show-actions-column="true"
          >
            <template #row-actions="{ row }">
              <NButton tertiary size="small" @click="openEdit(row)">
                编辑
              </NButton>
              <NButton
                tertiary
                type="error"
                size="small"
                @click="legoAdapter?.remove?.((row as LegoClient).id).then(() => crud.refresh())"
              >
                删除
              </NButton>
            </template>
          </NaiveCrudTable>
        </template>
      </CrudPage>
    </CrudProvider>

    <!-- 简单内联表单，演示 CrudForm 逻辑（示例中直接使用 AutoCrud 的表单接口结构） -->
    <div v-if="formVisible" style="margin-top: 16px">
      <p>
        表单示例（此处仅演示保存逻辑，真实项目中建议直接使用 AutoCrud / CrudForm）
      </p>
      <NButton
        type="primary"
        size="small"
        @click="handleSave({ mode: editingRow ? 'edit' : 'create', data: editingRow || {} })"
      >
        保存当前行（示例）
      </NButton>
    </div>
  </div>
</template>


