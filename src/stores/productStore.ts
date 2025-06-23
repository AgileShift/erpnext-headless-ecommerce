import { defineStore } from 'pinia'
import type { Product } from '@/types/Product'
import siteConfig from '@/config'

const BASE_URL = siteConfig.apiBaseUrl;

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [] as Product[],
    currentProduct: null as Product | null,
    currentCategory: null as string | null,
    totalProducts: 0,
    currentPage: 1,
    limit: 15,
    loading: false
  }),

  actions: {
    formatProduct(item: any): Product {
      // Formatted Discount Percent and Discount Percent comes from API

      // When 'Formatted Discount Rate' comes from API. This fields are empty so auto-calculated here! -> TODO: MOVE TO API?
      if (item.price.formatted_discount_rate) {
        item.price.mrp = item.price.formatted_mrp.replace(/[^\d.]/g, "")
        item.price.discount_rate = item.price.formatted_discount_rate.replace(/[^\d.]/g, "")

        item.price.discount_percent = (item.price.discount_rate / item.price.mrp) * 100
      }

      return {
        ...item,
        image: item.image ? item.image.startsWith('/') ? BASE_URL + item.image : item.image : 'https://dummyimage.com/300x400/000/fff&text='+item.item_name,
        price: item.price ? {
         ...item.price,
          formatted_price: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(item.price.price_list_rate),
          local_formatted_price: new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO', maximumFractionDigits: 0 }).format(item.price.price_list_rate * 36.6243),
          formatted_discount_percent: item.price.discount_percent ? `${Math.round(item.price.discount_percent)}%` : null
        } : {
          local_formatted_price: 'No price available',
        },
      }
    },

    // discount_percent | formatted_discount_percent

    async loadProducts(category: string | boolean | null = null, sale: boolean = false, page: number = 1) {
      this.loading = true
      const start = (page - 1) * this.limit

      let url = `${BASE_URL}/api/method/gr_tools.www.products.get_products?start=${start}&limit=${this.limit}`
      url += category ? `&category=${category}` : ''
      url += sale ? `&sale=1` : ''

      const response = await fetch(url)
      const data = await response.json()

      if (!data.message) {
        console.warn('No products found!');
        this.products = []
        this.loading = false
        return
      }

      const products = data.message.map(this.formatProduct)
      if (page === 1) {
        this.products = products
      } else {
        this.products = [...this.products, ...products]
      }

      this.currentPage = page
      this.loading = false
    },

    async loadProduct(itemCode: string) {
      this.loading = true

      const response = await fetch(`${BASE_URL}/api/method/gr_tools.www.products.get_product?item_code=${itemCode}`)
      const data = await response.json()

      if (!data || data.message?.length === 0) {
        console.error(`Product with item_code ${itemCode} not found!`)
        this.currentProduct = null
        this.loading = false
        return
      }

      this.currentProduct = this.formatProduct(data.message)
      this.loading = false
    },
  },
})
