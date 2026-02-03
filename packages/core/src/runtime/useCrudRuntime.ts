import type { CrudRuntime } from './types'
import { inject, provide } from 'vue'
import { CrudRuntimeSymbol } from '../context/symbols'

export function provideCrudRuntime(runtime: CrudRuntime<any, any, any, any, any, any>): void {
  provide(CrudRuntimeSymbol, runtime as any)
}

export function useCrudRuntime<Row = any>(): CrudRuntime<Row, any, any, any, any, any> {
  const runtime = inject(CrudRuntimeSymbol, undefined) as CrudRuntime<Row, any, any, any, any, any> | undefined
  if (!runtime)
    throw new Error('[fcurd] Missing CrudRuntime. Did you forget to wrap with <CrudProvider :runtime="..."> ?')
  return runtime
}
