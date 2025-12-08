import { ref } from 'vue'
import type { CrudAdapter, CrudListParams, UseCrudOptions, UseCrudReturn } from './models'

export function useCrud<Row = any>(options: UseCrudOptions<Row>): UseCrudReturn<Row> {
  const { adapter, initialQuery } = options

  const rows = ref<Row[]>([])
  const total = ref(0)
  const loading = ref(false)
  const query = ref<Record<string, any>>(initialQuery ? { ...initialQuery } : {})
  const page = ref(1)
  const pageSize = ref(20)

  async function fetchList(): Promise<void> {
    if (!adapter || typeof adapter.list !== 'function') return
    loading.value = true
    try {
      const params: CrudListParams = {
        page: page.value,
        pageSize: pageSize.value,
        query: query.value,
        sort: null,
      }
      const result = await adapter.list(params)
      rows.value = result.items
      total.value = result.total
    }
    catch (error) {
      // 交给上层组件决定如何处理错误，这里只打印
      // eslint-disable-next-line no-console
      console.error('[fcurd] useCrud fetchList error', error)
    }
    finally {
      loading.value = false
    }
  }

  function setQuery(partial: Record<string, any>): void {
    query.value = {
      ...query.value,
      ...partial,
    }
    page.value = 1
    void fetchList()
  }

  function setPage(nextPage: number): void {
    if (nextPage <= 0) return
    page.value = nextPage
    void fetchList()
  }

  function setPageSize(size: number): void {
    if (size <= 0) return
    pageSize.value = size
    page.value = 1
    void fetchList()
  }

  async function refresh(): Promise<void> {
    await fetchList()
  }

  return {
    rows,
    total,
    loading,
    query,
    page,
    pageSize,
    refresh,
    setQuery,
    setPage,
    setPageSize,
  }
}
