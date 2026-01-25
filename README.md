# curd-pro（@fcurd/*）

一个面向 **Vue 3.4+** 的 CRUD 组件/组合式方案：

- **`@fcurd/core`**：纯逻辑与类型（`useCrud`、`CrudProvider`、渲染器、路由搜索同步等）
- **`@fcurd/naive-ui`**：Naive UI 适配（`NaiveAutoCrud`/`NaiveCrudSearch`/`NaiveCrudTable`/`NaiveCrudForm` 以及字段控件）

## 快速体验（playground）

```bash
pnpm i
pnpm dev:playground
```

## 在业务项目中安装

```bash
pnpm add @fcurd/core @fcurd/naive-ui naive-ui
```

> `@fcurd/*` 以 workspace 方式开发；发布到 npm 后可直接按上面安装。`vue`/`vue-router` 为 peerDependencies（路由可选）。

## 最小用法：NaiveAutoCrud（推荐开箱即用）

核心只需要 3 样：**adapter**（对接后端）、**fields**（字段元信息）、**tableColumns**（表格列）。

```vue
<script setup lang="ts">
import type { CrudAdapter } from '@fcurd/core'
import { createNaiveColumns, defineNaiveFields, NaiveAutoCrud } from '@fcurd/naive-ui'

interface Row {
  id: number
  name: string
  status: 'enabled' | 'disabled'
}
interface Query {
  // 默认搜索会写入 query.search
  search?: { name?: string | null, status?: Row['status'] | null }
}

function createMemoryAdapter(initial?: Row[]): CrudAdapter<Row, number, Query> {
  let db: Row[] = (initial ?? [
    { id: 1, name: '示例 1', status: 'enabled' },
    { id: 2, name: '示例 2', status: 'disabled' },
  ]).slice()

  function nextId(): number {
    return db.reduce((max, row) => Math.max(max, row.id), 0) + 1
  }

  return {
    getId: row => row.id,
    async list({ page, pageSize }) {
      const p = Math.max(1, page ?? 1)
      const s = Math.max(1, pageSize ?? 20)
      const start = (p - 1) * s
      const end = start + s
      return { items: db.slice(start, end), total: db.length }
    },
    async create(data) {
      const row: Row = {
        id: nextId(),
        name: String((data as any)?.name ?? ''),
        status: ((data as any)?.status ?? 'enabled') as Row['status'],
      }
      db = [row, ...db]
      return row
    },
    async update(id, data) {
      const idx = db.findIndex(r => r.id === id)
      if (idx < 0)
        throw new Error(`记录不存在：${id}`)
      const next: Row = { ...db[idx], ...(data as any), id }
      db = db.slice()
      db[idx] = next
      return next
    },
    async remove(id) {
      db = db.filter(r => r.id !== id)
    },
  }
}

const adapter = createMemoryAdapter()

const fields = defineNaiveFields<Row, Row>([
  { key: 'name', label: () => '名称', type: 'text', required: true, visibleIn: { search: true, table: true, form: true } },
  {
    key: 'status',
    label: () => '状态',
    type: 'select',
    visibleIn: { search: true, table: true, form: true },
    ui: { control: { clearable: true, options: [
      { label: '启用', value: 'enabled' },
      { label: '禁用', value: 'disabled' },
    ] } },
  },
])

const tableColumns = createNaiveColumns<Row>(fields, {
  overrides: { name: { sortable: true, width: 220 }, status: { width: 120 } },
})
</script>

<template>
  <NaiveAutoCrud
    :adapter="adapter"
    :fields="fields"
    :table-columns="tableColumns"
    form-mode="drawer"
    show-selection
  />
</template>
```

## 常用自定义点

- **表格单元格 slot**：`#cell-<fieldKey>`（示例：`#cell-status`）
- **表单字段 slot**：`#field-<fieldKey>`（示例：`#field-remark`）
- **行操作 slot**：`#row-actions="{ row, openEdit, defaultActions, crud, refresh }"`（可复用默认编辑/删除按钮）
- **页面插槽**：`#toolbar`、`#beforeTable`、`#actions-header`、`#table-actions`
- **拿到内部 crud 实例**：`NaiveAutoCrud` 会 `defineExpose({ crud, refresh, setQuery })`，可用 `ref` 调用

## 搜索与路由同步（默认开启）

只要你在 `NaiveAutoCrud` 中启用搜索（默认不禁用），搜索提交会自动：

- 写入 `crud.query.value.search`
- 同步到 URL：`?search=<JSON字符串>`
- 刷新/复制链接打开会自动回填搜索并刷新列表

底层实现是 `@fcurd/core` 的 `useCrudSearchRouteSync`（在 `CrudSearchRenderer` 内默认启用）。

## 手动组合（更高自由度）

当你不想用 `NaiveAutoCrud` 的默认布局时，可以自己拼装：

- `useCrud({ adapter, debounceMs, dedupe })`
- `CrudProvider` 注入上下文（fields/columns/actions/controlMap/uiDriver）
- 然后用 `NaiveCrudSearch` / `NaiveCrudTable` / `NaiveCrudForm` 组合页面

参考：`packages/playground/src/pages/manual-compose-page.vue`
