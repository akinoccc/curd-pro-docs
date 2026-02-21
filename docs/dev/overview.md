---
title: 概览
---

本章节面向 **库开发者/贡献者**（不是库使用者）。如果你是来接入业务的，请从 [`安装`](/guide/installation) 开始。

## 你通常会做的事

- 本地跑 playground 进行交互验证（不是文档示例来源）
- 本地跑 docs 预览文档站
- 维护 `@fcurd/core` 与 `@fcurd/naive-ui` 的导出与兼容性

## 快速命令

```bash
pnpm dev:playground
pnpm docs:dev
pnpm typecheck
pnpm lint
```

## 交互 Demo（文档内可运行）

在 markdown 里用 `<demo />` 引用 `.vue/.tsx/.html` 文件即可；如果 Demo 涉及多个文件，可通过 `vueFiles/reactFiles/htmlFiles` 把相关文件一起展示出来：

```html
<demo
  vue="../demos/use-crud-list-basic.vue"
  vueFiles="['../demos/use-crud-list-basic.vue','../examples/basic-adapter.ts','../examples/basic-types.ts']"
/>
```
