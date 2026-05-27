import { createRouter, createWebHistory, type RouteLocationNormalizedLoaded } from 'vue-router'

import CatalogView from '@/views/CatalogView.vue'
import ProductView from '@/views/ProductView.vue'
import URLBuilderView from '@/views/URLBuilderView.vue'

const getFilterProps = (route: RouteLocationNormalizedLoaded) => ({
  category:
    typeof route.params.category === 'string'
      ? route.params.category
      : typeof route.query.category === 'string'
        ? route.query.category
        : null,
  sale: route.path === '/sale' || route.query.sale === '1',
  size: typeof route.query.size === 'string' ? route.query.size : null,
  color: typeof route.query.color === 'string' ? route.query.color : null,
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: CatalogView, props: getFilterProps },
    { path: '/sale', name: 'Sale', component: CatalogView, props: getFilterProps },
    { path: '/category/:category', name: 'Category', component: CatalogView, props: getFilterProps },
    { path: '/product/:id(.*)', name: 'Product', component: ProductView, props: false },
    { path: '/url-builder', name: 'URLBuilder', component: URLBuilderView },
  ],
})

export default router
