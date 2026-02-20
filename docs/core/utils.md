---
title: 工具函数
---

`@fcurd/core` 的工具函数用于 **更好的类型推导** 与 **字段/列的常用转换**。

## fields.ts

- `defineFields(fields)`：保留字面量类型，减少泛型显式声明
- `filterFieldsBySurface(fields, surface, ctx?)`：按 `visibleIn` 规则过滤

## columns.ts

- `defineColumns(columns)`：保留字面量类型
- `createColumnsFromFields(fields, options?)`：从字段生成表格列

## 示例

::: code-group
<<< @/examples/basic-schema.ts [fields & columns]
<<< @/examples/basic-types.ts [类型定义]
:::
