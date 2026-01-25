import type {
  CrudAction,
  CrudActionContext,
  CrudExportResult,
  CrudField,
  CrudSort,
  CrudSurface,
  CrudTableColumn,
} from '@fcurd/core'
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

export interface CrudRenderActionOptions<Row = any> {
  action: CrudAction<Row>
  ctx: CrudActionContext<Row>
  disabled: boolean
  run: () => void
}

export interface CrudConfirmActionOptions<Row = any> {
  action: CrudAction<Row>
  ctx: CrudActionContext<Row>
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
    /**
     * selection 列的配置透传（不同 UI 框架可以自行解释）
     * - Naive: DataTableColumn(type='selection') 的配置，例如 multiple/disabled
     */
    selectionColumn?: Record<string, any>
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

  /**
   * 可选：统一渲染 action（按钮/链接/菜单项等），由 UI 适配层决定具体呈现。
   * - core 会负责 visible/disabled/confirm 的通用逻辑，并提供 `run()` 给 UI 层触发执行。
   */
  // NOTE:
  // pnpm workspace 下可能出现多份 @vue/runtime-core 类型（版本细微差异），
  // 导致 VNode/VNodeChild 在不同包之间无法互相赋值。
  // 这里用 any 避免类型污染，同时保持运行时行为稳定。
  renderAction?: <Row = any>(options: CrudRenderActionOptions<Row>) => any

  /**
   * 可选：执行前确认交互（用于替代 window.confirm）。
   * - 返回 true 表示确认继续执行；false 表示取消。
   */
  confirmAction?: <Row = any>(options: CrudConfirmActionOptions<Row>) => Promise<boolean> | boolean

  /**
   * 可选：处理 export 结果（下载/打开链接等 UI 行为）。
   * - core 不做任何 window/document 相关操作，把下载策略交给 UI driver。
   */
  handleExportResult?: (result: CrudExportResult, options?: { filename?: string }) => void | Promise<void>
}
