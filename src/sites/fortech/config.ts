import type { SiteConfig } from '../types'

export const createFortechConfig = (origin: string): SiteConfig => ({
  id: 'fortech',
  shoppingMode: 'selection',
  showHeaderTitle: false,
  apiBaseUrl: 'https://erp.fortechni.com',
  siteName: 'ForTech Nicaragua',
  siteLogo: 'LogoFortech.svg',
  siteFavicon: 'fortech.ico',
  Gtag: 'G-JQ5GCG8Y3W',
  contact: {
    email: 'contacto@fortechni.com',
    whatsApp: '50583968452',
    website: origin,
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
})
