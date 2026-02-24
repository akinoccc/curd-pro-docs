<script setup lang="ts">
import type { CrudSort } from '@uozi/vito-core'
import type { DemoQuery, DemoRow } from '../examples/basic-types'
import { useCrudList } from '@uozi/vito-core'
import { computed, ref, watch } from 'vue'
import { createBasicAdapter } from '../examples/basic-adapter'

const { adapter, reset } = createBasicAdapter()

const pageSizeOptions = [2, 3, 5, 10]

const list = useCrudList<DemoRow, DemoQuery>({
  adapter,
  initialQuery: { search: {} },
  initialPageSize: 5,
  debounceMs: 150,
})

const searchName = ref('')
const searchStatus = ref<'' | DemoRow['status']>('')

watch([searchName, searchStatus], () => {
  list.setQuery(
    {
      search: {
        name: searchName.value || null,
        status: searchStatus.value || null,
      },
    },
    { pruneEmpty: true },
  )
}, { immediate: true })

const sortLabel = computed(() => {
  if (!list.sort.value)
    return '无'
  return `${list.sort.value.field} / ${list.sort.value.order}`
})

function toggleCreatedAtSort() {
  const cur = list.sort.value
  const next: CrudSort | null = !cur
    ? { field: 'createdAt', order: 'descend' }
    : cur.order === 'descend'
      ? { field: 'createdAt', order: 'ascend' }
      : null

  list.setSort(next)
}

function prevPage() {
  list.setPage(list.page.value - 1)
}

function nextPage() {
  const maxPage = Math.max(1, Math.ceil(list.total.value / list.pageSize.value))
  list.setPage(Math.min(maxPage, list.page.value + 1))
}

function onChangePageSize(v: string) {
  const n = Number(v)
  if (Number.isFinite(n) && n > 0)
    list.setPageSize(n)
}

function onResetData() {
  reset()
  list.reset()
}
</script>

<template>
  <div style="border: 1px solid var(--vp-c-divider); border-radius: 10px; padding: 12px">
    <div style="display: grid; grid-template-columns: 1fr 160px 1fr; gap: 10px; align-items: end">
      <label style="display: grid; gap: 6px">
        <span style="font-size: 12px; opacity: .85">名称包含</span>
        <input
          v-model="searchName"
          type="text"
          placeholder="例如：示例"
          style="width: 100%"
        >
      </label>

      <label style="display: grid; gap: 6px">
        <span style="font-size: 12px; opacity: .85">状态</span>
        <select v-model="searchStatus">
          <option value="">
            全部
          </option>
          <option value="draft">
            draft
          </option>
          <option value="enabled">
            enabled
          </option>
          <option value="disabled">
            disabled
          </option>
        </select>
      </label>

      <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end">
        <button
          type="button"
          @click="toggleCreatedAtSort"
        >
          切换 createdAt 排序
        </button>
        <button
          type="button"
          :disabled="list.loading.value"
          @click="list.refresh()"
        >
          刷新
        </button>
        <button
          type="button"
          :disabled="list.loading.value"
          @click="onResetData"
        >
          重置数据
        </button>
      </div>
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 10px; opacity: .9">
      <span>排序：<code>{{ sortLabel }}</code></span>
      <span>总数：<b>{{ list.total.value }}</b></span>
      <span>加载中：<b>{{ list.loading.value ? '是' : '否' }}</b></span>

      <span style="margin-left: auto; display: inline-flex; gap: 6px; align-items: center">
        <span>每页</span>
        <select
          :value="String(list.pageSize.value)"
          @change="onChangePageSize(($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="n in pageSizeOptions"
            :key="n"
            :value="String(n)"
          >
            {{ n }}
          </option>
        </select>
        <span>条</span>
      </span>
    </div>

    <div
      v-if="list.error.value"
      style="margin-top: 10px; color: var(--vp-c-danger-1)"
    >
      请求错误：<code>{{ String(list.error.value) }}</code>
    </div>

    <ul style="margin-top: 10px; padding-left: 18px">
      <li
        v-for="row in list.rows.value"
        :key="row.id"
      >
        <code>#{{ row.id }}</code>
        {{ row.name }}
        —
        <code>{{ row.status }}</code>
        —
        <code>{{ new Date(row.createdAt).toLocaleString() }}</code>
      </li>
    </ul>

    <div style="display: flex; gap: 8px; align-items: center; margin-top: 10px">
      <button
        type="button"
        :disabled="list.page.value <= 1 || list.loading.value"
        @click="prevPage"
      >
        上一页
      </button>
      <button
        type="button"
        :disabled="list.loading.value"
        @click="nextPage"
      >
        下一页
      </button>
      <span style="opacity: .9">
        当前页 <b>{{ list.page.value }}</b>
      </span>
    </div>
  </div>
</template>
