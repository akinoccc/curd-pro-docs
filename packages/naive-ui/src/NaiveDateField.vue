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

function formatMsToYmdLocal(ms: number): string {
  const dt = new Date(ms)
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const d = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const valueMs = computed<number | null>(() => {
  const v = modelValue.value
  if (v === null || v === undefined)
    return null

  // 输入支持：timestamp(number) 或 yyyy-mm-dd(string)
  if (typeof v === 'number' && Number.isFinite(v)) {
    // 认为 number 按配置 unit 表示（历史上也可能是 ms；但这里优先保证“按配置输出”一致性）
    return unit.value === 's' ? v * 1000 : v
  }

  if (typeof v === 'string') {
    const ms = parseYmdToMsLocal(v)
    return ms
  }

  return null
})

function handleUpdate(ts: number | null): void {
  if (typeof ts !== 'number' || !Number.isFinite(ts)) {
    modelValue.value = null
    return
  }

  // 回写永远按 ConfigProvider 配置的输出格式
  if (valueType.value === 'yyyy-mm-dd') {
    modelValue.value = formatMsToYmdLocal(ts)
    return
  }

  modelValue.value = unit.value === 's' ? Math.floor(ts / 1000) : ts
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
