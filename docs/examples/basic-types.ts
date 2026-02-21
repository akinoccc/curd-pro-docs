export interface DemoRow {
  id: number
  name: string
  status: 'draft' | 'enabled' | 'disabled'
  amount: number
  createdAt: number
}

export interface DemoQuery {
  search?: {
    name?: string | null
    status?: DemoRow['status'] | null
  }
}
