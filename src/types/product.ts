export interface Product {
  item_code: string
  item_name: string
  item_group: string
  image: string
  price: {
    price_list_rate: number // 35.00
    formatted_price: string // "$ 35.00"

    local_price_list_rate: number // 35.00 * exchange_rate
    local_formatted_price: string // "C$ 35.00"

    formatted_mrp?: string | null
    discount_percent?: string | null
    formatted_discount_percent?: string | null
  }
}
