<script setup lang="ts">
import { computed, inject, onMounted, reactive, ref, watch } from 'vue'
import type { CrudField, UseCrudReturn } from '@fcurd/core'
import { useRoute, useRouter, type LocationQuery, type LocationQueryRaw } from 'vue-router'
import {
  CrudControlMapSymbol,
  CrudFieldsSymbol,
  CrudInstanceSymbol,
} from '@fcurd/vue'
import { NButton, NForm, NFormItem, NSpace } from 'naive-ui'

interface NaiveCrudSearchProps<Row = any> {
  fields?: CrudField<Row, any>[]
  formProps?: Record<string, any>
}

const props = defineProps<NaiveCrudSearchProps<any>>()

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

const searchKeys = computed(() => effectiveFields.value.map((field) => field.key))
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

function pickSearchQuery(source: Record<string, any>): Record<string, any> {
  const picked: Record<string, any> = {}
  for (const key of searchKeys.value) {
    const value = source[key]
    if (value === undefined || value === null) continue
    if (Array.isArray(value) && value.length === 0) continue
    if (value === '') continue
    picked[key] = value
  }
  return picked
}

function normalizeRouteQuery(query: LocationQuery): Record<string, any> {
  const normalized: Record<string, any> = {}
  for (const key of searchKeys.value) {
    const value = query[key]
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      if (value.length === 0) continue
      normalized[key] = value.length === 1 ? value[0] : [...value]
      continue
    }
    normalized[key] = value
  }
  return normalized
}

function normalizeSearchParams(params: URLSearchParams): Record<string, any> {
  const normalized: Record<string, any> = {}
  for (const key of searchKeys.value) {
    const values = params.getAll(key)
    if (values.length === 0) continue
    normalized[key] = values.length === 1 ? values[0] : [...values]
  }
  return normalized
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
  searchKeys.value.forEach((key) => {
    delete preserved[key]
  })
  crud.query.value = { ...preserved, ...nextSearch }
  crud.page.value = 1
  if (fetch) {
    void crud.refresh()
  }
}

function applyFromCrud(): void {
  if (!crud) return
  const fromCrud = pickSearchQuery(crud.query.value)
  if (!Object.keys(fromCrud).length) return
  Object.assign(formModel, fromCrud)
}

function readQueryFromExternal(): Record<string, any> {
  if (enableRouteSync.value && routeRef.value) {
    return normalizeRouteQuery(routeRef.value.query)
  }
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  return normalizeSearchParams(params)
}

function applyFromRoute(shouldFetch: boolean): void {
  const fromRoute = readQueryFromExternal()
  if (!Object.keys(fromRoute).length) return
  const current = pickSearchQuery(formModel)
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
  const normalized: LocationQueryRaw = {}
  Object.entries(nextSearch).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (Array.isArray(value)) {
      if (value.length === 0) return
      normalized[key] = value as any
      return
    }
    normalized[key] = value as any
  })
  return normalized
}

function syncRouteQuery(nextSearch: Record<string, any>): void {
  const normalized = buildNormalizedSearch(nextSearch)
  if (enableRouteSync.value && routeRef.value && routerRef.value) {
    const base: LocationQueryRaw = { ...routeRef.value.query }
    searchKeys.value.forEach((key) => {
      delete base[key]
    })
    void routerRef.value.replace({ query: { ...base, ...normalized } })
    return
  }
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  const params = new URLSearchParams(url.search)
  searchKeys.value.forEach((key) => params.delete(key))
  Object.entries(normalized).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, `${v}`))
    }
    else {
      params.set(key, `${value}`)
    }
  })
  url.search = params.toString()
  window.history.replaceState({}, '', url)
}

function handleSubmit(): void {
  const next = pickSearchQuery(formModel)
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
  <div class="fcurd-search fcurd-search--naive">
    <slot
      :form-model="formModel"
      :submit="handleSubmit"
      :reset="handleReset"
    >
      <NForm
        v-if="controlMap"
        class="fcurd-search__auto"
        :model="formModel"
        size="small"
        label-placement="left"
        label-align="right"
        v-bind="props.formProps"
        @submit.prevent="handleSubmit"
      >
        <div class="fcurd-search__fields">
          <NFormItem
            v-for="field in effectiveFields"
            :key="field.key"
            :label="field.label()"
            class="fcurd-search__item"
            v-bind="field.ui?.searchItemProps"
          >
            <component
              :is="controlMap[field.type] || controlMap.text"
              v-model="formModel[field.key]"
              :field="field"
              v-bind="field.ui?.naiveProps"
            />
          </NFormItem>
        </div>
        <div class="fcurd-search__actions">
          <NSpace :size="8">
            <NButton attr-type="button" @click="handleReset">
              重置
            </NButton>
            <NButton type="primary" attr-type="submit" @click="handleSubmit">
              查询
            </NButton>
          </NSpace>
        </div>
      </NForm>
    </slot>
  </div>
</template>

<style scoped>
.fcurd-search--naive {
  width: 100%;
}

.fcurd-search__auto {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 8px 24px;
}

.fcurd-search__fields {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  flex: 1;
}

.fcurd-search__item {
  min-width: 220px;
}

.fcurd-search__actions {
  display: flex;
  gap: 8px;
}
</style>

