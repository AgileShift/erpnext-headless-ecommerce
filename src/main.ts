import './assets/style.css'
import './sites/theme.css'
import './sites/clothing-center/theme.css'
import './sites/fortech/theme.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createGtag } from 'vue-gtag'

import App from './App.vue'
import router from './router'

import siteConfig from '@/config'
import { applyStoredConsentPreference } from '@/utils/consentMode'
import { ensurePreconnectTag } from '@/utils/preconnectTag'

document.documentElement.dataset.site = siteConfig.id
document.querySelector('link[rel~="icon"]')?.setAttribute('href', siteConfig.siteFavicon)
ensurePreconnectTag(siteConfig.apiBaseUrl)

const app = createApp(App)

app.use(createPinia())
app.use(
  createGtag({
    tagId: siteConfig.Gtag,
    initMode: 'manual',
    pageTracker: {
      router,
      useRouteFullPath: true,
    },
  }),
)
app.use(router)

void applyStoredConsentPreference()

app.mount('#app')
