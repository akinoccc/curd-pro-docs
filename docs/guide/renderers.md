---
title: 渲染器
---

# 渲染器

`@fcurd/naive-ui` 提供了一组**单元格渲染器工厂函数**，用于快速定义表格列的渲染逻辑。每个工厂函数接收配置选项，返回一个 `(ctx: CellContext) => VNode` 的渲染函数，直接赋值给 `CrudColumn.render`。

## 基本用法

```ts
import { cellEnumTag, cellMoney, defineColumns } from '@fcurd/naive-ui'

const columns = defineColumns([
  { key: 'name', label: '名称' },
  {
    key: 'status',
    label: '状态',
    render: cellEnumTag({
      options: [
        { label: '草稿', value: 'draft' },
        { label: '启用', value: 'enabled' },
      ],
      typeMap: { draft: 'warning', enabled: 'success' },
    }),
  },
  {
    key: 'amount',
    label: '金额',
    render: cellMoney({ currency: 'CNY' }),
  },
])
```

所有渲染器都支持 `placeholder` 选项（默认 `'-'`），当值为 `null`、`undefined` 或空字符串时显示占位符。

## 文本类

### cellText

纯文本渲染，空值显示占位符。

```ts
import { cellText } from '@fcurd/naive-ui'

{ render: cellText() }
{ render: cellText({ placeholder: '暂无' }) }
```

### cellEllipsis

超长文本省略，hover 时展示 tooltip。

```ts
import { cellEllipsis } from '@fcurd/naive-ui'

{ render: cellEllipsis() }                          // 单行省略
{ render: cellEllipsis({ lineClamp: 2 }) }           // 两行后省略
{ render: cellEllipsis({ tooltip: false }) }         // 不显示 tooltip
```

| 选项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `lineClamp` | `number` | `1` | 显示行数 |
| `tooltip` | `boolean` | `true` | hover 时是否显示完整内容 |

## 标签类

### cellBooleanTag

将布尔值渲染为 Tag。

```ts
import { cellBooleanTag } from '@fcurd/naive-ui'

{ render: cellBooleanTag() }                         // 是 / 否
{ render: cellBooleanTag({ trueText: '启用', falseText: '关闭' }) }
{ render: cellBooleanTag({
  trueText: '在线',
  falseText: '离线',
  trueType: 'success',
  falseType: 'error',
}) }
```

| 选项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `trueText` | `string` | `'是'` | true 时的文案 |
| `falseText` | `string` | `'否'` | false 时的文案 |
| `trueType` | `TagProps['type']` | `'success'` | true 时的 Tag 类型 |
| `falseType` | `TagProps['type']` | `'default'` | false 时的 Tag 类型 |
| `nullText` | `string` | 同 `placeholder` | 值为 null 时的文案 |
| `nullType` | `TagProps['type']` | `'default'` | 值为 null 时的 Tag 类型 |
| `size` | `TagProps['size']` | `'small'` | Tag 尺寸 |

### cellEnumLabel

将枚举值映射为可读文本（纯文本，无 Tag）。

```ts
import { cellEnumLabel } from '@fcurd/naive-ui'

// 方式 1：使用 map
{ render: cellEnumLabel({ map: { draft: '草稿', enabled: '启用' } }) }

// 方式 2：使用 options（可复用 NSelect 的 options）
{ render: cellEnumLabel({
  options: [
    { label: '草稿', value: 'draft' },
    { label: '启用', value: 'enabled' },
  ],
}) }
```

### cellEnumTag

将枚举值映射为带颜色的 Tag（继承 `cellEnumLabel` 的所有选项）。

```ts
import { cellEnumTag } from '@fcurd/naive-ui'

{ render: cellEnumTag({
  options: statusOptions,
  typeMap: {
    draft: 'warning',
    enabled: 'success',
    disabled: 'error',
  },
}) }
```

| 选项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `map` | `Record<string\|number, string>` | — | value -> label 映射 |
| `options` | `{ value, label }[]` | — | 选项数组（可复用 NSelect options） |
| `typeMap` | `Record<string\|number, TagType>` | — | value -> Tag 类型映射 |
| `defaultType` | `TagProps['type']` | `'default'` | 无匹配时的 Tag 类型 |
| `size` | `TagProps['size']` | `'small'` | Tag 尺寸 |

::: tip
`map` 的优先级高于 `options`。两者可以同时使用。
:::

## 格式化类

### cellDateTime

基于 `Intl.DateTimeFormat` 格式化日期时间。自动兼容 `Date` 对象、时间戳（ms）和 ISO 字符串。

```ts
import { cellDateTime } from '@fcurd/naive-ui'

// 默认：yyyy/MM/dd HH:mm:ss（zh-CN）
{ render: cellDateTime() }

// 仅显示日期
{ render: cellDateTime({
  formatOptions: { year: 'numeric', month: '2-digit', day: '2-digit' },
}) }

// 自定义解析
{ render: cellDateTime({
  parse: (v) => dayjs(v).toDate(),
}) }
```

| 选项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `locale` | `string` | `'zh-CN'` | Intl locale |
| `formatOptions` | `Intl.DateTimeFormatOptions` | 年月日时分秒 | 格式化选项 |
| `parse` | `(value) => Date \| null` | 自动检测 | 自定义解析函数 |

### cellMoney

基于 `Intl.NumberFormat` 格式化金额。

```ts
import { cellMoney } from '@fcurd/naive-ui'

{ render: cellMoney() }                              // ¥1,234.56
{ render: cellMoney({ currency: 'USD' }) }            // $1,234.56
{ render: cellMoney({ minimumFractionDigits: 0 }) }   // ¥1,235
```

| 选项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `locale` | `string` | `'zh-CN'` | Intl locale |
| `currency` | `string` | `'CNY'` | 货币代码 |
| `minimumFractionDigits` | `number` | `2` | 最少小数位 |
| `maximumFractionDigits` | `number` | `2` | 最多小数位 |

## 预览类

### cellImage

渲染图片缩略图（基于 Naive UI `NImage`）。

```ts
import { cellImage } from '@fcurd/naive-ui'

// 默认：取 value 作为 URL
{ render: cellImage() }

// 自定义尺寸和 URL 提取
{ render: cellImage({
  width: 48,
  height: 48,
  previewDisabled: false,
  getUrl: (ctx) => ctx.row.avatarUrl,
}) }
```

| 选项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `width` | `number` | `32` | 缩略图宽度 |
| `height` | `number` | `32` | 缩略图高度 |
| `previewDisabled` | `boolean` | `true` | 是否禁用点击预览 |
| `getUrl` | `(ctx) => string \| null` | 取 `ctx.value` | 自定义 URL 提取 |

### cellJsonPopover

JSON 数据悬浮预览（NPopover + NCode），适合展示复杂对象。

```ts
import { cellJsonPopover } from '@fcurd/naive-ui'

{ render: cellJsonPopover() }
{ render: cellJsonPopover({ previewMaxLen: 40 }) }
```

| 选项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `previewMaxLen` | `number` | `60` | 触发区显示的最大字符数 |
| `popoverProps` | `Partial<PopoverProps>` | — | Popover 属性透传 |

## 与 Slot 的配合

渲染器和 `cell-{key}` slot 可以互补使用：

- **渲染器**适合简单的数据格式化（日期、金额、枚举映射）
- **Slot** 适合需要复杂交互或访问多个字段的场景

两者不能同时对同一列生效——如果提供了 `cell-{key}` slot，它的优先级高于 `column.render`。
