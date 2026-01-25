<script setup lang="ts">
import type { CrudSurface, NaiveCrudField } from './controls'
import { useCrudConfig } from '@fcurd/core'
import { NDatePicker } from 'naive-ui'
import { computed } from 'vue'
import { resolveNaiveSurfaceProps } from './controls'

interface NaiveDateRangeFieldProps {
  field?: NaiveCrudField<any, any, 'dateRange' | 'datetimeRange'>
  surface?: CrudSurface
}

const props = defineProps<NaiveDateRangeFieldProps>()
const modelValue = defineModel<[number, number] | [string, string] | null>()

const surface = computed<CrudSurface>(() => props.surface ?? 'form')
const controlProps = computed<Record<string, any>>(() => {
  return resolveNaiveSurfaceProps(props.field?.ui?.control as any, surface.value)
})

const crudConfig = useCrudConfig()
const unit = computed(() => crudConfig.value.date.unit)
const valueType = computed(() => crudConfig.value.date.valueType)

const type = computed(() => {
  return (controlProps.value as any).type ?? (props.field?.type === 'datetimeRange' ? 'datetimerange' : 'daterange')
})

const displayFormat = computed<string | undefined>(() => {
  const configured = crudConfig.value.date.displayFormat
  if (!configured)
    return undefined
  if (typeof configured === 'string')
    return configured
  return props.field?.type === 'datetimeRange'
    ? configured.datetimeRange
    : configured.dateRange
})

function isYmd(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function parseYmdToMsLocal(ymd: string): number | null {
  if (!isYmd(ymd))
    return null
  const [y, m, d] = ymd.split('-').map(s => Number(s))
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d))
    return null
  const dt = new Date(y, m - 1, d, 0, 0, 0, 0)
  const ms = dt.getTime()
  return Number.isFinite(ms) ? ms : null
}

function formatMsToYmdLocal(ms: number): string {
  const dt = new Date(ms)
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const d = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const valueMs = computed<[number, number] | null>(() => {
  const v = modelValue.value
  if (!v || v.length !== 2)
    return null
  const [start, end] = v as any

  // 输入支持：timestamp(number tuple) 或 yyyy-mm-dd(string tuple)
  const sMs: number | null = typeof start === 'number'
    ? (Number.isFinite(start) ? (unit.value === 's' ? start * 1000 : start) : null)
    : (typeof start === 'string' ? parseYmdToMsLocal(start) : null)

  const eMs: number | null = typeof end === 'number'
    ? (Number.isFinite(end) ? (unit.value === 's' ? end * 1000 : end) : null)
    : (typeof end === 'string' ? parseYmdToMsLocal(end) : null)

  if (sMs === null || eMs === null)
    return null
  return [sMs, eMs]
})

function handleUpdate(ts: [number, number] | null): void {
  if (!ts || ts.length !== 2) {
    modelValue.value = null
    return
  }
  const [start, end] = ts
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    modelValue.value = null
    return
  }

  // 回写永远按 ConfigProvider 配置的输出格式
  if (valueType.value === 'yyyy-mm-dd') {
    modelValue.value = [formatMsToYmdLocal(start), formatMsToYmdLocal(end)]
    return
  }

  modelValue.value = unit.value === 's'
    ? [Math.floor(start / 1000), Math.floor(end / 1000)]
    : [start, end]
}
</script>

<template>
  <NDatePicker
    :value="valueMs"
    :type="type"
    :format="displayFormat"
    :placeholder="(controlProps as any).placeholder ?? field?.label()"
    clearable
    v-bind="controlProps"
    @update:value="handleUpdate"
  />
</template>
