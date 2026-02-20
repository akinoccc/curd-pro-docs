import type { Ref } from 'vue'
import type { SetQueryOptions } from '../types'
import { onScopeDispose, watch } from 'vue'

export interface UseCrudRouteSyncOptions<Query = Record<string, unknown>> {
  /** Query ref from useCrudList */
  query: Ref<Query>
  /** Set query function from useCrudList */
  setQuery: (partial: Partial<Query>, options?: SetQueryOptions) => void
  /** Router instance (vue-router) */
  router?: any
  /** Route instance (vue-router) */
  route?: any
  /** Query key in URL (default: 'q') */
  queryKey?: string
  /** Serialize query to string (default: JSON.stringify) */
  serialize?: (query: Query) => string
  /** Deserialize string to query (default: JSON.parse) */
  deserialize?: (str: string) => Partial<Query>
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number
  /**
   * How to apply query when syncing from route (default: 'replace')
   * - replace: URL is the source of truth (prevents stale keys from lingering)
   * - merge: merge into current query
   */
  syncFromRouteMode?: 'replace' | 'merge'
}

/**
 * Sync CRUD query with URL route query
 */
export function useCrudRouteSync<Query = Record<string, unknown>>(
  options: UseCrudRouteSyncOptions<Query>,
): { syncFromRoute: () => void, syncToRoute: () => void } {
  const {
    query,
    setQuery,
    router,
    route,
    queryKey = 'q',
    serialize = (q: Query) => JSON.stringify(q),
    deserialize = (s: string) => JSON.parse(s) as Partial<Query>,
    debounceMs = 300,
    syncFromRouteMode = 'replace',
  } = options

  let syncTimer: ReturnType<typeof setTimeout> | null = null
  let isSyncingFromRoute = false
  let releaseSyncTimer: ReturnType<typeof setTimeout> | null = null

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

  // Sync query from route to list
  function syncFromRoute(): void {
    if (!route)
      return

    const raw = route.query?.[queryKey]
    if (!raw || typeof raw !== 'string')
      return

    try {
      isSyncingFromRoute = true
      const parsed = deserialize(raw)
      if (parsed && typeof parsed === 'object') {
        setQuery(parsed, {
          mode: syncFromRouteMode,
          pruneEmpty: true,
        })
      }
    }
    catch {
      // Invalid query string, ignore
    }
    finally {
      if (releaseSyncTimer)
        clearTimeout(releaseSyncTimer)
      releaseSyncTimer = setTimeout(() => {
        releaseSyncTimer = null
        isSyncingFromRoute = false
      }, 0)
    }
  }

  // Sync query from list to route
  function syncToRoute(): void {
    if (!router || !route || isSyncingFromRoute)
      return

    const currentQuery = query.value
    const normalized = pruneEmptyDeep(currentQuery as any) as any
    const isEmpty = normalized === undefined
      || (isPlainObject(normalized) && Object.keys(normalized).length === 0)

    const newRouteQuery = { ...route.query }

    if (isEmpty) {
      delete newRouteQuery[queryKey]
    }
    else {
      newRouteQuery[queryKey] = serialize(normalized)
    }

    // Only update if changed
    const currentStr = route.query?.[queryKey] ?? ''
    const newStr = newRouteQuery[queryKey] ?? ''
    if (currentStr !== newStr) {
      void Promise.resolve(router.replace({ query: newRouteQuery })).catch(() => {})
    }
  }

  // Watch query changes and sync to route with debounce
  watch(
    query,
    () => {
      if (isSyncingFromRoute)
        return

      if (syncTimer) {
        clearTimeout(syncTimer)
      }

      syncTimer = setTimeout(() => {
        syncTimer = null
        syncToRoute()
      }, debounceMs)
    },
    { deep: true },
  )

  // Initial sync from route
  if (route) {
    syncFromRoute()
  }

  onScopeDispose(() => {
    if (syncTimer) {
      clearTimeout(syncTimer)
      syncTimer = null
    }
    if (releaseSyncTimer) {
      clearTimeout(releaseSyncTimer)
      releaseSyncTimer = null
    }
  })

  return {
    syncFromRoute,
    syncToRoute,
  }
}
