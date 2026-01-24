import type { CrudField } from '@fcurd/core'
import type { DemoRow } from './memory-crud'
import { createNaiveColumns } from '@fcurd/naive-ui'

export function createDemoFields(): CrudField<DemoRow, DemoRow>[] {
  return [
    {
      key: 'name',
      label: () => '名称',
      type: 'text',
      required: true,
      visibleIn: { search: true, table: true, form: true },
      rules: [
        {
          trigger: ['change', 'submit'],
          validator({ value }) {
            const v = String(value ?? '').trim()
            if (!v)
              return true
            if (v.length < 2)
              return '名称至少 2 个字符'
            return true
          },
        },
      ],
      ui: { naive: { controlProps: { clearable: true } } },
    },
    {
      key: 'status',
      label: () => '状态',
      type: 'select',
      required: true,
      dictKey: 'status',
      visibleIn: { search: true, table: true, form: true },
      ui: { naive: { controlProps: { clearable: true } } },
    },
    {
      key: 'category',
      label: () => '分类',
      type: 'select',
      dictKey: 'category',
      visibleIn: { search: true, table: true, form: true },
      ui: { naive: { controlProps: { clearable: true } } },
    },
    {
      key: 'enabled',
      label: () => '启用',
      type: 'switch',
      visibleIn: { search: true, table: true, form: true },
    },
    {
      key: 'amount',
      label: () => '金额',
      type: 'number',
      required: true,
      visibleIn: { search: false, table: true, form: true },
      ui: {
        naive: {
          controlProps: { min: 0, step: 1, placeholder: '请输入金额' },
          columnProps: { sorter: 'default' },
        },
      },
    },
    {
      key: 'createdAt',
      label: () => '创建时间',
      type: 'datetime',
      visibleIn: { search: true, table: true, form: false },
      ui: {
        naive: {
          columnProps: { sorter: 'default' },
          controlProps: { clearable: true },
        },
      },
    },
    {
      key: 'remark',
      label: () => '备注（仅禁用时出现）',
      type: 'textarea',
      visibleIn: {
        search: false,
        table: false,
        form(ctx) {
          return ctx.formModel?.status === 'disabled'
        },
      },
      ui: {
        naive: {
          controlProps: { autosize: { minRows: 2, maxRows: 6 }, placeholder: '可选填写' },
        },
      },
    },
  ]
}

export function createDemoColumns(fields: CrudField<DemoRow, DemoRow>[]) {
  return createNaiveColumns<DemoRow>(fields, {
    overrides: {
      name: { sortable: true, width: 220 },
      status: { width: 120 },
      category: { width: 120 },
      enabled: { width: 90 },
      createdAt: { width: 220 },
      amount: { width: 120 },
    },
    defaults: {
      // minWidth: 120,
    },
  })
}
