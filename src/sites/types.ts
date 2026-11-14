import type { LegalDocumentKey } from '@/router/legalRoutes'

export type SiteId = 'clothing-center' | 'fortech'

export type SiteConfig = {
  apiBaseUrl: string
  siteName: string
  siteLogo: string
  siteFavicon: string
  Gtag: string
  id: SiteId
  shoppingMode: 'cart' | 'selection'
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
    productCardVisibleAttributes: string[]
    exchangeRate: number
  }
}
