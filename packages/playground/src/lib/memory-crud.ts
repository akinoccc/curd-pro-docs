import type { CrudAdapter, CrudListResult, CrudSort } from '@fcurd/core'
import { sleep } from './sleep'

export interface DemoRow {
  id: number
  name: string
  amount: number
  status: 'draft' | 'enabled' | 'disabled'
  category: 'A' | 'B' | 'C'
  enabled: boolean
  createdAt: number // timestamp(ms)
  remark?: string | null
}

export interface DemoQuery {
  // NaiveCrudSearch 默认会把搜索写到 query.search
  search?: {
    name?: string | null
    status?: DemoRow['status'] | null
    category?: DemoRow['category'] | null
    enabled?: boolean | null
    createdAt?: [number, number] | null
  }
}

function normalizeSearch(query: Record<string, any>): DemoQuery['search'] {
  const maybeSearch = (query as any)?.search
  if (maybeSearch && typeof maybeSearch === 'object')
    return maybeSearch as any
  return query as any
}

function includesIgnoreCase(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase())
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
  if (typeof a === 'boolean' && typeof b === 'boolean')
    return Number(a) - Number(b)
  return String(a).localeCompare(String(b))
}

function sortRows(rows: DemoRow[], sort?: CrudSort | null): DemoRow[] {
  if (!sort)
    return rows
  const { field, order } = sort
  const dir = order === 'descend' ? -1 : 1
  return rows.slice().sort((ra, rb) => dir * compare((ra as any)[field], (rb as any)[field]))
}

function filterRows(rows: DemoRow[], query: Record<string, any>): DemoRow[] {
  const search = normalizeSearch(query)
  const name = search?.name ?? null
  const status = search?.status ?? null
  const category = search?.category ?? null
  const enabled = search?.enabled ?? null
  const createdAt = search?.createdAt ?? null

  return rows.filter((row) => {
    if (name && !includesIgnoreCase(row.name, String(name)))
      return false
    if (status && row.status !== status)
      return false
    if (category && row.category !== category)
      return false
    if (enabled !== null && enabled !== undefined && row.enabled !== enabled)
      return false
    if (createdAt && createdAt.length === 2) {
      const [start, end] = createdAt
      const s = typeof start === 'number' ? start : Number.NaN
      const e = typeof end === 'number' ? end : Number.NaN
      const ts = row.createdAt
      if (Number.isFinite(s) && ts < s)
        return false
      if (Number.isFinite(e) && ts > e)
        return false
    }
    return true
  })
}

function nextId(list: DemoRow[]): number {
  return list.reduce((max, row) => Math.max(max, row.id), 0) + 1
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function formatExportFilename(prefix: string, ext: string): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = pad2(d.getMonth() + 1)
  const day = pad2(d.getDate())
  const hh = pad2(d.getHours())
  const mm = pad2(d.getMinutes())
  const ss = pad2(d.getSeconds())
  return `${prefix}-${y}${m}${day}-${hh}${mm}${ss}.${ext}`
}

function escapeCsvCell(value: unknown): string {
  const raw = value === null || value === undefined ? '' : String(value)
  // CSV 需要对包含特殊字符的字段加引号，并转义引号为双引号
  const escaped = raw.replaceAll('"', '""')
  const shouldQuote = /[",\r\n]/.test(escaped)
  return shouldQuote ? `"${escaped}"` : escaped
}

function toCsv(rows: DemoRow[]): string {
  const header: Array<{ key: keyof DemoRow, label: string }> = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '名称' },
    { key: 'amount', label: '金额' },
    { key: 'status', label: '状态' },
    { key: 'category', label: '分类' },
    { key: 'enabled', label: '启用' },
    { key: 'createdAt', label: '创建时间' },
    { key: 'remark', label: '备注' },
  ]

  const lines: string[] = []
  lines.push(header.map(h => escapeCsvCell(h.label)).join(','))

  for (const row of rows) {
    const cells = header.map(({ key }) => {
      if (key === 'createdAt') {
        const ts = row.createdAt
        const text = typeof ts === 'number' && Number.isFinite(ts) ? new Date(ts).toLocaleString() : String(ts ?? '')
        return escapeCsvCell(text)
      }
      return escapeCsvCell((row as any)[key])
    })
    lines.push(cells.join(','))
  }

  // Excel 兼容：加 UTF-8 BOM
  return `\uFEFF${lines.join('\r\n')}\r\n`
}

export function createDemoRows(count = 137): DemoRow[] {
  const base = new Date()
  const statuses: DemoRow['status'][] = ['draft', 'enabled', 'disabled']
  const categories: DemoRow['category'][] = ['A', 'B', 'C']

  const rows: DemoRow[] = []
  for (let i = 0; i < count; i += 1) {
    const id = i + 1
    const status = statuses[id % statuses.length]
    const category = categories[id % categories.length]
    const enabled = status === 'enabled'
    const createdAt = base.getTime() - id * 36 * 60 * 1000
    rows.push({
      id,
      name: `示例数据 ${id}`,
      amount: (id * 7) % 1000,
      status,
      category,
      enabled,
      createdAt,
      remark: id % 4 === 0 ? '这是一条备注' : null,
    })
  }
  return rows
}

export function createMemoryCrudAdapter(initial?: DemoRow[]): {
  adapter: CrudAdapter<DemoRow, number, DemoQuery>
  getAll: () => DemoRow[]
  reset: (next?: DemoRow[]) => void
} {
  let db: DemoRow[] = (initial ?? createDemoRows()).slice()

  function getAll(): DemoRow[] {
    return db.slice()
  }

  function reset(next?: DemoRow[]): void {
    db = (next ?? createDemoRows()).slice()
  }

  const adapter: CrudAdapter<DemoRow, number, DemoQuery> = {
    getId(row) {
      return row.id
    },
    async list(params): Promise<CrudListResult<DemoRow>> {
      // 模拟延迟 + 支持 abort（验证 useCrud 的“最后一次请求胜出”）
      await sleep(220, params.signal)

      const filtered = filterRows(db, params.query as any)
      const sorted = sortRows(filtered, params.sort as any)

      const page = Math.max(1, params.page ?? 1)
      const pageSize = Math.max(1, params.pageSize ?? 20)
      const start = (page - 1) * pageSize
      const end = start + pageSize

      return {
        items: sorted.slice(start, end),
        total: sorted.length,
      }
    },
    async export(params) {
      // 模拟导出延迟 + 支持 abort（与 list 行为一致）
      await sleep(180, params.signal)

      const filtered = filterRows(db, params.query as any)
      const sorted = sortRows(filtered, params.sort as any)
      const csv = toCsv(sorted)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      return {
        blob,
        filename: formatExportFilename('demo-export', 'csv'),
      }
    },
    async create(data): Promise<DemoRow> {
      await sleep(120)
      const row: DemoRow = {
        id: nextId(db),
        name: String((data as any)?.name ?? ''),
        amount: Number((data as any)?.amount ?? 0),
        status: ((data as any)?.status ?? 'draft') as DemoRow['status'],
        category: ((data as any)?.category ?? 'A') as DemoRow['category'],
        enabled: Boolean((data as any)?.enabled ?? false),
        createdAt: Date.now(),
        remark: ((data as any)?.remark ?? null) as any,
      }
      db = [row, ...db]
      return row
    },
    async update(id, data): Promise<DemoRow> {
      await sleep(120)
      const idx = db.findIndex(row => row.id === id)
      if (idx < 0)
        throw new Error(`记录不存在：${id}`)
      const current = db[idx]
      const next: DemoRow = {
        ...current,
        ...(data as any),
        id: current.id,
      }
      db = db.slice()
      db[idx] = next
      return next
    },
    async remove(id): Promise<void> {
      await sleep(100)
      db = db.filter(row => row.id !== id)
    },
  }

  return { adapter, getAll, reset }
}
