import type { CrudColumn } from '@uozi/vito-core'
import type { NaiveCrudField } from '@uozi/vito-naive-ui'
import type { SelectOption } from 'naive-ui'
import type { DemoRow } from './memory-crud'
import { cellBooleanTag, cellEnumTag, cellMoney, defineColumns, defineFields } from '@uozi/vito-naive-ui'

const statusOptions: SelectOption[] = [
  { label: '草稿', value: 'draft' },
  { label: '启用', value: 'enabled' },
  { label: '禁用', value: 'disabled' },
]

const categoryOptions: SelectOption[] = [
  { label: '分类 A', value: 'A' },
  { label: '分类 B', value: 'B' },
  { label: '分类 C', value: 'C' },
]

export function createDemoFields(): NaiveCrudField<DemoRow>[] {
  return defineFields([
    {
      key: 'name',
      label: '名称',
      type: 'text',
      required: true,
      visibleIn: { searchForm: true, table: true, editForm: true },
      ui: {
        overrides: {
          editForm: {
            formItem: {
              rule: {
                trigger: ['change', 'blur', 'input'],
                validator: async (_r: any, value: any) => {
                  const v = String(value ?? '').trim()
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
    },
    {
      key: 'status',
      label: '状态',
      type: 'select',
      required: true,
      visibleIn: { searchForm: true, table: true, editForm: true },
      ui: { formControl: { clearable: true, options: statusOptions } },
    },
    {
      key: 'category',
      label: '分类',
      type: 'select',
      visibleIn: { searchForm: true, table: true, editForm: true },
      ui: { formControl: { clearable: true, options: categoryOptions } },
    },
    {
      key: 'enabled',
      label: '启用',
      type: 'switch',
      visibleIn: { searchForm: true, table: true, editForm: true },
    },
    {
      key: 'amount',
      label: '金额',
      type: 'number',
      required: true,
      visibleIn: { searchForm: false, table: true, editForm: true },
      ui: {
        formControl: { min: 0, step: 1, placeholder: '请输入金额' },
      },
    },
    {
      key: 'createdAt',
      label: '创建时间',
      type: 'datetimeRange',
      visibleIn: { searchForm: true, table: true, editForm: false },
      ui: {
        formControl: { clearable: true },
      },
    },
    {
      key: 'remark',
      label: '备注（仅禁用时出现）',
      type: 'textarea',
      visibleIn: {
        searchForm: false,
        table: false,
        editForm(ctx) {
          return ctx.formModel?.status === 'disabled'
        },
      },
      ui: {
        formControl: { autosize: { minRows: 2, maxRows: 6 }, placeholder: '可选填写' },
      },
    },
  ])
}

export function createDemoColumns(): CrudColumn<DemoRow>[] {
  return defineColumns([
    { key: 'name', label: '名称', sortable: true, width: 220 },
    {
      key: 'status',
      label: '状态',
      width: 120,
      render: cellEnumTag({
        options: statusOptions,
        typeMap: { draft: 'warning', enabled: 'success', disabled: 'error' },
      }),
    },
    { key: 'category', label: '分类', width: 120 },
    {
      key: 'enabled',
      label: '启用',
      width: 90,
      render: cellBooleanTag({ trueText: '启用', falseText: '关闭' }),
    },
    { key: 'createdAt', label: '创建时间', width: 220 },
    {
      key: 'amount',
      label: '金额',
      width: 120,
      render: cellMoney({ currency: 'CNY' }),
    },
  ])
}
