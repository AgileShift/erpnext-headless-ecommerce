import { defineStore } from 'pinia'
import type {
  Product,
  ProductPrice,
  ProductPriceSummary,
  ProductVariant,
} from '@/features/catalog/types/Product'
import siteConfig from '@/config'
import type { CatalogSort } from '@/sites/types'
import { sortSizeValues } from '@/features/catalog/utils/sizeOrdering'
import { callFrappeMethod } from '@/shared/api/frappe'

const BASE_URL = siteConfig.apiBaseUrl
const SIZE_ATTRIBUTE_NAMES = new Set(['Talla', 'Size', 'Talla - Largo'])
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
  SIZE_ATTRIBUTE_NAMES.has(attributeName)

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

const formatImages = (images: unknown): string[] => {
  if (!Array.isArray(images)) return []
  return images.flatMap((entry) => {
    const url = typeof entry === 'object' && entry !== null ? toText((entry as Record<string, unknown>).url) : ''
    return url.startsWith('/files/') ? [BASE_URL + url] : []
  })
}

const formatProductPrice = (price: unknown, fallbackRate?: number): ProductPrice => {
  const priceRecord = (price ?? {}) as Record<string, unknown>
  const priceListRate = (priceRecord.price_list_rate as number | undefined) ?? fallbackRate ?? 0
  const hasPrice =
    typeof priceRecord.price_list_rate === 'number' || typeof fallbackRate === 'number'
  const discountPercent = (priceRecord.discount_percent as number | undefined) ?? null

  return {
    ...priceRecord,
    price_list_rate: priceListRate,
    currency: toText(priceRecord.currency, 'USD'),
    currency_symbol: toText(priceRecord.currency_symbol, '$'),
    formatted_price: hasPrice ? formatUsd(priceListRate) : 'No price available',
    formatted_price_sales_uom: priceRecord.formatted_price_sales_uom as string | undefined,
    local_price_list_rate: priceListRate * EXCHANGE_RATE,
    local_formatted_price: hasPrice
      ? formatNio(priceListRate * EXCHANGE_RATE)
      : 'No price available',
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

const formatVariantAttributes = (raw: unknown) => {
  const values: [string, string][] = []
  const abbreviations: [string, string][] = []

  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const [name, entry] of Object.entries(raw)) {
      const option = entry as { value?: unknown; abbr?: unknown } | null
      const value = typeof entry === 'string' ? entry : option?.value
      if (!name || typeof value !== 'string' || !value) continue
      values.push([name, value])
      if (typeof option?.abbr === 'string' && option.abbr) {
        abbreviations.push([name, option.abbr])
      }
    }
  }

  return {
    attributes: Object.fromEntries(values),
    attributeAbbreviations: Object.fromEntries(abbreviations),
  }
}

const getAvailableAttributes = (variants: ProductVariant[]) => {
  const attributes: Record<string, string[]> = Object.create(null)

  variants.forEach((variant) => {
    Object.entries(variant.attributes).forEach(([attributeName, attributeValue]) => {
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
    item_code: typeof variantItem.item_code === 'string' ? variantItem.item_code : '',
    item_name: itemName,
    item_group: toText(variantItem.item_group, toText(parentItem.item_group)),
    image: formatImage(variantItem.image || parentImage, itemName),
    images: formatImages(variantItem.images),
    variant_of: toText(variantItem.variant_of, toText(parentItem.item_code)),
    actual_qty: (variantItem.actual_qty as number | undefined) ?? 0,
    ...formatVariantAttributes(variantItem.attributes),
    price: formatProductPrice(variantItem.price),
  }
}

const getVariantColor = (variant: ProductVariant) => variant.attributes.Color || null

const getProductSingleColor = (product: Product): string | null => {
  const colorAttribute = Object.entries(product.available_attributes).find(
    ([attributeName, values]) =>
      attributeName === 'Color' && values.length === 1,
  )

  return colorAttribute?.[1][0] || (product.variants[0] ? getVariantColor(product.variants[0]) : null)
}

const getCatalogMergeKey = (product: Product) => {
  const color = getProductSingleColor(product)

  return color ? `${product.item_code}:color:${color}` : product.item_code
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

    const variants = variantsByColor.get(color) || []
    variants.push(variant)
    variantsByColor.set(color, variants)
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
    return value.filter(Boolean)
  }

  return value ? [value] : []
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
    loadingProduct: false,
    catalogSort: siteConfig.catalog.defaultSort,
    hasMoreProducts: true,
    catalogRequestKey: '',
    catalogErrorPage: null as number | null,
    catalogRequestId: 0,
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
        images: formatImages(productItem.images),
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
      sort: CatalogSort = siteConfig.catalog.defaultSort,
    ) {
      const sizes = normalizeFilterValues(size)
      const colors = normalizeFilterValues(color)
      const attributes = {
        ...(sizes.length ? { Talla: sizes } : {}),
        ...(colors.length ? { Color: colors } : {}),
      }
      const filters = {
        sale: sale ? 1 : undefined,
        item_group: normalizeFilterValues(category).join(','),
        attributes: sizes.length || colors.length ? JSON.stringify(attributes) : undefined,
        sort,
      }
      const requestKey = JSON.stringify(filters)

      if (page === 1 && this.catalogRequestKey === requestKey && this.products.length > 0) {
        return
      }

      const requestId = ++this.catalogRequestId
      this.loading = true
      this.catalogErrorPage = null
      if (page === 1) {
        this.products = []
        this.catalogRequestKey = ''
        this.hasMoreProducts = true
        this.currentPage = 1
      }
      const start = (page - 1) * this.limit

      try {
        const message = await callFrappeMethod<unknown>(
          'grupo_real_tools.ecommerce.api.item.get_items',
          { ...filters, start, limit: this.limit },
        )
        if (requestId !== this.catalogRequestId) return
        if (!Array.isArray(message)) throw new Error('Invalid catalog response')

        if (message.length === 0) {
          this.hasMoreProducts = false
          this.catalogRequestKey = requestKey
          if (page === 1) {
            this.products = []
          }
          this.currentPage = Math.max(1, page - 1)
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
        this.catalogRequestKey = requestKey
      } catch {
        if (requestId === this.catalogRequestId) this.catalogErrorPage = page
      } finally {
        if (requestId === this.catalogRequestId) this.loading = false
      }
    },

    async fetchProduct(itemCode: string): Promise<Product> {
      const product = await callFrappeMethod<unknown>(
        'grupo_real_tools.ecommerce.api.item.get_items_from_template',
        { item_code: itemCode },
      )
      const item = Array.isArray(product) ? product[0] : product
      if (!item) throw new Error('Product not found')
      return this.formatProduct(item)
    },

    async loadProduct(itemCode: string) {
      this.loadingProduct = true

      try {
        this.currentProduct = await this.fetchProduct(itemCode)
      } catch (error) {
        console.error(`Product with item_code ${itemCode} could not be loaded!`, error)
        this.currentProduct = null
      } finally {
        this.loadingProduct = false
      }
    },
  },
})
