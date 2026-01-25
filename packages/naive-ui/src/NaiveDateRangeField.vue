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

function parseDefaultStringToMsLocal(value: string): number | null {
  const asYmd = parseYmdToMsLocal(value)
  if (asYmd !== null)
    return asYmd
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/)
  if (!m)
    return null
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  const hour = Number(m[4])
  const minute = Number(m[5])
  const second = m[6] ? Number(m[6]) : 0
  if (![year, month, day, hour, minute, second].every(Number.isFinite))
    return null
  const dt = new Date(year, month - 1, day, hour, minute, second, 0)
  const ms = dt.getTime()
  return Number.isFinite(ms) ? ms : null
}

const valueMs = computed<[number, number] | null>(() => {
  const v = modelValue.value
  if (!v || v.length !== 2)
    return null
  const [start, end] = v as any

  // 输入支持：
  // - timestamp(number tuple)
  // - string tuple（遵循 UI 组件默认格式；这里做“默认格式”的有限解析）
  const sMs: number | null = typeof start === 'number'
    ? (Number.isFinite(start) ? (unit.value === 's' ? start * 1000 : start) : null)
    : (typeof start === 'string' ? parseDefaultStringToMsLocal(start) : null)

  const eMs: number | null = typeof end === 'number'
    ? (Number.isFinite(end) ? (unit.value === 's' ? end * 1000 : end) : null)
    : (typeof end === 'string' ? parseDefaultStringToMsLocal(end) : null)

  if (sMs === null || eMs === null)
    return null
  return [sMs, eMs]
})

function handleUpdateValue(ts: [number, number] | null): void {
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
  if (valueType.value === 'string')
    return

  modelValue.value = unit.value === 's'
    ? [Math.floor(start / 1000), Math.floor(end / 1000)]
    : [start, end]
}

function handleUpdateFormatted(value: [string, string] | null): void {
  if (valueType.value !== 'string')
    return
  if (!value || value.length !== 2) {
    modelValue.value = null
    return
  }
  modelValue.value = [value[0], value[1]]
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
    @update:value="handleUpdateValue"
    @update:formatted-value="handleUpdateFormatted"
  />
</template>
