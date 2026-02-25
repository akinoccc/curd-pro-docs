import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { vitepressDemoPlugin } from 'vitepress-demo-plugin'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default async () => {
  const base = '/'

  return withMermaid({
    lang: 'zh-CN',
    title: 'Vito',
    description: '@uozi/vito-core 与 @uozi/vito-naive-ui 文档',
    base,
    cleanUrls: true,
    head: [
      ['link', { rel: 'icon', href: `${base}vito.png` }],
    ],
    markdown: {
      config(md) {
        md.use(vitepressDemoPlugin)
      },
    },
    mermaid: {
      securityLevel: 'loose',
    },
    themeConfig: {
      logo: '/vito.png',
      nav: [
        { text: '指南', link: '/guide/introduction' },
        {
          text: 'API 参考',
          items: [
            { text: '@uozi/vito-core', link: '/api/core/adapter' },
            { text: '@uozi/vito-naive-ui', link: '/api/naive-ui/overview' },
          ],
        },
        { text: '开发者', link: '/dev/overview' },
      ],
      search: {
        provider: 'local',
      },
      sidebar: {
        '/guide/': [
          {
            text: '开始',
            items: [
              { text: '介绍', link: '/guide/introduction' },
              { text: '安装', link: '/guide/installation' },
              { text: '快速开始', link: '/guide/quick-start' },
              { text: '核心概念', link: '/guide/concepts' },
            ],
          },
          {
            text: '基础用法',
            items: [
              { text: '字段 UI 配置', link: '/guide/field-ui-config' },
              { text: '表单验证', link: '/guide/form-validation' },
              { text: '渲染器', link: '/guide/renderers' },
              { text: '从 Fields 生成 Columns', link: '/guide/columns-from-fields' },
              { text: '表单模式与 Props 透传', link: '/guide/form-mode-and-passthrough' },
            ],
          },
          {
            text: '进阶用法',
            items: [
              { text: 'Hooks 组合模式', link: '/guide/hooks-composition' },
              { text: '选择与批量操作', link: '/guide/selection-and-batch' },
              { text: '列表查询高级技巧', link: '/guide/advanced-query' },
              { text: '表单变更追踪', link: '/guide/form-change-tracking' },
              { text: '自定义控件', link: '/guide/custom-controls' },
              { text: '路由同步', link: '/guide/route-sync' },
              { text: '嵌套搜索 query', link: '/guide/nested-query' },
              { text: 'Slots 约定', link: '/guide/custom-slots' },
              { text: '导出', link: '/guide/export' },
              { text: '自定义 Actions', link: '/guide/custom-actions' },
            ],
          },
        ],
        '/api/core/': [
          {
            text: '核心 API',
            items: [
              { text: 'CrudAdapter', link: '/api/core/adapter' },
              { text: '类型定义', link: '/api/core/types' },
              { text: '工具函数', link: '/api/core/utils' },
            ],
          },
          {
            text: 'Hooks',
            items: [
              { text: 'useCrudList', link: '/api/core/hooks/use-crud-list' },
              { text: 'useCrudForm', link: '/api/core/hooks/use-crud-form' },
              { text: 'useCrudSelection', link: '/api/core/hooks/use-crud-selection' },
              { text: 'useCrudRouteSync', link: '/api/core/hooks/use-crud-route-sync' },
              { text: 'useCrudActions', link: '/api/core/hooks/use-crud-actions' },
            ],
          },
        ],
        '/api/naive-ui/': [
          {
            text: 'Naive UI 适配',
            items: [
              { text: '概览', link: '/api/naive-ui/overview' },
              { text: 'Adapter 工具', link: '/api/naive-ui/adapter' },
              { text: 'Controls 控件', link: '/api/naive-ui/controls' },
              { text: 'Renderers 渲染器', link: '/api/naive-ui/renderers' },
            ],
          },
          {
            text: '组件',
            items: [
              { text: 'AutoCrud', link: '/api/naive-ui/components/auto-crud' },
              { text: 'CrudSearch', link: '/api/naive-ui/components/crud-search' },
              { text: 'CrudTable', link: '/api/naive-ui/components/crud-table' },
              { text: 'CrudForm', link: '/api/naive-ui/components/crud-form' },
            ],
          },
        ],
        '/dev/': [
          {
            text: '开发者 / 贡献者',
            items: [
              { text: '概览', link: '/dev/overview' },
              { text: '本地开发', link: '/dev/local-dev' },
              { text: '构建与发布', link: '/dev/build-and-release' },
            ],
          },
        ],
      },
      footer: {
        message: 'Made with VitePress',
        copyright: 'MIT Licensed',
      },
    },
    vite: {
      resolve: {
        alias: {},
      },
      ssr: {
        noExternal: [
          'vitepress-plugin-mermaid',
          'mermaid',
          'dayjs',
        ],
      },
      optimizeDeps: {
        include: [
          'mermaid',
          'dayjs',
        ],
      },
    },
  })
}
