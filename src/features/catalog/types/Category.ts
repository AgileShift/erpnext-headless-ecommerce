export interface Category {
  name: string
  parent_item_group: string | null
  is_group: boolean
  children: Category[]
}
