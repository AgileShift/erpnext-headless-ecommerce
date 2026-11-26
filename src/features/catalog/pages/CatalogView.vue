<template>
  <div class="catalog-layout" :class="{ 'catalog-layout--clothing': isClothingCenter }">
    <CatalogFilters
      v-model:open="filtersOpen"
      v-model:categories-model="selectedCategories"
      v-model:sizes-model="selectedSizes"
      v-model:colors-model="selectedColors"
      :desktop-panel="isClothingCenter"
      :searchable="isClothingCenter"
      :initially-open="siteConfig.catalog.filters.initiallyOpen"
      :categories="categoryOptions"
      :sizes="sizeOptions"
      :colors="colorOptions"
      :attributes-loaded="itemAttributeStore.loaded"
      @clear="clearFilters"
    />
    <div class="catalog-content">
      <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div v-if="activeFilters.length" class="flex flex-wrap gap-2">
          <SfChip
            v-for="filter in activeFilters"
            :key="`${filter.type}-${filter.value}`"
            :model-value="true"
            size="sm"
            class="border border-primary-200 bg-primary-100 text-neutral-950 shadow-sm"
            @update:model-value="removeFilter(filter.type, filter.value)"
          >
            {{ filter.label }}
            <template #suffix>
              <SfIconCloseSm class="text-neutral-500" size="sm" />
            </template>
          </SfChip>
        </div>
        <label class="ml-auto flex items-center gap-2 text-sm font-medium text-neutral-700">
          <span>Ordenar por</span>
          <SfSelect v-model="selectedSort" size="sm" class="min-w-40" aria-label="Ordenar productos">
            <option value="asc">Orden del catálogo</option>
            <option value="desc">Más recientes</option>
          </SfSelect>
        </label>
      </div>
      <p v-if="isInitialLoading" role="status" class="mb-4 text-neutral-700">Cargando productos…</p>
      <div
        class="catalog-product-grid grid gap-6"
        :aria-busy="loading"
      >
        <template v-if="isInitialLoading">
          <ProductCardSkeleton v-for="index in skeletonCards" :key="`catalog-skeleton-${index}`" />
        </template>

        <ProductCard
          v-for="(product, index) in products"
          :key="product.catalog_key"
          :product="product"
          :eager="index < eagerProductCount"
          v-bind="$attrs"
        />
      </div>
      <div
        v-if="catalogErrorPage"
        role="alert"
        class="mt-6 rounded-lg border border-neutral-300 p-6 text-center"
      >
        <p class="font-bold">
          {{
            products.length ? 'No pudimos cargar más productos' : 'No pudimos cargar los productos'
          }}
        </p>
        <p class="mt-2 text-sm text-neutral-700">Revisá tu conexión e intentá de nuevo.</p>
        <SfButton class="mt-4" @click="retryProducts">Reintentar</SfButton>
      </div>
      <div
        v-else-if="!loading && !products.length"
        role="status"
        class="mt-6 rounded-lg border border-neutral-200 p-6 text-center"
      >
        <p class="font-bold">
          {{
            activeFilters.length
              ? 'No encontramos productos con estos filtros'
              : 'No hay productos disponibles'
          }}
        </p>
        <p v-if="activeFilters.length" class="mt-2 text-sm text-neutral-700">
          Probá quitando los filtros para ver más productos.
        </p>
        <SfButton v-if="activeFilters.length" variant="secondary" class="mt-4" @click="clearFilters"
          >Limpiar filtros</SfButton
        >
      </div>
      <div v-if="loading && products.length" role="status" class="mt-6 text-center">
        <p class="mb-3 font-bold">Cargando más productos…</p>
        <SfLoaderCircular size="xl" />
      </div>
      <div
        v-if="products.length && productStore.hasMoreProducts && !loading && !catalogErrorPage"
        class="mt-6 text-center"
      >
        <SfButton variant="secondary" @click="loadMoreProducts">Cargar más productos</SfButton>
      </div>
      <div ref="loadMoreTrigger" class="observer-trigger" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { SfButton, SfChip, SfIconCloseSm, SfLoaderCircular, SfSelect } from '@storefront-ui/vue'
import ProductCard from '@/features/catalog/components/ProductCard.vue'
import ProductCardSkeleton from '@/features/catalog/components/ProductCardSkeleton.vue'
import CatalogFilters from '@/features/catalog/components/CatalogFilters.vue'
import { useProductStore } from '@/features/catalog/stores/productStore'
import { ROOT_CATEGORY_NAME, useCategoryStore } from '@/features/catalog/stores/categoryStore'
import { useItemAttributeStore } from '@/features/catalog/stores/itemAttributeStore'
import type { Category } from '@/features/catalog/types/Category'
import type { ItemAttributeOption } from '@/features/catalog/types/ItemAttribute'
import { formatAttributeDisplayValue } from '@/features/catalog/utils/attributeFormatting'
import { compareSizeValues } from '@/features/catalog/utils/sizeOrdering'
import siteConfig from '@/config'

const props = defineProps<{
  sale?: boolean
  category?: string[]
  size?: string[]
  color?: string[]
}>()

const isClothingCenter = siteConfig.id === 'clothing-center'
const router = useRouter()
const route = useRoute()
const productStore = useProductStore()
const categoryStore = useCategoryStore()
const itemAttributeStore = useItemAttributeStore()

// Reactive state
const products = computed(() => productStore.products)
const loading = computed(() => productStore.loading)
const catalogErrorPage = computed(() => productStore.catalogErrorPage)
const isInitialLoading = computed(() => loading.value && products.value.length === 0)
const skeletonCards = Array.from({ length: 12 }, (_, index) => index + 1)
const eagerProductCount =
  window.innerWidth >= 1280 ? 5 : window.innerWidth >= 1024 ? 4 : window.innerWidth >= 768 ? 3 : 2
const loadMoreTrigger = ref<HTMLDivElement | null>(null)
const filtersOpen = ref(false)
const selectedCategories = ref<string[]>([...(props.category || [])])
const selectedSizes = ref<string[]>([...(props.size || [])])
const selectedColors = ref<string[]>([...(props.color || [])])
const { catalogSort: selectedSort } = storeToRefs(productStore)

const getLeafCategoryNames = (node: Category): string[] => {
  if (!node.children.length) {
    return node.name === ROOT_CATEGORY_NAME ? [] : [node.name]
  }

  const names: string[] = []

  for (const child of node.children) {
    names.push(...getLeafCategoryNames(child))
  }

  return names
}

const categoryOptions = computed(() =>
  Array.from(new Set(getLeafCategoryNames(categoryStore.categoryTree))),
)
const sizeOptions = computed(() =>
  [...itemAttributeStore.sizes].sort((firstSize, secondSize) =>
    compareSizeValues(firstSize.value, secondSize.value),
  ),
)
const colorOptions = computed(() => itemAttributeStore.colors)
const getAttributeOptionLabel = (
  attributeName: string,
  value: string,
  options: ItemAttributeOption[],
) => {
  const option = options.find((entry) => entry.value === value)
  return formatAttributeDisplayValue(attributeName, value, option?.abbr)
}

const activeFilters = computed(() => [
  ...selectedSizes.value.map((value) => ({
    type: 'size',
    value,
    label: `Talla: ${getAttributeOptionLabel('Talla', value, sizeOptions.value)}`,
  })),
  ...selectedCategories.value.map((value) => ({ type: 'category', value, label: value })),
  ...selectedColors.value.map((value) => ({
    type: 'color',
    value,
    label: getAttributeOptionLabel('Color', value, colorOptions.value),
  })),
])

const removeFilter = (type: string, value: string) => {
  const valuesByType: Record<string, string[]> = {
    category: selectedCategories.value,
    size: selectedSizes.value,
    color: selectedColors.value,
  }
  const values = valuesByType[type]

  if (values) {
    const index = values.indexOf(value)

    if (index >= 0) {
      values.splice(index, 1)
    }
  }
}

const applyFilters = async (closeFilters = false) => {
  const nextCategories = selectedCategories.value.map((value) => value.trim()).filter(Boolean)
  const nextSizes = selectedSizes.value.filter(Boolean)
  const nextColors = selectedColors.value.filter(Boolean)
  const query: Record<string, string | string[]> = {}

  if (nextCategories.length > 1) {
    query.category = nextCategories
  }

  if (nextSizes.length) {
    query.size = nextSizes
  }

  if (nextColors.length) {
    query.color = nextColors
  }

  if (props.sale && nextCategories.length) {
    query.sale = '1'
  }

  const path =
    nextCategories.length === 1
      ? `/category/${encodeURIComponent(nextCategories[0])}`
      : props.sale
        ? '/sale'
        : '/'
  const nextRoute = router.resolve({ path, query })

  if (nextRoute.fullPath === route.fullPath) {
    return
  }

  await router.push({ path, query })

  if (closeFilters) {
    filtersOpen.value = false
  }
}

const clearFilters = async () => {
  selectedCategories.value = []
  selectedSizes.value = []
  selectedColors.value = []
}

const loadMoreProducts = async () => {
  const nextPage = productStore.currentPage + 1
  await productStore.loadProducts(
    props.sale,
    props.category || [],
    props.size,
    props.color,
    nextPage,
    selectedSort.value,
  )
}

const retryProducts = () =>
  productStore.loadProducts(
    props.sale,
    props.category || [],
    props.size,
    props.color,
    catalogErrorPage.value || 1,
    selectedSort.value,
  )

let observer: IntersectionObserver | undefined
const setupIntersectionObserver = () => {
  if (!loadMoreTrigger.value || typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver(async (entries) => {
    if (
      entries[0].isIntersecting &&
      !productStore.loading &&
      !productStore.catalogErrorPage &&
      productStore.hasMoreProducts
    ) {
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
    newSort: selectedSort.value,
  }),
  ({ newSale, newCategory, newSize, newColor, newSort }) => {
    selectedCategories.value = [...(newCategory || [])]
    selectedSizes.value = [...(newSize || [])]
    selectedColors.value = [...(newColor || [])]
    productStore.loadProducts(Boolean(newSale), newCategory, newSize, newColor, 1, newSort)
  },
  { immediate: true },
)

watch(
  [selectedCategories, selectedSizes, selectedColors],
  async () => {
    await applyFilters()
  },
  { deep: true },
)

onMounted(() => {
  setupIntersectionObserver()
  categoryStore.loadCategories()
  itemAttributeStore.loadItemAttributes()
})
onUnmounted(() => observer?.disconnect())
</script>

<style>
.catalog-product-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (min-width: 640px) {
  .catalog-product-grid {
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  }
}

@media (min-width: 1024px) {
  .catalog-layout--clothing {
    display: grid;
    grid-template-columns: 15rem minmax(0, 1fr);
    gap: 1.5rem;
    align-items: start;
  }
  .catalog-layout--clothing .catalog-content {
    grid-column: 2;
    grid-row: 1;
    min-width: 0;
  }
}
.observer-trigger {
  height: 1px;
}
</style>
