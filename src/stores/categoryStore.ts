import { defineStore } from 'pinia'
import type { Category } from '@/types/Category'
import siteConfig from '@/config'

const BASE_URL = siteConfig.apiBaseUrl;

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [] as Category[],
  }),
  actions: {
    async loadCategories() {
      const response = await fetch(BASE_URL + '/api/method/gr_tools.www.products.get_categories')
      const data = await response.json()

      if (!data.message) {
        console.warn('No products found!')
        return
      }

      this.categories = data.message
    },
  },
})
