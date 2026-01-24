import type { DictApi, DictItem } from '@fcurd/core'

const dicts: Record<string, DictItem[]> = {
  status: [
    { label: '草稿', value: 'draft' },
    { label: '启用', value: 'enabled' },
    { label: '禁用', value: 'disabled' },
  ],
  category: [
    { label: 'A 类', value: 'A' },
    { label: 'B 类', value: 'B' },
    { label: 'C 类', value: 'C' },
  ],
  role: [
    { label: '管理员', value: 'admin' },
    { label: '运营', value: 'ops' },
    { label: '访客', value: 'guest' },
  ],
}

export function createMockDictApi(): DictApi {
  return {
    async getOptions(key: string): Promise<DictItem[]> {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 120))
      return dicts[key] ? dicts[key].slice() : []
    },
  }
}
