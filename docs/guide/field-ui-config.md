---
title: 字段 UI 配置
---

# 字段 UI 配置

每个 `CrudField` 都有一个可选的 `ui` 属性，用于向 UI 适配层传递额外配置。`ui` 的具体结构由适配层定义——本文以 `@fcurd/naive-ui` 为例说明其结构约定和场景差异化机制。

## ui 对象结构

```ts
interface NaiveFieldUi {
  /** 控件属性，透传给字段对应的表单控件组件 */
  control?: Record<string, unknown> & {
    form?: Record<string, unknown>    // 仅在表单中生效的覆盖
    search?: Record<string, unknown>  // 仅在搜索中生效的覆盖
  }
  /** 表单项属性，透传给 NFormItem 等容器 */
  formItem?: {
    form?: Record<string, unknown>    // 仅在表单中生效
    search?: Record<string, unknown>  // 仅在搜索中生效
  }
  /** 表格列属性，透传给 DataTableColumn */
  column?: Record<string, unknown>
  /** 选项数据（select 字段使用） */
  options?: SelectOption[]
  /** 自定义控件组件 */
  component?: Component
}
```

各层职责：

| 属性 | 作用 | 透传目标 |
|---|---|---|
| `control` | 控件的 props（如 clearable、placeholder、min 等） | 字段对应的控件组件 |
| `formItem` | 表单项容器的 props（如验证规则等） | NFormItem |
| `column` | 表格列的额外属性 | DataTableColumn |
| `options` | 下拉选项数据 | Select 控件 |
| `component` | 替换默认控件组件 | 渲染层 |

## 场景差异化机制

同一个字段可能同时出现在搜索表单和编辑表单中，但两个场景的行为需求经常不同。`control` 和 `formItem` 都支持通过 `form` / `search` 子键进行按场景覆盖。

### 合并逻辑

以 `control` 为例，`resolveControlProps(field, surface)` 的合并逻辑为：

1. 取 `ui.control` 中的**基础属性**（排除 `form` / `search` 两个保留键）
2. 如果存在 `ui.control[surface]`，将其浅合并到基础属性上（surface 特定值优先）

```ts
// 字段定义
{
  key: 'remark',
  label: '备注',
  type: 'textarea',
  ui: {
    control: {
      placeholder: '请输入',           // 基础 — 两个场景都生效
      form: { autosize: { minRows: 3 } }, // 仅表单生效
      search: { rows: 1 },               // 仅搜索生效
    },
  },
}

// 表单场景解析结果：{ placeholder: '请输入', autosize: { minRows: 3 } }
// 搜索场景解析结果：{ placeholder: '请输入', rows: 1 }
```

`formItem` 的合并方式相同——基础属性对两个场景生效，`formItem.form` / `formItem.search` 分别覆盖。

### 典型用法

```ts
{
  key: 'name',
  label: '名称',
  type: 'text',
  required: true,
  ui: {
    control: {
      clearable: true,  // 搜索和表单都可清除
    },
    formItem: {
      form: {
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
}
```

## 其他适配层

如果你开发自己的 UI 适配层（如 Element Plus、Ant Design Vue），可以定义不同的 `UiExt` 接口。`@fcurd/core` 的 `CrudField<Row, FormModel, UiExt>` 通过泛型的第三个参数支持此扩展——核心层不关心 `ui` 的具体结构，完全由适配层消费。
