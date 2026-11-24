import type { LegalDocumentKey } from '@/router/legalRoutes'

export type SiteId = 'clothing-center' | 'fortech'
export type CatalogFilterSection = 'size' | 'category' | 'color'
export type CatalogSort = 'asc' | 'desc'
export type AttributeDisplayMode = 'value' | 'abbr'

export type SiteConfig = {
  apiBaseUrl: string
  siteName: string
  siteLogo: string
  siteFavicon: string
  Gtag: string
  id: SiteId
  showHeaderTitle: boolean
  contact: {
    email: string
    whatsApp: string
    website: string
    address: string
    googleMaps: string
    businessHours?: string[]
    socialLinks: {
      instagram: string
      facebook: string
    }
  }
  wiki: {
    baseUrl: string
    routePrefix: string
    documents: Partial<Record<LegalDocumentKey, string>>
  }
  catalog: {
    attributeDisplay: Record<string, AttributeDisplayMode>
    defaultSort: CatalogSort
    productCardVisibleAttributes: string[]
    exchangeRate: number
    filters: {
      initiallyOpen: CatalogFilterSection[]
    }
  }
}
