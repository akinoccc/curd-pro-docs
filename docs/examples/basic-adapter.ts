import type { CrudAdapter, CrudSort, ListResult } from '@fcurd/core'
import type { DemoQuery, DemoRow } from './basic-types'

function compare(a: unknown, b: unknown): number {
  if (a === b)
    return 0
  if (a === null || a === undefined)
    return -1
  if (b === null || b === undefined)
    return 1
  if (typeof a === 'number' && typeof b === 'number')
    return a - b
  return String(a).localeCompare(String(b))
}

function sortRows(rows: DemoRow[], sort?: CrudSort | null): DemoRow[] {
  if (!sort)
    return rows
  const dir = sort.order === 'descend' ? -1 : 1
  return rows.slice().sort((ra, rb) => dir * compare((ra as any)[sort.field], (rb as any)[sort.field]))
}

function filterRows(rows: DemoRow[], query: DemoQuery): DemoRow[] {
  const s = query.search ?? {}
  const name = s.name?.trim() ?? null
  const status = s.status ?? null
  return rows.filter((r) => {
    if (name && !r.name.toLowerCase().includes(name.toLowerCase()))
      return false
    if (status && r.status !== status)
      return false
    return true
  })
}

function createSeed(): DemoRow[] {
  const now = Date.now()
  return [
    { id: 1, name: '示例 1', status: 'enabled', amount: 12.3, createdAt: now - 3600_000 },
    { id: 2, name: '示例 2', status: 'draft', amount: 45.6, createdAt: now - 7200_000 },
    { id: 3, name: '示例 3', status: 'disabled', amount: 78.9, createdAt: now - 10800_000 },
  ]
}

export function createBasicAdapter(initial?: DemoRow[]): {
  adapter: CrudAdapter<DemoRow, DemoQuery>
  reset: (next?: DemoRow[]) => void
  getAll: () => DemoRow[]
} {
  let db = (initial ?? createSeed()).slice()
  let idSeq = db.reduce((m, r) => Math.max(m, r.id), 0) + 1

  function getAll() {
    return db.slice()
  }

  function reset(next?: DemoRow[]) {
    db = (next ?? createSeed()).slice()
    idSeq = db.reduce((m, r) => Math.max(m, r.id), 0) + 1
  }

  const adapter: CrudAdapter<DemoRow, DemoQuery> = {
    getId(row) {
      return row.id
    },
    async list(params): Promise<ListResult<DemoRow>> {
      const filtered = filterRows(db, params.query)
      const sorted = sortRows(filtered, params.sort)
      const page = Math.max(1, params.page)
      const pageSize = Math.max(1, params.pageSize)
      const start = (page - 1) * pageSize
      return {
        items: sorted.slice(start, start + pageSize),
        total: sorted.length,
      }
    },
    async create(data): Promise<DemoRow> {
      const row: DemoRow = {
        id: idSeq++,
        name: String((data as any)?.name ?? ''),
        status: ((data as any)?.status ?? 'draft') as DemoRow['status'],
        amount: Number((data as any)?.amount ?? 0),
        createdAt: Date.now(),
      }
      db = [row, ...db]
      return row
    },
    async update(id, data): Promise<DemoRow> {
      const idx = db.findIndex(r => r.id === id)
      if (idx < 0)
        throw new Error(`记录不存在：${id}`)
      const next: DemoRow = { ...db[idx], ...(data as any), id: db[idx].id }
      db = db.slice()
      db[idx] = next
      return next
    },
    async remove(id): Promise<void> {
      db = db.filter(r => r.id !== id)
    },
  }

  return { adapter, reset, getAll }
}
