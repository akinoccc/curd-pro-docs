<script setup lang="ts">
import type { DemoQuery, DemoRow } from './basic-types'
import { useCrudList, useCrudRouteSync } from '@uozi/vito-core'
import { useRoute, useRouter } from 'vue-router'
import { createBasicAdapter } from './basic-adapter'

const route = useRoute()
const router = useRouter()

const { adapter } = createBasicAdapter()

const list = useCrudList<DemoRow, DemoQuery>({
  adapter,
})

useCrudRouteSync<DemoQuery>({
  query: list.query,
  setQuery: list.setQuery,
  router,
  route,
  queryKey: 'q',
})
</script>

<template>
  <div>
    <!-- 这里只演示 route-sync 的核心用法，渲染由你自行决定 -->
  </div>
</template>
