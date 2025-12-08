<script setup lang="ts">
import type { CrudAdapter, CrudField, CrudTableColumn } from '@fcurd/core'
import { NaiveAutoCrud } from '@fcurd/naive-ui'

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
  },
  {
    key: 'email',
    label: () => '邮箱',
    type: 'text',
    visibleIn: { table: true, search: true, form: true },
  },
]

const columns: CrudTableColumn<DemoClient>[] = [
  { field: fields[0], width: 150, searchable: 'input' },
  { field: fields[1], width: 200, searchable: 'input' },
]

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
    />
  </div>
</template>
