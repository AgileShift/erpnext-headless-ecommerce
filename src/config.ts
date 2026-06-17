// Environment variables configuration
import type { LegalDocumentKey } from '@/router/legalRoutes'

type SiteConfig = {
  apiBaseUrl: string
  siteName: string
  siteLogo: string
  siteFavicon: string
  Gtag: string
  colors: {
    primary: string
    secondary: string
  }
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

const configs: Record<string, SiteConfig> = {
  'fortechni.com': {
    apiBaseUrl: 'https://erp.fortechni.com',
    siteName: 'ForTech Nicaragua',
    siteLogo: 'LogoFortech.svg',
    siteFavicon: 'fortech.ico',
    Gtag: 'G-JQ5GCG8Y3W',
    colors: {
      primary: '0 108 247',
      secondary: '43 136 255',
    },
    contact: {
      email: 'contacto@fortechni.com',
      whatsApp: '50583968452',
      website: window.location.origin,
      address: 'DDF La Vicky 1c Norte, 1/2c Este. Altamira, Managua, Nicaragua',
      googleMaps: 'https://maps.app.goo.gl/4uSrJupNKJ8ZW75W6',
      businessHours: [],
      socialLinks: {
        instagram: 'https://www.instagram.com/fortech.ni',
        facebook: 'https://www.facebook.com/ForTech.Nicaragua',
      },
    },
    wiki: {
      baseUrl: 'https://erp.gruporeal.org',
      routePrefix: 'fortech',
      documents: {
        terms: 'terminos-y-condiciones',
        privacy: 'politica-de-privacidad',
        cookies: 'politica-de-cookies',
        shipping: 'politica-de-envios',
        returns: 'cambios-y-devoluciones',
        payments: 'formas-de-pago',
        safeShopping: 'compra-segura',
      },
    },
    catalog: {
      productCardVisibleAttributes: [],
      exchangeRate: 36.6243,
    },
  },
  'clothingcenterni.com': {
    apiBaseUrl: 'https://erp.clothingcenterni.com',
    siteName: 'Clothing Center',
    siteLogo: 'LogoClothing.svg',
    siteFavicon: 'clothing.ico',
    Gtag: 'G-GZKVCF6LVJ',
    colors: {
      primary: '247 198 200',
      secondary: '223 113 126',
    },
    contact: {
      email: 'contacto@clothingcenterni.com',
      whatsApp: '50577020233',
      website: 'clothingcenterni.com',
      address: 'DDF La Vicky 1c Norte, 1/2c Este. Altamira, Managua, Nicaragua',
      googleMaps: 'https://maps.app.goo.gl/S952rpBWWEfCTtYM6',
      businessHours: [
        'Lunes a Viernes: 9:00 am - 6:00 pm',
        'Sábados: 9:00 am - 4:00 pm',
        'Domingos: Cerrado',
      ],
      socialLinks: {
        instagram: 'https://www.instagram.com/clothingcenter.ni',
        facebook: 'https://www.facebook.com/ClothingCenter.Nicaragua',
      },
    },
    wiki: {
      baseUrl: 'https://erp.gruporeal.org',
      routePrefix: 'clothing-center',
      documents: {
        terms: 'terminos-y-condiciones',
        privacy: 'politicas/politica-de-privacidad',
        cookies: 'politicas/politica-de-cookies',
        shipping: 'politica-de-envios',
        returns: 'cambios-y-devoluciones',
        payments: 'formas-de-pago',
        safeShopping: 'politicas/catalogo-web/compra-segura',
      },
    },
    catalog: {
      productCardVisibleAttributes: ['Talla'],
      exchangeRate: 36.6243,
    },
  },
}

const hostname = window.location.host.replace('www.', '')
const siteConfig = configs[hostname] || configs['clothingcenterni.com']

export default siteConfig
