<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { CrudTableColumn, UseCrudReturn } from '@fcurd/core'
import {
  CrudColumnsSymbol,
  CrudInstanceSymbol,
  CrudSelectionSymbol,
} from './symbols'

interface CrudTableProps<Row = any> {
  columns?: CrudTableColumn<Row>[]
  showSelection?: boolean
  showActionsColumn?: boolean
}

const props = defineProps<CrudTableProps<any>>()

const crud = inject(CrudInstanceSymbol) as UseCrudReturn<any> | undefined
const providedColumns = inject(CrudColumnsSymbol) as CrudTableColumn<any>[] | undefined
const selection = inject(CrudSelectionSymbol, ref<any[]>([]))

const columns = computed(() => (props.columns ?? providedColumns ?? []) as CrudTableColumn<any>[])

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
</script>

<template>
  <div class="fcurd-table">
    <slot
      name="table-actions"
      :selection="selection"
      :query="crud?.query"
    />

    <table class="fcurd-table__native">
      <thead>
        <tr>
          <th v-if="showSelection">
            <!-- selection header reserved -->
          </th>
          <th
            v-for="column in columns"
            :key="column.field.key"
          >
            {{ column.field.label() }}
          </th>
          <th v-if="showActionsColumn">
            <slot name="actions-header">
              操作
            </slot>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in crud?.rows || []" :key="(row as any).id ?? row">
          <td v-if="showSelection">
            <input
              type="checkbox"
              :checked="isSelected(row)"
              @change="toggleRow(row)"
            >
          </td>
          <td
            v-for="column in columns"
            :key="column.field.key"
          >
            <slot
              :name="`cell-${column.field.key}`"
              :row="row"
              :field="column.field"
            >
              {{ (row as any)[column.field.key] }}
            </slot>
          </td>
          <td v-if="showActionsColumn">
            <slot name="row-actions" :row="row" />
          </td>
        </tr>
      </tbody>
    </table>

    <div class="fcurd-table__pagination" v-if="crud">
      <slot
        name="pagination"
        :page="crud.page"
        :page-size="crud.pageSize"
        :total="crud.total"
        :set-page="crud.setPage"
        :set-page-size="crud.setPageSize"
      />
    </div>
  </div>
</template>

