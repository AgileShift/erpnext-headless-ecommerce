<template>
  <button
    type="button"
    :aria-expanded="open"
    aria-controls="catalog-filters"
    class="catalog-filter-toggle fixed bottom-5 right-4 z-30 inline-flex max-w-[calc(100vw-2rem)] items-center rounded-full border border-neutral-950 bg-neutral-950 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-neutral-800"
    @click="emit('update:open', !open)"
  >
    Filtros
    <span
      v-if="activeCount"
      class="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs text-neutral-950"
    >
      {{ activeCount }}
    </span>
  </button>

  <aside
    id="catalog-filters"
    v-show="open || desktopPanel"
    :class="[
      desktopPanel
        ? 'catalog-filter-panel'
        : 'fixed bottom-20 left-4 right-4 z-30 max-h-[76vh] overflow-y-auto rounded-lg border border-neutral-200 bg-white p-4 shadow-2xl md:left-auto md:w-[430px]',
      { 'catalog-filter-panel--open': open },
    ]"
    aria-label="Filtros del catálogo"
  >
    <div class="mb-3 flex items-center justify-between gap-3">
      <div>
        <p class="text-lg font-bold text-neutral-950">Filtros</p>
        <p class="text-sm text-neutral-500">Combiná categorías, tallas y colores.</p>
      </div>
      <button
        type="button"
        class="catalog-filter-close rounded-md px-2 py-1 text-sm font-semibold text-neutral-500 hover:bg-neutral-100"
        @click="emit('update:open', false)"
      >
        Cerrar
      </button>
    </div>

    <div class="space-y-5">
      <details :open="initiallyOpen.includes('size')" class="border-b border-neutral-200 pb-4">
        <summary class="cursor-pointer py-2 text-sm font-semibold text-neutral-900">
          Tallas
          <span v-if="selectedSizes.length" class="font-normal text-neutral-600"
            >({{ selectedSizes.length }}): {{ selectedSizes.join(', ') }}</span
          >
        </summary>
        <div class="flex flex-wrap gap-2">
          <SfChip
            v-for="size in sizes"
            :key="size.value"
            v-model="selectedSizes"
            square
            size="sm"
            :class="getChipClass(selectedSizes, size.value, 'min-w-9')"
            :input-props="{ value: size.value }"
          >
            {{ getSizeLabel(size) }}
          </SfChip>
        </div>
      </details>

      <details :open="initiallyOpen.includes('category')" class="border-b border-neutral-200 pb-4">
        <summary class="cursor-pointer py-2 text-sm font-semibold text-neutral-900">
          Categorías
          <span v-if="selectedCategories.length" class="font-normal text-neutral-600"
            >({{ selectedCategories.length }}): {{ selectedCategories.join(', ') }}</span
          >
        </summary>
        <div v-if="searchable" class="mb-3">
          <SfInput
            v-model="categorySearch"
            aria-label="Buscar categoría"
            placeholder="Buscar categoría"
          />
          <button
            v-if="categorySearch"
            type="button"
            class="mt-2 text-sm font-semibold text-primary-700 underline"
            @click="categorySearch = ''"
          >
            Limpiar búsqueda
          </button>
        </div>
        <p
          v-if="searchable && categorySearch.trim() && !visibleCategories.length"
          role="status"
          class="mb-3 text-sm text-neutral-700"
        >
          No encontramos categorías con ese nombre.
        </p>
        <div
          :class="searchable ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-2 gap-2 sm:grid-cols-3'"
        >
          <SfChip
            v-for="category in visibleCategories"
            :key="category"
            v-model="selectedCategories"
            size="sm"
            :class="getChipClass(selectedCategories, category, 'min-w-0 justify-start')"
            :input-props="{ value: category }"
          >
            <span
              :class="searchable ? 'line-clamp-2 break-words text-left leading-tight' : 'truncate'"
              >{{ category }}</span
            >
          </SfChip>
        </div>
      </details>

      <details :open="initiallyOpen.includes('color')" class="border-b border-neutral-200 pb-4">
        <summary class="cursor-pointer py-2 text-sm font-semibold text-neutral-900">
          Colores
          <span v-if="selectedColors.length" class="font-normal text-neutral-600"
            >({{ selectedColors.length }}): {{ selectedColors.join(', ') }}</span
          >
        </summary>
        <div v-if="searchable" class="mb-3">
          <SfInput v-model="colorSearch" aria-label="Buscar color" placeholder="Buscar color" />
          <button
            v-if="colorSearch"
            type="button"
            class="mt-2 text-sm font-semibold text-primary-700 underline"
            @click="colorSearch = ''"
          >
            Limpiar búsqueda
          </button>
        </div>
        <p
          v-if="searchable && attributesLoaded && colorSearch.trim() && !visibleColors.length"
          role="status"
          class="mb-3 text-sm text-neutral-700"
        >
          No encontramos colores con ese nombre.
        </p>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <SfChip
            v-for="color in visibleColors"
            :key="color.value"
            v-model="selectedColors"
            size="sm"
            :class="getChipClass(selectedColors, color.value, 'min-w-0 justify-start')"
            :input-props="{ value: color.value }"
          >
            <template #prefix>
              <SfThumbnail
                size="sm"
                class="border border-neutral-300"
                :style="{ backgroundColor: getColorSwatch(color.value) }"
              />
            </template>
            <span class="break-words text-left">{{ color.label }}</span>
          </SfChip>
        </div>
      </details>

      <SfButton variant="tertiary" class="w-full border border-neutral-300" @click="emit('clear')"
        >Limpiar</SfButton
      >
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { SfButton, SfChip, SfInput, SfThumbnail } from '@storefront-ui/vue'
import type { ItemAttributeOption } from '@/features/catalog/types/ItemAttribute'
import type { CatalogFilterSection } from '@/sites/types'
import { getColorSwatch } from '@/features/catalog/utils/colorSwatches'
import { isNumericAttributeValue } from '@/features/catalog/utils/attributeFormatting'
import { normalizeComparableText } from '@/features/catalog/utils/sizeOrdering'

const props = defineProps<{
  open: boolean
  desktopPanel: boolean
  searchable: boolean
  initiallyOpen: CatalogFilterSection[]
  categories: string[]
  sizes: ItemAttributeOption[]
  colors: ItemAttributeOption[]
  attributesLoaded: boolean
}>()
const emit = defineEmits<{ 'update:open': [value: boolean]; clear: [] }>()
const selectedCategories = defineModel<string[]>('categoriesModel', { required: true })
const selectedSizes = defineModel<string[]>('sizesModel', { required: true })
const selectedColors = defineModel<string[]>('colorsModel', { required: true })
const categorySearch = ref('')
const colorSearch = ref('')

const activeCount = computed(
  () => selectedCategories.value.length + selectedSizes.value.length + selectedColors.value.length,
)
const visibleCategories = computed(() => {
  const search = props.searchable ? normalizeComparableText(categorySearch.value) : ''
  return search
    ? props.categories.filter((category) => normalizeComparableText(category).includes(search))
    : props.categories
})
const visibleColors = computed(() => {
  const search = props.searchable ? normalizeComparableText(colorSearch.value) : ''
  return search
    ? props.colors.filter((color) => normalizeComparableText(color.label).includes(search))
    : props.colors
})
const getSizeLabel = (size: ItemAttributeOption) =>
  isNumericAttributeValue(size.label) ? size.label : size.abbr || size.label
const getChipClass = (selected: string[], value: string, base = '') =>
  [
    base,
    selected.includes(value)
      ? 'border border-primary-200 bg-primary-100 text-neutral-950 shadow-sm'
      : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50',
  ].join(' ')
</script>

<style>
.catalog-filter-panel {
  display: none;
  position: fixed;
  z-index: 30;
  inset: auto 1rem 5rem;
  max-height: 76vh;
  overflow-y: auto;
  border: 1px solid #e5e5e5;
  border-radius: 0.5rem;
  background: white;
  padding: 1rem;
  box-shadow: 0 15px 30px rgb(0 0 0 / 0.2);
}
.catalog-filter-panel--open {
  display: block;
}
@media (min-width: 1024px) {
  .catalog-filter-toggle,
  .catalog-filter-close {
    display: none;
  }
  .catalog-filter-panel {
    display: block;
    position: sticky;
    top: 1rem;
    grid-column: 1;
    grid-row: 1;
    max-height: calc(100vh - 2rem);
    box-shadow: none;
  }
}
</style>
