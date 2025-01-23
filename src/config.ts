// Environment variables configuration
export const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,

  siteName: import.meta.env.VITE_SITE_NAME,
  siteLogo: import.meta.env.VITE_SITE_LOGO,

  // Theme Colors
  colors: {
    primary: import.meta.env.VITE_PRIMARY_COLOR
  },

  // Contact Information
  contact: {
    whatsApp: import.meta.env.VITE_WHATSAPP_NUMBER,
  }
}
