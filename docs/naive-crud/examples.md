## 示例与最佳实践（Examples）

本文件收录典型业务场景的完整示例，展示如何基于 Naive CRUD 设计落地实际页面。

- 客户管理（类似原有 `StdCurd + clientColumns`） → 使用 `AutoCrud`
- 保单管理（复杂业务页） → 使用 Lego 模式：`useCrud + CrudPage + CrudTable + 业务组件`

---

## 1. 客户管理：AutoCrud 场景

### 1.1 字段与注册表

```ts
// schemas/client/client.fields.ts
import type { CrudField } from 'libs/crud-naive'
import { createFieldRegistry } from 'libs/crud-naive'

export interface ModelClient {
  id: number
  name: string
  english_name: string
  id_number: string
  phone: string
  email: string
}

const fields: CrudField<ModelClient, ModelClient>[] = [
  {
    key: 'name',
    label: () => $gettext('姓名'),
    type: 'text',
    required: true,
  },
  {
    key: 'english_name',
    label: () => $gettext('英文姓名'),
    type: 'text',
  },
  {
    key: 'id_number',
    label: () => $gettext('证件号'),
    type: 'text',
  },
  {
    key: 'phone',
    label: () => $gettext('电话号码'),
    type: 'text',
  },
  {
    key: 'email',
    label: () => $gettext('邮箱'),
    type: 'text',
  },
]

export const clientFieldRegistry = createFieldRegistry<ModelClient, ModelClient>(fields)
export const clientFields = clientFieldRegistry.list
export const clientFieldByKey = clientFieldRegistry.byKey
```

### 1.2 表格列配置

```ts
// schemas/client/client.table.ts
import type { CrudTableColumn } from 'libs/crud-naive'
import type { ModelClient } from './client.fields'
import { clientFieldByKey } from './client.fields'

export const clientTableColumns: CrudTableColumn<ModelClient>[] = [
  { field: clientFieldByKey.name, width: 150, fixed: 'left', sortable: true, searchable: 'input' },
  { field: clientFieldByKey.english_name, width: 150, searchable: 'input' },
  { field: clientFieldByKey.id_number, width: 260, searchable: 'input' },
  { field: clientFieldByKey.phone, width: 180, searchable: 'input' },
  { field: clientFieldByKey.email, width: 200, searchable: 'input' },
]
```

### 1.3 页面实现（带附件管理弹窗）

```vue
<!-- pages/client/ClientPage.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { AutoCrud } from 'libs/crud-naive'
import type { CrudAdapter } from 'libs/crud-naive'
import { useClientApi } from '~/api'
import { useUserStore } from '~/store'
import TableTopScrollbar from '~/components/TableTopScrollbar/TableTopScrollbar.vue'
import ClientFileUploadModal from './components/ClientFileUploadDrawer.vue'
import {
  clientFields,
  clientFieldByKey,
  type ModelClient,
} from '@/schemas/client/client.fields'
import { useClientFormEffects } from '@/features/client/useClientFormEffects'

const clientApi = useClientApi()
const userStore = useUserStore()

const isReadonly = computed(() => {
  return (
    userStore.isFinance() ||
    userStore.isHR() ||
    userStore.isInfo() ||
    userStore.isSigningClerk()
  )
})

const clientAdapter: CrudAdapter<ModelClient> = {
  async list(params) {
    const res = await clientApi.list(params)
    return { items: res.items, total: res.total }
  },
  async create(data) {
    return await clientApi.create(data)
  },
  async update(id, data) {
    return await clientApi.update(String(id), data)
  },
  async remove(id) {
    await clientApi.remove(String(id))
  },
}

const fileModalVisible = ref(false)
const selectedClientId = ref<string | null>(null)

function handleOpenFileManager(row: ModelClient) {
  if (!row.id) return
  selectedClientId.value = String(row.id)
  fileModalVisible.value = true
}

const formModelRef = ref<ModelClient | null>(null)

function handleFormModelReady(model: ModelClient) {
  formModelRef.value = model
  const modelRef = ref(model)
  useClientFormEffects(modelRef)
}

const clientTableColumns = [
  { field: clientFieldByKey.name, width: 150, fixed: 'left', sortable: true, searchable: 'input' },
  { field: clientFieldByKey.english_name, width: 150, searchable: 'input' },
  { field: clientFieldByKey.id_number, width: 260, searchable: 'input' },
  { field: clientFieldByKey.phone, width: 180, searchable: 'input' },
]
</script>

<template>
  <AutoCrud
    :adapter="clientAdapter"
    :fields="clientFields"
    :table-columns="clientTableColumns"
    :disable-add="isReadonly"
    :disable-edit="isReadonly"
    :disable-delete="isReadonly"
    @form-model-ready="handleFormModelReady"
  >
    <template #beforeTable>
      <TableTopScrollbar />
    </template>

    <template #row-actions="{ row, EditButton, DeleteButton }">
      <n-space size="small">
        <n-button
          text
          size="small"
          @click="handleOpenFileManager(row)"
        >
          {{ $gettext('附件') }}
        </n-button>

        <EditButton v-if="!isReadonly" />
        <DeleteButton v-if="!isReadonly" />
      </n-space>
    </template>
  </AutoCrud>

  <ClientFileUploadModal
    v-model:visible="fileModalVisible"
    :client-id="selectedClientId"
    :readonly="isReadonly"
  />
</template>
```

---

## 2. 保单管理：Lego 模式 + 复杂业务 Action

### 2.1 保单字段与表格列

```ts
// schemas/policy/policy.fields.ts
import type { CrudField } from 'libs/crud-naive'

export interface ModelPolicy {
  id: number
  no: string
  status: number
  currency: string
  premium: number
}

export const policyFields: CrudField<ModelPolicy, ModelPolicy>[] = [
  {
    key: 'id',
    label: () => $gettext('系统编号'),
    type: 'text',
  },
  {
    key: 'no',
    label: () => $gettext('保单号'),
    type: 'text',
  },
  {
    key: 'status',
    label: () => $gettext('状态'),
    type: 'select',
    dictKey: 'PolicyStatus',
  },
  {
    key: 'premium',
    label: () => $gettext('主险保费'),
    type: 'money',
  },
]
```

```ts
// schemas/policy/policy.table.ts
import type { CrudTableColumn } from 'libs/crud-naive'
import type { ModelPolicy } from './policy.fields'
import { policyFields } from './policy.fields'
import PolicyStatusCell from '@/components/policy/PolicyStatusCell.vue'
import PolicyAmountCell from '@/components/policy/PolicyAmountCell.vue'

export const policyTableColumns: CrudTableColumn<ModelPolicy>[] = [
  {
    field: policyFields.find(f => f.key === 'id')!,
    width: 120,
    fixed: 'left',
    sortable: true,
    searchable: 'input',
  },
  {
    field: policyFields.find(f => f.key === 'no')!,
    width: 160,
    sortable: true,
    searchable: 'input',
  },
  {
    field: policyFields.find(f => f.key === 'status')!,
    width: 120,
    cellComponent: PolicyStatusCell,
    searchable: 'select',
  },
  {
    field: policyFields.find(f => f.key === 'premium')!,
    width: 160,
    sortable: true,
    cellComponent: PolicyAmountCell,
  },
]
```

### 2.2 业务组件：工具栏与行内操作

```vue
<!-- components/policy/PolicyToolbar.vue -->
<script setup lang="ts">
import type { UseCrudReturn } from 'libs/crud-naive'
import type { ModelPolicy } from '@/schemas/policy/policy.fields'
import ExportPolicyButton from '@/pages/policy/components/ExportPolicy/ExportPolicyButton.vue'

interface Props {
  crud: UseCrudReturn<ModelPolicy>
  privileged: boolean
  isReadonly: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (event: 'import'): void
  (event: 'add'): void
}>()
</script>

<template>
  <div class="policy-toolbar">
    <n-space>
      <n-button
        v-if="privileged && !isReadonly"
        secondary
        @click="emit('import')"
      >
        {{ $gettext('导入') }}
      </n-button>
      <n-button
        v-if="privileged && !isReadonly"
        type="primary"
        @click="emit('add')"
      >
        {{ $gettext('添加') }}
      </n-button>
      <ExportPolicyButton v-if="privileged" />
    </n-space>
  </div>
</template>
```

```vue
<!-- components/policy/PolicyRowActions.vue -->
<script setup lang="ts">
import type { ModelPolicy } from '@/schemas/policy/policy.fields'
import PolicyFilesButton from '@/pages/policy/components/PolicyFilesButton.vue'
import RenewDialog from '@/pages/policy/components/Renew/RenewDialog.vue'
import ResetPolicy from '@/pages/policy/components/Renew/ResetPolicy.vue'
import { POLICY_RENEW } from '~/router'
import { useRoute, useRouter } from 'vue-router'

interface Props {
  row: ModelPolicy
  privileged: boolean
  isReadonly: boolean
  isShowRenewDialog: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (event: 'view', id: number | string): void
  (event: 'edit', row: ModelPolicy): void
  (event: 'openPending', id: number | string): void
  (event: 'refresh'): void
}>()

const route = useRoute()
const router = useRouter()

function navigateToRenewRecord(policyId: number | string) {
  router.push({
    name: POLICY_RENEW,
    params: { id: policyId },
    query: { from: route.fullPath },
  })
}
</script>

<template>
  <div class="policy-actions-limited">
    <n-button text size="small" @click="emit('view', row.id)">
      {{ $gettext('查看') }}
    </n-button>

    <n-button
      v-if="privileged && !isReadonly"
      text
      size="small"
      @click="emit('edit', row)"
    >
      {{ $gettext('编辑') }}
    </n-button>

    <n-button text size="small" @click="emit('openPending', row.id)">
      {{ $gettext('处理 Pending') }}
    </n-button>

    <PolicyFilesButton
      :policy="row"
      :back-path="route.fullPath"
      :privileged="privileged"
    />

    <RenewDialog
      v-if="isShowRenewDialog"
      :policy-id="row.id"
      :policy-data="row"
      @refresh-list="emit('refresh')"
    />

    <n-dropdown v-if="privileged">
      <template #trigger>
        <n-button text size="small">
          {{ $gettext('财务') }}
        </n-button>
      </template>
      <n-dropdown-menu>
        <n-dropdown-item @click="navigateToRenewRecord(row.id)">
          {{ $gettext('续保记录') }}
        </n-dropdown-item>
        <n-dropdown-item v-if="!isReadonly">
          <ResetPolicy :policy-id="row.id" @update="emit('refresh')" />
        </n-dropdown-item>
      </n-dropdown-menu>
    </n-dropdown>
  </div>
</template>
```

### 2.3 保单页面实现

```vue
<!-- pages/policy/PolicyPage.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import {
  useCrud,
  CrudPage,
  CrudSearch,
  CrudTable,
} from 'libs/crud-naive'
import type { CrudAdapter } from 'libs/crud-naive'
import { usePolicyApi } from '~/api'
import { usePolicyStore, useUserStore } from '~/store'
import TableTopScrollbar from '~/components/TableTopScrollbar/TableTopScrollbar.vue'
import ModifyPolicy from './components/ModifyPolicy/ModifyPolicy.vue'
import ViewPolicy from './components/ViewPolicy/ViewPolicy.vue'
import PolicyPendingDrawer from './components/Pending/drawer.vue'
import PolicyToolbar from '@/components/policy/PolicyToolbar.vue'
import PolicyRowActions from '@/components/policy/PolicyRowActions.vue'
import { policyTableColumns } from '@/schemas/policy/policy.table'
import type { ModelPolicy } from '@/schemas/policy/policy.fields'

const policyStore = usePolicyStore()
const { privileged } = storeToRefs(policyStore)
const userStore = useUserStore()
const policyApi = usePolicyApi()

const isReadonly = computed(() => userStore.isFinance())
const isShowRenewDialog = computed(
  () => userStore.isAdmin() || userStore.isBusiness(),
)

const adapter: CrudAdapter<ModelPolicy> = {
  async list(params) {
    const res = await policyApi.list({
      ...params,
      query: { ...params.query, archived: 1 },
    })
    return { items: res.items, total: res.total }
  },
}

const crud = useCrud<ModelPolicy>({
  adapter,
  initialQuery: { archived: 1 },
})

const modifyRef = ref<InstanceType<typeof ModifyPolicy> | null>(null)
const viewRef = ref<InstanceType<typeof ViewPolicy> | null>(null)
const pendingRef = ref<InstanceType<typeof PolicyPendingDrawer> | null>(null)

function handleAdd() {
  modifyRef.value?.open()
}

function handleEdit(row: ModelPolicy) {
  modifyRef.value?.open(row.id, row)
}

function handleView(id: number | string) {
  viewRef.value?.open(String(id))
}

function handleOpenPending(id: number | string) {
  pendingRef.value?.open(String(id))
}

async function handleRefresh() {
  await crud.refresh()
}
</script>

<template>
  <div class="policy-page-wrapper">
    <CrudPage
      :crud="crud"
      :title="$gettext('管理保单')"
    >
      <template #beforeTable>
        <TableTopScrollbar />
      </template>

      <template #toolbar>
        <PolicyToolbar
          :crud="crud"
          :privileged="privileged"
          :is-readonly="isReadonly"
          @import="$router.push({ path: '/policies/import', query: { from: $route.fullPath } })"
          @add="handleAdd"
        />
      </template>

      <template #search>
        <CrudSearch />
      </template>

      <template #table>
        <CrudTable
          :columns="policyTableColumns"
          :show-actions-column="true"
        >
          <template #row-actions="{ row, EditButton, DeleteButton }">
            <PolicyRowActions
              :row="row"
              :privileged="privileged"
              :is-readonly="isReadonly"
              :is-show-renew-dialog="isShowRenewDialog"
              @view="handleView"
              @edit="handleEdit"
              @openPending="handleOpenPending"
              @refresh="handleRefresh"
            />
          </template>
        </CrudTable>
      </template>
    </CrudPage>

    <ModifyPolicy
      ref="modifyRef"
      :privileged="privileged"
      @save="handleRefresh"
    />

    <ViewPolicy
      ref="viewRef"
      :privileged="privileged"
      :in-appointment="false"
    />

    <PolicyPendingDrawer
      ref="pendingRef"
      @updated="handleRefresh"
    />
  </div>
</template>
```

---

## 3. 小结

- 简单场景：优先考虑 `AutoCrud`，配合字段/列配置和少量 slot 即可。
- 复杂场景：通过 `useCrud + CrudPage + CrudTable + 领域组件` 采用 Lego 模式，将业务逻辑从通用 CRUD 中解放出来。
- 所有示例都遵循前文的核心模型、hooks、组件设计，可以在此基础上扩展更多业务模块。 


