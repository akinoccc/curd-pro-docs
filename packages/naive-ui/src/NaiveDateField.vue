<script setup lang="ts">
import type { CrudSurface, NaiveCrudField } from './controls'
import { useCrudConfig } from '@fcurd/core'
import { NDatePicker } from 'naive-ui'
import { computed } from 'vue'
import { resolveNaiveSurfaceProps } from './controls'

interface NaiveDateFieldProps {
  field?: NaiveCrudField<any, any, 'date' | 'datetime'>
  surface?: CrudSurface
}

const props = defineProps<NaiveDateFieldProps>()
const modelValue = defineModel<number | string | null>()
const surface = computed<CrudSurface>(() => props.surface ?? 'form')
const controlProps = computed<Record<string, any>>(() => {
  return resolveNaiveSurfaceProps(props.field?.ui?.control as any, surface.value)
})

const crudConfig = useCrudConfig()

const unit = computed(() => crudConfig.value.date.unit)
const valueType = computed(() => crudConfig.value.date.valueType)
const type = computed(() => {
  return (controlProps.value as any).type ?? (props.field?.type === 'datetime' ? 'datetime' : 'date')
})

const displayFormat = computed<string | undefined>(() => {
  const configured = crudConfig.value.date.displayFormat
  if (!configured)
    return undefined
  if (typeof configured === 'string')
    return configured
  return props.field?.type === 'datetime'
    ? configured.datetime
    : configured.date
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
  // date：默认 formatted-value 通常是 yyyy-MM-dd
  const asYmd = parseYmdToMsLocal(value)
  if (asYmd !== null)
    return asYmd

  // datetime：默认 formatted-value 可能是 yyyy-MM-dd HH:mm 或 yyyy-MM-dd HH:mm:ss
  // 这里做一个轻量解析（本地时区），不要求特定格式配置。
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

const valueMs = computed<number | null>(() => {
  const v = modelValue.value
  if (v === null || v === undefined)
    return null

  // 输入支持：
  // - timestamp(number)
  // - string（遵循 UI 组件默认格式；这里做“默认格式”的有限解析）
  if (typeof v === 'number' && Number.isFinite(v)) {
    // 认为 number 按配置 unit 表示（历史上也可能是 ms；但这里优先保证“按配置输出”一致性）
    return unit.value === 's' ? v * 1000 : v
  }

  if (typeof v === 'string') {
    const ms = parseDefaultStringToMsLocal(v)
    return ms
  }

  return null
})

function handleUpdateValue(ts: number | null): void {
  if (typeof ts !== 'number' || !Number.isFinite(ts)) {
    modelValue.value = null
    return
  }

  // 回写永远按 ConfigProvider 配置的输出格式
  if (valueType.value === 'string')
    return

  modelValue.value = unit.value === 's' ? Math.floor(ts / 1000) : ts
}

function handleUpdateFormatted(value: string | null): void {
  if (valueType.value !== 'string')
    return
  modelValue.value = value ?? null
}
</script>

<template>
  <NDatePicker
    :value="valueMs"
    :type="type"
    :format="displayFormat"
    :placeholder="field?.label()"
    clearable
    v-bind="controlProps"
    @update:value="handleUpdateValue"
    @update:formatted-value="handleUpdateFormatted"
  />
</template>
