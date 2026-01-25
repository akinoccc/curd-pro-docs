<script setup lang="ts">
import { NaiveAutoCrud } from '@fcurd/naive-ui'
import { NAlert, NCard, NCode, NDivider, NText } from 'naive-ui'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { createDemoColumns, createDemoFields } from '../lib/demo-schema'
import { createMemoryCrudAdapter } from '../lib/memory-crud'

const route = useRoute()
const { adapter } = createMemoryCrudAdapter()

const fields = createDemoFields()
const tableColumns = createDemoColumns(fields)

const searchQueryRaw = computed(() => {
  const v = (route.query as any)?.search
  return v === undefined ? '(无)' : String(v)
})
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <NAlert
      type="info"
      :bordered="false"
    >
      <div>
        这个页面重点看 “搜索与路由 query 同步”。在搜索表单里输入条件并点击查询，URL 会自动写入
        <NText code>
          ?search=...
        </NText>；刷新页面/复制链接打开也会自动还原搜索并刷新列表。
      </div>
    </NAlert>

    <NCard>
      <div style="display: flex; flex-direction: column; gap: 8px">
        <NText depth="3">
          当前 route.query.search
        </NText>
        <NCode
          :code="searchQueryRaw"
          language="text"
        />
      </div>

      <NDivider style="margin: 12px 0" />

      <NaiveAutoCrud
        :adapter="adapter"
        :fields="fields"
        :table-columns="tableColumns"
        form-mode="modal"
        :show-actions-column="true"
      />
    </NCard>
  </div>
</template>
