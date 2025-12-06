## 视图组件与布局设计（Components）

本文件描述 Naive CRUD 的视图组件层设计，包括：

- `CrudProvider`
- `AutoCrud`
- `CrudPage`
- `CrudSearch`
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
``>

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

## 5. CrudTable

`CrudTable` 基于 `n-data-table` 封装，负责展示列表数据并提供选择列和操作列。

### 5.1 Props

```ts
interface CrudTableProps<Row = any> {
  columns: CrudTableColumn<Row>[]
  showSelection?: boolean
  showActionsColumn?: boolean
}
```

### 5.2 Slots

- `#table-actions="{ AddButton, DeleteButton, ExportButton, selection, query }"`
  - 工具栏区域，仅此一个 slot，用于组合/排序所有表头按钮。
- `#row-actions="{ row, ViewLink, EditButton, DeleteButton }"`
  - 行内操作区域 slot。
- `#cell-[fieldKey]`（可选高级用法）
  - 针对某一字段自定义单元格渲染。

---

## 6. CrudRowActions 与 CrudActions

### 6.1 CrudRowActions

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

### 6.2 CrudActions

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

## 7. 小结

- `CrudProvider` 负责上下文注入，是所有视图组件协作的基础。
- `AutoCrud` 面向简单场景，`CrudPage + CrudTable + CrudSearch` 面向 Lego 模式。
- `CrudRowActions` / `CrudActions` 与 Action 系统一起，为复杂按钮组合提供统一扩展点。 


