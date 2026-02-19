import type { Ref } from 'vue'
import { watch } from 'vue'

export interface UseCrudRouteSyncOptions<Query = Record<string, unknown>> {
  /** Query ref from useCrudList */
  query: Ref<Query>
  /** Set query function from useCrudList */
  setQuery: (partial: Partial<Query>) => void
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
  } = options

  let syncTimer: ReturnType<typeof setTimeout> | null = null
  let isSyncingFromRoute = false

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
        setQuery(parsed)
      }
    }
    catch {
      // Invalid query string, ignore
    }
    finally {
      setTimeout(() => {
        isSyncingFromRoute = false
      }, 50)
    }
  }

  // Sync query from list to route
  function syncToRoute(): void {
    if (!router || !route || isSyncingFromRoute)
      return

    const currentQuery = query.value
    const isEmpty = !currentQuery || Object.keys(currentQuery).length === 0
      || Object.values(currentQuery).every(v => v === undefined || v === null || v === '')

    const newRouteQuery = { ...route.query }

    if (isEmpty) {
      delete newRouteQuery[queryKey]
    }
    else {
      newRouteQuery[queryKey] = serialize(currentQuery)
    }

    // Only update if changed
    const currentStr = route.query?.[queryKey] ?? ''
    const newStr = newRouteQuery[queryKey] ?? ''
    if (currentStr !== newStr) {
      router.replace({ query: newRouteQuery })
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

  return {
    syncFromRoute,
    syncToRoute,
  }
}

