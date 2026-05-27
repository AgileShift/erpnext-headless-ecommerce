import { createRouter, createWebHistory, type RouteLocationNormalizedLoaded } from 'vue-router'


import CatalogView from '@/views/CatalogView.vue'
import ProductView from '@/views/ProductView.vue'

const getCatalogProps = (route: RouteLocationNormalizedLoaded) => ({
  category:
    typeof route.params.category === 'string'
      ? route.params.category
      : typeof route.query.category === 'string'
        ? route.query.category
        : null,
  sale: route.path === '/sale' || route.query.sale === '1',
  size: typeof route.query.talla === 'string' ? route.query.talla : null, // FIXME: Talla? Size?
  color: typeof route.query.color === 'string' ? route.query.color : null,
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: CatalogView, props: getCatalogProps },
    { path: '/sale', name: 'Sale', component: CatalogView, props: getCatalogProps },
    { path: '/category/:category', name: 'Category', component: CatalogView, props: getCatalogProps },
    { path: '/product/:id(.*)', name: 'Product', component: ProductView, props: false },
  ],
})

export default router
