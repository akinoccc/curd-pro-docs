import type { NaiveCrudField } from '@fcurd/naive-ui'
import type { DemoRow } from './memory-crud'
import { createNaiveColumns, defineNaiveFields } from '@fcurd/naive-ui'

export function createDemoFields() {
  return defineNaiveFields([
    {
      key: 'name',
      label: () => '名称',
      type: 'text',
      required: true,
      visibleIn: { search: true, table: true, form: true },
      ui: {
        control: { clearable: true },
        // 单条规则直接透传到 NFormItem 的 rule
        formItem: {
          form: {
            rule: {
              trigger: ['change', 'blur', 'input'],
              validator: async (_r, value) => {
                const v = String(value ?? '').trim()
                // required 由 NaiveCrudForm 自动处理（基于 field.required）
                if (!v)
                  return
                if (v.length < 2)
                  throw new Error('名称至少 2 个字符')
              },
            },
          },
        },
      },
    },
    {
      key: 'status',
      label: () => '状态',
      type: 'select',
      required: true,
      dictKey: 'status',
      visibleIn: { search: true, table: true, form: true },
      ui: { control: { clearable: true } },
    },
    {
      key: 'category',
      label: () => '分类',
      type: 'select',
      dictKey: 'category',
      visibleIn: { search: true, table: true, form: true },
      ui: { control: { clearable: true } },
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
        control: { min: 0, step: 1, placeholder: '请输入金额' },
      },
    },
    {
      key: 'createdAt',
      label: () => '创建时间',
      type: 'datetime',
      visibleIn: { search: true, table: true, form: false },
      ui: {
        control: { clearable: true },
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
        control: { autosize: { minRows: 2, maxRows: 6 }, placeholder: '可选填写' },
      },
    },
  ])
}

export function createDemoColumns(fields: readonly NaiveCrudField<DemoRow, DemoRow>[]) {
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
