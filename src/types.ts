export type Transaction = {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  description: string
  date: Date
  tags: string[]
  category: {
    id: string
    name: string
  }
}
