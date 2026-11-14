export type ItemAttributeKey = 'Talla' | 'Color'

export interface ItemAttributeOption {
  label: string
  value: string
  abbr: string | null
}

export type ItemAttributeGroups = Record<ItemAttributeKey, ItemAttributeOption[]>
