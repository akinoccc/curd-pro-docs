import type { CrudSort, UseCrudListOptions, UseCrudListReturn } from '../types'
import { ref, shallowRef, watch } from 'vue'

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

  function buildKey(): string {
    return JSON.stringify({
      page: page.value,
      pageSize: pageSize.value,
      query: query.value,
      sort: sort.value,
    })
  }

  function isAbortError(err: unknown): boolean {
    if (!err || typeof err !== 'object')
      return false
    const obj = err as Record<string, unknown>
    return obj.name === 'AbortError' || obj.code === 'ABORT_ERR'
  }

  async function fetchList(opts?: { force?: boolean }): Promise<void> {
    if (!adapter || typeof adapter.list !== 'function')
      return

    const force = Boolean(opts?.force)
    const key = buildKey()

    if (!force && dedupe) {
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
  function setQuery(partial: Partial<Query>): void {
    query.value = { ...query.value, ...partial } as Query
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
