---
title: 构建与发布
---

本页面向 **库开发者/维护者**。

## 构建文档

```bash
pnpm docs:build
pnpm docs:preview
```

## GitHub Pages

- workflow：`.github/workflows/docs.yml`
- `base`：在 GitHub Actions 环境下会根据 `GITHUB_REPOSITORY` 自动推导（也可通过 `VITEPRESS_BASE` 覆盖）

## 发布包（约定）

仓库目前是 workspace 结构：`packages/core`、`packages/naive-ui`。\n+
发布流程通常包含：更新版本号、变更日志、构建、发布。\n+
> 具体的发布命令/策略（changesets、npm publish、tag 规则等）如果你希望我补齐，我可以再按你的实际流程完善这一页。
