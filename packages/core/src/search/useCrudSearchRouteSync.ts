import type { CrudField, UseCrudReturn } from '@fcurd/core'
import type { LocationQueryRaw } from 'vue-router'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export interface CrudSearchCodec {
  encode: (value: Record<string, any>) => string | null
  decode: (raw: unknown) => Record<string, any>
}

export const jsonCrudSearchCodec: CrudSearchCodec = {
  encode(value) {
    if (!value || Object.keys(value).length === 0)
      return null
    return JSON.stringify(value)
  },
  decode(raw) {
    if (!raw)
      return {}
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw)
        return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, any>) : {}
      }
      catch {
        return {}
      }
    }
    if (typeof raw === 'object')
      return raw as Record<string, any>
    return {}
  },
}

export interface UseCrudSearchRouteSyncOptions<Row = any> {
  crud?: UseCrudReturn<Row>
  /**
   * 当前搜索面板参与搜索的字段列表（已处理 visibleIn.search）
   */
  fields: () => CrudField<Row, any>[]
  /**
   * 搜索表单模型（reactive）
   */
  formModel: Record<string, any>
  /**
   * CRUD query 内部用于保存 search 的 key（默认：search）
   * 同时也会用于路由 query 的 key
   */
  queryKey?: string
  /**
   * formModel 清空策略
   * - null：保留 key，但置为 null（更适合表单控件 v-model）
   * - delete：删除 key
   */
  clearMode?: 'null' | 'delete'
  /**
   * search 编解码（默认 JSON）
   */
  codec?: CrudSearchCodec
}

function toArray(value: any): any[] {
  if (Array.isArray(value))
    return value
  if (value === undefined || value === null)
    return []
  return [value]
}

function isQueryEqual(a: Record<string, any>, b: Record<string, any>): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    const va = a[key]
    const vb = b[key]
    const aArr = toArray(va)
    const bArr = toArray(vb)
    if (aArr.length !== bArr.length)
      return false
    for (let i = 0; i < aArr.length; i += 1) {
      if (aArr[i] !== bArr[i])
        return false
    }
  }
  return true
}

export function useCrudSearchRouteSync<Row = any>(options: UseCrudSearchRouteSyncOptions<Row>) {
  const {
    crud,
    fields,
    formModel,
    queryKey = 'search',
    clearMode = 'null',
    codec = jsonCrudSearchCodec,
  } = options

  const hasMounted = ref(false)
  const routeRef = ref<ReturnType<typeof useRoute> | null>(null)
  const routerRef = ref<ReturnType<typeof useRouter> | null>(null)

  try {
    routeRef.value = useRoute()
    routerRef.value = useRouter()
  }
  catch {
    // allow using without vue-router
  }

  function pickSearchModel(source: Record<string, any>): Record<string, any> {
    const picked: Record<string, any> = {}
    fields().forEach((field) => {
      const value = source[field.key]
      if (value === undefined || value === null)
        return
      if (Array.isArray(value) && value.length === 0)
        return
      if (value === '')
        return
      picked[field.key] = value
    })
    return picked
  }

  function clearFormModel(): void {
    for (const key of Object.keys(formModel)) {
      if (clearMode === 'delete')
        delete formModel[key]
      else
        formModel[key] = null
    }
  }

  function applyQueryToCrud(nextSearch: Record<string, any>, fetch = true): void {
    if (!crud)
      return
    const preserved = { ...crud.query.value }
    delete preserved[queryKey]
    crud.query.value = {
      ...preserved,
      [queryKey]: { ...nextSearch },
    }
    crud.page.value = 1
    if (fetch)
      void crud.refresh()
  }

  function applyFromCrud(): void {
    if (!crud)
      return
    const fromCrud = pickSearchModel((crud.query.value as any)?.[queryKey] ?? {})
    if (!Object.keys(fromCrud).length)
      return
    Object.assign(formModel, fromCrud)
  }

  function readQueryFromExternal(): Record<string, any> {
    if (routeRef.value)
      return codec.decode((routeRef.value.query as any)[queryKey])
    if (typeof window === 'undefined')
      return {}
    const params = new URLSearchParams(window.location.search)
    return codec.decode(params.get(queryKey))
  }

  function applyFromRoute(shouldFetch: boolean): void {
    const fromRoute = readQueryFromExternal()
    if (!Object.keys(fromRoute).length)
      return
    const current = pickSearchModel(formModel)
    if (isQueryEqual(fromRoute, current))
      return
    clearFormModel()
    Object.assign(formModel, fromRoute)
    applyQueryToCrud(fromRoute, shouldFetch)
  }

  function syncRouteQuery(nextSearch: Record<string, any>): void {
    const encoded = codec.encode(nextSearch)
    if (routeRef.value && routerRef.value) {
      const base: LocationQueryRaw = { ...(routeRef.value.query as any) }
      delete (base as any)[queryKey]
      const merged = encoded ? { ...base, [queryKey]: encoded } : { ...base }
      void routerRef.value.replace({ query: merged })
      return
    }
    if (typeof window === 'undefined')
      return
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)
    params.delete(queryKey)
    if (encoded)
      params.set(queryKey, encoded)
    url.search = params.toString()
    window.history.replaceState({}, '', url)
  }

  function handleSubmit(): void {
    const next = pickSearchModel(formModel)
    applyQueryToCrud(next)
    syncRouteQuery(next)
  }

  function handleReset(): void {
    clearFormModel()
    applyQueryToCrud({})
    syncRouteQuery({})
  }

  // 初始化：先从 crud 注入，再从 route 覆盖（route 优先）
  applyFromCrud()
  applyFromRoute(false)

  watch(
    () => routeRef.value?.query,
    () => applyFromRoute(hasMounted.value),
    { deep: true },
  )

  onMounted(() => {
    hasMounted.value = true
  })

  return {
    handleSubmit,
    handleReset,
  }
}


