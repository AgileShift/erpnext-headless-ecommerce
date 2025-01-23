import './assets/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueGtag from 'vue-gtag'

import App from './App.vue'
import router from './router'

import siteConfig from '@/config'

const app = createApp(App)

app.use(createPinia())
app.use(VueGtag, {
  config: { id: siteConfig.Gtag },
})
app.use(router)

app.mount('#app')
