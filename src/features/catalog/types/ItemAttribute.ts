export type ItemAttributeKey = 'Talla' | 'Color'

export interface ItemAttributeOption {
  value: string
  abbr: string | null
}

export type ItemAttributeGroups = Record<ItemAttributeKey, ItemAttributeOption[]>
