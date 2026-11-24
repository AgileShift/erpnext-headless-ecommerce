import { describe, expect, it } from 'vitest'
import { formatAttributeDisplayValue } from '@/features/catalog/utils/attributeFormatting'

describe('attribute display configuration', () => {
  it('uses values for colors and abbreviations for sizes', () => {
    expect(formatAttributeDisplayValue('Color', 'Negro', 'N')).toBe('Negro')
    expect(formatAttributeDisplayValue('Talla', 'Medium', 'M')).toBe('M')
    expect(formatAttributeDisplayValue('Talla', 'Extra Large')).toBe('Extra Large')
    expect(formatAttributeDisplayValue(' Talla', 'Medium', 'M')).toBe('Medium')
    expect(formatAttributeDisplayValue('Talla', '11')).toBe('11')
  })

  it('uses the full value for attributes without a configured display mode', () => {
    expect(formatAttributeDisplayValue('Material', 'Algodón', 'ALG')).toBe('Algodón')
  })
})
