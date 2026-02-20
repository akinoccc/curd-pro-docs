---
title: Renderers
---

`@fcurd/naive-ui` 提供一组 **表格单元格渲染器工厂**（返回 `CrudColumn.render(ctx)` 所需的函数）。

## 文本类

- `cellText()`：空值占位 + 文本化
- `cellEllipsis()`：`NEllipsis` 省略

## Tag / 枚举类

- `cellBooleanTag()`：布尔值 → `NTag`
- `cellEnumLabel()`：枚举值 → label
- `cellEnumTag()`：枚举值 → `NTag`

## 格式化类

- `cellDateTime()`：日期时间格式化（`Intl.DateTimeFormat`）
- `cellMoney()`：金额格式化（`Intl.NumberFormat`）

## 预览/媒体类

- `cellJsonPopover()`：`NPopover + NCode` 悬浮预览 JSON
- `cellImage()`：`NImage` 缩略图

## 示例

下面展示了 `cellEnumTag`、`cellMoney`、`cellDateTime` 的实际配置：

::: code-group
<<< @/examples/basic-schema.ts [fields & columns]
<<< @/examples/basic-types.ts [类型定义]
:::
