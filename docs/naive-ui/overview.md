---
title: 概览
---

`@fcurd/naive-ui` 是 `@fcurd/core` 的一套 **Naive UI 适配层**：

- 把 `CrudField/CrudColumn` 映射到 Naive 的 `NForm/NDataTable/...`
- 提供即插即用组件：`AutoCrud/CrudSearch/CrudTable/CrudForm`
- 提供字段控件与表格 cell 渲染器，减少样板代码

## 两种使用方式

### 1) 一把梭：AutoCrud

适合"标准 CRUD"场景：搜索 + 列表 + 表单（Modal/Drawer）+ actions + selection + routeSync。

::: code-group
<<< @/examples/auto-crud-basic.vue [页面]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-schema.ts [fields & columns]
<<< @/examples/basic-types.ts [类型定义]
:::

### 2) 自由组合：CrudSearch + CrudTable + CrudForm

适合你想完全掌控布局、交互与按钮的场景。

::: code-group
<<< @/examples/crud-compose-basic.vue [页面]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-types.ts [类型定义]
:::
