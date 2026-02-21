---
title: 表单模式与 Props 透传
---

# 表单模式与 Props 透传

## 表单显示模式

`CrudForm` 支持两种显示模式，通过 `displayMode` 属性控制：

| 模式 | 说明 | 适用场景 |
|---|---|---|
| `modal`（默认） | 弹出模态框 | 字段较少的表单 |
| `drawer` | 从右侧滑出抽屉 | 字段较多、需要更大空间 |

### 在 AutoCrud 中使用

`AutoCrud` 通过 `formMode` prop 控制（仅支持 `modal` 和 `drawer`）：

```vue
<!-- 默认 modal -->
<AutoCrud :adapter="adapter" :fields="fields" :columns="columns" />

<!-- 使用 drawer -->
<AutoCrud :adapter="adapter" :fields="fields" :columns="columns" form-mode="drawer" />
```

### 单独使用 CrudForm

直接使用 `CrudForm` 时可以使用 `modal` / `drawer` 两种模式：

```vue
<CrudForm
  v-model:visible="formVisible"
  :form="form"
  :fields="fields"
  display-mode="drawer"
/>
```

## 禁用默认操作

`AutoCrud` 会根据 adapter 的方法自动生成操作按钮。你可以通过 `disable*` props 关闭特定操作：

```vue
<AutoCrud
  :adapter="adapter"
  :fields="fields"
  :columns="columns"
  disable-create
  disable-export
/>
```

| Prop | 默认值 | 说明 |
|---|---|---|
| `disableCreate` | `false` | 隐藏"新增"按钮 |
| `disableEdit` | `false` | 隐藏行"编辑"按钮 |
| `disableDelete` | `false` | 隐藏行"删除"按钮 |
| `disableExport` | `false` | 隐藏"导出"按钮 |

::: tip
这些 props 只控制 AutoCrud 自动生成的默认操作。如果你通过 `actions` prop 传入了自定义操作，它们不受这些开关影响。
:::

## Props 透传

`@fcurd/naive-ui` 的组件支持将 props 透传给底层 Naive UI 组件，让你在不脱离 AutoCrud 的前提下精细控制 UI 行为。

### tableProps

透传给 `NDataTable`：

```vue
<AutoCrud
  :adapter="adapter"
  :fields="fields"
  :columns="columns"
/>
```

单独使用 `CrudTable` 时：

```vue
<CrudTable
  :list="list"
  :columns="columns"
  :table-props="{ bordered: true, striped: true, size: 'small' }"
/>
```

### paginationProps

透传给 `NPagination`，可在 `AutoCrud` 和 `CrudTable` 上使用：

```vue
<AutoCrud
  :adapter="adapter"
  :fields="fields"
  :columns="columns"
  :pagination-props="{ pageSizes: [20, 50, 100, 200] }"
/>
```

### formProps

透传给 `NForm`，可在 `CrudForm` 和 `CrudSearch` 上使用：

```vue
<CrudForm
  :form="form"
  :fields="fields"
  :form-props="{ labelPlacement: 'top', labelWidth: 'auto' }"
/>
```

### modalProps / drawerProps

透传给 `NModal` 或 `NDrawer`，仅在 `CrudForm` 上使用：

```vue
<!-- Modal 模式 -->
<CrudForm
  :form="form"
  :fields="fields"
  :modal-props="{ maskClosable: false, style: { width: '600px' } }"
/>

<!-- Drawer 模式 -->
<CrudForm
  :form="form"
  :fields="fields"
  display-mode="drawer"
  :drawer-props="{ width: 500 }"
  :drawer-content-props="{ closable: true }"
/>
```

### AutoCrud 中的 Props 透传

`AutoCrud` 直接支持 `paginationProps`。对于 `formProps`、`modalProps`、`tableProps` 等更细粒度的透传，你可以通过 slot 接管对应区域后自行传递：

```vue
<AutoCrud :adapter="adapter" :fields="fields" :columns="columns">
  <template #table="{ list, columns: cols, selection, rowKey }">
    <CrudTable
      :list="list"
      :columns="cols"
      :selection="selection"
      :row-key="rowKey"
      :table-props="{ bordered: true }"
    />
  </template>
</AutoCrud>
```

或者采用 [Hooks 组合模式](/guide/hooks-composition)，获得完全的控制权。

## 标题自定义

`CrudForm` 的 `title` 支持字符串或函数：

```vue
<!-- 固定标题 -->
<CrudForm :form="form" :fields="fields" title="用户信息" />

<!-- 根据模式动态标题 -->
<CrudForm
  :form="form"
  :fields="fields"
  :title="(mode) => mode === 'create' ? '新建用户' : '编辑用户'"
/>
```

不传 `title` 时，默认根据模式显示"新增"或"编辑"。
