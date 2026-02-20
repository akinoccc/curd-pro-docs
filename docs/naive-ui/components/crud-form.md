---
title: CrudForm
---

`CrudForm` 把 `fields` 渲染成 Naive 的表单，并基于 `useCrudForm` 的状态输出提交数据。

## Props（常用）

- `form`：`UseCrudFormReturn<Row>`（必填）
- `fields`：`CrudField<Row>[]`（必填）
- `displayMode`：`'modal' | 'drawer' | 'inline'`
- `v-model:visible`：控制 Modal/Drawer 显示
- `title?`：字符串或 `(mode) => string`
- `resetOnClose`：关闭后是否 reset + restoreValidation
- `formProps/modalProps/drawerProps/...`：透传

## 行为要点

- `required: true` 会自动补一个"必填"规则，但不会覆盖你在 `field.ui.formItem.form.rule` 里写的自定义规则。
- 提交时会先调用 `NForm.validate()`；通过后 emit `submit(data)`，其中 `data` 来自 `form.getSubmitData()`。

## Slots

- `field-${key}`：字段级自定义渲染
- `footer`：自定义表单底部按钮区（默认：取消/保存）

## 示例

::: code-group
<<< @/examples/auto-crud-basic.vue [页面]
<<< @/examples/basic-adapter.ts [Adapter]
<<< @/examples/basic-schema.ts [fields & columns]
<<< @/examples/basic-types.ts [类型定义]
:::
