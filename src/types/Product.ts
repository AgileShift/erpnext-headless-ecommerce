export interface ProductPrice {
  price_list_rate: number
  currency?: string
  currency_symbol?: string
  formatted_price: string
  formatted_price_sales_uom?: string

  local_price_list_rate: number
  local_formatted_price: string

  formatted_mrp?: string | null
  discount_percent?: number | null
  formatted_discount_percent?: string | null
}

export interface ProductPriceSummary {
  type: 'single' | 'range' | string
  min_price: number
  max_price: number
  formatted_price: string
  local_formatted_price: string
}

export type ProductVariantAttributes = Record<string, string>

export type ProductAvailableAttributes = Record<string, string[]>

export interface ProductVariant {
  item_code: string
  item_name: string
  item_group: string
  image: string
  variant_of: string
  actual_qty: number
  attributes: ProductVariantAttributes
  price: ProductPrice
}

export interface Product {
  catalog_key: string
  item_code: string
  item_name: string
  item_group: string
  image: string
  price_summary: ProductPriceSummary
  variants: ProductVariant[]
  available_attributes: ProductAvailableAttributes
  actual_qty: number
  price: ProductPrice
}
