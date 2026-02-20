---
title: 介绍
---

# 介绍

`fcurd` 是一套面向 Vue 3 的 **声明式 CRUD 方案**，由两个包组成：

| 包 | 定位 | UI 依赖 |
|---|---|---|
| `@fcurd/core` | Headless hooks / types / utils | 无 |
| `@fcurd/naive-ui` | Naive UI 适配层 + 组件 | `naive-ui ^2.43` |

## 解决什么问题

后台管理系统中 80% 的页面都是"搜索 + 列表 + 新增/编辑表单"。每次从零写一个 CRUD 页面需要处理：

- 分页、排序、查询状态管理
- 搜索表单 ↔ 列表联动
- 新增/编辑表单的 model 管理、dirty 检测、提交数据裁剪
- 行选择、批量操作
- URL query 同步（可分享链接）
- 表格列渲染、字段控件映射

`fcurd` 将这些能力抽象为一组可复用的 hooks + schema，让你只需声明 `adapter`（数据层） + `fields/columns`（UI 描述）即可生成完整页面。

## 架构设计

```
┌─────────────────────────────────────────────────┐
│                  你的业务页面                     │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │         @fcurd/naive-ui                 │   │
│   │   AutoCrud / CrudSearch / CrudTable /   │   │
│   │   CrudForm / Controls / Renderers       │   │
│   └──────────────────┬──────────────────────┘   │
│                      │                          │
│   ┌──────────────────▼──────────────────────┐   │
│   │           @fcurd/core                   │   │
│   │   useCrudList / useCrudForm /           │   │
│   │   useCrudSelection / useCrudRouteSync / │   │
│   │   useCrudActions                        │   │
│   │   CrudAdapter / CrudField / CrudColumn  │   │
│   └──────────────────┬──────────────────────┘   │
│                      │                          │
│   ┌──────────────────▼──────────────────────┐   │
│   │         CrudAdapter（你来实现）           │   │
│   │   list / create / update / remove /     │   │
│   │   export / getId                        │   │
│   └──────────────────┬──────────────────────┘   │
│                      │                          │
│              你的后端 API / 数据源                │
└─────────────────────────────────────────────────┘
```

**核心思路**：

1. **Adapter 隔离数据层** — `CrudAdapter` 是唯一需要你实现的接口，所有 UI 层只依赖它。切换后端 API 只需换一个 adapter。
2. **Headless hooks 管理状态** — `@fcurd/core` 的 hooks 不渲染任何 UI，只管理响应式状态和副作用（分页、查询、表单、选择等）。
3. **Adapter 层映射 UI** — `@fcurd/naive-ui` 将 core 的 schema（`CrudField` / `CrudColumn`）映射到 Naive UI 组件，提供即插即用的 `AutoCrud` 等组件。

## 两种使用方式

### 一把梭：AutoCrud

适合"标准 CRUD"场景，一个组件搞定搜索 + 列表 + 表单 + 操作按钮：

```vue
<AutoCrud
  :adapter="adapter"
  :fields="fields"
  :columns="columns"
  search-query-key="search"
  form-mode="modal"
  show-selection
/>
```

### 自由组合：hooks + 子组件

当你需要完全掌控布局和交互时，可以直接使用 hooks 和子组件：

```ts
const list = useCrudList({ adapter })
const form = useCrudForm({ fields })
const selection = useCrudSelection({ rows: list.rows, getId: adapter.getId })
```

```vue
<CrudSearch :list="list" :fields="fields" />

<CrudTable :list="list" :columns="columns" :selection="selection" />

<CrudForm :form="form" :fields="fields" display-mode="drawer" />
```

## 与其他方案的对比

| 特性 | 手写 CRUD | ProTable 类组件 | fcurd |
|---|---|---|---|
| 数据层可复用 | 每页重写 | 通常耦合 UI | Adapter 隔离 |
| UI 框架绑定 | 绑定 | 强绑定 | core 无绑定 |
| 使用粒度 | 完全自由 | 组件级 | hooks → 组件均可 |
| 类型安全 | 取决于你 | 通常较弱 | 泛型贯穿 |
| 学习成本 | 低 | 中 | 低（渐进式） |

## 下一步

- [安装](/guide/installation) — 添加依赖
- [快速开始](/guide/quick-start) — 5 分钟跑通一个完整 CRUD
- [核心概念](/guide/concepts) — 理解 Adapter / Field / Column / Action
