import type { SiteConfig } from '../types'

export const clothingCenterConfig: SiteConfig = {
  id: 'clothing-center',
  showHeaderTitle: true,
  apiBaseUrl: 'http://localhost:8000',
  siteName: 'Clothing Center',
  siteLogo: 'LogoClothing.svg',
  siteFavicon: 'clothing.ico',
  Gtag: 'G-GZKVCF6LVJ',
  contact: {
    email: 'contacto@clothingcenterni.com',
    whatsApp: '50577020233',
    website: 'https://clothingcenterni.com',
    address: 'DDF La Vicky 1c Norte, 1/2c Este. Altamira, Managua, Nicaragua',
    googleMaps: 'https://maps.app.goo.gl/S952rpBWWEfCTtYM6',
    businessHours: [
      'Lunes a Viernes: 9:00 am - 5:45 pm',
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
    routePrefix: 'clothing-center/ecommerce',
    documents: {
      terms: 'legal/terminos-y-condiciones',
      privacy: 'legal/politica-de-privacidad',
      cookies: 'legal/politica-de-cookies',
      shipping: 'politica-de-envios',
      returns: 'cambios-y-devoluciones',
      payments: 'formas-de-pago',
      safeShopping: 'compra-segura',
    },
  },
  catalog: {
    filters: { initiallyOpen: ['size'] },
    productCardVisibleAttributes: ['Talla', 'Talla - Largo'],
    exchangeRate: 36.6243,
  },
}
