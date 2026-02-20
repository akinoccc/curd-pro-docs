---
title: useCrudForm
---

`useCrudForm` 管理表单状态：`model/mode/dirty/changedData/visibleFields`。

## 行为要点

- `model`：响应式对象（`Reactive<Partial<Row>>`）
- `mode`：`create | edit`
- `dirty/changedKeys/changedData`：基于初始快照计算
- `getSubmitData()`：
  - create：返回整个 `model`
  - edit：只返回 `changedData`
- `visibleFields`：按 `visibleIn.form`（含函数）过滤

## 最小示例

```ts
import { useCrudForm } from '@fcurd/core'

const form = useCrudForm<{ name: string, status: string }>({
  fields: [
    { key: 'name', label: '名称', type: 'text', required: true, visibleIn: { form: true } },
    { key: 'status', label: '状态', type: 'select', visibleIn: { form: true } },
  ],
})

form.setMode('create')
form.reset({ name: '默认值' })

const payload = form.getSubmitData()
```

## 组合示例（完整）

::: code-group
<<< @/examples/crud-compose-basic.vue [页面]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-types.ts [类型定义]
:::
