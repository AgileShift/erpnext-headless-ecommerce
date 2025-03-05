import { createRouter, createWebHistory } from 'vue-router'

import CatalogView from '@/views/CatalogView.vue'
import ProductView from '@/views/ProductView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: CatalogView },
    { path: '/product/:id(.*)', name: 'Product', component: ProductView },
    { path: '/category/:category', name: 'Category', component: CatalogView, props: true },
  ],
})

export default router
