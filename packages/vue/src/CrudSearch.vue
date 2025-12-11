<script setup lang="ts">
import { computed, inject, onMounted, reactive, ref, watch } from 'vue'
import type { CrudField, UseCrudReturn } from '@fcurd/core'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import {
  CrudControlMapSymbol,
  CrudFieldsSymbol,
  CrudInstanceSymbol,
} from './symbols'

interface CrudSearchProps<Row = any> {
  fields?: CrudField<Row, any>[]
}

const props = defineProps<CrudSearchProps<any>>()

const crud = inject(CrudInstanceSymbol) as UseCrudReturn<any> | undefined
const providedFields = inject(CrudFieldsSymbol) as CrudField<any, any>[] | undefined
const controlMap = inject(CrudControlMapSymbol)

const effectiveFields = computed(() => {
  const all = (props.fields ?? providedFields ?? []) as CrudField<any, any>[]
  return all.filter((field) => {
    const visible = field.visibleIn?.search
    if (visible === undefined) return true
    if (typeof visible === 'boolean') return visible
    if (!crud) return true
    return visible({
      surface: 'search',
      query: crud.query.value,
      extra: {},
    })
  })
})

const formModel = reactive<Record<string, any>>({})

const hasMounted = ref(false)
const routeRef = ref<ReturnType<typeof useRoute> | null>(null)
const routerRef = ref<ReturnType<typeof useRouter> | null>(null)

try {
  routeRef.value = useRoute()
  routerRef.value = useRouter()
}
catch (_error) {
  // allow using component without vue-router; fallback to window.location
}

const enableRouteSync = computed(() => Boolean(routeRef.value && routerRef.value))

function pickSearchModel(source: Record<string, any>): Record<string, any> {
  const picked: Record<string, any> = {}
  effectiveFields.value.forEach((field) => {
    const value = source[field.key]
    if (value === undefined || value === null) return
    if (Array.isArray(value) && value.length === 0) return
    if (value === '') return
    picked[field.key] = value
  })
  return picked
}

function parseSearchPayload(raw: unknown): Record<string, any> {
  if (!raw) return {}
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return typeof parsed === 'object' && parsed !== null ? parsed as Record<string, any> : {}
    }
    catch (_error) {
      return {}
    }
  }
  if (typeof raw === 'object') return raw as Record<string, any>
  return {}
}

function toArray(value: any): any[] {
  if (Array.isArray(value)) return value
  if (value === undefined || value === null) return []
  return [value]
}

function isQueryEqual(a: Record<string, any>, b: Record<string, any>): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    const va = a[key]
    const vb = b[key]
    const aArr = toArray(va)
    const bArr = toArray(vb)
    if (aArr.length !== bArr.length) return false
    for (let i = 0; i < aArr.length; i += 1) {
      if (aArr[i] !== bArr[i]) return false
    }
  }
  return true
}

function clearFormModel(): void {
  Object.keys(formModel).forEach((key) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete formModel[key]
  })
}

function applyQueryToCrud(nextSearch: Record<string, any>, fetch = true): void {
  if (!crud) return
  const preserved = { ...crud.query.value }
  delete preserved.search
  crud.query.value = {
    ...preserved,
    search: { ...nextSearch },
  }
  crud.page.value = 1
  if (fetch) {
    void crud.refresh()
  }
}

function applyFromCrud(): void {
  if (!crud) return
  const fromCrud = pickSearchModel(crud.query.value.search ?? {})
  if (!Object.keys(fromCrud).length) return
  Object.assign(formModel, fromCrud)
}

function readQueryFromExternal(): Record<string, any> {
  if (enableRouteSync.value && routeRef.value) {
    return parseSearchPayload(routeRef.value.query.search)
  }
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  return parseSearchPayload(params.get('search'))
}

function applyFromRoute(shouldFetch: boolean): void {
  const fromRoute = readQueryFromExternal()
  if (!Object.keys(fromRoute).length) return
  const current = pickSearchModel(formModel)
  if (isQueryEqual(fromRoute, current)) return
  clearFormModel()
  Object.assign(formModel, fromRoute)
  applyQueryToCrud(fromRoute, shouldFetch)
}

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

function buildNormalizedSearch(nextSearch: Record<string, any>): LocationQueryRaw {
  if (!Object.keys(nextSearch).length) return {}
  return { search: JSON.stringify(nextSearch) }
}

function syncRouteQuery(nextSearch: Record<string, any>): void {
  const normalized = buildNormalizedSearch(nextSearch)
  if (enableRouteSync.value && routeRef.value && routerRef.value) {
    const base: LocationQueryRaw = { ...routeRef.value.query }
    delete base.search
    void routerRef.value.replace({ query: { ...base, ...normalized } })
    return
  }
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  const params = new URLSearchParams(url.search)
  params.delete('search')
  if (normalized.search) params.set('search', `${normalized.search}`)
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
</script>

<template>
  <div class="fcurd-search">
    <slot
      :form-model="formModel"
      :submit="handleSubmit"
      :reset="handleReset"
    >
      <div class="fcurd-search__auto" v-if="controlMap">
        <div
          v-for="field in effectiveFields"
          :key="field.key"
          class="fcurd-search__item"
        >
          <label class="fcurd-search__label">
            {{ field.label() }}
          </label>
          <component
            :is="controlMap[field.type] || controlMap.text"
            v-model="formModel[field.key]"
            :field="field"
          />
        </div>
        <div class="fcurd-search__actions">
          <slot
            name="actions"
            :submit="handleSubmit"
            :reset="handleReset"
          />
        </div>
      </div>
    </slot>
  </div>
</template>
