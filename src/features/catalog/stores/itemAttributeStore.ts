import { defineStore } from 'pinia'
import { callFrappeMethod } from '@/shared/api/frappe'
import type {
  ItemAttributeGroups,
  ItemAttributeKey,
  ItemAttributeOption,
} from '@/features/catalog/types/ItemAttribute'

const fetchOptions = async (attribute: ItemAttributeKey) => {
  const options = await callFrappeMethod<ItemAttributeOption[]>(
    'grupo_real_tools.ecommerce.api.item_attribute.get_item_attributes',
    { attribute },
  )
  if (!Array.isArray(options)) throw new Error('No se pudieron cargar las tallas y colores')
  return options
}

export const useItemAttributeStore = defineStore('itemAttribute', {
  state: () => ({
    attributes: { Talla: [], Color: [] } as ItemAttributeGroups,
    loading: false,
    loaded: false,
    error: null as string | null,
  }),
  getters: {
    sizes: (state) => state.attributes.Talla,
    colors: (state) => state.attributes.Color,
  },
  actions: {
    async loadItemAttributes() {
      if (this.loading || this.loaded) return

      this.loading = true
      this.error = null
      try {
        const [sizes, colors] = await Promise.all([fetchOptions('Talla'), fetchOptions('Color')])
        this.attributes = { Talla: sizes, Color: colors }
        this.loaded = true
      } catch (error) {
        this.error = 'No se pudieron cargar las tallas y colores'
        console.error(this.error, error)
      } finally {
        this.loading = false
      }
    },
  },
})
