export const ATTRIBUTE_VALUE_ABBREVIATIONS: Record<string, string> = {
  large: 'L',
  medium: 'M',
  small: 'S',
  'extra large': 'XL',
  'extra small': 'XS',
}

export const normalizeAttributeName = (value: string) => value.trim().toLowerCase()

export const isNumericAttributeValue = (value: string) => /^[\d\s.,/-]+$/.test(value.trim())

export const formatAttributeValue = (value: string) => {
  if (isNumericAttributeValue(value)) {
    return value.trim()
  }

  return ATTRIBUTE_VALUE_ABBREVIATIONS[normalizeAttributeName(value)] || value.trim()
}

export const formatCompactAttributeValue = (value: string) => {
  if (isNumericAttributeValue(value)) {
    return value.trim()
  }

  const formattedValue = formatAttributeValue(value)

  if (formattedValue !== value.trim()) {
    return formattedValue
  }

  const words = value.trim().match(/[A-Za-z0-9]+/g) || []

  if (words.length > 1) {
    return words.map((word) => word.charAt(0).toUpperCase()).join('')
  }

  return value.trim().charAt(0).toUpperCase()
}
