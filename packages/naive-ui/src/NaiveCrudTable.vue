<script setup lang="ts">
import type { CrudTableCellContext, CrudTableColumn, UseCrudReturn } from '@fcurd/core'
import type { DataTableColumn } from 'naive-ui'
import type { InternalRowData } from 'naive-ui/es/data-table/src/interface'
import type { VNodeChild } from 'vue'
import {
  CrudColumnsSymbol,
  CrudGetIdSymbol,
  CrudInstanceSymbol,
  CrudSelectionSymbol,
} from '@fcurd/vue'
import { NCheckbox, NDataTable, NPagination, NSpace } from 'naive-ui'
import { computed, h, inject, ref, useSlots } from 'vue'

type NDataTableProps = InstanceType<typeof NDataTable>['$props']
type NPaginationProps = InstanceType<typeof NPagination>['$props']

interface ForwardDataTableProps extends Omit<NDataTableProps, 'columns' | 'data'> {}
interface ForwardPaginationProps extends Omit<NPaginationProps, 'page' | 'pageSize' | 'itemCount'> {}

interface NaiveCrudTableProps<Row = any> {
  columns?: CrudTableColumn<Row>[]
  showSelection?: boolean
  showActionsColumn?: boolean
  dataTableProps?: ForwardDataTableProps
  paginationProps?: ForwardPaginationProps
}

const props = defineProps<NaiveCrudTableProps<any>>()

const crud = inject(CrudInstanceSymbol) as UseCrudReturn<any> | undefined
// CrudProvider 提供的是 CrudTableColumn，这里通过扩展类型 NaiveCrudTableColumn 增强能力
const providedColumns = inject(CrudColumnsSymbol) as CrudTableColumn<any>[] | undefined
const selection = inject(CrudSelectionSymbol, ref<Set<string | number>>(new Set()))
const getId = inject(CrudGetIdSymbol, (row: any) => (row as any)?.id as string | number)

const slots = useSlots()

const columns = computed(() => (props.columns ?? providedColumns ?? []) as CrudTableColumn<any>[])

const effectiveColumns = computed(() => {
  const all = columns.value
  return all.filter((column) => {
    const field = column.field
    const visible = field.visibleIn?.table
    if (visible === undefined)
      return false
    if (typeof visible === 'boolean')
      return visible
    // 允许在 table 层基于 query / 额外上下文动态决定可见性
    // 注：这里是“列级别”判断，不涉及具体 row
    if (!crud)
      return true
    return visible({
      surface: 'table',
      query: crud.query.value,
      extra: {},
    } as any)
  })
})

function isSelected(row: any): boolean {
  return selection.value.has(getId(row))
}

function toggleRow(row: any): void {
  const id = getId(row)
  const next = new Set(selection.value)
  if (next.has(id))
    next.delete(id)
  else
    next.add(id)
  selection.value = next
}

function handleSorterChange(sorter: { columnKey: string, order: 'ascend' | 'descend' | false } | null): void {
  if (!crud)
    return
  if (!sorter || sorter.order === false) {
    crud.setSort(null)
    return
  }
  crud.setSort({
    field: sorter.columnKey,
    order: sorter.order,
  })
}

const naiveColumns = computed<DataTableColumn[]>(() => {
  const baseColumns: DataTableColumn[] = effectiveColumns.value.map((column) => {
    const field = column.field
    // 兼容两种命名风格：
    // - #cell-xxx（推荐，历史实现）
    // - #cell_xxx（业务侧常见写法）
    const cellSlot = slots[`cell-${field.key}`] ?? slots[`cell_${field.key}`]
    const naiveColumnProps = column.ui?.naive?.columnProps
    const cellRender = column.cellRender

    // 获取当前排序状态（用于高亮当前排序列）
    const currentSort = crud?.sort.value
    const isCurrentSortField = currentSort?.field === field.key
    const sortOrder = isCurrentSortField ? currentSort.order : undefined

    // 基础映射：保持 CrudTableColumn 的语义
    const base: DataTableColumn = {
      key: field.key,
      title: field.label(),
      width: column.width,
      minWidth: column.minWidth,
      fixed: column.fixed,
      sorter: column.sortable ? 'default' : undefined,
      sortOrder,
      render(row: InternalRowData, rowIndex: number): VNodeChild {
        if (cellSlot) {
          const content = cellSlot({
            row,
            field,
            rowIndex,
          })
          return Array.isArray(content) ? content[0] : content
        }
        const ctx: CrudTableCellContext<any> = {
          row: row as any,
          rowIndex,
          field,
          value: (row as any)?.[field.key],
        }

        if (typeof cellRender === 'function') {
          const content = cellRender(ctx)
          return Array.isArray(content) ? content[0] : content
        }

        return ctx.value as any
      },
    }

    // 透传并合并用户提供的 Naive UI 列配置（例如 filters / ellipsis / align / sorter 等）
    if (naiveColumnProps) {
      const extra = naiveColumnProps as DataTableColumn
      return {
        ...base,
        ...extra,
      } as DataTableColumn
    }

    return base
  })

  const result: DataTableColumn[] = []

  if (props.showSelection) {
    result.push({
      key: '__selection',
      width: 60,
      align: 'center',
      render(row: any) {
        return h(NCheckbox, {
          'checked': isSelected(row),
          'onUpdate:checked': () => toggleRow(row),
        })
      },
    })
  }

  result.push(...baseColumns)

  // 只有当 showActionsColumn 为 true 时才显示操作列
  // 当为 false 或 undefined 时，操作列将被隐藏
  if (props.showActionsColumn === true) {
    const actionsHeader = slots['actions-header']
    result.push({
      key: '__actions',
      minWidth: 'fit',
      fixed: 'right',
      title: () => {
        if (actionsHeader) {
          const content = actionsHeader()
          return Array.isArray(content) ? content[0] : content
        }
        return '操作'
      },
      align: 'center',
      render(row: any) {
        const rowActions = slots['row-actions']
        if (!rowActions)
          return null
        const content = rowActions({ row })
        const nodes = Array.isArray(content) ? content : [content]
        // 使用 NSpace 统一为行内操作按钮增加间距
        return h(
          NSpace,
          { size: 8, justify: 'center' },
          {
            default: () => nodes,
          },
        )
      },
    })
  }

  return result
})

const mergedDataTableProps = computed<ForwardDataTableProps>(() => {
  return {
    striped: true,
    scrollX: 'max-content',
    // maxHeight: '480px',
    ...(props.dataTableProps ?? {}),
  }
})

const mergedPaginationProps = computed<ForwardPaginationProps>(() => {
  return {
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    pageSlot: 7,
    ...(props.paginationProps ?? {}),
  }
})

// 保证传给 NDataTable 的数据是普通数组而不是 ref 对象
const tableData = computed<any[]>(() => {
  if (!crud || !crud.rows)
    return []
  // useCrud 返回的是 ref，所以这里取 .value
  return crud.rows?.value ?? []
})
</script>

<template>
  <div class="fcurd-table fcurd-table--naive">
    <slot
      name="table-actions"
      :selection="selection"
      :selected-ids="selection"
      :query="crud?.query"
    />

    <NDataTable
      v-bind="mergedDataTableProps"
      :columns="naiveColumns"
      :data="tableData"
      @update:sorter="handleSorterChange"
    />

    <div
      v-if="crud"
      class="fcurd-table__pagination"
    >
      <NPagination
        v-bind="mergedPaginationProps"
        :page="crud.page.value"
        :page-size="crud.pageSize.value"
        :item-count="crud.total.value"
        @update:page="crud.setPage"
        @update:page-size="crud.setPageSize"
      />
    </div>
  </div>
</template>

<style scoped>
.fcurd-table--naive {
  width: 100%;
}

.fcurd-table__pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
  font-size: 13px;
}
</style>

<style>
/* 为固定的操作列添加左边框和阴影，以区分非固定列 */
/* 使用 data-col-key="__actions" 来精确选择操作列 */
.n-data-table-th[data-col-key="__actions"].n-data-table-th--fixed-right,
.n-data-table-td[data-col-key="__actions"].n-data-table-td--fixed-right {
  border-left: 1px solid rgba(0, 0, 0, 0.08) !important;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.04) !important;
}

/* 暗色主题适配 */
:root[data-theme="dark"] .n-data-table-th[data-col-key="__actions"].n-data-table-th--fixed-right,
:root[data-theme="dark"] .n-data-table-td[data-col-key="__actions"].n-data-table-td--fixed-right {
  border-left-color: rgba(255, 255, 255, 0.1) !important;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.2) !important;
}
</style>
