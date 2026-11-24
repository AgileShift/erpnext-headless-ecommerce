import type { Product, ProductVariant } from '@/features/catalog/types/Product'

export const getVariantAttribute = (variant: ProductVariant, name: string) =>
  Object.prototype.hasOwnProperty.call(variant.attributes, name) ? variant.attributes[name] : null

export const variantMatchesSelection = (variant: ProductVariant, selection: Record<string, string>) =>
  Object.entries(selection).every(([name, value]) => !value || getVariantAttribute(variant, name) === value)

export const getAttributeGroups = (product: Product) =>
  Object.entries(product.available_attributes).filter(([, values]) => values.length > 0)
    .map(([name, values]) => ({ name, values }))
    .sort((a, b) => {
      const priority = (name: string) => name === 'Color' ? 0 : name === 'Talla' ? 1 : 2
      return priority(a.name) - priority(b.name)
    })
