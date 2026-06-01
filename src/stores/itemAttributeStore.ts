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

type ItemAttributeQueryValue =
  | string
  | number
  | boolean
  | Array<string | number | boolean>

type ItemAttributeQueryParams = Partial<Record<string, ItemAttributeQueryValue>>

const DEFAULT_ATTRIBUTES: ItemAttributeKey[] = ['Talla', 'Color']

const createEmptyAttributes = (): ItemAttributeGroups => ({
  Talla: [],
  Color: [],
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

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

const getRequestedAttributes = (params?: ItemAttributeQueryParams) => {
  if (!params) {
    return [...DEFAULT_ATTRIBUTES]
  }

  const requested = Object.entries(params)
    .filter(([, value]) =>
      Array.isArray(value)
        ? value.some((entry) => String(entry).trim().length > 0)
        : value === true || String(value).trim().length > 0,
    )
    .map(([key]) => normalizeAttributeKey(key))
    .filter((key): key is ItemAttributeKey => key !== null)

  return Array.from(new Set(requested))
}

const normalizeOptions = (message: unknown) =>
  Array.isArray(message)
    ? uniqueOptions(
        message
          .map(toAttributeOption)
          .filter((option): option is ItemAttributeOption => option !== null),
      )
    : []

export const useItemAttributeStore = defineStore('itemAttribute', {
  state: () => ({
    attributes: createEmptyAttributes(),
    loading: false,
    loaded: false,
    error: null as string | null,
    lastQueryKey: null as string | null,
  }),
  getters: {
    sizes: (state) => state.attributes.Talla,
    colors: (state) => state.attributes.Color,
  },
  actions: {
    async loadItemAttributes(params?: ItemAttributeQueryParams) {
      const requestedAttributes = getRequestedAttributes(params).sort()
      const queryKey = requestedAttributes.join('|') || 'none'

      if (this.loading || (this.loaded && this.lastQueryKey === queryKey)) {
        return this.attributes
      }

      this.loading = true
      this.error = null
      if (this.lastQueryKey !== queryKey) {
        this.loaded = false
      }

      try {
        const attributes = createEmptyAttributes()

        if (requestedAttributes.length === 0) {
          this.attributes = attributes
          this.loaded = true
          this.lastQueryKey = queryKey
          return attributes
        }

        const endpoint = BASE_URL + '/api/method/gr_tools.www.products.get_item_attributes'
        const responses = await Promise.all(
          requestedAttributes.map(async (attribute) => {
            const url = `${endpoint}?attribute=${encodeURIComponent(attribute)}`
            const response = await fetch(url)
            const data = await response.json()
            return normalizeOptions(data.message)
          }),
        )

        requestedAttributes.forEach((attribute, index) => {
          attributes[attribute] = responses[index] ?? []
        })

        const hasAny = requestedAttributes.some((attribute) => attributes[attribute].length > 0)
        if (!hasAny) {
          this.error = 'No se pudieron cargar las tallas y colores'
          console.warn(this.error, attributes)
          return null
        }

        this.attributes = attributes
        this.loaded = true
        this.lastQueryKey = queryKey
        return attributes
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'No se pudieron cargar las tallas y colores'
        console.error(this.error)
        return null
      } finally {
        this.loading = false
      }
    },
  },
})
