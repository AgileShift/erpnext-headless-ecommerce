import { defineStore } from 'pinia'
import type { Product } from '@/types/product'

const BASE_URL = 'https://erp.clothingcenterni.com';
// const BASE_URL = 'http://localhost:8000';

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
      return {
        ...item,
        image: item.image ? item.image.startsWith('/') ? BASE_URL + item.image : item.image : 'https://dummyimage.com/300x400/000/fff&text=Clothing+Center',
        discount_percent: item.price.discount_percent ? `${Math.round(item.price.discount_percent)}%` : null
      }
    },

    async loadProducts(category: string | null = null, page: number = 1) {
      this.loading = true
      const start = (page - 1) * this.limit

      let url = `${BASE_URL}/api/method/gr_tools.www.products.get_products?start=${start}&limit=${this.limit}`
      url += category ? `&category=${category}` : ''

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

      const response = await fetch(`${BASE_URL}/api/method/gr_tools.www.products.get_products?item_code=${itemCode}`)
      const data = await response.json()

      if (!data || !data.message) {
        console.warn(`Product with item_code ${itemCode} not found!`)
        this.currentProduct = null
        return
      }

      this.currentProduct = this.formatProduct(data.message[0])
      this.loading = false
    },
  },
})
