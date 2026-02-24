---
title: 表单验证
---

# 表单验证

`@uozi/vito-naive-ui` 的 `CrudForm` 组件基于 Naive UI 的 `NForm` 验证体系，提供了自动规则生成和自定义规则两种方式。

## 自动必填验证

当字段设置了 `required: true` 时，`CrudForm` 会自动生成一条必填验证规则：

```ts
defineFields([
  {
    key: 'name',
    label: '名称',
    type: 'text',
    required: true,  // 自动生成："名称不能为空"
  },
  {
    key: 'amount',
    label: '金额',
    type: 'number',
    required: true,  // 自动生成数字类型的必填规则
  },
])
```

自动生成规则的行为：

- 提示文案：`${label}不能为空`
- 触发时机：`['input', 'blur', 'change']`
- 对 `number` / `money` 类型，会自动添加 `type: 'number'`

::: tip
自动规则只在 **CrudForm**（编辑/新增表单）中生效，搜索表单不会添加验证。
:::

## 自定义验证规则

通过 `ui.overrides.editForm.formItem.rule` 可以为编辑表单添加自定义规则（搜索表单不受影响）：

```ts
{
  key: 'name',
  label: '名称',
  type: 'text',
  required: true,
  ui: {
    overrides: {
      editForm: {
        formItem: {
          rule: {
            trigger: ['change', 'blur', 'input'],
            validator: (_rule, value) => {
              const v = String(value ?? '').trim()
              if (!v) return  // 空值由 required 规则处理
              if (v.length < 2)
                throw new Error('名称至少 2 个字符')
            },
          },
        },
      },
    },
  },
}
```

### 规则合并逻辑

当字段同时设置了 `required: true` 和自定义 `rule` 时，`CrudForm` 会将两者合并为数组：

1. 检查自定义规则中是否已包含 `required: true` 的规则
2. 如果没有，则在数组头部插入自动生成的必填规则
3. 自定义规则追加在后面

因此你不需要在自定义规则中重复处理必填校验。

## 异步验证

验证函数支持 `async`，可以用于远程校验（如用户名唯一性检查）：

```ts
{
  key: 'username',
  label: '用户名',
  type: 'text',
  required: true,
  ui: {
    overrides: {
      editForm: {
        formItem: {
          rule: {
            trigger: ['blur'],
            validator: async (_rule, value) => {
              const v = String(value ?? '').trim()
              if (!v) return
              const exists = await api.checkUsername(v)
              if (exists)
                throw new Error('用户名已存在')
            },
          },
        },
      },
    },
  },
}
```

## 多条规则

`rule` 也可以是数组，按顺序执行：

```ts
ui: {
  overrides: {
    editForm: {
      formItem: {
        rule: [
          {
            trigger: ['input'],
            validator: (_r, v) => {
              if (v && v.length > 50)
                throw new Error('不能超过 50 个字符')
            },
          },
          {
            trigger: ['blur'],
            pattern: /^[a-zA-Z0-9_]+$/,
            message: '只允许字母、数字和下划线',
          },
        ],
      },
    },
  },
}
```

## 搜索表单 vs 编辑表单

验证规则的场景差异化通过 `overrides` 实现：

- `overrides.editForm.formItem.rule` — 仅在编辑/新增表单中生效
- `overrides.searchForm.formItem.rule` — 仅在搜索表单中生效（通常不需要）

`required: true` 生成的自动规则也**仅作用于编辑表单**，搜索表单不会强制必填。

详见 [字段 UI 配置](/guide/field-ui-config) 中的场景差异化机制。
