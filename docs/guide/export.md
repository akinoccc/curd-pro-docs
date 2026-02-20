---
title: 导出
---

# 导出功能

## 在 Adapter 中实现 export

`CrudAdapter.export` 接收当前查询条件和排序，返回文件数据：

```ts
const adapter: CrudAdapter<MyRow, MyQuery> = {
  async list(params) { /* ... */ },

  async export(params) {
    const response = await fetch('/api/export', {
      method: 'POST',
      body: JSON.stringify({ query: params.query, sort: params.sort }),
      signal: params.signal,
    })
    const blob = await response.blob()
    const filename = response.headers.get('content-disposition')
      ?.match(/filename="?(.+)"?/)?.[1]

    return { blob, filename }
  },
}
```

## ExportResult 三种形式

`export()` 可以返回以下任意一种：

| 返回形式 | 说明 |
|---|---|
| `Blob` | 直接返回文件 Blob |
| `{ blob: Blob, filename?: string }` | Blob + 可选文件名 |
| `{ url: string, filename?: string }` | 下载链接 + 可选文件名 |

```ts
// 形式 1：直接返回 Blob
async export() {
  return new Blob(['data'], { type: 'text/csv' })
}

// 形式 2：Blob + 文件名
async export() {
  return { blob: new Blob([data]), filename: 'export.xlsx' }
}

// 形式 3：URL（后端返回下载地址）
async export() {
  const { url } = await api.getExportUrl()
  return { url, filename: 'report.xlsx' }
}
```

## AutoCrud 中使用

只要 adapter 有 `export` 方法，`AutoCrud` 就会自动在工具栏显示"导出"按钮：

```vue
<AutoCrud
  :adapter="adapter"
  :fields="fields"
  :columns="columns"
/>
```

点击后，`@fcurd/naive-ui` 的 `handleExportResult` 会自动处理三种返回形式的下载。

## 手动使用 handleExportResult

当你用 hooks 组合方式时，可以直接调用 `handleExportResult`：

```ts
import { handleExportResult } from '@fcurd/naive-ui'

async function handleExport() {
  const result = await adapter.export!({
    query: list.query.value,
    sort: list.sort.value,
  })
  handleExportResult(result, 'fallback-filename.xlsx')
}
```

## 自定义导出 Action

使用 `presetActions.export` 工厂创建：

```ts
import { presetActions } from '@fcurd/core'
import { handleExportResult } from '@fcurd/naive-ui'

const exportAction = presetActions.export({
  adapter,
  filename: 'my-export.xlsx',
  handleExport: handleExportResult,
  onError: (err) => console.error('导出失败', err),
})
```
