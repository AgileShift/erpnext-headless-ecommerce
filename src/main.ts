import './assets/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueGtag from 'vue-gtag'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(VueGtag, {
  config: { id: 'G-GZKVCF6LVJ' },
})
app.use(router)

app.mount('#app')
