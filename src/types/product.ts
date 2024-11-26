export interface Product {
  item_code: string
  item_name: string
  item_group: string
  image: string | null
  discount_percent?: string | null
  price: {
    formatted_price: number
    formatted_mrp?: number
  }
}
