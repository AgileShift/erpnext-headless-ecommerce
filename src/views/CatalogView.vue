<template>
  <div v-if="activeFilters.length" class="mb-4 flex flex-wrap gap-2">
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

  <button
    type="button"
    class="fixed bottom-5 right-4 z-30 inline-flex max-w-[calc(100vw-2rem)] items-center rounded-full border border-neutral-950 bg-neutral-950 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-neutral-800"
    @click="filtersOpen = !filtersOpen"
  >
    Filtros
    <span
      v-if="activeFilters.length"
      class="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs text-neutral-950"
    >
      {{ activeFilters.length }}
    </span>
  </button>

  <div
    v-if="filtersOpen"
    class="fixed bottom-20 left-4 right-4 z-30 max-h-[76vh] overflow-y-auto rounded-lg border border-neutral-200 bg-white p-4 shadow-2xl md:left-auto md:w-[430px]"
  >
    <div class="mb-3 flex items-center justify-between gap-3">
      <div>
        <p class="text-lg font-bold text-neutral-950">Filtros</p>
        <p class="text-sm text-neutral-500">Combiná categorías, tallas y colores.</p>
      </div>
      <button
        type="button"
        class="rounded-md px-2 py-1 text-sm font-semibold text-neutral-500 hover:bg-neutral-100"
        @click="filtersOpen = false"
      >
        Cerrar
      </button>
    </div>

    <div class="space-y-5">
      <section>
        <p class="mb-2 text-sm font-semibold text-neutral-900">Tallas</p>
        <div class="flex flex-wrap gap-2">
          <SfChip
            v-for="size in sizeOptions"
            :key="size.value"
            v-model="selectedSizes"
            square
            size="sm"
            :class="getFilterChipClass(selectedSizes, size.value, 'min-w-9')"
            :input-props="{ value: size.value }"
          >
            {{ getSizeOptionLabel(size) }}
          </SfChip>
        </div>
      </section>

      <section>
        <p class="mb-2 text-sm font-semibold text-neutral-900">Categorías</p>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <SfChip
            v-for="category in categoryOptions"
            :key="category"
            v-model="selectedCategories"
            size="sm"
            :class="getFilterChipClass(selectedCategories, category, 'min-w-0 justify-start')"
            :input-props="{ value: category }"
          >
            <span class="truncate">{{ category }}</span>
          </SfChip>
        </div>
      </section>

      <section>
        <p class="mb-2 text-sm font-semibold text-neutral-900">Colores</p>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <SfChip
            v-for="color in colorOptions"
            :key="color.value"
            v-model="selectedColors"
            size="sm"
            :class="getFilterChipClass(selectedColors, color.value, 'min-w-0 justify-start')"
            :input-props="{ value: color.value }"
          >
            <template #prefix>
              <SfThumbnail
                size="sm"
                class="border border-neutral-300"
                :style="{ backgroundColor: getColorSwatch(color.value) }"
              />
            </template>
            <span class="truncate">{{ color.label }}</span>
          </SfChip>
        </div>
      </section>

      <div class="flex gap-2 border-t border-neutral-200 pt-4">
        <SfButton variant="tertiary" class="w-full border border-neutral-300" @click="clearFilters">
          Limpiar
        </SfButton>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
    <ProductCard
      v-for="product in products"
      :key="product.catalog_key"
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
import { useRoute, useRouter } from 'vue-router'
import { SfButton, SfChip, SfIconCloseSm, SfLoaderCircular, SfThumbnail } from '@storefront-ui/vue'
import ProductCard from '@/components/ProductCard.vue'
import { useProductStore } from '@/stores/productStore'
import { ROOT_CATEGORY_NAME, useCategoryStore } from '@/stores/categoryStore'
import { useItemAttributeStore } from '@/stores/itemAttributeStore'
import type { Category } from '@/types/Category'
import { getColorSwatch } from '@/utils/colorSwatches'
import { isNumericAttributeValue } from '@/utils/attributeFormatting'
import { compareSizeValues } from '@/utils/sizeOrdering'

const props = defineProps<{
  sale?: boolean
  category?: string[]
  size?: string[]
  color?: string[]
}>()

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()
const categoryStore = useCategoryStore()
const itemAttributeStore = useItemAttributeStore()

// Reactive state
const products = computed(() => productStore.products)
const loading = computed(() => productStore.loading)
const loadMoreTrigger = ref<HTMLDivElement | null>(null)
const filtersOpen = ref(false)
const selectedCategories = ref<string[]>([...(props.category || [])])
const selectedSizes = ref<string[]>([...(props.size || [])])
const selectedColors = ref<string[]>([...(props.color || [])])

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
    compareSizeValues(firstSize.label, secondSize.label),
  ),
)
const colorOptions = computed(() => itemAttributeStore.colors)

const getSizeOptionLabel = (size: { label: string; abbr: string | null }) =>
  isNumericAttributeValue(size.label) ? size.label : size.abbr || size.label

const getFilterChipClass = (
  selectedValues: string[],
  value: string,
  baseClass = '',
) => {
  const activeClass = 'border border-primary-200 bg-primary-100 text-neutral-950 shadow-sm'
  const inactiveClass = 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'

  return [
    baseClass,
    selectedValues.includes(value) ? activeClass : inactiveClass,
  ].join(' ')
}

const activeFilters = computed(() => [
  ...selectedSizes.value.map((value) => ({
    type: 'size',
    value,
    label: `Talla: ${sizeOptions.value.find((option) => option.value === value)?.label || value}`,
  })),
  ...selectedCategories.value.map((value) => ({ type: 'category', value, label: value })),
  ...selectedColors.value.map((value) => ({
    type: 'color',
    value,
    label: colorOptions.value.find((option) => option.value === value)?.label || value,
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
  const nextSizes = selectedSizes.value.map((value) => value.trim()).filter(Boolean)
  const nextColors = selectedColors.value.map((value) => value.trim()).filter(Boolean)
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
  )
}

const setupIntersectionObserver = () => {
  if (!loadMoreTrigger.value) return
  const observer = new IntersectionObserver(async (entries) => {
    if (entries[0].isIntersecting && !productStore.loading && productStore.hasMoreProducts) {
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
    selectedCategories.value = [...(newCategory || [])]
    selectedSizes.value = [...(newSize || [])]
    selectedColors.value = [...(newColor || [])]
    productStore.loadProducts(Boolean(newSale), newCategory, newSize, newColor, 1)
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
  itemAttributeStore.loadItemAttributes({ talla: true, color: true })
})
</script>

<style>
.observer-trigger {
  height: 1px;
}
</style>
