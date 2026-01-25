<script setup lang="ts">
import type { CrudTableColumn } from '@fcurd/core'
import type { DataTableProps, PaginationProps } from 'naive-ui'
import { useCrudContext, useCrudTableSorterSync, useCrudTableUiColumns, useEffectiveColumns } from '@fcurd/vue'
import { NDataTable, NPagination } from 'naive-ui'
import { computed, useSlots } from 'vue'

interface NaiveCrudTableProps<Row = any> {
  columns?: readonly CrudTableColumn<Row>[]
  showSelection?: boolean
  showActionsColumn?: boolean
  dataTableProps?: DataTableProps
  paginationProps?: PaginationProps
}

const props = defineProps<NaiveCrudTableProps<any>>()

const ctx = useCrudContext<any>()
const { onSorterChange } = useCrudTableSorterSync()
const slots = useSlots()

const effectiveColumns = useEffectiveColumns<any>({
  columns: () => (props.columns ?? ctx.columns ?? []) as readonly CrudTableColumn<any>[],
})

const mergedDataTableProps = computed<DataTableProps>(() => {
  return {
    striped: true,
    scrollX: 'max-content',
    ...(props.dataTableProps ?? {}),
  }
})

const mergedPaginationProps = computed<PaginationProps>(() => {
  return {
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    pageSlot: 7,
    ...(props.paginationProps ?? {}),
  }
})

const uiColumnsRef = useCrudTableUiColumns<any>({
  columns: effectiveColumns as any,
  slots,
  showSelection: props.showSelection,
  showActionsColumn: props.showActionsColumn,
})

const uiColumns = computed<any[]>(() => uiColumnsRef.value ?? [])

const tableData = computed<any[]>(() => {
  return ctx.crud?.rows?.value ?? []
})
</script>

<template>
  <div class="fcurd-table fcurd-table--naive">
    <slot
      name="table-actions"
      :selection="ctx.selection"
      :selected-ids="ctx.selection"
      :query="ctx.crud?.query"
    />

    <NDataTable
      v-bind="mergedDataTableProps"
      :columns="uiColumns"
      :data="tableData"
      @update:sorter="onSorterChange"
    />

    <div
      v-if="ctx.crud"
      class="fcurd-table__pagination"
    >
      <NPagination
        v-bind="mergedPaginationProps"
        :page="ctx.crud.page.value"
        :page-size="ctx.crud.pageSize.value"
        :item-count="ctx.crud.total.value"
        @update:page="ctx.crud.setPage"
        @update:page-size="ctx.crud.setPageSize"
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
