<template>
  <div class="gap-6">
    <!-- <TheFilters class="hidden md:block" />-->

    <div class="flex flex-wrap gap-6">
      <ProductCard v-for="product in products" :key="product.item_code" :product="product" />

      <div v-if="loading" class="xs:col-span-2 lg:col-span-4 text-center">
        <h1 class="font-bold pb-4">Cargando Productos</h1>
        <SfLoaderCircular size="4xl" />
      </div>

      <div ref="loadMoreTrigger" class="observer-trigger" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { SfLoaderCircular } from '@storefront-ui/vue'
import ProductCard from '@/components/ProductCard.vue'
import { useProductStore } from '@/stores/productStore'

const props = defineProps<{ category?: string }>()

const productStore = useProductStore()

// Reactive state
const products = computed(() => productStore.products)
const loading = computed(() => productStore.loading)
const loadMoreTrigger = ref<HTMLDivElement | null>(null)


const loadMoreProducts = async () => {
  const nextPage = productStore.currentPage + 1
  await productStore.loadProducts(props.category || null, nextPage)
}

const setupIntersectionObserver = () => {
  if (!loadMoreTrigger.value) return
  const observer = new IntersectionObserver(async (entries) => {
    if (entries[0].isIntersecting && !productStore.loading) {
      await loadMoreProducts()
    }
  })

  observer.observe(loadMoreTrigger.value)
}

watch(() => props.category, (newCategory) => {
  productStore.loadProducts(newCategory || null, 1)
})

onMounted(() => {
  productStore.loadProducts(props.category || null, 1)
  setupIntersectionObserver()
})
</script>

<style>
.observer-trigger {
  height: 1px;
}
</style>
