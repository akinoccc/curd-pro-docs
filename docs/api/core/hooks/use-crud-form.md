---
title: useCrudForm
---

# useCrudForm

表单状态管理：model、mode、dirty 检测、变更数据裁剪、可见字段过滤。

## 基本用法

```ts
import { useCrudForm } from '@fcurd/core'

const form = useCrudForm<MyRow>({
  fields: [
    { key: 'name', label: '名称', type: 'text', required: true, visibleIn: { form: true } },
    { key: 'status', label: '状态', type: 'select', visibleIn: { form: true } },
  ],
})

// 新增模式
form.setMode('create')
form.reset({ name: '默认值' })

// 编辑模式
form.setMode('edit')
form.reset(existingRow)

// 获取提交数据
const data = form.getSubmitData()
// create 模式: 返回整个 model
// edit 模式: 只返回 changedData（变更字段）
```

## Options

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `fields` | `CrudField<Row>[]` | — | 字段定义（必填） |
| `initialData` | `Partial<Row>` | `{}` | 初始数据 |

## 返回值

### State

| 属性 | 类型 | 说明 |
|---|---|---|
| `model` | `Reactive<Partial<Row>>` | 响应式表单对象 |
| `mode` | `Ref<'create' \| 'edit'>` | 当前模式 |
| `dirty` | `ComputedRef<boolean>` | model 是否与初始快照不同 |
| `changedKeys` | `ComputedRef<string[]>` | 变更的字段 key 列表 |
| `changedData` | `ComputedRef<Partial<Row>>` | 仅包含变更字段的数据 |
| `visibleFields` | `ComputedRef<CrudField<Row>[]>` | 按 `visibleIn.form` 过滤后的字段 |

### Actions

| 方法 | 签名 | 说明 |
|---|---|---|
| `reset` | `(data?: Partial<Row>) => void` | 重置 model 和初始快照 |
| `setMode` | `(mode: 'create' \| 'edit') => void` | 切换模式 |
| `getSubmitData` | `() => Partial<Row>` | 获取提交数据 |

## 行为说明

### dirty / changedData

`useCrudForm` 在 `reset()` 时拍一个初始快照。后续修改 `model` 时，`dirty` / `changedKeys` / `changedData` 通过浅比较计算：

- `dirty`：任一字段值与快照不同
- `changedKeys`：所有变更字段的 key
- `changedData`：只包含变更字段的子集

### getSubmitData

| 模式 | 返回值 | 说明 |
|---|---|---|
| `create` | 整个 `model` | 新增通常需要完整数据 |
| `edit` | `changedData` | 编辑只提交变更字段，节省带宽、减少冲突 |

### visibleFields

根据 `visibleIn.form` 过滤。如果 `visibleIn.form` 是函数，会传入 `FieldContext`（包含 `formModel`），支持条件渲染。

## 完整示例

::: code-group
<<< @/examples/crud-compose-basic.vue [页面]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-types.ts [类型定义]
:::
