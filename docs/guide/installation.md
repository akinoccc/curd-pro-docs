---
title: 安装
---

# 安装

## 环境要求

| 依赖 | 版本要求 | 说明 |
|---|---|---|
| Vue | `^3.4.0` | 需要 `defineModel` 等 3.4+ 特性 |
| Vue Router | `^4.6.0` | 仅在使用 `useCrudRouteSync` / `AutoCrud routeSync` 时需要 |
| Naive UI | `^2.43.2` | 仅 `@fcurd/naive-ui` 需要 |

## 安装命令

**只使用 core（headless hooks）**：

```bash
pnpm add @fcurd/core
```

**使用 Naive UI 适配层（推荐）**：

```bash
pnpm add @fcurd/core @fcurd/naive-ui naive-ui
```

::: tip
`@fcurd/naive-ui` 的 peer dependency 包含 `@fcurd/core`，两个包需要同时安装。
:::

## 样式引入（必需）

`@fcurd/naive-ui` 组件库包含少量布局/间距相关的全局样式（例如表格头部间距、分页区域布局等），需要在应用入口 **全局引入一次**：

```ts
import '@fcurd/naive-ui/naive-ui.css'
```

:::: tip
本 VitePress 文档站点已默认引入该样式；你的业务项目中仍需要按上述方式手动引入。
::::

## 你会得到什么

### @fcurd/core

- **Hooks**：`useCrudList` / `useCrudForm` / `useCrudSelection` / `useCrudRouteSync` / `useCrudActions`
- **类型**：`CrudAdapter` / `CrudField` / `CrudColumn` / `CrudAction` / `CrudSort` 等
- **工具函数**：`defineFields` / `defineColumns` / `createColumnsFromFields` / `filterFieldsBySurface`

### @fcurd/naive-ui

- **组件**：`AutoCrud` / `CrudSearch` / `CrudTable` / `CrudForm`
- **字段控件**：`TextField` / `NumberField` / `SelectField` / `DateField` / `DateRangeField` / `SwitchField`
- **表格渲染器**：`cellText` / `cellMoney` / `cellDateTime` / `cellEnumTag` / `cellBooleanTag` / `cellImage` / `cellJsonPopover` 等
- **适配工具**：`createTableColumns` / `resolveControlProps` / `confirmAction` / `handleExportResult`

## 下一步

前往 [快速开始](/guide/quick-start) 用一个最小 Demo 跑通完整 CRUD 流程。
