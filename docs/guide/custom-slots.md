---
title: Slots 约定
---

# Slots 约定

`@uozi/vito-naive-ui` 的组件使用一套可预测的 slot 命名规则，让你可以在不离开 `AutoCrud` 的前提下自定义任意部分的渲染。

## 命名规则

### 表格单元格：`cell-${key}`

自定义某一列的渲染。也兼容下划线写法 `cell_${key}`。

```vue
<AutoCrud :adapter="adapter" :fields="fields" :columns="columns">
  <template #cell-status="{ row, value }">
    <NTag :type="value === 'enabled' ? 'success' : 'warning'">
      {{ value }}
    </NTag>
  </template>
</AutoCrud>
```

Slot Props：

| 属性 | 类型 | 说明 |
|---|---|---|
| `row` | `Row` | 当前行数据 |
| `value` | `any` | 当前列的值（`row[column.key]`） |
| `rowIndex` | `number` | 行索引 |

### 表单字段：`field-${key}`

自定义编辑/新增表单中某个字段的渲染。

```vue
<AutoCrud :adapter="adapter" :fields="fields" :columns="columns">
  <template #field-avatar="{ field, model, mode }">
    <NUpload v-model:file-list="model.avatar" />
  </template>
</AutoCrud>
```

Slot Props：

| 属性 | 类型 | 说明 |
|---|---|---|
| `field` | `CrudField` | 字段定义 |
| `model` | `Record<string, unknown>` | 表单 model 对象 |
| `mode` | `'create' \| 'edit'` | 当前表单模式 |
| `value` | `any` | 当前字段值 |

### 搜索字段：`search-${key}`

自定义搜索表单中某个字段的渲染。

```vue
<AutoCrud :adapter="adapter" :fields="fields" :columns="columns">
  <template #search-dateRange="{ field, model }">
    <NDatePicker v-model:value="model.dateRange" type="daterange" />
  </template>
</AutoCrud>
```

Slot Props：

| 属性 | 类型 | 说明 |
|---|---|---|
| `field` | `CrudField` | 字段定义 |
| `model` | `Record<string, unknown>` | 搜索 model 对象 |

### 行操作：`row-actions`

自定义每一行的操作按钮区域。

```vue
<AutoCrud :adapter="adapter" :fields="fields" :columns="columns">
  <template #row-actions="{ row, openEdit, defaultButtons }">
    <NSpace>
      <component :is="defaultButtons.Edit" :row="row" />
      <component :is="defaultButtons.Delete" :row="row" />
      <NButton size="small" @click="handleCustomAction(row)">
        自定义
      </NButton>
    </NSpace>
  </template>
</AutoCrud>
```

Slot Props：

| 属性 | 类型 | 说明 |
|---|---|---|
| `row` | `Row` | 当前行数据 |
| `rowIndex` | `number` | 行索引 |
| `openEdit` | `() => void` | 打开编辑表单 |
| `actions` | `CrudAction[]` | 当前行的 action 列表 |
| `defaultButtons` | `{ Edit, Delete, View }` | 预设按钮组件 |

## 布局类 Slots

这些 slot 仅在 `AutoCrud` 中可用：

| Slot | 说明 | Slot Props |
|---|---|---|
| `toolbar` | 工具栏（默认渲染 toolbar actions） | `{ list, selection, openCreate }` |
| `before-table` | 表格前区域 | `{ list, selection }` |
| `batch-actions` | 批量操作区（选中行 > 0 时显示） | `{ list, selection, actions, renderActionButton }` |
| `search` | 替换整个搜索区域 | `{ list, fields }` |
| `table` | 替换整个表格区域 | `{ list, columns, selection, rowKey, rowActions, ... }` |
| `form` | 替换整个表单区域 | `{ form, fields, visible, setVisible, mode, editingRow, submit }` |

## Slot 穿透

`AutoCrud` 中的 `cell-*` / `field-*` / `search-*` slot 会自动穿透到对应的子组件（`CrudTable` / `CrudForm` / `CrudSearch`），你不需要关心内部组件结构。
