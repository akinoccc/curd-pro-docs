---
title: Renderers 渲染器
---

# Renderers 渲染器

`@fcurd/naive-ui` 提供一组表格单元格渲染器工厂函数，返回 `CrudColumn.render(ctx)` 所需的函数。

## 使用方式

在 `defineColumns` 的 `render` 属性中调用工厂函数：

```ts
import { cellDateTime, cellEnumTag, cellMoney, defineColumns } from '@fcurd/naive-ui'

const columns = defineColumns<MyRow>([
  {
    key: 'status',
    label: '状态',
    render: cellEnumTag({
      options: statusOptions,
      typeMap: { draft: 'warning', enabled: 'success', disabled: 'error' },
    }),
  },
  {
    key: 'amount',
    label: '金额',
    render: cellMoney({ currency: 'CNY' }),
  },
  {
    key: 'createdAt',
    label: '创建时间',
    render: cellDateTime(),
  },
])
```

## 文本类

### cellText

空值占位 + 文本化。

```ts
function cellText(options?: { placeholder?: string }): RenderFunction
```

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `placeholder` | `string` | `'-'` | 空值时显示的占位符 |

### cellEllipsis

使用 `NEllipsis` 省略长文本。

```ts
function cellEllipsis(options?: { lineClamp?: number }): RenderFunction
```

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `lineClamp` | `number` | `1` | 最大行数 |

## Tag / 枚举类

### cellBooleanTag

布尔值渲染为 `NTag`。

```ts
function cellBooleanTag(options?: {
  trueLabel?: string
  falseLabel?: string
  trueType?: string
  falseType?: string
}): RenderFunction
```

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `trueLabel` | `string` | `'是'` | true 时文本 |
| `falseLabel` | `string` | `'否'` | false 时文本 |
| `trueType` | `string` | `'success'` | true 时 NTag type |
| `falseType` | `string` | `'default'` | false 时 NTag type |

### cellEnumLabel

枚举值转为对应的 label 文本。

```ts
function cellEnumLabel(options: {
  options: Array<{ label: string, value: any }>
  placeholder?: string
}): RenderFunction
```

### cellEnumTag

枚举值渲染为 `NTag`，支持按值映射 tag type。

```ts
function cellEnumTag(options: {
  options: Array<{ label: string, value: any }>
  typeMap?: Record<string, string>
  placeholder?: string
}): RenderFunction
```

| 参数 | 类型 | 说明 |
|---|---|---|
| `options` | `Array<{ label, value }>` | 枚举选项（与 Naive UI SelectOption 兼容） |
| `typeMap` | `Record<string, string>` | 值 → NTag type 的映射 |
| `placeholder` | `string` | 无匹配时的占位符 |

```ts
cellEnumTag({
  options: [
    { label: '草稿', value: 'draft' },
    { label: '启用', value: 'enabled' },
  ],
  typeMap: {
    draft: 'warning',
    enabled: 'success',
  },
})
```

## 格式化类

### cellDateTime

日期时间格式化（基于 `Intl.DateTimeFormat`）。

```ts
function cellDateTime(options?: {
  format?: Intl.DateTimeFormatOptions
  locale?: string
  placeholder?: string
}): RenderFunction
```

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `format` | `Intl.DateTimeFormatOptions` | 日期+时间 | 格式选项 |
| `locale` | `string` | `'zh-CN'` | 语言区域 |
| `placeholder` | `string` | `'-'` | 空值占位 |

### cellMoney

金额格式化（基于 `Intl.NumberFormat`）。

```ts
function cellMoney(options?: {
  currency?: string
  locale?: string
  placeholder?: string
}): RenderFunction
```

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `currency` | `string` | `'CNY'` | 货币代码 |
| `locale` | `string` | `'zh-CN'` | 语言区域 |
| `placeholder` | `string` | `'-'` | 空值占位 |

## 预览 / 媒体类

### cellJsonPopover

`NPopover` + `NCode` 悬浮预览 JSON 数据。

```ts
function cellJsonPopover(options?: {
  maxWidth?: number
  language?: string
}): RenderFunction
```

### cellImage

`NImage` 缩略图渲染。

```ts
function cellImage(options?: {
  width?: number
  height?: number
  objectFit?: string
}): RenderFunction
```

## 完整示例

::: code-group
<<< @/examples/basic-schema.ts [fields & columns]
<<< @/examples/basic-types.ts [类型定义]
:::
