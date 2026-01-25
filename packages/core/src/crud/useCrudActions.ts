import type {
  CrudAction,
  CrudActionArea,
  UseCrudActionsReturn,
} from './models'
import { ref } from 'vue'

export function useCrudActions<Row = any>(): UseCrudActionsReturn<Row> {
  const actions = ref<CrudAction<Row>[]>([])

  function register(action: CrudAction<Row>): void {
    actions.value = actions.value.concat(action)
  }

  function list(area?: CrudActionArea): CrudAction<Row>[] {
    const current = actions.value
    const filtered = area ? current.filter(item => item.area === area) : current
    return filtered.slice().sort((a, b) => {
      const ao = a.order ?? 0
      const bo = b.order ?? 0
      return ao - bo
    })
  }

  return {
    actions,
    register,
    list,
  }
}
