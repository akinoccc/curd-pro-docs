<script setup lang="ts">
import type { CrudAdapter, CrudField } from '@fcurd/core'
import { createNaiveColumns, NaiveAutoCrud } from '@fcurd/naive-ui'

interface DemoClient {
  id: number
  name: string
  email: string
}

const fields: CrudField<DemoClient, DemoClient>[] = [
  {
    key: 'name',
    label: () => '姓名',
    type: 'text',
    required: true,
    visibleIn: { table: true, search: true, form: true },
    ui: {
      naiveProps: { clearable: true, maxlength: 30 },
      naiveColumn: { ellipsis: true },
    },
  },
  {
    key: 'email',
    label: () => '邮箱',
    type: 'text',
    required: true,
    rules: [
      {
        trigger: ['blur', 'submit'],
        validator: ({ value }) =>
          /^[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(value || '') || '邮箱格式不正确',
      },
    ],
    visibleIn: { table: true, search: true, form: true },
    ui: {
      naiveProps: { clearable: true },
      naiveColumn: { ellipsis: true },
    },
  },
]

const columns = createNaiveColumns<DemoClient>(fields, {
  defaults: { searchable: 'input' },
  overrides: {
    name: { width: 150 },
    email: { width: 200 },
  },
})

let idSeed = 4
const mockData: DemoClient[] = [
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
  },
]

const adapter: CrudAdapter<DemoClient> = {
  async list(params) {
    const { page, pageSize, query } = params
    console.log('list', params)
    const filtered = mockData.filter((item) => {
      if (query.name && !item.name.includes(query.name)) return false
      if (query.email && !item.email.includes(query.email)) return false
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
    const row: DemoClient = {
      id: idSeed++,
      name: data.name ?? '',
      email: data.email ?? '',
    }
    mockData.push(row)
    return row
  },
  async update(id, data) {
    const index = mockData.findIndex(item => item.id === id)
    if (index >= 0) {
      mockData[index] = { ...mockData[index], ...data } as DemoClient
    }
    return mockData[index]
  },
  async remove(id) {
    const index = mockData.findIndex(item => item.id === id)
    if (index >= 0) mockData.splice(index, 1)
  },
}

</script>

<template>
  <div>
    <NaiveAutoCrud
      :adapter="adapter"
      :fields="fields"
      :table-columns="columns"
      :search-fields="fields"
      form-mode="modal"
    >
      <!-- 自定义行操作示例：使用默认 actions 并自定义排序 -->
      <template #row-actions="{ row, defaultActions }">
        <!-- 这里演示：先删除、再编辑 -->
        <component :is="defaultActions.Delete" :row="row" />
        <div>测试</div>
        <component :is="defaultActions.Edit" :row="row" />
      </template>
    </NaiveAutoCrud>
  </div>
</template>
