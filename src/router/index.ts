import { createRouter, createWebHistory } from 'vue-router'

import CatalogView from '@/views/CatalogView.vue'
import ProductView from '@/views/ProductView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: CatalogView, props: false },
    { path: '/sale', name: 'Sale', component: CatalogView, props: { sale: true } },
    { path: '/category/:category', name: 'Category', component: CatalogView, props: route => ({ category: route.params.category, sale: false }) },
    { path: '/product/:id(.*)', name: 'Product', component: ProductView, props: false },
  ],
})

export default router
