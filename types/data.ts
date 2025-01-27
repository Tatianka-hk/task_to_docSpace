export interface DataItem {
  id: string
  name: string
  category: string
  value: number
  date: string
}

export type DataItemCreate = Omit<DataItem, "id">

