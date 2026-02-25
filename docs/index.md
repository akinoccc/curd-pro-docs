---
layout: home

hero:
  name: Vito
  text: Vue 3 CRUD 方案
  tagline: Headless hooks + UI 适配，用声明式 schema 驱动搜索、表格、表单
  image:
    src: /vito.png
    alt: Vito Logo
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: API 参考
      link: /api/core/adapter

features:
  - title: Headless 设计
    details: '@uozi/vito-core 不依赖任何 UI 框架，纯 hooks + types + utils，可适配任意组件库。'
  - title: 类型安全
    details: '完整的 TypeScript 泛型推导，Row / Query / FormModel 一路贯穿，IDE 提示零死角。'
  - title: Naive UI 开箱即用
    details: '@uozi/vito-naive-ui 提供 AutoCrud / CrudSearch / CrudTable / CrudForm 四件套，一行代码搭出完整 CRUD 页面。'
  - title: 可组合、可覆盖
    details: '从 AutoCrud 一把梭到 hooks 自由组合，粒度由你决定。Slots / Actions / Renderers 均可自定义。'
---
