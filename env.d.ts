/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_BASE_URL: string

  // Site Configuration
  readonly VITE_SITE_NAME: string
  readonly VITE_SITE_LOGO: string

  // Theme Colors
  readonly VITE_PRIMARY_COLOR: string

  // Contact Information
  readonly VITE_WHATSAPP_NUMBER: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
