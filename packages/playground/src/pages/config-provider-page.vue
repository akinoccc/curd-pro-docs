<script setup lang="ts">
import { CrudConfigProvider } from '@fcurd/core'
import { NaiveDateField, NaiveDateRangeField } from '@fcurd/naive-ui'
import {
  NButton,
  NCard,
  NCode,
  NDivider,
  NForm,
  NFormItem,
  NInput,
  NRadioButton,
  NRadioGroup,
  NSpace,
  NText,
} from 'naive-ui'
import { computed, ref } from 'vue'

type DateValueType = 'timestamp' | 'yyyy-mm-dd'
type DateUnit = 'ms' | 's'

const valueType = ref<DateValueType>('timestamp')
const unit = ref<DateUnit>('ms')

const displayMode = ref<'none' | 'global' | 'byType'>('byType')
const globalFormat = ref('yyyy-MM-dd')
const fmtDate = ref('yyyy-MM-dd')
const fmtDatetime = ref('yyyy-MM-dd HH:mm:ss')
const fmtDateRange = ref('yyyy-MM-dd')
const fmtDatetimeRange = ref('yyyy-MM-dd HH:mm:ss')

const config = computed(() => {
  const displayFormat = (() => {
    if (displayMode.value === 'none')
      return undefined
    if (displayMode.value === 'global')
      return globalFormat.value
    return {
      date: fmtDate.value,
      datetime: fmtDatetime.value,
      dateRange: fmtDateRange.value,
      datetimeRange: fmtDatetimeRange.value,
    }
  })()

  return {
    date: {
      valueType: valueType.value,
      unit: unit.value,
      displayFormat,
    },
  }
})

const dateValue = ref<number | string | null>(null)
const datetimeValue = ref<number | string | null>(null)
const dateRangeValue = ref<[number, number] | [string, string] | null>(null)
const datetimeRangeValue = ref<[number, number] | [string, string] | null>(null)

const dateField = { key: 'date', type: 'date', label: () => 'date' } as any
const datetimeField = { key: 'datetime', type: 'datetime', label: () => 'datetime' } as any
const dateRangeField = { key: 'dateRange', type: 'dateRange', label: () => 'dateRange' } as any
const datetimeRangeField = { key: 'datetimeRange', type: 'datetimeRange', label: () => 'datetimeRange' } as any

function setTimestampSample(): void {
  const now = Date.now()
  dateValue.value = now
  datetimeValue.value = now
  dateRangeValue.value = [now - 7 * 24 * 60 * 60 * 1000, now]
  datetimeRangeValue.value = [now - 3 * 24 * 60 * 60 * 1000, now]
}

function setYmdSample(): void {
  dateValue.value = '2026-01-26'
  datetimeValue.value = '2026-01-26'
  dateRangeValue.value = ['2026-01-01', '2026-01-31']
  datetimeRangeValue.value = ['2026-01-20', '2026-01-26']
}

function clearAll(): void {
  dateValue.value = null
  datetimeValue.value = null
  dateRangeValue.value = null
  datetimeRangeValue.value = null
}
</script>

<template>
  <CrudConfigProvider :config="config">
    <div style="display: flex; flex-direction: column; gap: 12px">
      <NCard title="ConfigProvider：date 读写格式 + 展示 format（NaiveDateField/RangeField）">
        <NSpace
          vertical
          :size="10"
        >
          <NText depth="3">
            这个示例直接使用 date 控件组件（不依赖 CrudProvider）。输入支持 timestamp 或 YYYY-MM-DD；
            但每次选择/更新时，会始终按 ConfigProvider 的 valueType 回写。
          </NText>

          <NForm
            label-placement="left"
            label-width="140"
          >
            <NFormItem label="valueType（回写格式）">
              <NRadioGroup v-model:value="valueType">
                <NRadioButton value="timestamp">
                  timestamp
                </NRadioButton>
                <NRadioButton value="yyyy-mm-dd">
                  yyyy-mm-dd
                </NRadioButton>
              </NRadioGroup>
            </NFormItem>

            <NFormItem label="unit（timestamp 单位）">
              <NSpace
                :size="8"
                align="center"
              >
                <NRadioGroup v-model:value="unit">
                  <NRadioButton value="ms">
                    ms
                  </NRadioButton>
                  <NRadioButton value="s">
                    s
                  </NRadioButton>
                </NRadioGroup>
                <NText
                  depth="3"
                  style="font-size: 12px"
                >
                  （仅 valueType=timestamp 时生效）
                </NText>
              </NSpace>
            </NFormItem>

            <NFormItem label="displayFormat（展示）">
              <NSpace
                vertical
                :size="8"
                style="width: 100%"
              >
                <NRadioGroup v-model:value="displayMode">
                  <NRadioButton value="none">
                    不配置
                  </NRadioButton>
                  <NRadioButton value="global">
                    全局一个
                  </NRadioButton>
                  <NRadioButton value="byType">
                    按类型
                  </NRadioButton>
                </NRadioGroup>

                <template v-if="displayMode === 'global'">
                  <NInput
                    v-model:value="globalFormat"
                    placeholder="例如：yyyy-MM-dd"
                  />
                </template>

                <template v-else-if="displayMode === 'byType'">
                  <div style="display: grid; grid-template-columns: 140px 1fr; gap: 8px 12px">
                    <NText depth="3">
                      date
                    </NText>
                    <NInput v-model:value="fmtDate" />
                    <NText depth="3">
                      datetime
                    </NText>
                    <NInput v-model:value="fmtDatetime" />
                    <NText depth="3">
                      dateRange
                    </NText>
                    <NInput v-model:value="fmtDateRange" />
                    <NText depth="3">
                      datetimeRange
                    </NText>
                    <NInput v-model:value="fmtDatetimeRange" />
                  </div>
                </template>
              </NSpace>
            </NFormItem>
          </NForm>

          <NSpace :size="8">
            <NButton @click="setTimestampSample">
              塞入 timestamp 示例
            </NButton>
            <NButton @click="setYmdSample">
              塞入 YYYY-MM-DD 示例
            </NButton>
            <NButton
              tertiary
              @click="clearAll"
            >
              清空
            </NButton>
          </NSpace>
        </NSpace>
      </NCard>

      <NCard title="控件演示">
        <NSpace
          vertical
          :size="12"
        >
          <NText depth="3">
            你也可以在 field.ui.control 里显式传 <NText code>
              format
            </NText> 来覆盖 ConfigProvider 的 displayFormat。
          </NText>

          <div style="display: grid; grid-template-columns: 260px 1fr; gap: 12px 16px; align-items: center">
            <div>
              <NaiveDateField
                v-model="dateValue"
                :field="dateField"
              />
            </div>
            <NCode
              :code="JSON.stringify(dateValue, null, 2)"
              language="json"
            />

            <div>
              <NaiveDateField
                v-model="datetimeValue"
                :field="datetimeField"
              />
            </div>
            <NCode
              :code="JSON.stringify(datetimeValue, null, 2)"
              language="json"
            />

            <div>
              <NaiveDateRangeField
                v-model="dateRangeValue"
                :field="dateRangeField"
              />
            </div>
            <NCode
              :code="JSON.stringify(dateRangeValue, null, 2)"
              language="json"
            />

            <div>
              <NaiveDateRangeField
                v-model="datetimeRangeValue"
                :field="datetimeRangeField"
              />
            </div>
            <NCode
              :code="JSON.stringify(datetimeRangeValue, null, 2)"
              language="json"
            />
          </div>

          <NDivider style="margin: 8px 0" />

          <NText depth="3">
            当前注入的 config（供确认）：
          </NText>
          <NCode
            :code="JSON.stringify(config, null, 2)"
            language="json"
          />
        </NSpace>
      </NCard>
    </div>
  </CrudConfigProvider>
</template>
