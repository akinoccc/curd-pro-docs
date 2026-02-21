---
title: Adapter 工具
---

# Adapter 工具

本页介绍 `@fcurd/naive-ui` 的适配层工具函数和类型扩展。

## NaiveFieldUi

在 `CrudField` 的 `ui` 上扩展的 Naive UI 配置：

```ts
interface NaiveFieldUi {
  formControl?: Record<string, unknown>
  formItem?: Record<string, unknown>
  overrides?: {
    editForm?: {
      formControl?: Record<string, unknown>
      formItem?: Record<string, unknown>
    }
    searchForm?: {
      formControl?: Record<string, unknown>
      formItem?: Record<string, unknown>
    }
  }
  component?: Component
}
```

| 属性 | 类型 | 说明 |
|---|---|---|
| `formControl` | `object` | 透传到字段控件的 props，可通过 `overrides` 按场景覆盖 |
| `formItem` | `object` | 透传到 `NFormItem` 的 props，可通过 `overrides` 按场景覆盖 |
| `overrides` | `object` | 按 surface（`editForm` / `searchForm`）覆盖 `formControl` / `formItem` |
| `component` | `Component` | 自定义控件 |

### 场景覆盖示例

`formControl` 的根属性作为基础值，`overrides.editForm.formControl` / `overrides.searchForm.formControl` 在对应 surface 下覆盖基础值：

```ts
const field: NaiveCrudField = {
  key: 'name',
  label: '名称',
  type: 'text',
  ui: {
    formControl: { placeholder: '请输入' },  // 基础值，editForm 和 searchForm 都生效
    overrides: {
      editForm: { formControl: { clearable: true } },   // 只在编辑表单中生效
      searchForm: { formControl: { clearable: true } },  // 只在搜索表单中生效
    },
  },
}
```

## NaiveCrudField

带 `NaiveFieldUi` 扩展的 CrudField 类型别名：

```ts
type NaiveCrudField<Row = any, FormModel = Row> = CrudField<Row, FormModel, NaiveFieldUi>
```

## componentMap

字段类型到 Vue 组件的映射表：

| field.type | 组件 | 说明 |
|---|---|---|
| `text` | `TextField` | 单行文本 |
| `textarea` | `TextField` | 多行文本 |
| `number` | `NumberField` | 数字输入 |
| `money` | `NumberField` | 金额输入 |
| `select` | `SelectField` | 下拉选择 |
| `date` | `DateField` | 日期 |
| `datetime` | `DateField` | 日期时间 |
| `dateRange` | `DateRangeField` | 日期范围 |
| `datetimeRange` | `DateRangeField` | 日期时间范围 |
| `switch` | `SwitchField` | 开关 |

## createTableColumns

把 `CrudColumn[]` 转为 Naive UI 的 `DataTableColumn[]`。

```ts
function createTableColumns<Row>(
  columns: CrudColumn<Row>[],
  options?: {
    slots?: Record<string, any>
    renderCell?: (column, row, value, rowIndex) => any
  }
): DataTableColumn<Row>[]
```

| 参数 | 类型 | 说明 |
|---|---|---|
| `columns` | `CrudColumn<Row>[]` | 列定义 |
| `options.slots` | `Record<string, any>` | 组件的 slots 对象，用于识别 `cell-${key}` slot |
| `options.renderCell` | `Function` | 兜底的单元格渲染函数 |

**渲染优先级**：slot (`cell-${key}` / `cell_${key}`) > `CrudColumn.render` > `renderCell` fallback > 默认文本

## resolveControlProps

解析字段控件的最终 props（合并基础值和场景覆盖）。

```ts
function resolveControlProps(field: NaiveCrudField, surface: 'editForm' | 'searchForm'): Record<string, unknown>
```

## resolveFormItemProps

解析 NFormItem 的最终 props（合并基础值和场景覆盖）。

```ts
function resolveFormItemProps(field: NaiveCrudField, surface: 'editForm' | 'searchForm'): Record<string, unknown>
```

## confirmAction

基于 Naive UI 离散 API 的确认弹窗。

```ts
function confirmAction(message: string, options?: { title?: string }): Promise<boolean>
```

```ts
const confirmed = await confirmAction('确定要删除吗？')
if (confirmed) {
  // 执行删除
}
```

## handleExportResult

处理 `ExportResult` 的三种形式，触发浏览器下载。

```ts
function handleExportResult(
  result: Blob | { blob: Blob, filename?: string } | { url: string, filename?: string },
  filename?: string
): void
```

## defineFields / defineColumns

与 `@fcurd/core` 同名，但 `UiExt` 默认绑定为 `NaiveFieldUi`：

```ts
import { defineFields } from '@fcurd/naive-ui'

const fields = defineFields<MyRow>([
  { key: 'name', label: '名称', type: 'text', ui: { formControl: { clearable: true } } },
])
// fields 的类型推导包含 NaiveFieldUi
```

::: tip
使用 Naive UI 时推荐从 `@fcurd/naive-ui` 导入 `defineFields` / `defineColumns`，这样 `ui` 属性会有完整的类型提示。
:::
