---
title: 概览
---

# @uozi/vito-naive-ui 概览

`@uozi/vito-naive-ui` 是 `@uozi/vito-core` 的 Naive UI 适配层，做三件事：

1. 把 `CrudField` / `CrudColumn` 映射到 Naive UI 的 `NForm` / `NDataTable` / `NDatePicker` 等组件
2. 提供即插即用组件：`AutoCrud` / `CrudSearch` / `CrudTable` / `CrudForm`
3. 提供字段控件和表格 cell 渲染器，减少样板代码

## 两种使用方式

### 一把梭：AutoCrud

适合"标准 CRUD"场景：搜索 + 列表 + 表单（Modal/Drawer）+ actions + selection + routeSync。

::: code-group
<<< @/examples/auto-crud-basic.vue [页面]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-schema.ts [fields & columns]
<<< @/examples/basic-types.ts [类型定义]
:::

### 自由组合：CrudSearch + CrudTable + CrudForm

适合需要完全掌控布局、交互与按钮的场景。

::: code-group
<<< @/examples/crud-compose-basic.vue [页面]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-types.ts [类型定义]
:::

## 导出一览

### 组件

| 组件 | 说明 | 文档 |
|---|---|---|
| `AutoCrud` | 一体化 CRUD 组件 | [AutoCrud](/api/naive-ui/components/auto-crud) |
| `CrudSearch` | 搜索表单 | [CrudSearch](/api/naive-ui/components/crud-search) |
| `CrudTable` | 数据表格 + 分页 | [CrudTable](/api/naive-ui/components/crud-table) |
| `CrudForm` | 表单（Modal / Drawer / Inline） | [CrudForm](/api/naive-ui/components/crud-form) |

### 适配工具

| 导出 | 说明 | 文档 |
|---|---|---|
| `componentMap` | 字段类型 → Vue 组件映射 | [Adapter 工具](/api/naive-ui/adapter) |
| `createTableColumns` | CrudColumn → DataTableColumn | [Adapter 工具](/api/naive-ui/adapter) |
| `resolveControlProps` | 解析字段控件 props | [Adapter 工具](/api/naive-ui/adapter) |
| `confirmAction` | 确认弹窗 | [Adapter 工具](/api/naive-ui/adapter) |
| `handleExportResult` | 导出文件下载 | [Adapter 工具](/api/naive-ui/adapter) |
| `defineFields` / `defineColumns` | 带 NaiveFieldUi 的类型辅助 | [Adapter 工具](/api/naive-ui/adapter) |

### 渲染器

| 导出 | 说明 | 文档 |
|---|---|---|
| `cellText` / `cellEllipsis` | 文本类 | [Renderers](/api/naive-ui/renderers) |
| `cellBooleanTag` / `cellEnumTag` / `cellEnumLabel` | Tag / 枚举类 | [Renderers](/api/naive-ui/renderers) |
| `cellDateTime` / `cellMoney` | 格式化类 | [Renderers](/api/naive-ui/renderers) |
| `cellImage` / `cellJsonPopover` | 预览 / 媒体类 | [Renderers](/api/naive-ui/renderers) |
