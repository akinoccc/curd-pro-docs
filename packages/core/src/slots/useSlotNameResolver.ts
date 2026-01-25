export interface SlotNameResolverOptions {
  /**
   * slot 前缀，例如：field / cell
   */
  prefix: string
  /**
   * key，例如：name
   */
  key: string
}

// NOTE:
// pnpm workspace 下可能出现多份 @vue/runtime-core 类型（版本细微差异），
// 导致 Slots 类型在不同包之间无法互相赋值。
// 这里用最小约束（any）避免类型污染，同时保持运行时行为稳定。
export function resolveSlotName(slots: any, options: SlotNameResolverOptions): string | null {
  if (!slots)
    return null
  const { prefix, key } = options
  const candidates = [
    `${prefix}-${key}`,
    `${prefix}_${key}`,
  ]
  for (const name of candidates) {
    if (slots[name])
      return name
  }
  return null
}
