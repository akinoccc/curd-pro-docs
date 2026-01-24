import type { Ref } from 'vue'
import type { DictApi, DictCenter, DictItem } from './models'
import { ref } from 'vue'

export interface UseDictLoadResult {
  options: Ref<DictItem[]>
  loading: Ref<boolean>
  error: Ref<unknown | null>
}

interface DictEntry {
  options: Ref<DictItem[]>
  loading: Ref<boolean>
  error: Ref<unknown | null>
  inFlight: Promise<void> | null
}

export function createDictCenter(dictApi: DictApi): DictCenter {
  const entries = new Map<string, DictEntry>()

  function ensure(key: string): DictEntry {
    const existing = entries.get(key)
    if (existing)
      return existing
    const created: DictEntry = {
      options: ref<DictItem[]>([]),
      loading: ref(false),
      error: ref<unknown | null>(null),
      inFlight: null,
    }
    entries.set(key, created)
    return created
  }

  async function load(key: string): Promise<UseDictLoadResult> {
    const entry = ensure(key)

    // 已经有数据：直接返回 refs
    if (entry.options.value.length > 0)
      return { options: entry.options, loading: entry.loading, error: entry.error }

    // 正在请求：等待同一个 inFlight（并发去重）
    if (entry.inFlight) {
      await entry.inFlight
      return { options: entry.options, loading: entry.loading, error: entry.error }
    }

    entry.loading.value = true
    entry.error.value = null

    entry.inFlight = (async () => {
      try {
        entry.options.value = await dictApi.getOptions(key)
      }
      catch (e) {
        entry.error.value = e
      }
      finally {
        entry.loading.value = false
        entry.inFlight = null
      }
    })()

    await entry.inFlight
    return { options: entry.options, loading: entry.loading, error: entry.error }
  }

  function invalidate(key?: string): void {
    if (!key) {
      entries.clear()
      return
    }
    entries.delete(key)
  }

  return { load, invalidate }
}
