import { defineStore } from 'pinia'
import type { Category } from '@/types/Category'
import siteConfig from '@/config'

const BASE_URL = siteConfig.apiBaseUrl

export const ROOT_CATEGORY_NAME = 'All Item Groups'

const createRootCategory = (children: Category[] = []): Category => ({
  name: ROOT_CATEGORY_NAME,
  parent_item_group: null,
  is_group: true,
  children,
})

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categoryTree: createRootCategory(),
    loading: false,
    loaded: false,
    error: null as string | null,
  }),
  actions: {
    async loadCategories() {
      if (this.loading || this.loaded) {
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await fetch(BASE_URL + '/api/method/gr_tools.www.categories.get_item_groups')
        const data = await response.json()

        if (!Array.isArray(data.message)) {
          this.error = 'No se pudieron cargar las categorías'
          console.warn(this.error, data)
          return
        }

        this.categoryTree = createRootCategory(data.message as Category[])
        this.loaded = true
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'No se pudieron cargar las categorías'
        console.error(this.error)
      } finally {
        this.loading = false
      }
    },
  },
})
