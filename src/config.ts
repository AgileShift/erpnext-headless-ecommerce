// Environment variables configuration
const configs: any = {
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
      whatsApp: '50583968452',
    },
    catalog: {
      productCardVisibleAttributes: [],
    },
  },
  'clothingcenterni.com': {
    // apiBaseUrl: 'https://erp.clothingcenterni.com',
    apiBaseUrl: 'http://192.168.1.146:8000',
    siteName: 'Clothing Center',
    siteLogo: 'LogoClothing.svg',
    siteFavicon: 'clothing.ico',
    Gtag: 'G-GZKVCF6LVJ',
    colors: {
      primary: '247 198 200',
      secondary: '223 113 126',
    },
    contact: {
      whatsApp: '50577020233',
    },
    catalog: {
      productCardVisibleAttributes: ['Talla'],
    },
  },
}

const hostname = window.location.host.replace('www.', '')
const siteConfig = configs[hostname] || configs['clothingcenterni.com']

export default siteConfig
