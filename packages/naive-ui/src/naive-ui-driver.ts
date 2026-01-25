import type { CrudTableColumn, CrudUiDriver } from '@fcurd/core'
import type { DataTableColumn } from 'naive-ui'
import { createDiscreteApi, NButton, NSpace } from 'naive-ui'
import { h } from 'vue'
import { resolveNaiveSurfaceProps } from './controls'

const { dialog } = createDiscreteApi(['dialog'])

export const naiveUiDriver: CrudUiDriver = {
  decodeTableSorter(payload) {
    if (!payload)
      return null
    const order = payload.order
    if (order === false || order === undefined || order === null)
      return null
    const columnKey = payload.columnKey
    if (!columnKey)
      return null
    return {
      field: String(columnKey),
      order,
    } as any
  },
  resolveControl(options) {
    const { surface, field, controlMap } = options
    const ui: any = (field as any)?.ui ?? {}

    // custom component override
    if (ui.component) {
      return {
        component: ui.component,
        passField: ui.passField === true,
        controlProps: resolveNaiveSurfaceProps(ui.control, surface),
      }
    }

    const fallback = controlMap?.[field.type] ?? controlMap?.text
    return {
      component: fallback,
      passField: true,
      controlProps: resolveNaiveSurfaceProps(ui.control, surface),
    }
  },
  resolveFormItem(options) {
    const { surface, field } = options
    const ui: any = (field as any)?.ui ?? {}
    const formItem = ui.formItem ?? {}
    const bySurface = (formItem as any)[surface] ?? {}
    return {
      formItemProps: bySurface,
    }
  },
  confirmAction(options) {
    const { action } = options as any
    const confirm = action?.confirm
    if (!confirm)
      return true
    const content = confirm === true
      ? '确定要执行此操作吗？'
      : (confirm?.content ?? '确定要执行此操作吗？')

    return new Promise<boolean>((resolve) => {
      let resolved = false
      function done(value: boolean) {
        if (resolved)
          return
        resolved = true
        resolve(value)
      }

      dialog.warning({
        title: '确认',
        content,
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => done(true),
        onNegativeClick: () => done(false),
        onClose: () => done(false),
      })
    })
  },
  handleExportResult(result, options) {
    if (!result)
      return

    function downloadUrl(url: string, filename?: string) {
      if (typeof window === 'undefined')
        return
      const a = document.createElement('a')
      a.href = url
      if (filename)
        a.download = filename
      a.rel = 'noopener'
      a.target = '_blank'
      a.click()
    }

    function downloadBlob(blob: Blob, filename?: string) {
      if (typeof window === 'undefined')
        return
      const url = URL.createObjectURL(blob)
      downloadUrl(url, filename ?? options?.filename ?? 'export')
      setTimeout(() => URL.revokeObjectURL(url), 3000)
    }

    if (result instanceof Blob) {
      downloadBlob(result, options?.filename)
      return
    }

    if ('blob' in result) {
      downloadBlob(result.blob, result.filename ?? options?.filename)
      return
    }

    if ('url' in result) {
      downloadUrl(result.url, result.filename ?? options?.filename)
    }
  },
  renderAction(options) {
    const { action, disabled, run } = options as any
    const isTertiary = action?.type === 'tertiary'
    const isRowArea = typeof action?.area === 'string' && action.area.startsWith('row:')
    return h(
      NButton,
      {
        size: isRowArea ? 'small' : undefined,
        type: isTertiary ? undefined : action?.type,
        tertiary: isTertiary,
        disabled,
        onClick: run,
      },
      { default: () => action?.label ?? action?.id },
    )
  },
  mapTableColumns(options) {
    const {
      columns,
      sort,
      showSelection,
      selectionColumn,
      showActionsColumn,
      renderActionsHeader,
      renderRowActions,
      renderCell,
    } = options

    const baseColumns: DataTableColumn[] = (columns as readonly CrudTableColumn<any>[]).map((column) => {
      const field = column.field
      const passthrough = (column.ui ?? {}) as Record<string, any>
      const isCurrentSortField = sort?.field === field.key
      const sortOrder = isCurrentSortField ? sort?.order : undefined

      const base: DataTableColumn = {
        ...passthrough,
        key: field.key,
        title: passthrough.title ?? field.label(),
        width: column.width,
        minWidth: column.minWidth,
        fixed: column.fixed,
        sorter: column.sortable ? 'default' : undefined,
        sortOrder: passthrough.sortOrder ?? sortOrder,
        render: ((row: any, rowIndex: number) => {
          return renderCell({
            column,
            row,
            rowIndex,
            value: row?.[field.key],
            fallback: () => row?.[field.key],
          })
        }) as any,
      }

      return base
    })

    const result: DataTableColumn[] = []

    if (showSelection) {
      // 使用 Naive UI 原生 selection 列：
      // - 勾选状态由 <NDataTable v-model:checked-row-keys> 驱动（见 NaiveCrudTable.vue）
      // - selectionColumn 允许透传 multiple/disabled 等配置
      result.push({
        type: 'selection',
        ...(selectionColumn ?? {}),
      } as any)
    }

    result.push(...baseColumns)

    if (showActionsColumn === true) {
      result.push({
        key: '__actions',
        minWidth: 80,
        fixed: 'right',
        title: renderActionsHeader ? () => renderActionsHeader() : '操作' as any,
        align: 'left',
        render: (row: any) => {
          if (!renderRowActions)
            return null
          const content = renderRowActions(row)
          const nodes = Array.isArray(content) ? content : [content]
          return h(
            NSpace,
            { size: 8, justify: 'center' },
            { default: () => nodes },
          )
        },
      })
    }

    return result
  },
}
