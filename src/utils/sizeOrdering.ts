const KNOWN_SIZE_ORDER: Record<string, number> = {
  'extra extra small': 0,
  xxs: 0,
  'extra small': 1,
  xs: 1,
  small: 2,
  s: 2,
  medium: 3,
  m: 3,
  large: 4,
  l: 4,
  'extra large': 5,
  xl: 5,
  'extra extra large': 6,
  xxl: 6,
  '2xl': 6,
  '3xl': 7,
  xxxl: 7,
}

export const normalizeComparableText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')

export const isNumericSizeValue = (value: string) => /^[\d\s.,/-]+$/.test(value.trim())

const getKnownSizeOrder = (value: string) => KNOWN_SIZE_ORDER[normalizeComparableText(value)]

const getNumericSizeValue = (value: string) => {
  const normalizedValue = value.trim().replace(',', '.')
  const parsedValue = Number.parseFloat(normalizedValue)

  return Number.isFinite(parsedValue) ? parsedValue : null
}

const compareNaturalText = (firstValue: string, secondValue: string) =>
  firstValue.localeCompare(secondValue, undefined, {
    numeric: true,
    sensitivity: 'base',
  })

export const compareSizeValues = (firstValue: string, secondValue: string) => {
  const firstNumeric = isNumericSizeValue(firstValue)
  const secondNumeric = isNumericSizeValue(secondValue)

  if (firstNumeric && secondNumeric) {
    const firstNumber = getNumericSizeValue(firstValue)
    const secondNumber = getNumericSizeValue(secondValue)

    if (firstNumber !== null && secondNumber !== null && firstNumber !== secondNumber) {
      return firstNumber - secondNumber
    }

    return compareNaturalText(firstValue, secondValue)
  }

  if (firstNumeric) {
    return 1
  }

  if (secondNumeric) {
    return -1
  }

  const firstKnownOrder = getKnownSizeOrder(firstValue)
  const secondKnownOrder = getKnownSizeOrder(secondValue)

  if (firstKnownOrder !== undefined && secondKnownOrder !== undefined) {
    return firstKnownOrder - secondKnownOrder
  }

  if (firstKnownOrder !== undefined) {
    return -1
  }

  if (secondKnownOrder !== undefined) {
    return 1
  }

  return compareNaturalText(firstValue, secondValue)
}

export const sortSizeValues = (values: string[]) => [...values].sort(compareSizeValues)
