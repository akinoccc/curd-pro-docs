---
title: 字段 UI 配置
---

# 字段 UI 配置

每个 `CrudField` 都有一个可选的 `ui` 属性，用于向 UI 适配层传递额外配置。`ui` 的具体结构由适配层定义——本文以 `@fcurd/naive-ui` 为例说明其结构约定和场景差异化机制。

## ui 对象结构

```ts
interface NaiveFieldUi {
  /** 控件属性，透传给字段对应的表单控件组件 */
  formControl?: Record<string, unknown>
  /** 表单项属性，透传给 NFormItem 等容器 */
  formItem?: Record<string, unknown>
  /** 按 surface 覆盖 formControl / formItem 的配置 */
  overrides?: {
    editForm?: {
      formControl?: Record<string, unknown>
      formItem?: Record<string, unknown>
    }
    searchForm?: {
      formControl?: Record<string, unknown>
      formItem?: Record<string, unknown>
    }
  }
  /** 自定义控件组件 */
  component?: Component
}
```

各层职责：

| 属性 | 作用 | 透传目标 |
|---|---|---|
| `formControl` | 控件的 props（如 clearable、placeholder、options 等） | 字段对应的控件组件 |
| `formItem` | 表单项容器的 props（如验证规则等） | NFormItem |
| `overrides` | 按 surface 覆盖 formControl / formItem | 见下方说明 |
| `component` | 替换默认控件组件 | 渲染层 |

## 场景差异化机制

同一个字段可能同时出现在搜索表单和编辑表单中，但两个场景的行为需求经常不同。通过 `overrides` 可以为 `editForm`（编辑/新增表单）和 `searchForm`（搜索表单）分别覆盖配置。

### 合并逻辑

以 `formControl` 为例，`resolveControlProps(field, surface)` 的合并逻辑为：

1. 取 `ui.formControl` 作为**基础属性**（两个场景共享）
2. 如果存在 `ui.overrides[surface].formControl`，将其浅合并到基础属性上（surface 特定值优先）

```ts
// 字段定义
{
  key: 'remark',
  label: '备注',
  type: 'textarea',
  ui: {
    formControl: { placeholder: '请输入' },  // 基础 — 两个场景都生效
    overrides: {
      editForm: { formControl: { autosize: { minRows: 3 } } },  // 仅编辑表单生效
      searchForm: { formControl: { rows: 1 } },                  // 仅搜索表单生效
    },
  },
}

// 编辑表单场景解析结果：{ placeholder: '请输入', autosize: { minRows: 3 } }
// 搜索表单场景解析结果：{ placeholder: '请输入', rows: 1 }
```

`formItem` 的合并方式相同——基础属性对两个场景生效，`overrides.editForm.formItem` / `overrides.searchForm.formItem` 分别覆盖。

### 典型用法

```ts
{
  key: 'name',
  label: '名称',
  type: 'text',
  required: true,
  ui: {
    formControl: { clearable: true },  // 搜索和表单都可清除
    overrides: {
      editForm: {
        formItem: {
          // 仅编辑表单添加自定义验证规则
          rule: {
            trigger: ['blur', 'input'],
            validator: (_r, v) => {
              if (String(v ?? '').trim().length < 2)
                throw new Error('名称至少 2 个字符')
            },
          },
        },
      },
    },
  },
}
```

## 其他适配层

如果你开发自己的 UI 适配层（如 Element Plus、Ant Design Vue），可以定义不同的 `UiExt` 接口。`@fcurd/core` 的 `CrudField<Row, FormModel, UiExt>` 通过泛型的第三个参数支持此扩展——核心层不关心 `ui` 的具体结构，完全由适配层消费。
