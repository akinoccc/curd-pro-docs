---
title: Adapter
---

本页介绍 `@fcurd/naive-ui` 的“适配层工具函数”，用于把 core 的 schema 映射到 Naive UI 组件与行为。

## NaiveCrudField / NaiveFieldUi

在 `CrudField` 的 `ui` 上扩展了 Naive UI 相关配置：

- `ui.control`：透传到字段控件（支持 `form/search` 分面覆盖）
- `ui.formItem`：透传到 `NFormItem`（支持 `form/search` 分面覆盖）
- `ui.options`：Select 的 options
- `ui.component`：替换默认控件（高级用法）

## componentMap

把 `field.type` 映射到内置控件：text/number/select/date/dateRange/switch...

## createTableColumns

把 `CrudColumn[]` 转为 `DataTableColumn[]`，并支持：
- 自动识别 `cell-${key}` / `cell_${key}` slot
- `CrudColumn.render(ctx)` 与自定义 `renderCell` fallback

## confirmAction / handleExportResult

- `confirmAction(message)`：基于 Naive 离散 API 的确认框
- `handleExportResult(result)`：支持 `Blob | { blob } | { url }` 三形态下载

## 典型用法（只看怎么用）

```ts
import type { NaiveCrudField } from '@fcurd/naive-ui'

// 用 ui.control.form / ui.control.search 做“分面覆盖”
const fields: NaiveCrudField[] = [
  {
    key: 'name',
    label: '名称',
    type: 'text',
    ui: {
      control: {
        placeholder: '请输入',
        form: { clearable: true },
        search: { clearable: true },
      },
    },
  },
]
```
