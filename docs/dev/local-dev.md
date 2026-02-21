---
title: 本地开发
---

## 环境

- Node.js：建议 20+（CI 使用 22）
- 包管理：`pnpm@10`（见根 `package.json#packageManager`）

## 安装依赖

```bash
pnpm install
```

## 运行 playground（交互验证）

```bash
pnpm dev:playground
```

## 运行文档站

```bash
pnpm docs:dev
```

## 常用质量检查

```bash
pnpm typecheck
pnpm lint
```

## 文档交互 Demo（可选）

<demo vue="../demos/use-crud-list-basic.vue" />
