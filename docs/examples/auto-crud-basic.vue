<script setup lang="ts">
import { AutoCrud } from '@uozi/vito-naive-ui'
import { NAlert, NText } from 'naive-ui'
import { ref } from 'vue'
import { createBasicAdapter } from './basic-adapter'
import { demoColumns, demoFields } from './basic-schema'

const { adapter } = createBasicAdapter()
const crudRef = ref<InstanceType<typeof AutoCrud> | null>(null)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <NAlert
      :bordered="false"
      type="info"
    >
      <div>
        这是一个最小的 <NText code>
          AutoCrud
        </NText> 示例：搜索（query.search）、分页、排序、表单（Modal）、新增/编辑/删除。
      </div>
    </NAlert>

    <AutoCrud
      ref="crudRef"
      :adapter="adapter"
      :fields="demoFields"
      :columns="demoColumns"
      search-query-key="search"
      form-mode="modal"
      show-selection
      :show-actions-column="true"
    />
  </div>
</template>
