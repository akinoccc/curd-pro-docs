<script setup lang="ts">
import type { CrudAdapter, CrudField, CrudListResult, CrudSort } from '@fcurd/core'
import { CrudConfigProvider, CrudProvider, useCrud } from '@fcurd/core'
import {
  createNaiveColumns,
  defineNaiveFields,
  naiveControlMap,
  NaiveCrudForm,
  NaiveCrudSearch,
  NaiveCrudTable,
  naiveUiDriver,
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
      unit: unit.value,
      displayFormat,
    },
  }
})

interface ConfigDemoRow {
  id: number
  name: string
  date: number // ms in db
  datetime: number // ms in db
  dateRange: [number, number] | null // ms tuple in db
  datetimeRange: [number, number] | null // ms tuple in db
}

interface ConfigDemoQuery {
  search?: {
    name?: string | null
    date?: number | string | null
    datetime?: number | string | null
    dateRange?: [number, number] | [string, string] | null
    datetimeRange?: [number, number] | [string, string] | null
  }
}

function isYmd(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function parseYmdToMsLocal(ymd: string): number | null {
  if (!isYmd(ymd))
    return null
  const [y, m, d] = ymd.split('-').map(s => Number(s))
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d))
    return null
  const dt = new Date(y, m - 1, d, 0, 0, 0, 0)
  const ms = dt.getTime()
  return Number.isFinite(ms) ? ms : null
}

function normalizeToMs(value: unknown): number | null {
  if (value === null || value === undefined)
    return null
  if (typeof value === 'number' && Number.isFinite(value)) {
    // 当 valueType=timestamp 时，组件回写的 number 会按 unit 表示（ms/s）
    return unit.value === 's' ? value * 1000 : value
  }
  if (typeof value === 'string')
    return parseYmdToMsLocal(value)
  return null
}

function normalizeRangeToMs(value: unknown): [number, number] | null {
  if (!Array.isArray(value) || value.length !== 2)
    return null
  const [a, b] = value
  const s = normalizeToMs(a)
  const e = normalizeToMs(b)
  if (s === null || e === null)
    return null
  return [s, e]
}

function normalizeSearch(query: Record<string, any>): ConfigDemoQuery['search'] {
  const maybeSearch = (query as any)?.search
  if (maybeSearch && typeof maybeSearch === 'object')
    return maybeSearch as any
  return query as any
}

function compare(a: any, b: any): number {
  if (a === b)
    return 0
  if (a === undefined || a === null)
    return -1
  if (b === undefined || b === null)
    return 1
  if (typeof a === 'number' && typeof b === 'number')
    return a - b
  return String(a).localeCompare(String(b))
}

function nextId(list: ConfigDemoRow[]): number {
  return list.reduce((max, row) => Math.max(max, row.id), 0) + 1
}

function seedRows(): ConfigDemoRow[] {
  const base = Date.now()
  const rows: ConfigDemoRow[] = []
  for (let i = 0; i < 23; i += 1) {
    const id = i + 1
    const dt = base - id * 24 * 60 * 60 * 1000
    rows.push({
      id,
      name: `示例 ${id}`,
      date: dt,
      datetime: dt + (id % 24) * 60 * 60 * 1000,
      dateRange: [dt - 3 * 24 * 60 * 60 * 1000, dt] as [number, number],
      datetimeRange: [dt - 2 * 24 * 60 * 60 * 1000, dt + 2 * 60 * 60 * 1000] as [number, number],
    })
  }
  return rows
}

let db: ConfigDemoRow[] = seedRows()

const adapter: CrudAdapter<ConfigDemoRow, number, ConfigDemoQuery, Partial<ConfigDemoRow>, Partial<ConfigDemoRow>, string> = {
  getId(row) {
    return row.id
  },
  async list(params): Promise<CrudListResult<ConfigDemoRow>> {
    const search = normalizeSearch(params.query as any)
    const name = search?.name ?? null
    const date = search?.date ?? null
    const datetime = search?.datetime ?? null
    const dateRange = search?.dateRange ?? null
    const datetimeRange = search?.datetimeRange ?? null

    const dateMs = normalizeToMs(date)
    const datetimeMs = normalizeToMs(datetime)
    const dateRangeMs = normalizeRangeToMs(dateRange)
    const datetimeRangeMs = normalizeRangeToMs(datetimeRange)

    let rows = db.slice()

    rows = rows.filter((row) => {
      if (name && !row.name.toLowerCase().includes(String(name).toLowerCase()))
        return false
      if (dateMs !== null && row.date !== dateMs)
        return false
      if (datetimeMs !== null && row.datetime !== datetimeMs)
        return false
      if (dateRangeMs) {
        const [s, e] = dateRangeMs
        const value = row.date
        if (value < s || value > e)
          return false
      }
      if (datetimeRangeMs) {
        const [s, e] = datetimeRangeMs
        const value = row.datetime
        if (value < s || value > e)
          return false
      }
      return true
    })

    const sort = params.sort as CrudSort | null | undefined
    if (sort) {
      const dir = sort.order === 'descend' ? -1 : 1
      rows = rows.slice().sort((ra, rb) => dir * compare((ra as any)[sort.field], (rb as any)[sort.field]))
    }

    const page = Math.max(1, params.page ?? 1)
    const pageSize = Math.max(1, params.pageSize ?? 10)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return { items: rows.slice(start, end), total: rows.length }
  },
  async create(data): Promise<ConfigDemoRow> {
    const id = nextId(db)
    const now = Date.now()
    const row: ConfigDemoRow = {
      id,
      name: String((data as any)?.name ?? ''),
      date: normalizeToMs((data as any)?.date) ?? now,
      datetime: normalizeToMs((data as any)?.datetime) ?? now,
      dateRange: normalizeRangeToMs((data as any)?.dateRange),
      datetimeRange: normalizeRangeToMs((data as any)?.datetimeRange),
    }
    db = [row, ...db]
    return row
  },
  async update(id, data): Promise<ConfigDemoRow> {
    const idx = db.findIndex(r => r.id === id)
    if (idx < 0)
      throw new Error(`记录不存在：${id}`)
    const current = db[idx]
    const next: ConfigDemoRow = {
      ...current,
      ...(data as any),
      id: current.id,
      name: String((data as any)?.name ?? current.name),
      date: normalizeToMs((data as any)?.date) ?? current.date,
      datetime: normalizeToMs((data as any)?.datetime) ?? current.datetime,
      dateRange: (data as any)?.dateRange === undefined ? current.dateRange : normalizeRangeToMs((data as any)?.dateRange),
      datetimeRange: (data as any)?.datetimeRange === undefined ? current.datetimeRange : normalizeRangeToMs((data as any)?.datetimeRange),
    }
    db = db.slice()
    db[idx] = next
    return next
  },
  async remove(id): Promise<void> {
    db = db.filter(r => r.id !== id)
  },
}

const fields = defineNaiveFields<ConfigDemoRow, any>([
  {
    key: 'name',
    label: () => '名称',
    type: 'text',
    required: true,
    visibleIn: { search: true, table: true, form: true },
    ui: { control: { clearable: true, placeholder: '支持模糊搜索' } },
  },
  {
    key: 'date',
    label: () => 'date（单日）',
    type: 'date',
    visibleIn: { search: true, table: true, form: true },
    ui: { control: { clearable: true } },
  },
  {
    key: 'datetime',
    label: () => 'datetime（时间）',
    type: 'datetime',
    visibleIn: { search: true, table: true, form: true },
    ui: { control: { clearable: true } },
  },
  {
    key: 'dateRange',
    label: () => 'dateRange（范围）',
    type: 'dateRange',
    visibleIn: { search: true, table: false, form: true },
    ui: { control: { clearable: true } },
  },
  {
    key: 'datetimeRange',
    label: () => 'datetimeRange（范围）',
    type: 'datetimeRange',
    visibleIn: { search: true, table: false, form: true },
    ui: { control: { clearable: true } },
  },
])

const columns = computed(() => createNaiveColumns<ConfigDemoRow>(fields as readonly CrudField<ConfigDemoRow, any>[], {
  overrides: {
    name: { sortable: true, width: 160 },
    date: { width: 160 },
    datetime: { width: 200 },
  },
}))

const crud = useCrud<ConfigDemoRow, ConfigDemoQuery, number>({
  adapter,
  debounceMs: 150,
  dedupe: true,
})

onMounted(() => {
  void crud.refresh()
})

const formVisible = ref(false)
const editingRow = ref<ConfigDemoRow | null>(null)

function openCreate(): void {
  editingRow.value = null
  formVisible.value = true
}

function openEdit(row: ConfigDemoRow): void {
  editingRow.value = row
  formVisible.value = true
}

function closeForm(): void {
  formVisible.value = false
}

async function handleSubmit(payload: { mode: 'create' | 'edit', data: any }): Promise<void> {
  if (payload.mode === 'create') {
    await adapter.create?.(payload.data)
  }
  else {
    const id = editingRow.value?.id
    if (id === undefined)
      return
    await adapter.update?.(id, payload.data)
  }
  await crud.refresh()
  formVisible.value = false
}

async function handleRemove(row: ConfigDemoRow): Promise<void> {
  await adapter.remove?.(row.id)
  await crud.refresh()
}

function formatCell(value: unknown, kind: 'date' | 'datetime'): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return kind === 'date'
      ? new Date(value).toLocaleDateString()
      : new Date(value).toLocaleString()
  }
  if (typeof value === 'string')
    return value
  return String(value ?? '')
}
</script>

<template>
  <CrudConfigProvider :config="config">
    <CrudProvider
      :crud="crud"
      :fields="fields as any"
      :columns="columns"
      :control-map="naiveControlMap"
      :ui-driver="naiveUiDriver"
      :get-id="(row: any) => row.id"
    >
      <div style="display: flex; flex-direction: column; gap: 12px">
        <NCard title="ConfigProvider：在一个 CRUD 实例里演示 date 配置">
          <NSpace
            vertical
            :size="10"
          >
            <NText depth="3">
              这个页面用同一个 crud 实例贯穿搜索/表格/表单。输入支持 timestamp 或 YYYY-MM-DD；
              但每次选择/更新时，会始终按 ConfigProvider 的 valueType 回写到 formModel/searchModel。
            </NText>

            <NForm
              label-placement="left"
              label-width="140"
            >
              <NFormItem label="valueType（回写格式）">
                <NRadioGroup v-model:value="valueType">
                  <NRadioButton value="timestamp">
                    timestamp
                  </NRadioButton>
                  <NRadioButton value="string">
                    string
                  </NRadioButton>
                </NRadioGroup>
              </NFormItem>

              <NFormItem label="unit（timestamp 单位）">
                <NSpace
                  :size="8"
                  align="center"
                >
                  <NRadioGroup v-model:value="unit">
                    <NRadioButton value="ms">
                      ms
                    </NRadioButton>
                    <NRadioButton value="s">
                      s
                    </NRadioButton>
                  </NRadioGroup>
                  <NText
                    depth="3"
                    style="font-size: 12px"
                  >
                    （仅 valueType=timestamp 时生效）
                  </NText>
                </NSpace>
              </NFormItem>

              <NFormItem label="displayFormat（展示）">
                <NSpace
                  vertical
                  :size="8"
                  style="width: 100%"
                >
                  <NRadioGroup v-model:value="displayMode">
                    <NRadioButton value="none">
                      不配置
                    </NRadioButton>
                    <NRadioButton value="global">
                      全局一个
                    </NRadioButton>
                    <NRadioButton value="byType">
                      按类型
                    </NRadioButton>
                  </NRadioGroup>

                  <template v-if="displayMode === 'global'">
                    <NInput
                      v-model:value="globalFormat"
                      placeholder="例如：yyyy-MM-dd"
                    />
                  </template>

                  <template v-else-if="displayMode === 'byType'">
                    <div style="display: grid; grid-template-columns: 140px 1fr; gap: 8px 12px">
                      <NText depth="3">
                        date
                      </NText>
                      <NInput v-model:value="fmtDate" />
                      <NText depth="3">
                        datetime
                      </NText>
                      <NInput v-model:value="fmtDatetime" />
                      <NText depth="3">
                        dateRange
                      </NText>
                      <NInput v-model:value="fmtDateRange" />
                      <NText depth="3">
                        datetimeRange
                      </NText>
                      <NInput v-model:value="fmtDatetimeRange" />
                    </div>
                  </template>
                </NSpace>
              </NFormItem>
            </NForm>

            <NSpace :size="8">
              <NButton
                type="primary"
                @click="openCreate"
              >
                新增
              </NButton>
              <NButton
                tertiary
                @click="crud.refresh"
              >
                刷新
              </NButton>
            </NSpace>
          </NSpace>
        </NCard>

        <NCard title="搜索 / 表格">
          <NSpace
            vertical
            :size="12"
          >
            <NText depth="3">
              搜索面板会把值写入 <NText code>
                crud.query.value.search
              </NText>。你可以切换 valueType 看它回写 number 还是 YYYY-MM-DD。
            </NText>

            <NaiveCrudSearch :fields="fields as any" />

            <NaiveCrudTable
              :columns="columns"
              :show-actions-column="true"
            >
              <template #cell-date="{ row }">
                <NText depth="3">
                  {{ formatCell(row.date, 'date') }}
                </NText>
              </template>
              <template #cell-datetime="{ row }">
                <NText depth="3">
                  {{ formatCell(row.datetime, 'datetime') }}
                </NText>
              </template>
              <template #row-actions="{ row }">
                <NSpace :size="8">
                  <NButton
                    size="small"
                    tertiary
                    @click="openEdit(row)"
                  >
                    编辑
                  </NButton>
                  <NButton
                    size="small"
                    tertiary
                    type="error"
                    @click="handleRemove(row)"
                  >
                    删除
                  </NButton>
                </NSpace>
              </template>
            </NaiveCrudTable>

            <NDivider style="margin: 8px 0" />

            <NText depth="3">
              当前注入的 config（供确认）：
            </NText>
            <NCode
              :code="JSON.stringify(config, null, 2)"
              language="json"
            />

            <NDivider style="margin: 8px 0" />

            <NText depth="3">
              当前 crud.query（供确认）：
            </NText>
            <NCode
              :code="JSON.stringify(crud.query.value, null, 2)"
              language="json"
            />
          </NSpace>
        </NCard>

        <NaiveCrudForm
          v-model="formVisible"
          :row="editingRow"
          :fields="fields as any"
          form-mode="drawer"
          :reset-on-close="true"
          @submit="handleSubmit"
          @close="closeForm"
        />
      </div>
    </CrudProvider>
  </CrudConfigProvider>
</template>
