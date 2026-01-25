import type { CrudField, CrudSort, CrudSurface, CrudTableColumn } from '@fcurd/core'
import type { Component, VNodeChild } from 'vue'

export interface CrudControlResolveResult {
  component?: Component | any
  /**
   * 是否把 field 作为 prop 传给控件组件
   * - 默认 false：避免被当作 attrs 透传到底层三方组件
   * - 自定义控件需要字段元信息时再开启
   */
  passField?: boolean
  /**
   * 透传给控件组件的 props
   */
  controlProps?: Record<string, any>
}

export interface CrudResolveControlOptions<Row = any, FormModel = any> {
  surface: CrudSurface
  field: CrudField<Row, FormModel, any>
  row?: Row
  formModel?: FormModel
  /**
   * UI 侧的默认控件映射（例如 Naive 的 controlMap）
   */
  controlMap?: Record<string, Component | any>
}

export interface CrudFormItemResolveResult {
  /**
   * 透传给 form-item 容器的 props（例如 Naive NFormItem）
   */
  formItemProps?: Record<string, any>
}

export interface CrudResolveFormItemOptions<Row = any, FormModel = any> {
  surface: CrudSurface
  field: CrudField<Row, FormModel, any>
}

export interface CrudResolveTableColumnOptions<Row = any> {
  column: CrudTableColumn<Row>
  /**
   * UI slot（例如 Naive 的 cell-xxx）
   */
  slots?: any
}

export interface CrudUiDriver {
  /**
   * 解析控件组件与 props 策略
   */
  resolveControl?: (options: CrudResolveControlOptions) => CrudControlResolveResult
  /**
   * 解析 form-item 容器 props
   */
  resolveFormItem?: (options: CrudResolveFormItemOptions) => CrudFormItemResolveResult
  /**
   * 可选：把通用表格列映射为 UI 组件列结构
   * - Naive：CrudTableColumn -> DataTableColumn
   */
  mapTableColumns?: <Row = any>(options: {
    columns: readonly CrudTableColumn<Row>[]
    sort?: CrudSort | null
    showSelection?: boolean
    showActionsColumn?: boolean
    selection?: { value: Set<string | number> }
    getId?: (row: any) => string | number
    renderActionsHeader?: () => VNodeChild
    renderRowActions?: (row: any) => VNodeChild
    renderCell: (args: {
      column: CrudTableColumn<Row>
      row: any
      rowIndex: number
      value: any
      fallback: () => VNodeChild
    }) => VNodeChild
  }) => any[]

  /**
   * 可选：把 UI 表格 sorter 事件解码为 CrudSort（用于 crud.setSort）
   * - Naive NDataTable: sorter = { columnKey, order } | null
   */
  decodeTableSorter?: (payload: any) => CrudSort | null
}
