---
title: 表单变更追踪
---

# 表单变更追踪

`useCrudForm` 内置了表单变更追踪能力，能够精确感知哪些字段被修改了，并在编辑模式下只提交变更部分。

## 核心概念

当调用 `form.reset(data)` 时，hook 会对 `data` 拍一份快照。之后任何对 `form.model` 的修改都会被追踪，并与快照进行对比。

```ts
import { useCrudForm } from '@fcurd/core'

const form = useCrudForm({ fields })

// 初始化（拍快照）
form.reset({ name: '张三', status: 'active', age: 25 })

// 修改一个字段
form.model.name = '李四'

// 追踪状态
form.dirty.value        // true — 有变更
form.changedKeys.value  // ['name'] — 变更的字段键
form.changedData.value  // { name: '李四' } — 仅变更字段的数据
```

## 属性说明

| 属性 | 类型 | 说明 |
|---|---|---|
| `dirty` | `ComputedRef<boolean>` | 是否有任何字段被修改 |
| `changedKeys` | `ComputedRef<string[]>` | 所有被修改的字段键数组 |
| `changedData` | `ComputedRef<Partial<Row>>` | 仅包含被修改字段的对象 |

这三个属性都是计算属性，会随 `model` 的变化实时更新。

## getSubmitData：模式感知的提交数据

`getSubmitData()` 根据当前模式返回不同的数据：

| 模式 | 返回值 | 说明 |
|---|---|---|
| `create` | 完整的 `model` 副本 | 新建时需要提交所有字段 |
| `edit` | `changedData` | 编辑时只提交变更字段 |

```ts
form.setMode('create')
form.getSubmitData()
// → { name: '李四', status: 'active', age: 25 }（全量）

form.setMode('edit')
form.getSubmitData()
// → { name: '李四' }（仅变更）
```

## 实际应用场景

### 节省带宽

编辑大型对象时，只发送变更字段可以显著减少请求体大小：

```ts
async function handleSubmit() {
  const data = form.getSubmitData()
  // create：POST /api/users  body: { name, email, role, ... }
  // edit：  PATCH /api/users/1  body: { name: '新名称' }
  if (form.mode.value === 'create') {
    await adapter.create!(data)
  } else {
    await adapter.update!(editingId, data)
  }
}
```

### 避免覆盖并发修改

当多人同时编辑同一条记录时，只提交变更字段可以减少冲突风险——你修改了 `name`，同事修改了 `status`，两个 PATCH 请求不会互相覆盖。

### 保存按钮状态

利用 `dirty` 控制保存按钮的启用状态：

```vue
<NButton
  type="primary"
  :disabled="!form.dirty.value"
  @click="handleSubmit"
>
  保存
</NButton>
```

### 离开提示

结合 `dirty` 在用户离开页面时提示未保存变更：

```ts
import { onBeforeRouteLeave } from 'vue-router'

onBeforeRouteLeave(() => {
  if (form.dirty.value) {
    return window.confirm('有未保存的变更，确定要离开吗？')
  }
})
```

## 重置快照

调用 `form.reset(newData)` 会同时重置 model 和快照——此后 `dirty` 恢复为 `false`：

```ts
// 打开编辑表单时
function openEdit(row: Row) {
  form.reset(row)           // model = row, 快照 = row
  form.setMode('edit')
  form.dirty.value          // false
}
```

不传参数的 `form.reset()` 会清空 model 和快照。

## CrudForm 组件中的行为

在 `@fcurd/naive-ui` 的 `CrudForm` 组件中：

- 表单提交时调用 `form.getSubmitData()` 获取提交数据
- `resetOnClose` 默认为 `true`，关闭弹窗时自动 `form.reset()`
- `footer` slot 可以拿到 `dirty` 来自定义底部按钮行为
