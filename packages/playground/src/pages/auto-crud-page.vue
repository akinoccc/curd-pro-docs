<script setup lang="ts">
import type { DemoRow } from '../lib/memory-crud'
import { NaiveAutoCrud } from '@fcurd/naive-ui'
import { NAlert, NCode, NDivider, NTag, NText } from 'naive-ui'
import { createDemoColumns, createDemoFields } from '../lib/demo-schema'
import { createMemoryCrudAdapter } from '../lib/memory-crud'
import { createMockDictApi } from '../lib/mock-dicts'

const dictApi = createMockDictApi()
const { adapter } = createMemoryCrudAdapter()

const fields = createDemoFields()
const tableColumns = createDemoColumns(fields)

function formatDate(iso: string): string {
  const ts = Date.parse(iso)
  if (!Number.isFinite(ts))
    return String(iso ?? '')
  return new Date(ts).toLocaleString()
}

function statusTagType(status: DemoRow['status']): 'default' | 'success' | 'warning' | 'error' {
  if (status === 'enabled')
    return 'success'
  if (status === 'draft')
    return 'warning'
  return 'error'
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <NAlert
      type="info"
      :bordered="false"
    >
      这个页面用 <NText code>
        NaiveAutoCrud
      </NText> 覆盖：搜索（含路由同步）、分页、排序、表单（drawer）、新增/编辑/删除、选择集、slot 自定义渲染、DictCenter 字典加载。
    </NAlert>

    <NaiveAutoCrud
      :adapter="adapter"
      :fields="fields"
      :table-columns="tableColumns"
      :dict-api="dictApi"
      form-mode="drawer"
      show-selection
      :show-actions-column="true"
    >
      <template #beforeTable>
        <NDivider style="margin: 8px 0">
          自定义内容（beforeTable slot）
        </NDivider>
      </template>

      <template #cell-status="{ row }">
        <NTag
          :type="statusTagType(row.status)"
          size="small"
        >
          {{ row.status }}
        </NTag>
      </template>

      <template #cell-createdAt="{ row }">
        <NText depth="3">
          {{ formatDate(row.createdAt) }}
        </NText>
      </template>

      <template #row-actions="{ row, openEdit, defaultActions }">
        <component
          :is="defaultActions.Edit"
          :row="row"
        />
        <component
          :is="defaultActions.Delete"
          :row="row"
        />
        <NDivider vertical />
        <NText
          depth="3"
          style="cursor: pointer"
          @click="openEdit(row)"
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
    </NaiveAutoCrud>
  </div>
</template>
