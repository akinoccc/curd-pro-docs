<script setup lang="ts">
import type { TabsProps } from 'naive-ui'
import { NConfigProvider, NDialogProvider, NLayout, NLayoutContent, NLayoutHeader, NMessageProvider, NTabPane, NTabs, NText } from 'naive-ui'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { routeNames } from './router'

const route = useRoute()
const router = useRouter()

const tabValue = computed<string>(() => {
  const name = route.name
  return typeof name === 'string' ? name : routeNames.auto
})

function handleUpdateValue(value: string): void {
  void router.push({ name: value })
}

const tabsType = 'line' satisfies TabsProps['type']
</script>

<template>
  <NConfigProvider>
    <NMessageProvider>
      <NDialogProvider>
        <NLayout style="min-height: 100vh">
          <NLayoutHeader
            bordered
            style="padding: 12px 16px"
          >
            <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
              <div style="display: flex; flex-direction: column; gap: 2px; width: 200px;">
                <NText strong>
                  @uozi/vito playground
                </NText>
                <NText
                  depth="3"
                  style="font-size: 12px"
                >
                  Naive UI + Vue3 + TS
                </NText>
              </div>

              <NTabs
                :type="tabsType"
                :value="tabValue"
                @update:value="handleUpdateValue"
              >
                <NTabPane
                  :name="routeNames.auto"
                  tab="Auto CRUD"
                />
                <NTabPane
                  :name="routeNames.routeSync"
                  tab="路由同步"
                />
                <NTabPane
                  :name="routeNames.config"
                  tab="ConfigProvider"
                />
              </NTabs>
            </div>
          </NLayoutHeader>

          <NLayoutContent style="padding: 16px">
            <RouterView />
          </NLayoutContent>
        </NLayout>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>
