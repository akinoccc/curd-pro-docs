<script setup lang="ts" generic="Row">
import type { CrudColumn, CrudSort, UseCrudListReturn, UseCrudSelectionReturn } from '@fcurd/core'
import type { DataTableColumn, DataTableSortState, PaginationProps } from 'naive-ui'
import { NDataTable, NPagination, NSpace } from 'naive-ui'
import { computed, h } from 'vue'
import { createTableColumns } from '../adapter'

export interface Props<Row> {
  /** CRUD list state from useCrudList */
  list: UseCrudListReturn<Row, any>
  /** Column definitions */
  columns: CrudColumn<Row>[]
  /** Selection state from useCrudSelection (optional) */
  selection?: UseCrudSelectionReturn<Row>
  /** Row key getter */
  rowKey?: (row: Row) => string | number
  /** Show row actions column */
  showActionsColumn?: boolean
  /** Actions column title */
  actionsColumnTitle?: string
  /** Actions column width */
  actionsColumnWidth?: number
  /** Data table props passthrough */
  tableProps?: Record<string, unknown>
  /** Pagination props passthrough */
  paginationProps?: PaginationProps
  /** Extra props generator for row-actions slot */
  getRowActionsSlotProps?: (row: Row) => Record<string, unknown>
}

const props = withDefaults(defineProps<Props<Row>>(), {
  showActionsColumn: false,
  actionsColumnTitle: '操作',
  actionsColumnWidth: 120,
})

const emit = defineEmits<{
  (e: 'sort', sort: CrudSort | null): void
}>()

const slots = defineSlots<Record<string, any>>()

// Build table columns
const tableColumns = computed<DataTableColumn<Row>[]>(() => {
  const cols = createTableColumns(props.columns, {
    slots,
    renderCell: (_col: CrudColumn<Row>, _row: Row, value: any) => {
      // Default rendering
      return value
    },
  })

  // Add selection column
  if (props.selection) {
    cols.unshift({
      type: 'selection',
    } as DataTableColumn<Row>)
  }

  // Add actions column
  if (props.showActionsColumn && slots['row-actions']) {
    cols.push({
      key: '__actions',
      title: props.actionsColumnTitle,
      width: props.actionsColumnWidth,
      fixed: 'right',
      render: (row: Row, rowIndex: number) => {
        // Build slot props with optional extra props from parent
        const extraProps = props.getRowActionsSlotProps?.(row) ?? {}
        const slotProps = { row, rowIndex, ...extraProps }
        return h(NSpace, { size: 8 }, () => slots['row-actions']!(slotProps))
      },
    } as DataTableColumn<Row>)
  }

  return cols
})

// Selection handling
const checkedRowKeys = computed(() => {
  return props.selection ? [...props.selection.selectedIds.value] : []
})

function handleCheckedRowKeysChange(keys: (string | number)[]) {
  if (!props.selection)
    return
  props.selection.setSelectedIds(keys)
}

// Sort handling
function handleSorterChange(sorter: DataTableSortState | DataTableSortState[] | null) {
  if (!sorter || Array.isArray(sorter)) {
    props.list.setSort(null)
    emit('sort', null)
    return
  }

  if (sorter.order === false || sorter.order === undefined) {
    props.list.setSort(null)
    emit('sort', null)
    return
  }

  const sort: CrudSort = {
    field: String(sorter.columnKey),
    order: sorter.order,
  }
  props.list.setSort(sort)
  emit('sort', sort)
}

// Pagination handling
function handlePageChange(page: number) {
  props.list.setPage(page)
}

function handlePageSizeChange(pageSize: number) {
  props.list.setPageSize(pageSize)
}
</script>

<template>
  <div class="crud-table">
    <!-- Table header slot -->
    <div
      v-if="$slots['table-header']"
      class="crud-table__header"
    >
      <slot
        name="table-header"
        :list="list"
        :selection="selection"
      />
    </div>

    <!-- Data Table -->
    <NDataTable
      :columns="tableColumns"
      :data="(list.rows.value as any)"
      :loading="list.loading.value"
      :row-key="rowKey"
      :checked-row-keys="checkedRowKeys"
      remote
      v-bind="tableProps"
      @update:checked-row-keys="handleCheckedRowKeysChange"
      @update:sorter="handleSorterChange"
    />

    <!-- Pagination -->
    <div class="crud-table__pagination">
      <NPagination
        :page="list.page.value"
        :page-size="list.pageSize.value"
        :item-count="list.total.value"
        show-size-picker
        :page-sizes="[10, 20, 50, 100]"
        v-bind="paginationProps"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<style scoped>
.crud-table__header {
  margin-bottom: 12px;
}

.crud-table__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
