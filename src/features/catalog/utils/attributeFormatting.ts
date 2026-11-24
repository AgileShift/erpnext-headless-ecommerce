import siteConfig from '@/config'
import type { ProductVariant } from '@/features/catalog/types/Product'

export const formatAttributeDisplayValue = (
  name: string,
  value: string,
  abbreviation?: string | null,
) => siteConfig.catalog.attributeDisplay[name] === 'abbr' ? abbreviation || value : value

export const formatVariantAttributeLabel = (
  variants: ProductVariant[],
  name: string,
  value: string,
) => {
  const variant = variants.find((entry) =>
    entry.attributes[name] === value && entry.attributeAbbreviations?.[name],
  )
  return formatAttributeDisplayValue(name, value, variant?.attributeAbbreviations?.[name])
}
