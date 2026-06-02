import { defineStore } from 'pinia'
import type {
  Product,
  ProductPrice,
  ProductPriceSummary,
  ProductVariant,
  ProductVariantAttributes,
} from '@/types/Product'
import siteConfig from '@/config'
import { normalizeComparableText, sortSizeValues } from '@/utils/sizeOrdering'

const BASE_URL = siteConfig.apiBaseUrl
const SIZE_ATTRIBUTE_NAMES = new Set(['talla', 'size'])
const EXCHANGE_RATE = siteConfig.catalog.exchangeRate

const formatUsd = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount)

const formatNio = (amount: number) =>
  new Intl.NumberFormat('es-NI', {
    style: 'currency',
    currency: 'NIO',
    maximumFractionDigits: 0,
  }).format(amount)

const toText = (value: unknown, fallback = ''): string =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback

const isSizeAttribute = (attributeName: string) =>
  SIZE_ATTRIBUTE_NAMES.has(normalizeComparableText(attributeName))

const sortAttributeValues = (attributeName: string, values: string[]) => {
  if (!isSizeAttribute(attributeName)) {
    return values
  }

  return sortSizeValues(values)
}

const formatImage = (image: unknown, itemName: unknown) => {
  const imagePath = toText(image)

  if (!imagePath) {
    return 'https://dummyimage.com/300x400/000/fff&text=' + encodeURIComponent(toText(itemName))
  }

  return imagePath.startsWith('/') ? BASE_URL + imagePath : imagePath
}

const formatProductPrice = (price: unknown, fallbackRate?: number): ProductPrice => {
  const priceRecord = (price ?? {}) as Record<string, unknown>
  const priceListRate = (priceRecord.price_list_rate as number | undefined) ?? fallbackRate ?? 0
  const hasPrice = typeof priceRecord.price_list_rate === 'number' || typeof fallbackRate === 'number'
  const discountPercent = (priceRecord.discount_percent as number | undefined) ?? null

  return {
    ...priceRecord,
    price_list_rate: priceListRate,
    currency: toText(priceRecord.currency, 'USD'),
    currency_symbol: toText(priceRecord.currency_symbol, '$'),
    formatted_price: hasPrice ? formatUsd(priceListRate) : 'No price available',
    formatted_price_sales_uom: priceRecord.formatted_price_sales_uom as string | undefined,
    local_price_list_rate: priceListRate * EXCHANGE_RATE,
    local_formatted_price: hasPrice ? formatNio(priceListRate * EXCHANGE_RATE) : 'No price available',
    formatted_mrp: (priceRecord.formatted_mrp as string | null) ?? null,
    discount_percent: discountPercent,
    formatted_discount_percent: discountPercent ? `${Math.round(discountPercent)}%` : null,
  }
}

const formatPriceSummary = (
  priceSummary: unknown,
  price: unknown,
  variants: ProductVariant[],
): ProductPriceSummary => {
  const summaryRecord = (priceSummary ?? {}) as Record<string, unknown>
  const variantPrices = variants.map((variant) => variant.price.price_list_rate)
  const fallbackPrice = (price as { price_list_rate?: number } | null)?.price_list_rate
  const priceCandidates =
    typeof fallbackPrice === 'number' ? [...variantPrices, fallbackPrice] : variantPrices
  const minPrice =
    (summaryRecord.min_price as number | undefined) ??
    (priceCandidates.length > 0 ? Math.min(...priceCandidates) : 0)
  const maxPrice =
    (summaryRecord.max_price as number | undefined) ??
    (priceCandidates.length > 0 ? Math.max(...priceCandidates) : minPrice)
  const summaryType = toText(summaryRecord.type, minPrice === maxPrice ? 'single' : 'range')

  return {
    type: summaryType,
    min_price: minPrice,
    max_price: maxPrice,
    formatted_price:
      minPrice === maxPrice
        ? formatUsd(minPrice)
        : `${formatUsd(minPrice)} - ${formatUsd(maxPrice)}`,
    local_formatted_price:
      minPrice === maxPrice
        ? formatNio(minPrice * EXCHANGE_RATE)
        : `${formatNio(minPrice * EXCHANGE_RATE)} - ${formatNio(maxPrice * EXCHANGE_RATE)}`,
  }
}

const formatVariantAttributes = (attributes: unknown): ProductVariantAttributes =>
  Object.entries((attributes ?? {}) as Record<string, unknown>).reduce<ProductVariantAttributes>(
    (normalized, [key, value]) => {
      const attributeName = key.trim()
      const attributeValue = toText(value)

      if (attributeName && attributeValue) {
        normalized[attributeName] = attributeValue
      }

      return normalized
    },
    {},
  )

const getAvailableAttributes = (variants: ProductVariant[]) => {
  const attributes: Record<string, string[]> = {}

  variants.forEach((variant) => {
    Object.entries(variant.attributes).forEach(([attributeName, attributeValue]) => {
      if (!attributeValue) {
        return
      }

      if (!attributes[attributeName]) {
        attributes[attributeName] = []
      }

      if (!attributes[attributeName].includes(attributeValue)) {
        attributes[attributeName].push(attributeValue)
      }
    })
  })

  return Object.fromEntries(
    Object.entries(attributes).map(([attributeName, values]) => [
      attributeName,
      sortAttributeValues(attributeName, values),
    ]),
  )
}

const formatVariant = (
  variant: unknown,
  parentItem: Record<string, unknown>,
  parentImage: string,
): ProductVariant | null => {
  const variantItem = (variant ?? {}) as Record<string, unknown>
  const itemName = toText(variantItem.item_name, toText(parentItem.item_name))

  return {
    item_code: toText(variantItem.item_code),
    item_name: itemName,
    item_group: toText(variantItem.item_group, toText(parentItem.item_group)),
    image: formatImage(variantItem.image || parentImage, itemName),
    variant_of: toText(variantItem.variant_of, toText(parentItem.item_code)),
    actual_qty: (variantItem.actual_qty as number | undefined) ?? 0,
    attributes: formatVariantAttributes(variantItem.attributes),
    price: formatProductPrice(variantItem.price),
  }
}

const getVariantColor = (variant: ProductVariant): string | null => {
  const colorAttribute = Object.entries(variant.attributes).find(
    ([attributeName]) => attributeName.trim().toLowerCase() === 'color',
  )

  return colorAttribute?.[1] || null
}

const getProductSingleColor = (product: Product): string | null => {
  const colorAttribute = Object.entries(product.available_attributes).find(
    ([attributeName, values]) =>
      normalizeComparableText(attributeName) === 'color' && values.length === 1,
  )

  return colorAttribute?.[1][0] || getVariantColor(product.variants[0]) || null
}

const getCatalogMergeKey = (product: Product) => {
  const color = getProductSingleColor(product)

  return color
    ? `${product.item_code}:color:${normalizeComparableText(color)}`
    : product.item_code
}

const buildProductFromVariants = (product: Product, variants: ProductVariant[]): Product => {
  const representativeVariant = variants[0]
  const priceSummary = formatPriceSummary(null, null, variants)

  return {
    ...product,
    catalog_key: representativeVariant?.item_code || product.catalog_key,
    item_code: product.item_code,
    image: representativeVariant?.image || product.image,
    price_summary: priceSummary,
    variants,
    available_attributes: getAvailableAttributes(variants),
    actual_qty: variants.reduce((total, variant) => total + variant.actual_qty, 0),
    price: representativeVariant?.price || product.price,
  }
}

const splitProductByColor = (product: Product): Product[] => {
  if (product.variants.length === 0) {
    return [product]
  }

  const variantsByColor = new Map<string, ProductVariant[]>()

  for (const variant of product.variants) {
    const color = getVariantColor(variant)

    if (!color) {
      return [product]
    }

    const colorKey = normalizeComparableText(color)
    const variants = variantsByColor.get(colorKey) || []
    variants.push(variant)
    variantsByColor.set(colorKey, variants)
  }

  if (variantsByColor.size <= 1) {
    return [product]
  }

  return [...variantsByColor.values()].map((variants) =>
    buildProductFromVariants(product, variants),
  )
}

const mergeCatalogProduct = (existingProduct: Product, incomingProduct: Product): Product => {
  const variantsByCode = new Map<string, ProductVariant>()

  for (const variant of [...existingProduct.variants, ...incomingProduct.variants]) {
    variantsByCode.set(variant.item_code, variant)
  }

  const variants = [...variantsByCode.values()]

  if (variants.length === 0) {
    return existingProduct
  }

  return buildProductFromVariants(existingProduct, variants)
}

const mergeCatalogProducts = (existingProducts: Product[], incomingProducts: Product[]) => {
  const productsByMergeKey = new Map<string, Product>()

  for (const product of [...existingProducts, ...incomingProducts]) {
    const mergeKey = getCatalogMergeKey(product)
    const existingProduct = productsByMergeKey.get(mergeKey)

    productsByMergeKey.set(
      mergeKey,
      existingProduct ? mergeCatalogProduct(existingProduct, product) : product,
    )
  }

  return [...productsByMergeKey.values()]
}

type CatalogFilterValue = string | string[] | null

const normalizeFilterValues = (value: CatalogFilterValue) => {
  if (Array.isArray(value)) {
    return value.map((entry) => entry.trim()).filter(Boolean)
  }

  return value && value.trim() ? [value.trim()] : []
}

const getFilterCombinations = (
  category: CatalogFilterValue,
  size: CatalogFilterValue,
  color: CatalogFilterValue,
) => {
  const categories = normalizeFilterValues(category)
  const sizes = normalizeFilterValues(size)
  const colors = normalizeFilterValues(color)
  const categoryValues = categories.length ? categories : [null]
  const sizeValues = sizes.length ? sizes : [null]
  const colorValues = colors.length ? colors : [null]

  return categoryValues.flatMap((categoryValue) =>
    sizeValues.flatMap((sizeValue) =>
      colorValues.map((colorValue) => ({
        category: categoryValue,
        size: sizeValue,
        color: colorValue,
      })),
    ),
  )
}

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [] as Product[],
    currentProduct: null as Product | null,
    currentCategory: null as string | null,
    totalProducts: 0,
    currentPage: 1,
    limit: 33,
    loading: false,
    hasMoreProducts: true,
  }),

  actions: {
    formatProduct(item: unknown): Product {
      const productItem = (item ?? {}) as Record<string, unknown>
      const itemName = toText(productItem.item_name)
      const itemImage = formatImage(productItem.image, itemName)
      const variants = Array.isArray(productItem.variants)
        ? productItem.variants
            .map((variant) => formatVariant(variant, productItem, itemImage))
            .filter((variant): variant is ProductVariant => variant !== null)
        : []
      const priceSummary = formatPriceSummary(
        productItem.price_summary,
        productItem.price,
        variants,
      )
      const totalQty =
        variants.length > 0
          ? variants.reduce((total, variant) => total + variant.actual_qty, 0)
          : ((productItem.actual_qty as number | undefined) ?? 0)

      return {
        catalog_key: toText(productItem.item_code),
        item_code: toText(productItem.item_code),
        item_name: itemName,
        item_group: toText(productItem.item_group),
        image: itemImage,
        price_summary: priceSummary,
        variants,
        available_attributes: getAvailableAttributes(variants),
        actual_qty: totalQty,
        price: productItem.price
          ? formatProductPrice(productItem.price, priceSummary.min_price)
          : variants[0]?.price || formatProductPrice(null, priceSummary.min_price),
      }
    },

    async loadProducts(
      sale: boolean = false,
      category: CatalogFilterValue = null,
      size: CatalogFilterValue = null,
      color: CatalogFilterValue = null,
      page: number = 1,
    ) {
      this.loading = true
      const start = (page - 1) * this.limit
      const combinations = getFilterCombinations(category, size, color)

      const responses = await Promise.all(
        combinations.map(async (combination) => {
          let url = `${BASE_URL}/api/method/gr_tools.www.products.get_items?start=${start}&limit=${this.limit}`
          url += sale ? `&sale=1` : ''
          url += combination.category ? `&category=${encodeURIComponent(combination.category)}` : ''
          url += combination.size ? `&size=${encodeURIComponent(combination.size)}` : ''
          url += combination.color ? `&color=${encodeURIComponent(combination.color)}` : ''

          const response = await fetch(url)
          const data = await response.json()

          return Array.isArray(data.message) ? data.message : []
        }),
      )
      const message = responses.flat()

      if (message.length === 0) {
        console.warn('No products found!')
        this.hasMoreProducts = false
        if (page === 1) {
          this.products = []
        }
        this.currentPage = Math.max(1, page - 1)
        this.loading = false
        return
      }

      const products = message.flatMap((item: unknown) =>
        splitProductByColor(this.formatProduct(item)),
      )
      if (page === 1) {
        this.products = mergeCatalogProducts([], products)
      } else {
        this.products = mergeCatalogProducts(this.products, products)
      }

      this.hasMoreProducts = true
      this.currentPage = page
      this.loading = false
    },

    async loadProduct(itemCode: string) {
      this.loading = true

      try {
        const encodedItemCode = encodeURIComponent(itemCode)
        const response = await fetch(
          `${BASE_URL}/api/method/gr_tools.www.products.get_items_from_template?item_code=${encodedItemCode}`,
        )
        const data = await response.json()

        const productItem = Array.isArray(data?.message) ? data.message[0] : data?.message

        if (!productItem) {
          console.error(`Product with item_code ${itemCode} not found!`)
          this.currentProduct = null
          return
        }

        this.currentProduct = this.formatProduct(productItem)
      } catch (error) {
        console.error(`Product with item_code ${itemCode} could not be loaded!`, error)
        this.currentProduct = null
      } finally {
        this.loading = false
      }
    },
  },
})
