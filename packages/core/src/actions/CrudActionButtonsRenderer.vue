<script setup lang="ts">
import type {
  CrudAction,
  CrudActionArea,
  CrudActionContext,
} from '../crud/models'
import { computed, defineComponent, h } from 'vue'
import { useCrudContext } from '../context/useCrudContext'
import { useCrudActionRunner } from './useCrudActionRunner'

interface CrudActionButtonsRendererProps<Row = any> {
  actions?: CrudAction<Row>[]
  area?: CrudActionArea
  row?: Row
}

const props = defineProps<CrudActionButtonsRendererProps<any>>()

const ctx = useCrudContext<any>()

const actionsSource = computed(() => props.actions ?? ctx.actions)

const actionContext = computed<CrudActionContext<any>>(() => {
  return {
    row: props.row,
    selectedRows: ctx.selectedRows.value as any[],
    selectedIds: ctx.selectedIds.value as any[],
    clearSelection: (ctx as any).clearSelection,
    query: (ctx.crud?.query.value ?? {}) as Record<string, any>,
    extra: ctx.extra,
  }
})

const { actions: effectiveActions, run } = useCrudActionRunner<any>({
  actions: actionsSource as any,
  area: props.area,
  ctx: actionContext as any,
  uiDriver: ctx.uiDriver,
  onError: (err) => {
    // Prefer app-level handler if provided via ctx.extra.
    const extra: any = ctx.extra ?? {}
    if (typeof extra.onError === 'function')
      extra.onError(err)
    else
      console.error(err)
  },
})

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
            void run(action)
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
            void run(action)
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
    :run="run"
  >
    <template
      v-for="(action, index) in effectiveActions"
      :key="action?.id ?? index"
    >
      <ActionItem
        v-if="action"
        :action="action"
      />
    </template>
  </slot>
</template>
