// Environment variables configuration
const configs: any = {
  'fortechni.com': {
    apiBaseUrl: 'https://erp.fortechni.com',
    siteName: 'ForTech Nicaragua',
    siteLogo: 'LogoFortech.svg',
    Gtag: 'G-JQ5GCG8Y3W',
    colors: {
      primary: '0 108 247'
    },
    contact: {
      whatsApp: '50583754233'
    }
  },
  'clothingcenterni.com': {
    apiBaseUrl: 'https://erp.clothingcenterni.com',
    siteName: 'Clothing Center',
    siteLogo: 'LogoClothing.svg',
    Gtag: 'G-GZKVCF6LVJ',
    colors: {
      primary: '247 198 200'
    },
    contact: {
      whatsApp: '50577020233'
    }
  }
};

const hostname = window.location.hostname;
const siteConfig = configs[hostname] || configs['fortechni.com'];

export default siteConfig;
