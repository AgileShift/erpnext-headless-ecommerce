<template>
  <!-- <TheFilters class="hidden md:block" /> -->

  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
    <ProductCard
      v-for="product in products"
      :key="product.item_code"
      :product="product"
      v-bind="$attrs"
    />

    <div v-if="loading" class="xs:col-span-2 lg:col-span-4 text-center">
      <h1 class="font-bold pb-4">Cargando Productos</h1>
      <SfLoaderCircular size="4xl" />
    </div>

    <div ref="loadMoreTrigger" class="observer-trigger" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { SfLoaderCircular } from '@storefront-ui/vue'
import ProductCard from '@/components/ProductCard.vue'
import { useProductStore } from '@/stores/productStore'

const props = defineProps<{
  sale?: boolean
  category?: string | null
  size?: string | null
  color?: string | null
}>()

const productStore = useProductStore()

// Reactive state
const products = computed(() => productStore.products)
const loading = computed(() => productStore.loading)
const loadMoreTrigger = ref<HTMLDivElement | null>(null)

const loadMoreProducts = async () => {
  const nextPage = productStore.currentPage + 1
  await productStore.loadProducts(
    props.sale,
    props.category || null,
    props.size,
    props.color,
    nextPage,
  )
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

watch(
  () => ({
    newSale: props.sale,
    newCategory: props.category,
    newSize: props.size,
    newColor: props.color,
  }),
  ({ newSale, newCategory, newSize, newColor }) => {
    productStore.loadProducts(Boolean(newSale), newCategory, newSize, newColor, 1)
  },
  { immediate: true },
)

onMounted(() => {
  setupIntersectionObserver()
})
</script>

<style>
.observer-trigger {
  height: 1px;
}
</style>
