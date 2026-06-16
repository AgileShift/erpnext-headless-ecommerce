import './assets/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createGtag } from 'vue-gtag'

import App from './App.vue'
import router from './router'

import siteConfig from '@/config'
import { applyStoredConsentPreference } from '@/utils/consentMode'
import { ensurePreconnectTag } from '@/utils/preconnectTag'

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
