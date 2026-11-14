import type { Product, ProductVariant } from '@/features/catalog/types/Product'
import { normalizeAttributeName } from './attributeFormatting'

export const getVariantAttribute = (variant: ProductVariant, name: string) =>
  Object.entries(variant.attributes).find(([key]) => normalizeAttributeName(key) === normalizeAttributeName(name))?.[1] || null

export const variantMatchesSelection = (variant: ProductVariant, selection: Record<string, string>) =>
  Object.entries(selection).every(([name, value]) => !value || getVariantAttribute(variant, name) === value)

export const getAttributeGroups = (product: Product) =>
  Object.entries(product.available_attributes).filter(([, values]) => values.length > 0)
    .map(([name, values]) => ({ name, values }))
    .sort((a, b) => {
      const priority = (name: string) => normalizeAttributeName(name) === 'color' ? 0 : normalizeAttributeName(name) === 'talla' ? 1 : 2
      return priority(a.name) - priority(b.name)
    })
