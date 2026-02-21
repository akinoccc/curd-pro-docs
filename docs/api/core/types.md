---
title: 类型定义
---

# 类型定义

本页列出 `@fcurd/core` 所有公共类型的完整定义。所有类型均从 `@fcurd/core` 直接导出。

## CrudField

字段定义，统一服务于搜索 / 表单 / 表格。

```ts
interface CrudField<Row = any, FormModel = Row, UiExt = unknown> {
  key: string
  label: string | (() => string)
  type: CrudFieldType | (string & {})
  required?: boolean
  visibleIn?: {
    search?: boolean | ((ctx: FieldContext<Row, FormModel>) => boolean)
    table?: boolean | ((ctx: FieldContext<Row, FormModel>) => boolean)
    form?: boolean | ((ctx: FieldContext<Row, FormModel>) => boolean)
    detail?: boolean | ((ctx: FieldContext<Row, FormModel>) => boolean)
  }
  ui?: UiExt
}
```

| 属性 | 类型 | 说明 |
|---|---|---|
| `key` | `string` | 字段 key，对应 Row 属性名 |
| `label` | `string \| (() => string)` | 显示名称，支持函数（国际化场景） |
| `type` | `CrudFieldType \| string` | 字段类型，见下方 CrudFieldType |
| `required` | `boolean` | 是否必填（CrudForm 自动生成校验规则） |
| `visibleIn` | `object` | 各 surface 可见性，支持 boolean 或函数 |
| `ui` | `UiExt` | UI 框架扩展（Naive UI 层使用 `NaiveFieldUi`） |

## CrudFieldType

```ts
type CrudFieldType
  = | 'text' | 'textarea' | 'select'
    | 'date' | 'datetime' | 'dateRange' | 'datetimeRange'
    | 'switch' | 'number' | 'money' | 'custom'
```

## CrudColumn

表格列定义。

```ts
interface CrudColumn<Row = any, UiExt = unknown> {
  key: string
  label?: string | (() => string)
  width?: number
  minWidth?: number
  fixed?: 'left' | 'right'
  sortable?: boolean
  render?: (ctx: CellContext<Row>) => any
  ui?: UiExt
}
```

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `key` | `string` | — | 列 key，对应 Row 属性名 |
| `label` | `string \| (() => string)` | `key` | 列标题 |
| `width` | `number` | — | 列宽（px） |
| `minWidth` | `number` | — | 最小列宽 |
| `fixed` | `'left' \| 'right'` | — | 固定列 |
| `sortable` | `boolean` | `false` | 是否可排序 |
| `render` | `(ctx: CellContext) => any` | — | 自定义渲染函数 |
| `ui` | `UiExt` | — | UI 框架扩展 |

## CrudSort

```ts
interface CrudSort<Field extends string = string> {
  field: Field
  order: 'ascend' | 'descend'
}
```

## FieldContext

`visibleIn` 函数的参数：

```ts
interface FieldContext<Row = any, FormModel = Row> {
  surface: 'search' | 'table' | 'form' | 'detail'
  row?: Row
  formModel?: FormModel
  query?: Record<string, unknown>
}
```

## CellContext

`CrudColumn.render` 的参数：

```ts
interface CellContext<Row = any> {
  row: Row
  rowIndex: number
  value: any
}
```

## CrudAction

操作按钮定义。

```ts
interface CrudAction<Row = any> {
  id: string
  label: string
  icon?: any
  type?: 'primary' | 'default' | 'success' | 'warning' | 'error'
  area: 'toolbar' | 'row' | 'batch'
  order?: number
  confirm?: boolean | string
  visible?: (ctx: ActionContext<Row>) => boolean
  disabled?: (ctx: ActionContext<Row>) => boolean
  onClick: (ctx: ActionContext<Row>) => Promise<void> | void
}
```

| 属性 | 类型 | 说明 |
|---|---|---|
| `id` | `string` | 唯一标识 |
| `label` | `string` | 按钮文本 |
| `icon` | `any` | 图标（按 UI 框架约定） |
| `type` | `string` | 按钮主题色 |
| `area` | `'toolbar' \| 'row' \| 'batch'` | 按钮位置 |
| `order` | `number` | 排列顺序（同区域内升序） |
| `confirm` | `boolean \| string` | 点击前确认（`true` = 默认文案，`string` = 自定义文案） |
| `visible` | `(ctx) => boolean` | 可见性判断 |
| `disabled` | `(ctx) => boolean` | 禁用判断 |
| `onClick` | `(ctx) => void \| Promise<void>` | 点击处理 |

## ActionContext

Action 回调的上下文对象：

```ts
interface ActionContext<Row = any> {
  row?: Row
  selectedRows: Row[]
  selectedIds: (string | number)[]
  query?: Record<string, unknown>
  sort?: CrudSort | null
  page?: number
  pageSize?: number
  refresh: () => Promise<void>
  clearSelection: () => void
}
```

| 属性 | 类型 | 说明 |
|---|---|---|
| `row` | `Row \| undefined` | 行操作时的当前行 |
| `selectedRows` | `Row[]` | 选中行数据 |
| `selectedIds` | `(string \| number)[]` | 选中行 ID |
| `query` | `Record<string, unknown>` | 当前查询条件 |
| `sort` | `CrudSort \| null` | 当前排序 |
| `page` | `number` | 当前页码 |
| `pageSize` | `number` | 每页条数 |
| `refresh` | `() => Promise<void>` | 刷新列表 |
| `clearSelection` | `() => void` | 清空选择 |

## Hook Return Types

### UseCrudListReturn

见 [useCrudList](/api/core/hooks/use-crud-list#返回值)。

### UseCrudFormReturn

见 [useCrudForm](/api/core/hooks/use-crud-form#返回值)。

### UseCrudSelectionReturn

见 [useCrudSelection](/api/core/hooks/use-crud-selection#返回值)。

### UseCrudActionsReturn

见 [useCrudActions](/api/core/hooks/use-crud-actions#返回值)。
