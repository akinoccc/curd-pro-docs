import type { CrudColumn, CrudField } from '@fcurd/core'
import type { DataTableColumn, SelectOption } from 'naive-ui'
import type { Component } from 'vue'
import { createDiscreteApi } from 'naive-ui'
import NaiveDateField from './controls/DateField.vue'
import NaiveDateRangeField from './controls/DateRangeField.vue'
import NaiveNumberField from './controls/NumberField.vue'
import NaiveSelectField from './controls/SelectField.vue'
import NaiveSwitchField from './controls/SwitchField.vue'
import NaiveTextField from './controls/TextField.vue'

// =============================================================================
// Component Map - Maps field types to Naive UI components
// =============================================================================

export const componentMap: Record<string, Component> = {
  text: NaiveTextField,
  textarea: NaiveTextField,
  number: NaiveNumberField,
  money: NaiveNumberField,
  select: NaiveSelectField,
  date: NaiveDateField,
  datetime: NaiveDateField,
  dateRange: NaiveDateRangeField,
  datetimeRange: NaiveDateRangeField,
  switch: NaiveSwitchField,
}

// =============================================================================
// Field UI Type Extensions
// =============================================================================

export interface NaiveFieldUi {
  /** Control props passed to the field component */
  control?: Record<string, unknown> & {
    form?: Record<string, unknown>
    search?: Record<string, unknown>
  }
  /** FormItem props */
  formItem?: {
    form?: Record<string, unknown>
    search?: Record<string, unknown>
  }
  /** Custom component override */
  component?: Component
  /** Column props for table */
  column?: Record<string, unknown>
  /** Select options (for select fields) */
  options?: SelectOption[]
}

export type NaiveCrudField<Row = any, FormModel = Row> = CrudField<Row, FormModel, NaiveFieldUi>

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get field label string
 */
export function getFieldLabel(field: CrudField): string {
  return typeof field.label === 'function' ? field.label() : field.label
}

/**
 * Resolve control props for a specific surface
 */
export function resolveControlProps(
  field: NaiveCrudField,
  surface: 'form' | 'search',
): Record<string, unknown> {
  const ui = field.ui ?? {}
  const control = ui.control ?? {}

  // Check for surface-specific props
  const surfaceProps = control[surface]
  if (surfaceProps && typeof surfaceProps === 'object') {
    // eslint-disable-next-line unused-imports/no-unused-vars
    const { form, search, ...baseProps } = control as Record<string, unknown>
    return { ...baseProps, ...(surfaceProps as Record<string, unknown>) }
  }

  // Return base control props (excluding surface keys)
  // eslint-disable-next-line unused-imports/no-unused-vars
  const { form, search, ...baseProps } = control as Record<string, unknown>
  return baseProps
}

/**
 * Resolve form item props for a specific surface
 */
export function resolveFormItemProps(
  field: NaiveCrudField,
  surface: 'form' | 'search',
): Record<string, unknown> {
  const formItem = field.ui?.formItem ?? {}
  return formItem[surface] ?? {}
}

/**
 * Create Naive UI DataTable columns from CrudColumns
 */
export function createTableColumns<Row = any>(
  columns: CrudColumn<Row, any>[],
  options?: {
    slots?: Record<string, any>
    renderCell?: (column: CrudColumn<Row, any>, row: Row, value: any, rowIndex: number) => any
  },
): DataTableColumn<Row>[] {
  return columns.map((col) => {
    const label = typeof col.label === 'function' ? col.label() : col.label

    // Check for cell slot with multiple naming conventions
    const slotNames = [`cell-${col.key}`, `cell_${col.key}`]
    let cellSlot: any = null
    if (options?.slots) {
      for (const name of slotNames) {
        if (options.slots[name]) {
          cellSlot = options.slots[name]
          break
        }
      }
    }

    const ui = col.ui && typeof col.ui === 'object' && !Array.isArray(col.ui) ? col.ui : {}

    return {
      key: col.key,
      title: label ?? col.key,
      width: col.width,
      minWidth: col.minWidth,
      fixed: col.fixed,
      sorter: col.sortable ? 'default' : undefined,
      render: cellSlot
        ? (row: Row, rowIndex: number) => cellSlot({ row, value: (row as any)[col.key], rowIndex })
        : col.render
          ? (row: Row, rowIndex: number) => col.render!({
              row,
              value: (row as any)[col.key],
              rowIndex,
            })
          : options?.renderCell
            ? (row: Row, rowIndex: number) => options.renderCell!(col, row, (row as any)[col.key], rowIndex)
            : undefined,
      ...ui,
    } as DataTableColumn<Row>
  })
}

// =============================================================================
// UI Utilities
// =============================================================================

const discreteApi = createDiscreteApi(['dialog', 'message', 'notification'])

/**
 * Show confirmation dialog
 */
export async function confirmAction(
  message: string,
  options?: { title?: string },
): Promise<boolean> {
  return new Promise((resolve) => {
    let resolved = false
    function done(value: boolean) {
      if (resolved)
        return
      resolved = true
      resolve(value)
    }

    discreteApi.dialog.warning({
      title: options?.title ?? '确认',
      content: message,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => done(true),
      onNegativeClick: () => done(false),
      onClose: () => done(false),
    })
  })
}

/**
 * Handle export result (download file)
 */
export function handleExportResult(
  result: Blob | { blob: Blob, filename?: string } | { url: string, filename?: string },
  filename?: string,
): void {
  if (typeof window === 'undefined')
    return

  function downloadUrl(url: string, name?: string) {
    const a = document.createElement('a')
    a.href = url
    if (name)
      a.download = name
    a.rel = 'noopener'
    a.target = '_blank'
    a.click()
  }

  function downloadBlob(blob: Blob, name?: string) {
    const url = URL.createObjectURL(blob)
    downloadUrl(url, name ?? filename ?? 'export')
    setTimeout(() => URL.revokeObjectURL(url), 3000)
  }

  if (result instanceof Blob) {
    downloadBlob(result, filename)
    return
  }

  if ('blob' in result) {
    downloadBlob(result.blob, result.filename ?? filename)
    return
  }

  if ('url' in result) {
    downloadUrl(result.url, result.filename ?? filename)
  }
}

// =============================================================================
// Field Definition Helpers
// =============================================================================

/**
 * Define a single field with Naive UI extensions
 */
export function defineField<Row = any, FormModel = Row>(
  field: NaiveCrudField<Row, FormModel>,
): NaiveCrudField<Row, FormModel> {
  return field
}

/**
 * Define multiple fields with Naive UI extensions
 */
export function defineFields<
  Row = any,
  FormModel = Row,
  const Fields extends NaiveCrudField<Row, FormModel>[] = NaiveCrudField<Row, FormModel>[],
>(fields: Fields): Fields {
  return fields
}

/**
 * Define table columns
 */
export function defineColumns<
  Row = any,
  const Columns extends CrudColumn<Row>[] = CrudColumn<Row>[],
>(columns: Columns): Columns {
  return columns
}
