import type { CrudSort, SetQueryOptions, UseCrudListOptions, UseCrudListReturn } from '../types'
import { onScopeDispose, ref, shallowRef, watch } from 'vue'

/**
 * Core hook for CRUD list operations - handles pagination, sorting, query, and data fetching
 */
export function useCrudList<Row = any, Query extends object = Record<string, unknown>>(
  options: UseCrudListOptions<Row, Query>,
): UseCrudListReturn<Row, Query> {
  const {
    adapter,
    initialQuery,
    initialPage = 1,
    initialPageSize = 20,
    autoFetch = true,
    debounceMs = 0,
    dedupe = true,
    onError,
  } = options

  // State
  const rows = shallowRef<Row[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref<unknown>(null)
  const query = shallowRef<Query>((initialQuery ?? {}) as Query)
  const sort = shallowRef<CrudSort | null>(null)
  const page = ref(initialPage)
  const pageSize = ref(initialPageSize)

  // Internal state for deduplication and abort
  let fetchTimer: ReturnType<typeof setTimeout> | null = null
  let requestSeq = 0
  let activeSeq = 0
  let lastKey: string | null = null
  let activeKey: string | null = null
  let abortController: AbortController | null = null

  function buildKey(): string | null {
    try {
      return JSON.stringify({
        page: page.value,
        pageSize: pageSize.value,
        query: query.value,
        sort: sort.value,
      })
    }
    catch {
      // Unstringifiable query (e.g. BigInt/circular refs) should not break list fetching.
      // Fallback: disable dedupe for this round.
      return null
    }
  }

  function isAbortError(err: unknown): boolean {
    if (!err || typeof err !== 'object')
      return false
    const obj = err as Record<string, unknown>
    return obj.name === 'AbortError' || obj.code === 'ABORT_ERR'
  }

  function isPlainObject(value: unknown): value is Record<string, unknown> {
    return Object.prototype.toString.call(value) === '[object Object]'
  }

  function pruneEmptyDeep<T>(value: T): T | undefined {
    if (value === undefined || value === null)
      return undefined
    if (typeof value === 'string' && value === '')
      return undefined

    if (Array.isArray(value)) {
      const next = value
        .map(v => pruneEmptyDeep(v))
        .filter(v => v !== undefined) as unknown as T
      return (next as unknown as unknown[]).length === 0 ? undefined : next
    }

    if (isPlainObject(value)) {
      const out: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(value)) {
        const pv = pruneEmptyDeep(v)
        if (pv !== undefined)
          out[k] = pv
      }
      return Object.keys(out).length === 0 ? undefined : (out as T)
    }

    return value
  }

  async function fetchList(opts?: { force?: boolean }): Promise<void> {
    if (!adapter || typeof adapter.list !== 'function')
      return

    const force = Boolean(opts?.force)
    const key = buildKey()

    if (!force && dedupe && key) {
      if (key === lastKey || key === activeKey)
        return
    }

    // Cancel previous request
    if (abortController) {
      try {
        abortController.abort()
      }
      catch {
        // ignore
      }
    }
    abortController = typeof AbortController !== 'undefined' ? new AbortController() : null

    activeKey = key
    const seq = (requestSeq += 1)
    activeSeq = seq

    loading.value = true
    error.value = null

    try {
      const result = await adapter.list({
        page: page.value,
        pageSize: pageSize.value,
        query: query.value,
        sort: sort.value,
        signal: abortController?.signal,
      })

      // Stale response: ignore
      if (seq !== activeSeq)
        return

      rows.value = result.items
      total.value = result.total
      if (key)
        lastKey = key
    }
    catch (err) {
      if (isAbortError(err))
        return
      if (seq !== activeSeq)
        return

      error.value = err
      if (onError)
        onError(err)
    }
    finally {
      if (seq === activeSeq) {
        loading.value = false
        activeKey = null
      }
    }
  }

  function scheduleFetch(): void {
    if (!autoFetch)
      return

    if (fetchTimer) {
      clearTimeout(fetchTimer)
      fetchTimer = null
    }

    if (debounceMs > 0) {
      fetchTimer = setTimeout(() => {
        fetchTimer = null
        void fetchList({ force: false })
      }, debounceMs)
      return
    }

    void fetchList({ force: false })
  }

  // Auto-fetch on state changes
  watch([query, sort, page, pageSize], () => {
    scheduleFetch()
  }, { deep: false })

  // Actions
  function setQuery(partial: Partial<Query>, options?: SetQueryOptions): void {
    const mode = options?.mode ?? 'merge'
    const clearKeys = options?.clearKeys ?? []
    const shouldPrune = Boolean(options?.pruneEmpty)

    const base = mode === 'replace'
      ? {}
      : ({ ...(query.value as any) } as Record<string, unknown>)

    for (const k of clearKeys)
      delete base[k]

    const merged = mode === 'replace'
      ? ({ ...(partial as any) } as Record<string, unknown>)
      : ({ ...base, ...(partial as any) } as Record<string, unknown>)

    const next = shouldPrune ? (pruneEmptyDeep(merged) ?? {}) : merged
    query.value = next as Query
    page.value = 1
  }

  function setPage(nextPage: number): void {
    if (nextPage <= 0)
      return
    page.value = nextPage
  }

  function setPageSize(size: number): void {
    if (size <= 0)
      return
    pageSize.value = size
    page.value = 1
  }

  function setSort(nextSort: CrudSort | null): void {
    sort.value = nextSort
    page.value = 1
  }

  function reset(): void {
    query.value = (initialQuery ?? {}) as Query
    sort.value = null
    page.value = initialPage
    pageSize.value = initialPageSize
    void fetchList({ force: true })
  }

  async function refresh(): Promise<void> {
    await fetchList({ force: true })
  }

  // Initial fetch (if enabled)
  scheduleFetch()

  // Cleanup on scope dispose (component unmount / effect stop)
  onScopeDispose(() => {
    if (fetchTimer) {
      clearTimeout(fetchTimer)
      fetchTimer = null
    }
    if (abortController) {
      try {
        abortController.abort()
      }
      catch {
        // ignore
      }
      abortController = null
    }
    activeSeq = 0
    activeKey = null
  })

  return {
    // State
    rows: rows as UseCrudListReturn<Row, Query>['rows'],
    total,
    loading,
    error,
    query: query as UseCrudListReturn<Row, Query>['query'],
    sort,
    page,
    pageSize,
    // Actions
    refresh,
    setQuery,
    setPage,
    setPageSize,
    setSort,
    reset,
  }
}
