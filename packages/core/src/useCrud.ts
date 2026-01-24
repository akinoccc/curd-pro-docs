import type { ShallowRef } from 'vue'
import type { CrudListParams, CrudSort, UseCrudOptions, UseCrudReturn } from './models'
import { ref, shallowRef, watch } from 'vue'

export function useCrud<
  Row = any,
  Query extends Record<string, any> = Record<string, any>,
  RowId extends string | number = string | number,
  CreateInput = Partial<Row>,
  UpdateInput = Partial<Row>,
  SortField extends string = string,
>(
  options: UseCrudOptions<Row, Query, RowId, CreateInput, UpdateInput, SortField>,
): UseCrudReturn<Row, Query, SortField> {
  const {
    adapter,
    initialQuery,
    onError,
    autoFetch = true,
    debounceMs = 0,
    dedupe = true,
  } = options

  // 使用 shallowRef 避免 Vue 对泛型 Row 做深层 unwrap，导致 Ref<Row[]> 类型在 TS 里不兼容
  const rows = shallowRef<Row[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref<unknown>(null)
  // 使用 shallowRef 避免 Vue 对泛型 Query/SortField 做 unwrap，导致 Ref 类型在 TS 里不兼容
  const query = shallowRef({} as Query) as unknown as ShallowRef<Query>
  if (initialQuery)
    query.value = { ...(initialQuery as any) } as Query

  const sort = shallowRef(null) as unknown as ShallowRef<CrudSort<SortField> | null>
  const page = ref(1)
  const pageSize = ref(20)

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
    const anyErr = err as any
    return anyErr.name === 'AbortError' || anyErr.code === 'ABORT_ERR'
  }

  async function fetchList(opts?: { force?: boolean }): Promise<void> {
    if (!adapter || typeof adapter.list !== 'function')
      return
    const force = Boolean(opts?.force)

    const key = buildKey()
    if (!force && dedupe) {
      // 参数未变：不重复请求
      if (key === lastKey || key === activeKey)
        return
    }

    // cancel previous request (last request wins)
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
      const params: CrudListParams = {
        page: page.value,
        pageSize: pageSize.value,
        query: query.value as any,
        sort: sort.value as any,
        signal: abortController?.signal,
      }
      const result = await adapter.list(params as any)
      // stale response: ignore
      if (seq !== activeSeq)
        return
      rows.value = result.items
      total.value = result.total
      lastKey = key
    }
    catch (err) {
      // canceled by a newer request: ignore
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

  watch([query, sort, page, pageSize], () => {
    scheduleFetch()
  }, { deep: false })

  function setQuery(partial: Partial<Query>): void {
    query.value = {
      ...query.value,
      ...(partial as any),
    } as Query
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

  function setSort(nextSort: CrudSort<SortField> | null): void {
    sort.value = nextSort
    page.value = 1
  }

  async function refresh(): Promise<void> {
    // 手动刷新：强制请求（不做 dedupe）
    await fetchList({ force: true })
  }

  return {
    rows,
    total,
    loading,
    error,
    query,
    sort,
    page,
    pageSize,
    refresh,
    setQuery,
    setSort,
    setPage,
    setPageSize,
  }
}
