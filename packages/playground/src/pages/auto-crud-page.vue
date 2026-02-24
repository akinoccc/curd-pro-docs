<script setup lang="ts">
import type { DemoRow } from '../lib/memory-crud'
import { AutoCrud } from '@uozi/vito-naive-ui'
import { NAlert, NCode, NDivider, NTag, NText } from 'naive-ui'
import { computed, ref } from 'vue'
import { createDemoColumns, createDemoFields } from '../lib/demo-schema'
import { createMemoryCrudAdapter } from '../lib/memory-crud'

const { adapter } = createMemoryCrudAdapter()

const fields = createDemoFields()
const tableColumns = createDemoColumns()

const crudRef = ref<any>(null)
const selectedCount = computed(() => {
  const selection = crudRef.value?.selection
  return selection?.selectedCount.value ?? 0
})

function formatDate(value: number | string): string {
  if (typeof value === 'number' && Number.isFinite(value))
    return new Date(value).toLocaleString()
  if (typeof value === 'string')
    return value
  return String(value ?? '')
}

function statusTagType(status: DemoRow['status']): 'default' | 'success' | 'warning' | 'error' {
  if (status === 'enabled')
    return 'success'
  if (status === 'draft')
    return 'warning'
  return 'error'
}

function categoryTagType(category: DemoRow['category']): 'default' | 'info' | 'success' | 'warning' {
  if (category === 'A')
    return 'info'
  if (category === 'B')
    return 'success'
  return 'warning'
}

function categoryLabel(category: DemoRow['category']): string {
  if (category === 'A')
    return '分类 A'
  if (category === 'B')
    return '分类 B'
  return '分类 C'
}

function statusLabel(status: DemoRow['status']): string {
  if (status === 'enabled')
    return '启用'
  if (status === 'draft')
    return '草稿'
  return '禁用'
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <NAlert
      type="info"
      :bordered="false"
    >
      这个页面用 <NText code>
        AutoCrud
      </NText> 覆盖：搜索（含路由同步）、分页、排序、表单（drawer）、新增/编辑/删除、导出、选择集、slot 自定义渲染。
    </NAlert>

    <AutoCrud
      ref="crudRef"
      :adapter="adapter"
      :fields="fields"
      :columns="tableColumns"
      search-query-key="search"
      form-mode="drawer"
      show-selection
      :show-actions-column="true"
    >
      <template #before-table>
        <NDivider style="margin: 8px 0">
          自定义内容（before-table slot）
        </NDivider>
        <NText depth="3">
          已勾选：{{ selectedCount }}
        </NText>
      </template>

      <template #cell-status="{ row }">
        <NTag
          :type="statusTagType(row.status)"
          size="small"
        >
          {{ statusLabel(row.status) }}
        </NTag>
      </template>

      <template #cell-category="{ row }">
        <NTag
          :type="categoryTagType(row.category)"
          size="small"
        >
          {{ categoryLabel(row.category) }}
        </NTag>
      </template>

      <template #cell-createdAt="{ row }">
        <NText depth="3">
          {{ formatDate(row.createdAt) }}
        </NText>
      </template>

      <template #row-actions="{ row, openEdit, defaultButtons }">
        <component
          :is="defaultButtons?.Edit"
          :row="row"
        />
        <component
          :is="defaultButtons?.Delete"
          :row="row"
        />
        <NDivider vertical />
        <NText
          depth="3"
          style="cursor: pointer"
          @click="openEdit"
        >
          二次编辑
        </NText>
      </template>

      <template #field-remark="{ model }">
        <NCode
          :code="String(model.remark ?? '')"
          language="text"
        />
      </template>
    </AutoCrud>
  </div>
</template>
