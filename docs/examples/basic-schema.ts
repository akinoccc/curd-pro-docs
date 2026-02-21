import type { SelectOption } from 'naive-ui'
import type { DemoRow } from './basic-types'
import { cellDateTime, cellEnumTag, cellMoney, defineColumns, defineFields } from '@fcurd/naive-ui'

const statusOptions: SelectOption[] = [
  { label: '草稿', value: 'draft' },
  { label: '启用', value: 'enabled' },
  { label: '禁用', value: 'disabled' },
]

export const demoFields = defineFields<DemoRow>([
  {
    key: 'name',
    label: '名称',
    type: 'text',
    required: true,
    visibleIn: { searchForm: true, table: true, editForm: true },
    ui: {
      controlProps: { placeholder: '输入名称' },
      overrides: {
        editForm: { controlProps: { clearable: true } },
        searchForm: { controlProps: { clearable: true } },
      },
    },
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    required: true,
    visibleIn: { searchForm: true, table: true, editForm: true },
    ui: {
      options: statusOptions,
      controlProps: { options: statusOptions, clearable: true },
    },
  },
  {
    key: 'amount',
    label: '金额',
    type: 'money',
    required: true,
    visibleIn: { searchForm: false, table: true, editForm: true },
    ui: {
      controlProps: { min: 0, step: 1, placeholder: '输入金额' },
    },
  },
  {
    key: 'createdAt',
    label: '创建时间',
    type: 'datetime',
    visibleIn: { searchForm: false, table: true, editForm: false },
  },
])

export const demoColumns = defineColumns<DemoRow>([
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
  {
    key: 'amount',
    label: '金额',
    width: 140,
    render: cellMoney({ currency: 'CNY' }),
  },
  {
    key: 'createdAt',
    label: '创建时间',
    width: 200,
    render: cellDateTime(),
  },
])
