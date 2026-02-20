---
title: 核心概念
---

# 核心概念

## Adapter（数据层）

`CrudAdapter` 是你的业务 API 与 fcurd 之间的唯一桥梁。UI 层（Naive UI 组件或你自己的组件）只依赖它，不直接调用 HTTP 请求。

```ts
interface CrudAdapter<Row, Query> {
  list: (params: ListParams<Query>) => Promise<ListResult<Row>>   // 必选
  create?: (data: Partial<Row>) => Promise<Row>                   // 可选
  update?: (id: string | number, data: Partial<Row>) => Promise<Row>
  remove?: (id: string | number) => Promise<void>
  export?: (params: ExportParams<Query>) => Promise<ExportResult>
  getId?: (row: Row) => string | number
}
```

**设计要点**：

- `list` 是唯一必选方法，其余按需实现。`AutoCrud` 会根据 adapter 是否有 `create` / `update` / `remove` / `export` 自动显示或隐藏对应按钮。
- `getId` 建议实现，用于 selection、更新、删除时准确定位行。默认回退到 `row.id`。
- `list` 接收 `signal: AbortSignal`，`useCrudList` 会在发新请求前 abort 上一个。

## Query（查询）

`useCrudList` 维护一个响应式的 `query` 对象，结构由你的 `Query` 泛型决定。

**扁平结构**（默认）：

```ts
const list = useCrudList<Row, { name?: string; status?: string }>({
  adapter,
  initialQuery: { name: '', status: '' },
})
// list.query.value => { name: '', status: '' }
```

**嵌套结构**（配合 `searchQueryKey`）：

```ts
// AutoCrud 或 CrudSearch 设置 searchQueryKey="search"
// 搜索条件会写到 query.search 下
// list.query.value => { search: { name: '...', status: '...' } }
```

详见 [嵌套搜索 query](/guide/nested-query)。

## Fields（字段定义）

`CrudField` 是一个统一的字段描述，同时服务于搜索表单、编辑表单和表格列：

```ts
interface CrudField<Row, FormModel, UiExt> {
  key: string                           // 字段 key
  label: string | (() => string)        // 显示名称
  type: CrudFieldType | string          // 字段类型
  required?: boolean                    // 是否必填
  visibleIn?: {                         // 各 surface 的可见性
    search?: boolean | ((ctx) => boolean)
    table?: boolean | ((ctx) => boolean)
    form?: boolean | ((ctx) => boolean)
    detail?: boolean | ((ctx) => boolean)
  }
  ui?: UiExt                            // UI 框架扩展（Naive UI 层使用 NaiveFieldUi）
}
```

### visibleIn：按场景控制可见性

`visibleIn` 的每个字段支持 `boolean` 或函数。函数会收到 `FieldContext`，可以做条件渲染：

```ts
{
  key: 'remark',
  label: '备注',
  type: 'textarea',
  visibleIn: {
    form(ctx) {
      return ctx.formModel?.status === 'disabled'
    },
  },
}
```

### 内置字段类型

| 类型 | 说明 | 对应 Naive UI 控件 |
|---|---|---|
| `text` | 单行文本 | `NInput` |
| `textarea` | 多行文本 | `NInput[type=textarea]` |
| `number` | 数字 | `NInputNumber` |
| `money` | 金额 | `NInputNumber`（带格式化） |
| `select` | 下拉选择 | `NSelect` |
| `date` | 日期 | `NDatePicker` |
| `datetime` | 日期时间 | `NDatePicker[type=datetime]` |
| `dateRange` | 日期范围 | `NDatePicker[type=daterange]` |
| `datetimeRange` | 日期时间范围 | `NDatePicker[type=datetimerange]` |
| `switch` | 开关 | `NSwitch` |
| `custom` | 自定义 | 通过 `ui.component` 或 slot 提供 |

## Columns（表格列）

`CrudColumn` 描述表格列：

```ts
interface CrudColumn<Row, UiExt> {
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

你可以：

- 手写 `CrudColumn[]`，完全控制列定义
- 用 `createColumnsFromFields(fields)` 从字段自动生成列（适合简单场景）

在 Naive UI 层，`createTableColumns()` 会把 `CrudColumn` 转为 `DataTableColumn`，并自动识别 `cell-${key}` slot。

## Actions（动作）

`CrudAction` 定义操作按钮（工具栏 / 行操作 / 批量操作）：

```ts
interface CrudAction<Row> {
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

`@fcurd/core` 提供一组预设工厂：`presetActions.create` / `.edit` / `.delete` / `.batchDelete` / `.export`。

`AutoCrud` 会根据 adapter 能力自动使用这些预设。你也可以通过 `actions` prop 完全覆盖，或用 `useCrudActions` 的 `register` / `unregister` 动态管理。

详见 [自定义 Actions](/guide/custom-actions)。

## Slots（自定义渲染）

`@fcurd/naive-ui` 的组件约定了一组可预测的 slot 命名：

| Slot | 说明 | 可用组件 |
|---|---|---|
| `cell-${key}` | 自定义表格单元格（也支持 `cell_${key}`） | AutoCrud, CrudTable |
| `field-${key}` | 自定义表单字段 | AutoCrud, CrudForm |
| `search-${key}` | 自定义搜索字段 | AutoCrud, CrudSearch |
| `row-actions` | 行操作区 | AutoCrud, CrudTable |
| `toolbar` | 工具栏 | AutoCrud |
| `before-table` | 表格前 | AutoCrud |
| `batch-actions` | 批量操作区 | AutoCrud |
| `table-header` | 表格上方 | CrudTable |
| `footer` | 表单底部按钮 | CrudForm |

详见 [Slots 约定](/guide/custom-slots)。
