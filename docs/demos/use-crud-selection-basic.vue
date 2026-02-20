<script setup lang="ts">
import { useCrudSelection } from '@fcurd/core'
import { computed, ref } from 'vue'

interface DemoRow {
  id: number
  name: string
  status: 'draft' | 'enabled' | 'disabled'
}

const rows = ref<DemoRow[]>([
  { id: 1, name: '示例 1', status: 'enabled' },
  { id: 2, name: '示例 2', status: 'draft' },
  { id: 3, name: '示例 3', status: 'disabled' },
  { id: 4, name: '示例 4', status: 'enabled' },
])

const selection = useCrudSelection<DemoRow>({
  rows,
  getId: row => row.id,
})

const selectedIdList = computed(() => {
  return Array
    .from(selection.selectedIds.value)
    .slice()
    .sort((a, b) => Number(a) - Number(b))
})

function onCheck(id: number, checked: boolean) {
  if (checked)
    selection.select(id)
  else
    selection.deselect(id)
}
</script>

<template>
  <div style="border: 1px solid var(--vp-c-divider); border-radius: 10px; padding: 12px">
    <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 10px">
      <button type="button" @click="selection.selectAll()">
        全选当前页
      </button>
      <button type="button" @click="selection.clear()">
        清空
      </button>

      <span style="margin-left: auto; opacity: .9">
        已选 <b>{{ selection.selectedCount.value }}</b> 条：<code>{{ selectedIdList.join(', ') || '—' }}</code>
      </span>
    </div>

    <table style="width: 100%; border-collapse: collapse">
      <thead>
        <tr>
          <th style="text-align: left; padding: 8px; border-bottom: 1px solid var(--vp-c-divider)">
            选中
          </th>
          <th style="text-align: left; padding: 8px; border-bottom: 1px solid var(--vp-c-divider)">
            ID
          </th>
          <th style="text-align: left; padding: 8px; border-bottom: 1px solid var(--vp-c-divider)">
            名称
          </th>
          <th style="text-align: left; padding: 8px; border-bottom: 1px solid var(--vp-c-divider)">
            状态
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td style="padding: 8px; border-bottom: 1px solid var(--vp-c-divider)">
            <input
              type="checkbox"
              :checked="selection.isSelected(row.id)"
              @change="onCheck(row.id, ($event.target as HTMLInputElement).checked)"
            >
          </td>
          <td style="padding: 8px; border-bottom: 1px solid var(--vp-c-divider)">
            <code>{{ row.id }}</code>
          </td>
          <td style="padding: 8px; border-bottom: 1px solid var(--vp-c-divider)">
            {{ row.name }}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid var(--vp-c-divider)">
            <code>{{ row.status }}</code>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

