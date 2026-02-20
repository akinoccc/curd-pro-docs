---
title: CrudForm
---

# CrudForm

表单组件，将 `fields` 渲染为 Naive UI 表单，支持 Modal / Drawer / Inline 三种显示模式。

## Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `form` | `UseCrudFormReturn<Row>` | — | 表单状态（必填） |
| `fields` | `CrudField<Row>[]` | — | 字段定义（必填） |
| `displayMode` | `'modal' \| 'drawer' \| 'inline'` | `'modal'` | 显示模式 |
| `v-model:visible` | `boolean` | `false` | Modal/Drawer 的显示状态 |
| `title` | `string \| ((mode: 'create' \| 'edit') => string)` | 自动生成 | 标题（函数可按模式返回不同标题） |
| `resetOnClose` | `boolean` | `true` | 关闭后是否 reset form + restoreValidation |
| `formProps` | `FormProps` | — | 透传到 `NForm` |
| `modalProps` | `ModalProps` | — | 透传到 `NModal` |
| `drawerProps` | `DrawerProps` | — | 透传到 `NDrawer` |
| `drawerContentProps` | `DrawerContentProps` | — | 透传到 `NDrawerContent` |

### title 默认值

| 模式 | 默认标题 |
|---|---|
| `create` | `'新增'` |
| `edit` | `'编辑'` |

## Emits

| 事件 | 参数 | 说明 |
|---|---|---|
| `update:visible` | `boolean` | visible 双向绑定 |
| `submit` | `Partial<Row>` | 验证通过后触发，数据来自 `form.getSubmitData()` |
| `cancel` | — | 取消/关闭触发 |

## 行为说明

### 字段渲染

只渲染 `form.visibleFields`（由 `visibleIn.form` 过滤）。

### 验证

- `required: true` 自动补一个"必填"规则（`${label}不能为空`）
- 不会覆盖你在 `field.ui.formItem.form.rule` 中定义的自定义规则
- 提交时先调用 `NForm.validate()`，通过后才 emit `submit`

### 提交数据

`submit` 事件的 `data` 来自 `form.getSubmitData()`：

| 模式 | data 内容 |
|---|---|
| `create` | 整个 model |
| `edit` | 仅 changedData（变更字段） |

### 关闭行为

`resetOnClose` 为 `true` 时（默认），关闭 Modal/Drawer 后：
1. 调用 `form.reset()` 清空 model
2. 调用 `NForm.restoreValidation()` 清除验证状态

## Slots

| Slot | Props | 说明 |
|---|---|---|
| `field-${key}` | `{ field, model, mode, value }` | 自定义某个表单字段 |
| `footer` | `{ mode, dirty }` | 自定义底部按钮区（默认：取消 + 保存） |

### footer slot 示例

```vue
<CrudForm :form="form" :fields="fields" v-model:visible="visible" @submit="handleSubmit">
  <template #footer="{ mode, dirty }">
    <NSpace justify="end">
      <NButton @click="visible = false">取消</NButton>
      <NButton type="primary" :disabled="mode === 'edit' && !dirty" attr-type="submit">
        {{ mode === 'create' ? '创建' : '更新' }}
      </NButton>
    </NSpace>
  </template>
</CrudForm>
```

## 示例

::: code-group
<<< @/examples/auto-crud-basic.vue [页面]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-schema.ts [fields & columns]
<<< @/examples/basic-types.ts [类型定义]
:::
