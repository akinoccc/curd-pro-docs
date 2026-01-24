<script setup lang="ts">
import type { CrudAction, CrudActionArea, CrudActionContext } from '@fcurd/core'
import type { DemoRow } from '../lib/memory-crud'
import { useCrud, useCrudActions, validateFields } from '@fcurd/core'
import {
  naiveControlMap,
  NaiveCrudForm,
  NaiveCrudSearch,
  NaiveCrudTable,
} from '@fcurd/naive-ui'
import {
  CrudActionsSymbol,
  CrudInstanceSymbol,
  CrudProvider,
  CrudSelectedRowsSymbol,
  CrudSelectionSymbol,
} from '@fcurd/vue'
import {
  NAlert,
  NButton,
  NCard,
  NDivider,
  NSpace,
  NText,
  useMessage,
} from 'naive-ui'
import { computed, defineComponent, h, inject, onMounted, ref } from 'vue'
import { createDemoColumns, createDemoFields } from '../lib/demo-schema'
import { createDemoRows, createMemoryCrudAdapter } from '../lib/memory-crud'
import { createMockDictApi } from '../lib/mock-dicts'

const dictApi = createMockDictApi()
const store = createMemoryCrudAdapter(createDemoRows(89))

const fields = createDemoFields()
const tableColumns = createDemoColumns(fields)
const message = useMessage()

const crud = useCrud<DemoRow>({
  adapter: store.adapter,
  debounceMs: 150,
  dedupe: true,
  onError(error) {
    // 这里只做示范：实际建议统一错误上报/埋点

    console.error(error)
  },
})

const visible = ref(false)
const editingRow = ref<DemoRow | null>(null)
const mode = computed<'create' | 'edit'>(() => (editingRow.value ? 'edit' : 'create'))

function openCreate(): void {
  editingRow.value = null
  visible.value = true
}

function openEdit(row: DemoRow): void {
  editingRow.value = row
  visible.value = true
}

const actions = useCrudActions<DemoRow>()

function registerAction(action: CrudAction<DemoRow>): void {
  actions.register(action)
}

registerAction({
  id: 'refresh',
  area: 'toolbar',
  label: '刷新',
  order: 10,
  onClick: async () => {
    await crud.refresh()
  },
})

registerAction({
  id: 'reset-data',
  area: 'toolbar',
  label: '重置数据',
  order: 20,
  onClick: async () => {
    store.reset(createDemoRows(89))
    await crud.refresh()
  },
})

registerAction({
  id: 'batch-delete',
  area: 'batch',
  label: '批量删除选中',
  order: 10,
  disabled: ctx => ctx.selectedRows.length === 0,
  onClick: async (ctx) => {
    const ids = ctx.selectedRows.map(r => r.id)
    for (const id of ids)
      await store.adapter.remove?.(id)
    await crud.refresh()
  },
})

const ActionBar = defineComponent({
  name: 'ActionBar',
  props: {
    area: {
      type: String as () => CrudActionArea,
      required: true,
    },
  },
  setup(props) {
    const message = useMessage()
    const injected = inject(CrudActionsSymbol, null)
    const injectedCrud = inject(CrudInstanceSymbol, null) as any
    const selectedRows = inject(CrudSelectedRowsSymbol, computed(() => [] as DemoRow[]))
    const selection = inject(CrudSelectionSymbol, ref(new Set<string | number>()))

    const list = computed(() => {
      if (!injected)
        return [] as CrudAction<DemoRow>[]
      if (Array.isArray(injected)) {
        return injected
          .filter(item => item.area === props.area)
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      }
      return injected.list(props.area) as CrudAction<DemoRow>[]
    })

    function buildCtx(): CrudActionContext<DemoRow> {
      return {
        selectedRows: selectedRows.value,
        query: injectedCrud?.query?.value ?? {},
        extra: {
          selectedIds: Array.from(selection.value),
        },
      }
    }

    function run(action: CrudAction<DemoRow>): void {
      const ctx = buildCtx()
      if (action.visible && !action.visible(ctx))
        return
      if (action.disabled && action.disabled(ctx))
        return
      Promise.resolve(action.onClick(ctx)).catch((err) => {
        message.error(String((err as any)?.message ?? err))
      })
    }

    return () => {
      if (list.value.length === 0)
        return null
      return h(
        NSpace,
        { size: 8, align: 'center' },
        {
          default: () => list.value.map(action =>
            h(
              NButton,
              {
                size: 'small',
                type: action.type as any,
                disabled: action.disabled ? action.disabled(buildCtx()) : false,
                onClick: () => run(action),
              },
              { default: () => action.label ?? action.id },
            ),
          ),
        },
      )
    }
  },
})

async function handleSubmit(payload: { mode: 'create' | 'edit', data: Partial<DemoRow> }): Promise<void> {
  try {
    const { mode: submitMode, data } = payload
    // 用 core 的 validateFields 再跑一遍（演示核心校验能力，不依赖 UI）
    const result = await validateFields(fields, data as any, { mode: submitMode, trigger: 'submit' })
    if (!result.valid) {
      const firstKey = Object.keys(result.errors)[0]
      const firstMsg = firstKey ? result.errors[firstKey]?.[0] : '校验失败'
      message.error(firstMsg ?? '校验失败')
      return
    }

    if (submitMode === 'create') {
      await store.adapter.create?.(data as any)
    }
    else {
      const row = editingRow.value
      if (!row) {
        message.error('未选择要编辑的行')
        return
      }
      await store.adapter.update?.(row.id, data as any)
    }

    await crud.refresh()
    visible.value = false
    message.success('保存成功')
  }
  catch (err) {
    message.error(String((err as any)?.message ?? err))
  }
}

onMounted(() => {
  void crud.refresh()
})
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <NAlert
      type="info"
      :bordered="false"
    >
      这个页面不使用 <NText code>
        NaiveAutoCrud
      </NText>，而是手动组合 <NText code>
        useCrud
      </NText> +
      <NText code>
        CrudProvider
      </NText> +
      <NText code>
        NaiveCrudSearch/Table/Form
      </NText>，并演示 <NText code>
        useCrudActions
      </NText> 与
      <NText code>
        validateFields
      </NText>。
    </NAlert>

    <CrudProvider
      :crud="crud"
      :fields="fields"
      :columns="tableColumns"
      :actions="actions"
      :user="{ roles: ['admin'] }"
      :extra="{ from: 'manual-page' }"
      :control-map="naiveControlMap"
      :dict-api="dictApi"
      :get-id="(row: DemoRow) => row.id"
    >
      <NCard>
        <section style="display: flex; align-items: center; justify-content: space-between; gap: 12px">
          <NSpace
            :size="8"
            align="center"
          >
            <NButton
              type="primary"
              @click="openCreate"
            >
              新增
            </NButton>
            <ActionBar area="toolbar" />
            <NDivider vertical />
            <ActionBar area="batch" />
          </NSpace>

          <NText
            depth="3"
            style="font-size: 12px"
          >
            当前模式：{{ mode }}，列表共 {{ crud.total.value }} 条
          </NText>
        </section>

        <section style="margin-top: 12px">
          <NaiveCrudSearch />
        </section>

        <section style="margin-top: 12px">
          <NaiveCrudTable
            :columns="tableColumns"
            :show-selection="true"
            :show-actions-column="true"
          >
            <template #row-actions="{ row }">
              <NSpace
                :size="8"
                justify="center"
              >
                <NButton
                  size="small"
                  tertiary
                  @click="openEdit(row)"
                >
                  编辑
                </NButton>
              </NSpace>
            </template>
          </NaiveCrudTable>
        </section>

        <NaiveCrudForm
          v-model="visible"
          :row="editingRow"
          :fields="fields as any"
          form-mode="modal"
          reset-on-close
          @submit="handleSubmit"
        >
          <template #field-remark="{ model }">
            <NText
              depth="3"
              style="display: block; margin-bottom: 8px"
            >
              这里是自定义 field slot（并且该字段仅当 status=disabled 时可见）
            </NText>
            <pre style="margin: 0; padding: 8px; background: rgba(0,0,0,0.04); border-radius: 6px">{{ model.remark }}</pre>
          </template>
        </NaiveCrudForm>
      </NCard>
    </CrudProvider>
  </div>
</template>
