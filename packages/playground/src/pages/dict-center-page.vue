<script setup lang="ts">
import type { DictItem } from '@fcurd/core'
import { createDictCenter } from '@fcurd/core'
import { NAlert, NButton, NCard, NDivider, NInput, NList, NListItem, NSpace, NText, useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import { createMockDictApi } from '../lib/mock-dicts'

const message = useMessage()
const dictApi = createMockDictApi()
const dictCenter = createDictCenter(dictApi)

const key = ref('status')
const options = ref<DictItem[]>([])
const loading = ref(false)
const error = ref<unknown | null>(null)
const loadedAt = ref<number | null>(null)

const info = computed(() => {
  const ts = loadedAt.value
  return ts ? new Date(ts).toLocaleTimeString() : '未加载'
})

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const result = await dictCenter.load(key.value)
    options.value = result.options.value
    error.value = result.error.value
    loadedAt.value = Date.now()
    if (error.value)
      message.warning('字典加载完成，但有错误（见下方 error）')
    else
      message.success(`已加载：${key.value}`)
  }
  catch (e) {
    error.value = e
    message.error(String((e as any)?.message ?? e))
  }
  finally {
    loading.value = false
  }
}

function invalidateOne(): void {
  dictCenter.invalidate(key.value)
  options.value = []
  loadedAt.value = null
  message.info(`已失效缓存：${key.value}`)
}

function invalidateAll(): void {
  dictCenter.invalidate()
  options.value = []
  loadedAt.value = null
  message.info('已清空全部缓存')
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <NAlert
      type="info"
      :bordered="false"
    >
      这个页面直接演示 <NText code>
        createDictCenter
      </NText> 的缓存与失效能力（并发去重、按 key 缓存、invalidate）。
    </NAlert>

    <NCard>
      <NSpace
        :size="8"
        align="center"
      >
        <NText depth="3">
          dictKey
        </NText>
        <NInput
          v-model:value="key"
          placeholder="例如：status / category / role"
          style="width: 260px"
        />
        <NButton
          :loading="loading"
          type="primary"
          @click="load"
        >
          加载
        </NButton>
        <NButton
          :disabled="loading"
          @click="invalidateOne"
        >
          失效当前 key
        </NButton>
        <NButton
          :disabled="loading"
          @click="invalidateAll"
        >
          清空全部缓存
        </NButton>
        <NDivider vertical />
        <NText depth="3">
          最近加载：{{ info }}
        </NText>
      </NSpace>

      <NDivider style="margin: 12px 0" />

      <div style="display: grid; grid-template-columns: 1fr; gap: 8px">
        <NText
          v-if="error"
          type="error"
        >
          error: {{ String((error as any)?.message ?? error) }}
        </NText>

        <NList bordered>
          <template #header>
            options（{{ options.length }}）
          </template>
          <NListItem
            v-for="item in options"
            :key="String(item.value)"
          >
            <div style="display: flex; justify-content: space-between; gap: 12px; width: 100%">
              <NText>{{ item.label }}</NText>
              <NText depth="3">
                {{ String(item.value) }}
              </NText>
            </div>
          </NListItem>
        </NList>
      </div>
    </NCard>
  </div>
</template>
