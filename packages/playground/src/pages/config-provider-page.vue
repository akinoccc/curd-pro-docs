<script setup lang="ts">
import type { CrudAdapter, ListResult } from '@fcurd/core'
import { useCrudForm, useCrudList, useCrudSelection } from '@fcurd/core'
import {
  CrudForm,
  CrudSearch,
  CrudTable,
  defineColumns,
  defineFields,
} from '@fcurd/naive-ui'
import {
  NButton,
  NCard,
  NCode,
  NDivider,
  NForm,
  NFormItem,
  NInput,
  NRadioButton,
  NRadioGroup,
  NSpace,
  NText,
} from 'naive-ui'
import { computed, onMounted, ref } from 'vue'

type DateValueType = 'timestamp' | 'string'
type DateUnit = 'ms' | 's'

const valueType = ref<DateValueType>('timestamp')
const unit = ref<DateUnit>('ms')

const displayMode = ref<'none' | 'global' | 'byType'>('byType')
const globalFormat = ref('yyyy-MM-dd')
const fmtDate = ref('yyyy-MM-dd')
const fmtDatetime = ref('yyyy-MM-dd HH:mm:ss')
const fmtDateRange = ref('yyyy-MM-dd')
const fmtDatetimeRange = ref('yyyy-MM-dd HH:mm:ss')

const config = computed(() => {
  const displayFormat = (() => {
    if (displayMode.value === 'none')
      return undefined
    if (displayMode.value === 'global')
      return globalFormat.value
    return {
      date: fmtDate.value,
      datetime: fmtDatetime.value,
      dateRange: fmtDateRange.value,
      datetimeRange: fmtDatetimeRange.value,
    }
  })()

  return {
    date: {
      valueType: valueType.value,
      unit: valueType.value === 'timestamp' ? unit.value : undefined,
      displayFormat,
    },
  }
})

interface ConfigDemoRow {
  id: number
  date: number | string
  datetime: number | string
  dateRange: [number | string, number | string] | null
  datetimeRange: [number | string, number | string] | null
}

function genValue(offset: number): number | string {
  const ms = Date.now() + offset * 86400_000
  if (valueType.value === 'string')
    return new Date(ms).toISOString()
  return unit.value === 's' ? Math.floor(ms / 1000) : ms
}

let idCounter = 1
function createRow(offset: number): ConfigDemoRow {
  return {
    id: idCounter++,
    date: genValue(offset),
    datetime: genValue(offset),
    dateRange: [genValue(offset), genValue(offset + 5)],
    datetimeRange: [genValue(offset), genValue(offset + 3)],
  }
}

const store = ref<ConfigDemoRow[]>([
  createRow(-7),
  createRow(-3),
  createRow(0),
  createRow(5),
])

const adapter: CrudAdapter<ConfigDemoRow> = {
  getId: (row: ConfigDemoRow) => row.id,
  list: async (params: any): Promise<ListResult<ConfigDemoRow>> => {
    await new Promise(r => setTimeout(r, 100))
    const { page, pageSize, sort } = params

    const result = [...store.value]

    if (sort) {
      const key = sort.field as keyof ConfigDemoRow
      result.sort((a, b) => {
        const av = a[key]
        const bv = b[key]
        if (av === bv)
          return 0
        const cmp = av! > bv! ? 1 : -1
        return sort.order === 'descend' ? -cmp : cmp
      })
    }

    const start = (page - 1) * pageSize
    const items = result.slice(start, start + pageSize)

    return { items, total: store.value.length }
  },

  create: async (data: any) => {
    const row: ConfigDemoRow = {
      id: idCounter++,
      date: data.date ?? genValue(0),
      datetime: data.datetime ?? genValue(0),
      dateRange: data.dateRange ?? null,
      datetimeRange: data.datetimeRange ?? null,
    }
    store.value.push(row)
    return row
  },

  update: async (id: any, data: any) => {
    const idx = store.value.findIndex(r => r.id === id)
    if (idx >= 0) {
      store.value[idx] = { ...store.value[idx], ...data }
      return store.value[idx]
    }
    throw new Error('Row not found')
  },

  remove: async (id: any) => {
    const idx = store.value.findIndex(r => r.id === id)
    if (idx >= 0) {
      store.value.splice(idx, 1)
    }
  },
}

const fields = defineFields<ConfigDemoRow>([
  {
    key: 'date',
    label: '日期',
    type: 'date',
    visibleIn: { search: true, table: true, form: true },
  },
  {
    key: 'datetime',
    label: '日期时间',
    type: 'datetime',
    visibleIn: { search: true, table: true, form: true },
  },
  {
    key: 'dateRange',
    label: '日期范围',
    type: 'dateRange',
    visibleIn: { search: true, table: true, form: true },
  },
  {
    key: 'datetimeRange',
    label: '日期时间范围',
    type: 'datetimeRange',
    visibleIn: { search: true, table: true, form: true },
  },
])

const columns = defineColumns<ConfigDemoRow>([
  { key: 'date', label: '日期', sortable: true, width: 150 },
  { key: 'datetime', label: '日期时间', sortable: true, width: 180 },
  { key: 'dateRange', label: '日期范围', width: 220 },
  { key: 'datetimeRange', label: '日期时间范围', width: 280 },
])

// Initialize hooks
const list = useCrudList<ConfigDemoRow>({
  adapter,
})

const selection = useCrudSelection<ConfigDemoRow>({
  rows: list.rows,
  getId: adapter.getId,
})

const form = useCrudForm<ConfigDemoRow>({
  fields: fields as any,
})

// Form visibility
const formVisible = ref(false)
const editingRow = ref<ConfigDemoRow | null>(null)

function openCreate() {
  editingRow.value = null
  form.reset()
  form.setMode('create')
  formVisible.value = true
}

function openEdit(row: ConfigDemoRow) {
  editingRow.value = row
  form.reset(row)
  form.setMode('edit')
  formVisible.value = true
}

async function handleFormSubmit(data: Partial<ConfigDemoRow>) {
  try {
    if (form.mode.value === 'create') {
      await adapter.create!(data)
    }
    else if (editingRow.value) {
      await adapter.update!(editingRow.value.id, data)
    }
    formVisible.value = false
    await list.refresh()
  }
  catch (err) {
    console.error(err)
  }
}

function formatDateValue(value: any): string {
  if (value == null)
    return '-'
  if (typeof value === 'number') {
    const ms = unit.value === 's' ? value * 1000 : value
    return new Date(ms).toLocaleString()
  }
  if (typeof value === 'string') {
    return new Date(value).toLocaleString()
  }
  return String(value)
}

function formatRangeValue(value: any): string {
  if (!Array.isArray(value) || value.length < 2)
    return '-'
  return `${formatDateValue(value[0])} ~ ${formatDateValue(value[1])}`
}

onMounted(() => {
  void list.refresh()
})
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <!-- Config panel -->
    <NCard title="日期配置">
      <NForm
        label-placement="left"
        label-width="120"
      >
        <NFormItem label="值类型">
          <NRadioGroup v-model:value="valueType">
            <NRadioButton value="timestamp">
              时间戳
            </NRadioButton>
            <NRadioButton value="string">
              ISO字符串
            </NRadioButton>
          </NRadioGroup>
        </NFormItem>

        <NFormItem
          v-if="valueType === 'timestamp'"
          label="时间戳单位"
        >
          <NRadioGroup v-model:value="unit">
            <NRadioButton value="ms">
              毫秒
            </NRadioButton>
            <NRadioButton value="s">
              秒
            </NRadioButton>
          </NRadioGroup>
        </NFormItem>

        <NFormItem label="显示格式">
          <NRadioGroup v-model:value="displayMode">
            <NRadioButton value="none">
              无格式化
            </NRadioButton>
            <NRadioButton value="global">
              全局格式
            </NRadioButton>
            <NRadioButton value="byType">
              按类型
            </NRadioButton>
          </NRadioGroup>
        </NFormItem>

        <template v-if="displayMode === 'global'">
          <NFormItem label="全局格式">
            <NInput v-model:value="globalFormat" />
          </NFormItem>
        </template>

        <template v-if="displayMode === 'byType'">
          <NFormItem label="日期格式">
            <NInput v-model:value="fmtDate" />
          </NFormItem>
          <NFormItem label="日期时间格式">
            <NInput v-model:value="fmtDatetime" />
          </NFormItem>
          <NFormItem label="日期范围格式">
            <NInput v-model:value="fmtDateRange" />
          </NFormItem>
          <NFormItem label="日期时间范围格式">
            <NInput v-model:value="fmtDatetimeRange" />
          </NFormItem>
        </template>
      </NForm>

      <NDivider />

      <NText>当前配置：</NText>
      <NCode
        :code="JSON.stringify(config, null, 2)"
        language="json"
      />
    </NCard>

    <!-- CRUD demo -->
    <NCard title="日期字段演示">
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

      <!-- Search -->
      <CrudSearch
        :list="list"
        :fields="(fields as any)"
      />

      <!-- Table -->
      <CrudTable
        :list="list"
        :columns="columns"
        :selection="selection"
        :row-key="(row: ConfigDemoRow) => row.id"
        show-actions-column
      >
        <template #cell-date="{ row }">
          {{ formatDateValue(row.date) }}
        </template>
        <template #cell-datetime="{ row }">
          {{ formatDateValue(row.datetime) }}
        </template>
        <template #cell-dateRange="{ row }">
          {{ formatRangeValue(row.dateRange) }}
        </template>
        <template #cell-datetimeRange="{ row }">
          {{ formatRangeValue(row.datetimeRange) }}
        </template>

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

      <!-- Form -->
      <CrudForm
        v-model:visible="formVisible"
        :form="form"
        :fields="(fields as any)"
        display-mode="drawer"
        @submit="handleFormSubmit"
      />
    </NCard>
  </div>
</template>
