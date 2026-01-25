<script setup lang="ts">
import type {
  CrudAction,
  CrudActionArea,
  CrudActionContext,
  UseCrudActionsReturn,
} from '../crud/models'
import { computed, defineComponent, h } from 'vue'
import { useCrudContext } from '../context/useCrudContext'

interface CrudActionButtonsRendererProps<Row = any> {
  actions?: CrudAction<Row>[] | UseCrudActionsReturn<Row>
  area?: CrudActionArea
  row?: Row
}

const props = defineProps<CrudActionButtonsRendererProps<any>>()

const ctx = useCrudContext<any>()

function isActionRegistry(value: any): value is UseCrudActionsReturn<any> {
  return Boolean(value && typeof value === 'object' && typeof value.list === 'function')
}

const actionsSource = computed(() => props.actions ?? ctx.actions)

const actionContext = computed<CrudActionContext<any>>(() => {
  return {
    row: props.row,
    selectedRows: ctx.selectedRows.value as any[],
    query: (ctx.crud?.query.value ?? {}) as Record<string, any>,
    extra: ctx.extra,
  }
})

const effectiveActions = computed<CrudAction<any>[]>(() => {
  const source = actionsSource.value
  const area = props.area
  const list: CrudAction<any>[] = isActionRegistry(source)
    ? source.list(area)
    : Array.isArray(source)
      ? (area ? source.filter(a => a.area === area) : source)
      : []

  const currentCtx = actionContext.value
  return list.filter((action) => {
    if (typeof action.visible === 'function')
      return Boolean(action.visible(currentCtx))
    return true
  })
})

function getConfirmContent(action: CrudAction<any>): string {
  if (!action.confirm)
    return ''
  if (action.confirm === true)
    return '确定要执行此操作吗？'
  return action.confirm.content ?? '确定要执行此操作吗？'
}

async function confirmIfNeeded(action: CrudAction<any>, currentCtx: CrudActionContext<any>): Promise<boolean> {
  if (!action.confirm)
    return true

  const driver = ctx.uiDriver
  if (driver?.confirmAction) {
    try {
      const result = await driver.confirmAction({ action, ctx: currentCtx })
      return Boolean(result)
    }
    catch {
      return false
    }
  }

  if (typeof window === 'undefined')
    return false
  return window.confirm(getConfirmContent(action))
}

async function runAction(action: CrudAction<any>): Promise<void> {
  const currentCtx = actionContext.value
  const disabled = action.disabled?.(currentCtx) ?? false
  if (disabled)
    return

  const ok = await confirmIfNeeded(action, currentCtx)
  if (!ok)
    return

  await action.onClick(currentCtx)
}

const ActionItem = defineComponent({
  name: 'CrudActionButtonItem',
  props: {
    action: { type: Object as any, required: true },
  },
  setup(p: any) {
    return () => {
      const action = p.action as CrudAction<any>
      const currentCtx = actionContext.value
      const disabled = action.disabled?.(currentCtx) ?? false

      // UI driver renders it
      if (ctx.uiDriver?.renderAction) {
        return ctx.uiDriver.renderAction({
          action,
          ctx: currentCtx,
          disabled,
          run: () => {
            void runAction(action)
          },
        } as any)
      }

      // fallback: minimal native button
      return h(
        'button',
        {
          type: 'button',
          disabled,
          onClick: () => {
            void runAction(action)
          },
        },
        action.label ?? action.id,
      )
    }
  },
})
</script>

<template>
  <slot
    :actions="effectiveActions"
    :ctx="actionContext"
    :run="runAction"
  >
    <template
      v-for="action in effectiveActions"
      :key="action.id"
    >
      <ActionItem :action="action" />
    </template>
  </slot>
</template>


