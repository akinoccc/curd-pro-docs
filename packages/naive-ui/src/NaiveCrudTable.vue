<script setup lang="ts">
import { computed, h, inject, ref, useSlots } from 'vue'
import type { CrudTableColumn, UseCrudReturn } from '@fcurd/core'
import {
  CrudColumnsSymbol,
  CrudInstanceSymbol,
  CrudSelectionSymbol,
} from '@fcurd/vue'
import { NDataTable, NCheckbox, NPagination, NSpace } from 'naive-ui'
import type { DataTableColumn } from 'naive-ui'

interface NaiveCrudTableProps<Row = any> {
  columns?: CrudTableColumn<Row>[]
  showSelection?: boolean
  showActionsColumn?: boolean
}

const props = defineProps<NaiveCrudTableProps<any>>()

const crud = inject(CrudInstanceSymbol) as UseCrudReturn<any> | undefined
const providedColumns = inject(CrudColumnsSymbol) as CrudTableColumn<any>[] | undefined
const selection = inject(CrudSelectionSymbol, ref<any[]>([]))

const slots = useSlots()

const columns = computed(
  () => (props.columns ?? providedColumns ?? []) as CrudTableColumn<any>[],
)

function isSelected(row: any): boolean {
  return selection.value.includes(row)
}

function toggleRow(row: any): void {
  if (isSelected(row)) {
    selection.value = selection.value.filter(item => item !== row)
  }
  else {
    selection.value = selection.value.concat(row)
  }
}

const naiveColumns = computed<DataTableColumn[]>(() => {
  const baseColumns: DataTableColumn[] = columns.value.map((column) => {
    const field = column.field
    const cellSlot = slots[`cell-${field.key}`]

    return {
      key: field.key,
      title: field.label(),
      width: column.width,
      minWidth: column.minWidth,
      fixed: column.fixed,
      sorter: column.sortable ? 'default' : undefined,
      render(row: any) {
        if (cellSlot) {
          const content = cellSlot({
            row,
            field,
          })
          return Array.isArray(content) ? content[0] : content
        }
        return (row as any)[field.key]
      },
    }
  })

  const result: DataTableColumn[] = []

  if (props.showSelection) {
    result.push({
      key: '__selection',
      width: 60,
      align: 'center',
      render(row: any) {
        return h(NCheckbox, {
          checked: isSelected(row),
          'onUpdate:checked': () => toggleRow(row),
        })
      },
    })
  }

  result.push(...baseColumns)

  if (props.showActionsColumn) {
    const actionsHeader = slots['actions-header']
    result.push({
      key: '__actions',
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
        if (!rowActions) return null
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

// 保证传给 NDataTable 的数据是普通数组而不是 ref 对象
const tableData = computed<any[]>(() => {
  if (!crud || !crud.rows) return []
  // useCrud 返回的是 ref，所以这里取 .value
  return (crud.rows as any).value ?? []
})
</script>

<template>
  <div class="fcurd-table fcurd-table--naive">
    <slot
      name="table-actions"
      :selection="selection"
      :query="crud?.query"
    />

    <NDataTable
      :columns="naiveColumns"
      :data="tableData"
      size="small"
      :bordered="false"
      :single-line="false"
      :striped="true"
    />

    <div class="fcurd-table__pagination" v-if="crud">
      <NPagination
        :page="crud.page.value"
        :page-size="crud.pageSize.value"
        :item-count="crud.total.value"
        show-size-picker
        :page-sizes="[10, 20, 50, 100]"
        :page-slot="7"
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

