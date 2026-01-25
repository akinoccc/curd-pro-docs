import type { CrudConfig } from '../config/symbols'
import type {
  CrudAction,
  CrudAdapter,
  CrudExportResult,
  CrudSort,
  UseCrudActionsReturn,
  UseCrudReturn,
} from '../crud/models'
import type { CrudUiDriver } from '../ui/ui-driver'

export interface CreateCrudPresetActionsOptions<
  Row = any,
  RowId extends string | number = string | number,
  Query extends Record<string, any> = Record<string, any>,
  CreateInput = Partial<Row>,
  UpdateInput = Partial<Row>,
  SortField extends string = string,
> {
  adapter: CrudAdapter<Row, RowId, Query, CreateInput, UpdateInput, SortField>
  crud: UseCrudReturn<Row, Query, SortField>

  /**
   * 触发“创建/编辑”的 UI 行为由上层决定（core 不关心 modal/drawer/route）。
   */
  openCreate: () => void
  openEdit: (row: Row) => void

  disableAdd?: boolean
  disableEdit?: boolean
  disableDelete?: boolean
  disableExport?: boolean

  /**
   * 当内部默认 action 执行失败时的错误出口（推荐接到 UI toast/notification）
   */
  onError?: (error: unknown) => void

  /**
   * export 执行成功后的结果交由上层处理（下载/打开链接/提示等）
   */
  onExportResult?: (result: CrudExportResult) => void | Promise<void>

  /**
   * 可选：UI driver（用于处理 export 下载等 UI 行为）
   */
  uiDriver?: CrudUiDriver

  /**
   * 可选：全局配置（来自 CrudConfigProvider）
   */
  config?: CrudConfig

  /**
   * 用户自定义 actions（数组或 registry）。同 id 会覆盖默认 action。
   */
  actions?: CrudAction<Row>[] | UseCrudActionsReturn<Row>
}

function isActionRegistry(value: any): value is UseCrudActionsReturn<any> {
  return Boolean(value && typeof value === 'object' && typeof value.list === 'function')
}

function normalizeActions<Row = any>(actions?: CrudAction<Row>[] | UseCrudActionsReturn<Row>): CrudAction<Row>[] {
  if (!actions)
    return []
  if (Array.isArray(actions))
    return actions as CrudAction<Row>[]
  if (isActionRegistry(actions))
    return actions.list() as CrudAction<Row>[]
  return []
}

/**
 * 生成一组“可用即开箱”的默认 actions，并与用户 actions 合并（同 id 覆盖）。
 *
 * 说明：
 * - 不考虑兼容性：默认动作与行为以“好用”为第一优先级。
 * - UI 行为（弹窗/抽屉/下载）交由上层/driver 实现。
 */
export function createCrudPresetActions<
  Row = any,
  RowId extends string | number = string | number,
  Query extends Record<string, any> = Record<string, any>,
  CreateInput = Partial<Row>,
  UpdateInput = Partial<Row>,
  SortField extends string = string,
>(
  options: CreateCrudPresetActionsOptions<Row, RowId, Query, CreateInput, UpdateInput, SortField>,
): CrudAction<Row>[] {
  const {
    adapter,
    crud,
    openCreate,
    openEdit,
    disableAdd,
    disableEdit,
    disableDelete,
    disableExport,
    onError,
    onExportResult,
    uiDriver,
    config,
  } = options

  const actionConfig = config?.actions

  const createLabel = actionConfig?.create.label ?? '新增'
  const createOrder = actionConfig?.create.order ?? 10
  const exportLabel = actionConfig?.export.label ?? '导出'
  const exportOrder = actionConfig?.export.order ?? 30
  const exportFilename = actionConfig?.export.defaultFilename ?? 'export'
  const editLabel = actionConfig?.edit.label ?? '编辑'
  const editOrder = actionConfig?.edit.order ?? 10
  const deleteLabel = actionConfig?.delete.label ?? '删除'
  const deleteOrder = actionConfig?.delete.order ?? 20
  const deleteConfirmContent = actionConfig?.delete.confirmContent ?? '确定要删除这条记录吗？'

  const defaults: CrudAction<Row>[] = []

  if (!disableAdd) {
    defaults.push({
      id: 'create',
      area: 'toolbar',
      label: createLabel,
      type: 'primary',
      order: createOrder,
      onClick: () => openCreate(),
    })
  }

  if (!disableExport && adapter.export) {
    defaults.push({
      id: 'export',
      area: 'toolbar',
      label: exportLabel,
      type: 'default',
      order: exportOrder,
      onClick: async () => {
        try {
          const result = await adapter.export?.({
            query: crud.query.value as Query,
            sort: crud.sort.value as CrudSort<SortField> | null,
          })
          if (!result)
            return
          if (onExportResult) {
            await onExportResult(result as CrudExportResult)
            return
          }
          if (uiDriver?.handleExportResult) {
            await uiDriver.handleExportResult(result as CrudExportResult, { filename: exportFilename })
          }
        }
        catch (err) {
          onError?.(err)
        }
      },
    })
  }

  if (!disableEdit) {
    defaults.push({
      id: 'edit',
      area: 'row:after',
      label: editLabel,
      type: 'tertiary',
      order: editOrder,
      visible: ctx => Boolean(ctx.row),
      onClick: (ctx) => {
        if (ctx.row)
          openEdit(ctx.row)
      },
    })
  }

  if (!disableDelete && adapter.remove) {
    defaults.push({
      id: 'delete',
      area: 'row:after',
      label: deleteLabel,
      type: 'error',
      order: deleteOrder,
      confirm: { content: deleteConfirmContent },
      visible: ctx => Boolean(ctx.row),
      onClick: async (ctx) => {
        try {
          const row = ctx.row
          if (!row)
            return
          const getId = adapter.getId ?? ((r: any) => r?.id as RowId)
          const id = getId(row)
          await adapter.remove?.(id)
          await crud.refresh()
        }
        catch (err) {
          onError?.(err)
        }
      },
    })
  }

  const userList = normalizeActions(options.actions)

  // merge by id: 用户 actions 覆盖默认 actions（同 id）
  const byId = new Map<string, CrudAction<Row>>()
  for (const action of defaults)
    byId.set(action.id, action)
  for (const action of userList)
    byId.set(action.id, action)

  return Array.from(byId.values())
}
