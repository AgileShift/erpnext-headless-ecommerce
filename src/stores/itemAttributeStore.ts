import { defineStore } from 'pinia'
import siteConfig from '@/config'
import type {
  ItemAttributeGroups,
  ItemAttributeKey,
  ItemAttributeOption,
} from '@/types/ItemAttribute'

const BASE_URL = siteConfig.apiBaseUrl

const ATTRIBUTE_ALIASES: Record<string, ItemAttributeKey> = {
  talla: 'Talla',
  size: 'Talla',
  color: 'Color',
}

const createEmptyAttributes = (): ItemAttributeGroups => ({
  Talla: [],
  Color: [],
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const normalizeAttributeKey = (value: unknown): ItemAttributeKey | null => {
  if (typeof value !== 'string') {
    return null
  }

  return ATTRIBUTE_ALIASES[value.trim().toLowerCase()] || null
}

const toAttributeOption = (value: unknown): ItemAttributeOption | null => {
  if (typeof value === 'string') {
    return {
      label: value,
      value,
      abbr: null,
    }
  }

  if (!isRecord(value)) {
    return null
  }

  const rawValue = value.value || value.attribute_value || value.label || value.name

  if (typeof rawValue !== 'string' || rawValue.trim().length === 0) {
    return null
  }

  const label =
    typeof value.label === 'string' && value.label.trim().length > 0 ? value.label : rawValue
  const abbr = typeof value.abbr === 'string' && value.abbr.trim().length > 0 ? value.abbr : null

  return {
    label,
    value: rawValue,
    abbr,
  }
}

const isAttributeOption = (option: ItemAttributeOption | null): option is ItemAttributeOption =>
  option !== null

const uniqueOptions = (options: ItemAttributeOption[]) => {
  const seen = new Set<string>()

  return options.filter((option) => {
    const key = option.value.toLowerCase()

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

const normalizeAttributes = (message: unknown): ItemAttributeGroups => {
  const attributes = createEmptyAttributes()

  if (Array.isArray(message)) {
    message.forEach((row) => {
      if (!isRecord(row)) {
        return
      }

      const key = normalizeAttributeKey(row.attribute || row.parent || row.attribute_name)
      const option = toAttributeOption(row)

      if (key && option) {
        attributes[key].push(option)
      }
    })

    attributes.Talla = uniqueOptions(attributes.Talla)
    attributes.Color = uniqueOptions(attributes.Color)

    return attributes
  }

  if (!isRecord(message)) {
    return attributes
  }

  Object.entries(message).forEach(([attributeName, rawOptions]) => {
    const key = normalizeAttributeKey(attributeName)

    if (!key) {
      return
    }

    const options = Array.isArray(rawOptions) ? rawOptions : [rawOptions]
    attributes[key] = uniqueOptions(options.map(toAttributeOption).filter(isAttributeOption))
  })

  return attributes
}

export const useItemAttributeStore = defineStore('itemAttribute', {
  state: () => ({
    attributes: createEmptyAttributes(),
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
      if (this.loading || this.loaded) {
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await fetch(
          BASE_URL + '/api/method/gr_tools.www.categories.get_item_attributes',
        )
        const data = await response.json()
        const attributes = normalizeAttributes(data.message)

        if (attributes.Talla.length === 0 && attributes.Color.length === 0) {
          this.error = 'No se pudieron cargar las tallas y colores'
          console.warn(this.error, data)
          return
        }

        this.attributes = attributes
        this.loaded = true
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'No se pudieron cargar las tallas y colores'
        console.error(this.error)
      } finally {
        this.loading = false
      }
    },
  },
})
