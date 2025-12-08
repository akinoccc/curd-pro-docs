import { ref } from 'vue'
import type { DictApi, DictItem } from './models'
import type { Ref } from 'vue'

export interface UseDictLoadResult {
  options: Ref<DictItem[]>
  loading: Ref<boolean>
  error: Ref<unknown | null>
}

export function useDict(dictApi: DictApi) {
  const cache = new Map<string, Ref<DictItem[]>>()
  const loadingMap = new Map<string, Ref<boolean>>()
  const errorMap = new Map<string, Ref<unknown | null>>()

  async function load(key: string): Promise<UseDictLoadResult> {
    if (!cache.has(key)) cache.set(key, ref<DictItem[]>([]))
    if (!loadingMap.has(key)) loadingMap.set(key, ref(false))
    if (!errorMap.has(key)) errorMap.set(key, ref<unknown | null>(null))

    const optionsRef = cache.get(key)!
    const loading = loadingMap.get(key)!
    const error = errorMap.get(key)!

    if (optionsRef.value.length === 0 && !loading.value) {
      loading.value = true
      error.value = null
      try {
        optionsRef.value = await dictApi.getOptions(key)
      }
      catch (e) {
        error.value = e
      }
      finally {
        loading.value = false
      }
    }

    return { options: optionsRef, loading, error }
  }

  return { load }
}
