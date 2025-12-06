## 视图组件与布局设计（Components）

本文件描述 Naive CRUD 的视图组件层设计，包括：

- `CrudProvider`
- `AutoCrud`
- `CrudPage`
- `CrudSearch`
- `CrudForm`
- `CrudTable`
- `CrudRowActions`
- `CrudActions`

所有组件都基于 Naive UI 构建，并通过 `CrudProvider` 提供的上下文协同工作。

---

## 1. CrudProvider

**职责**：将 CRUD 上下文（crud 实例、字段、actions、用户信息等）通过 `provide` 注入给子组件。

```ts
interface CrudProviderProps<Row = any> {
  crud: UseCrudReturn<Row>
  fields?: CrudField<Row, any>[]
  actions?: CrudAction<Row>[]
  user?: { roles: string[] }
  extra?: Record<string, any>
  controlMap?: Partial<CrudControlMap>
}
```

典型用法：

```vue
<CrudProvider :crud="crud" :fields="clientFields">
  <CrudPage>
    <!-- 内部使用 CrudSearch / CrudTable 等 -->
  </CrudPage>
</CrudProvider>
```

---

## 2. AutoCrud

`AutoCrud` 用于简单 / 中等复杂度的 CRUD 场景，通过字段定义和适配器自动生成完整页面。

### 2.1 Props

```ts
interface AutoCrudProps<Row = any> {
  adapter: CrudAdapter<Row>
  fields: CrudField<Row, any>[]
  tableColumns?: CrudTableColumn<Row>[]
  searchFields?: CrudField<Row, any>[]
  formLayout?: any
  disableAdd?: boolean
  disableEdit?: boolean
  disableDelete?: boolean
  disableExport?: boolean
}
```

### 2.2 Slots

- `#beforeTable`：表格上方区域（如顶部滚动条）。
- `#table-actions="{ AddButton, DeleteButton, ExportButton, selection, query }"`
  - 单一工具栏 slot，通过 slot props 提供已接线按钮组件。
- `#row-actions="{ row, ViewLink, EditButton, DeleteButton }"`
  - 行内操作区域 slot。
- `#form-extra="{ formModel }"`：表单底部扩展区域。

### 2.3 事件（与表单编辑相关）

为支持表单编辑期的联动和生命周期控制，`AutoCrud` 可以对外抛出以下与表单相关的事件（实现时可按需取舍）：

- `@form-model-ready="(model: Row, mode: 'create' | 'edit') => void"`
  - 表单实例创建并完成字段初始化时触发；
  - 适合在这里调用领域 Hook（如 `useClientFormEffects`）进行联动。
- `@submit="(payload: { mode: 'create' | 'edit'; data: Partial<Row> }) => void"`
  - 用户点击保存按钮且通过前端校验后触发；
  - 通常由内部调用 `adapter.create/update` 完成提交，业务可以在此埋点。
- `@success="(payload: { mode: 'create' | 'edit'; data: Row }) => void"`
  - 提交成功后触发，适合做提示或额外逻辑。
- `@error="(error: unknown) => void"`
  - 提交失败时触发，业务可统一处理错误展示/上报。
- `@open="(mode: 'create' | 'edit', row?: Row) => void"`
  - 打开表单弹窗/抽屉时触发。
- `@close="() => void"`
  - 关闭表单弹窗/抽屉时触发。

---

## 3. CrudPage

`CrudPage` 提供 CRUD 页面的骨架布局，常用于 Lego 模式。

### 3.1 Props

```ts
interface CrudPageProps<Row = any> {
  crud: UseCrudReturn<Row>
  title?: string
}
```

### 3.2 Slots

- `#header`：自定义头部，覆盖默认标题。
- `#toolbar`：工具栏区域（如新增/导入/导出）。
- `#search`：搜索区域。
- `#table`：表格区域。
- `#beforeTable`：表格上方小区域（如滚动条）。
- `#footer`：底部扩展区域。

---

## 4. CrudSearch

`CrudSearch` 根据 `searchFields` 自动渲染搜索表单。

### 4.1 Props

```ts
interface CrudSearchProps<Row = any> {
  fields?: CrudField<Row, any>[]  // 默认从 Provider 获取
}
```

### 4.2 Slots

- `#default="{ formModel, submit, reset }"`
  - 完全自定义搜索表单时使用；
  - 库负责提供 `formModel` 和 `submit` / `reset` 方法。

---

## 5. CrudForm（编辑表单 / 弹窗）

`CrudForm` 是对编辑表单的封装组件，负责：

- 根据字段定义渲染表单项（配合 Control Map）；
- 管理新增 / 编辑两种模式（create / edit）；
- 与 `CrudAdapter.create/update` 协作完成提交；
- 提供生命周期事件与扩展 slot。

> 在大多数使用场景中，`CrudForm` 会被 `AutoCrud` 内部使用；在 Lego 模式下，可以单独配合 `useCrud` 和业务组件使用。

### 5.1 Props

```ts
interface CrudFormProps<Row = any> {
  /** 表单当前是否可见（用于弹窗/抽屉） */
  modelValue?: boolean
  'onUpdate:modelValue'?: (visible: boolean) => void

  /** 表单模式：modal 弹窗 / drawer 抽屉 / inline 内联 */
  mode?: 'modal' | 'drawer' | 'inline'

  /** 当前编辑的行数据；为空表示新增 */
  row?: Row | null

  /** 字段定义，不传则从 Provider 获取 */
  fields?: CrudField<Row, Row>[]

  /** 自定义布局配置（栅格 / 行列等） */
  layout?: any

  /** 标题或标题生成函数 */
  title?: string | ((payload: { mode: 'create' | 'edit'; row?: Row | null }) => string)

  /** 是否在关闭时自动重置表单 */
  resetOnClose?: boolean
}
```

### 5.2 事件

```ts
interface CrudFormEmits<Row = any> {
  (e: 'update:modelValue', visible: boolean): void
  (e: 'submit', payload: { mode: 'create' | 'edit'; data: Partial<Row> }): void
  (e: 'success', payload: { mode: 'create' | 'edit'; data: Row }): void
  (e: 'error', error: unknown): void
  (e: 'open', payload: { mode: 'create' | 'edit'; row?: Row | null }): void
  (e: 'close'): void
  (e: 'form-model-ready', model: Row, mode: 'create' | 'edit'): void
}
```

说明：

- `form-model-ready`：用于把内部响应式的表单模型暴露给外部 Hook（如身份证联动）。
- `submit/success/error`：与 `CrudAdapter.create/update` 的调用配合，便于业务追加逻辑。

### 5.3 Slots

- `#default="{ formModel, mode, submit, reset }"`
  - 完全自定义表单内容时使用；
  - `formModel` 为响应式对象，`mode` 为 `'create' | 'edit'`。
- `#footer="{ mode, submitting, submit, reset }"`
  - 自定义底部按钮区域（替换默认的“取消 / 保存”按钮）。

在默认实现中，`CrudForm` 会：

- 基于 `fields` 与 Control Map 自动渲染表单项；
- 在内部处理校验、loading 状态；
- 调用 `submit` 时触发 `submit` 事件，并在外层协作下完成真正的持久化。

### 5.4 编辑容器组件：CrudModalForm / CrudDrawerForm（可选）

为适配不同的展示形态（弹窗 / 抽屉 / 内联），推荐将“表单逻辑”和“容器 UI”进一步拆分：

- **逻辑层**：`CrudForm` 或组合式 `useCrudForm`，只负责：
  - 生成和管理 `formModel`；
  - 区分 `mode: 'create' | 'edit'`；
  - 调用 `adapter.create/update` 提交数据；
  - 触发 `form-model-ready` / `submit` / `success` / `error` 等事件。
- **展示层（容器组件）**：在逻辑层之上增加 Modal / Drawer 容器：
  - `CrudModalForm`：内部使用 `n-modal + CrudForm`；
  - `CrudDrawerForm`：内部使用 `n-drawer + CrudForm`；
  - 或业务自定义容器（例如 `PolicyEditDrawer`），内部同样复用 `CrudForm`。

示例（抽屉版编辑组件）：

```vue
<CrudDrawerForm
  v-model="editVisible"
  :row="editingRow"
  :fields="policyFields"
  :adapter="policyAdapter"
  @form-model-ready="usePolicyFormEffects"
  @success="crud.refresh"
/>
```

在 `AutoCrud` 中：

- 默认可以选择使用 `CrudModalForm` 作为标准编辑容器；
- 通过 prop 或 slot（例如 `editContainer="drawer"` 或 `#edit-container="{ open, row, mode }"`）允许业务方自定义编辑容器，只复用 `CrudForm` 提供的表单逻辑；
- 这样既能保证“编辑是一套可选的独立组件（弹窗 / 抽屉）”，又不会重复造表单逻辑。 

---

## 6. CrudTable

`CrudTable` 基于 `n-data-table` 封装，负责展示列表数据并提供选择列和操作列。

### 6.1 Props

```ts
interface CrudTableProps<Row = any> {
  columns: CrudTableColumn<Row>[]
  showSelection?: boolean
  showActionsColumn?: boolean
}
```

### 6.2 Slots

- `#table-actions="{ AddButton, DeleteButton, ExportButton, selection, query }"`
  - 工具栏区域，仅此一个 slot，用于组合/排序所有表头按钮。
- `#row-actions="{ row, ViewLink, EditButton, DeleteButton }"`
  - 行内操作区域 slot。
- `#cell-[fieldKey]`（可选高级用法）
  - 针对某一字段自定义单元格渲染。

---

## 7. CrudRowActions 与 CrudActions

### 7.1 CrudRowActions

负责行内操作区域的渲染，与 Action 系统配合。

简化示例：

```vue
<CrudTable :columns="columns">
  <template #row-actions="{ row, ViewLink, EditButton, DeleteButton }">
    <n-space size="small">
      <ViewLink />
      <EditButton />
      <DeleteButton />
      <!-- 自定义行内按钮 -->
      <n-button text size="small" @click="openLog(row)">
        {{ $gettext('日志') }}
      </n-button>
    </n-space>
  </template>
</CrudTable>
```

### 7.2 CrudActions

通用的区域动作渲染组件（可选），根据 `area` 自动从 `useCrudActions` 中获取对应动作列表，渲染一组按钮。

```vue
<CrudActions area="toolbar" />

<!-- 或自定义渲染 -->
<CrudActions area="toolbar" v-slot="{ actions, execute, context }">
  <n-space>
    <n-button
      v-for="action in actions"
      :key="action.id"
      @click="execute(action, context)"
    >
      {{ action.label }}
    </n-button>
  </n-space>
</CrudActions>
```

---

## 8. 小结

- `CrudProvider` 负责上下文注入，是所有视图组件协作的基础。
- `AutoCrud` 面向简单场景，`CrudPage + CrudTable + CrudSearch` 面向 Lego 模式。
- `CrudForm` 负责新增/编辑表单的生命周期与提交行为，可由 `AutoCrud` 自动使用，也可在 Lego 模式下独立组合使用。
- `CrudRowActions` / `CrudActions` 与 Action 系统一起，为复杂按钮组合提供统一扩展点。 
