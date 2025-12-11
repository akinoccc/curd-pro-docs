<script setup lang="ts">
import { computed, inject, onMounted, reactive, ref, watch } from 'vue'
import type { CrudField, UseCrudReturn } from '@fcurd/core'
import { useRoute, useRouter, type LocationQuery, type LocationQueryRaw } from 'vue-router'
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
  // allow using component without vue-router
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

function applyFromRoute(shouldFetch: boolean): void {
  if (!enableRouteSync.value || !routeRef.value) return
  const fromRoute = normalizeRouteQuery(routeRef.value.query)
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

function syncRouteQuery(nextSearch: Record<string, any>): void {
  if (!enableRouteSync.value || !routeRef.value || !routerRef.value) return
  const base: LocationQueryRaw = { ...routeRef.value.query }
  searchKeys.value.forEach((key) => {
    delete base[key]
  })
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
  void routerRef.value.replace({ query: { ...base, ...normalized } })
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
