---
title: 快速开始
---

# 快速开始

本页用一个最小 Demo 展示完整的 CRUD 流程。你将接触到三个核心概念：

1. **CrudAdapter** — 负责 `list` / `create` / `update` / `remove`
2. **Fields / Columns** — 描述搜索 / 表单 / 表格的 schema
3. **AutoCrud** — 把以上能力组合为可用的 UI

## 1) 定义行类型

先约定数据结构与查询结构：

<<< @/examples/basic-types.ts

## 2) 实现 CrudAdapter

`CrudAdapter` 是数据层的唯一接口。你只需要实现 `list`（必选），以及 `create` / `update` / `remove`（按需）：

::: code-group
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-types.ts [类型定义]
:::

::: tip
在实际项目中，adapter 通常封装你的 HTTP 客户端（如 axios / ofetch）。这里用内存数组演示，方便你直接运行。
:::

## 3) 定义 fields 与 columns

`defineFields` 描述搜索 / 表单字段，`defineColumns` 描述表格列。两者都是纯 schema，不包含 UI 渲染逻辑：

::: code-group
<<< @/examples/basic-schema.ts [fields & columns]
<<< @/examples/basic-types.ts [类型定义]
:::

**关键属性**：

| 属性 | 作用 |
|---|---|
| `key` | 字段 key，对应 `Row` 的属性名 |
| `label` | 显示名称 |
| `type` | 字段类型（`text` / `select` / `number` / `money` / `date` / `switch` 等） |
| `required` | 表单必填（自动生成验证规则） |
| `visibleIn` | 控制字段在 `searchForm` / `table` / `editForm` 中是否可见 |
| `ui` | Naive UI 扩展配置（控件 props、formItem props、options 等） |

## 4) 使用 AutoCrud 组件

把 `adapter`、`fields`、`columns` 传给 `AutoCrud` 即可：

::: code-group
<<< @/examples/auto-crud-basic.vue [页面]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-schema.ts [fields & columns]
<<< @/examples/basic-types.ts [类型定义]
:::

### 交互预览

<demo
  vue="../examples/auto-crud-basic.vue"
  vueFiles="['../examples/auto-crud-basic.vue','../examples/basic-adapter.ts','../examples/basic-schema.ts','../examples/basic-types.ts']"
/>

这个组件会自动处理：

- 搜索表单渲染 + 查询联动
- 表格分页 + 排序
- 新增 / 编辑表单（Modal）
- 根据 adapter 能力自动生成操作按钮

## 下一步

- [核心概念](/guide/concepts) — 深入理解 Adapter / Field / Column / Action 的设计
- [AutoCrud API](/api/naive-ui/components/auto-crud) — 查看完整的 Props / Emits / Slots
- 不想用 AutoCrud？试试 [自由组合方式](/api/naive-ui/overview)
