import { defineStore } from 'pinia'
import type { Category } from '@/features/catalog/types/Category'
import { callFrappeMethod } from '@/shared/api/frappe'

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
        const categories = await callFrappeMethod<unknown>(
          'grupo_real_tools.ecommerce.api.item_group.get_item_groups',
        )

        if (!Array.isArray(categories)) {
          this.error = 'No se pudieron cargar las categorías'
          console.warn(this.error, categories)
          return
        }

        this.categoryTree = createRootCategory(categories as Category[])
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
