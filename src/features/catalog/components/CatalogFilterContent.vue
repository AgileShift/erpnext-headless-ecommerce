<template>
  <div class="mb-4 flex items-start justify-between gap-3">
    <div>
      <h2 class="text-lg font-bold text-neutral-950">Filtros</h2>
    </div>
    <SfButton
      v-if="mobileActions"
      variant="tertiary"
      square
      class="!text-neutral-500"
      aria-label="Cerrar filtros"
      @click="emit('close')"
    ><SfIconClose aria-hidden="true" /></SfButton>
  </div>

  <ul class="divide-y divide-neutral-200 border-y border-neutral-200">
    <li>
      <SfAccordionItem v-model="openSections.size">
        <template #summary>
          <FilterSectionSummary label="Tallas" :selected-values="selectedSizes" :open="openSections.size" />
        </template>
        <ul class="grid grid-cols-5 gap-2 px-2 pb-4">
          <li v-for="size in sizes" :key="size.value">
            <SfChip v-model="selectedSizes" square size="sm" class="w-full" :input-props="{ value: size.value }">
              {{ getSizeLabel(size) }}
            </SfChip>
          </li>
        </ul>
      </SfAccordionItem>
    </li>

    <li>
      <SfAccordionItem v-model="openSections.category">
        <template #summary>
          <FilterSectionSummary label="Categorías" :selected-values="selectedCategories" :open="openSections.category" />
        </template>
        <div class="px-2 pb-4">
          <div v-if="searchable" class="mb-3">
            <SfInput v-model="categorySearch" aria-label="Buscar categoría" placeholder="Buscar categoría" />
            <button
              v-if="categorySearch"
              type="button"
              class="mt-2 text-sm font-semibold text-primary-700 underline"
              @click="categorySearch = ''"
            >Limpiar búsqueda</button>
          </div>
          <p
            v-if="searchable && categorySearch.trim() && !visibleCategories.length"
            role="status"
            class="mb-3 text-sm text-neutral-700"
          >No encontramos categorías con ese nombre.</p>
          <ul>
            <li v-for="category in visibleCategories" :key="category">
              <SfListItem
                tag="label"
                size="sm"
                :selected="selectedCategories.includes(category)"
                :class="[
                  'cursor-pointer rounded-md bg-transparent px-1.5 hover:bg-neutral-100',
                  { 'font-medium': selectedCategories.includes(category) },
                ]"
              >
                <template #prefix>
                  <SfCheckbox
                    v-model="selectedCategories"
                    wrapper-tag="span"
                    wrapper-class="flex items-center"
                    :value="category"
                  />
                </template>
                <span class="break-words text-sm">{{ category }}</span>
              </SfListItem>
            </li>
          </ul>
        </div>
      </SfAccordionItem>
    </li>

    <li>
      <SfAccordionItem v-model="openSections.color">
        <template #summary>
          <FilterSectionSummary label="Colores" :selected-values="selectedColors" :open="openSections.color" />
        </template>
        <div class="px-2 pb-4">
          <div v-if="searchable" class="mb-3">
            <SfInput v-model="colorSearch" aria-label="Buscar color" placeholder="Buscar color" />
            <button
              v-if="colorSearch"
              type="button"
              class="mt-2 text-sm font-semibold text-primary-700 underline"
              @click="colorSearch = ''"
            >Limpiar búsqueda</button>
          </div>
          <p
            v-if="searchable && attributesLoaded && colorSearch.trim() && !visibleColors.length"
            role="status"
            class="mb-3 text-sm text-neutral-700"
          >No encontramos colores con ese nombre.</p>
          <ul :class="['grid gap-2', mobileActions ? 'grid-cols-2' : 'grid-cols-1']">
            <li v-for="color in visibleColors" :key="color.value">
              <SfChip
                v-model="selectedColors"
                size="sm"
                class="w-full min-w-0 justify-start"
                :input-props="{ value: color.value }"
              >
                <template #prefix>
                  <SfThumbnail
                    size="sm"
                    class="shrink-0 border border-neutral-300"
                    :style="{ backgroundColor: getColorSwatch(color.value) }"
                  />
                </template>
                <span class="break-words text-left">{{ color.label }}</span>
              </SfChip>
            </li>
          </ul>
        </div>
      </SfAccordionItem>
    </li>
  </ul>

  <div :class="['mt-4 flex gap-3', { 'sticky bottom-0 bg-white py-3': mobileActions }]">
    <SfButton
      variant="secondary"
      class="w-full"
      :disabled="!hasActiveFilters"
      @click="emit('clear')"
    >Limpiar filtros</SfButton>
    <SfButton v-if="mobileActions" class="w-full" @click="emit('show-products')">Ver productos</SfButton>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  SfAccordionItem,
  SfButton,
  SfCheckbox,
  SfChip,
  SfIconClose,
  SfInput,
  SfListItem,
  SfThumbnail,
} from '@storefront-ui/vue'
import FilterSectionSummary from '@/features/catalog/components/FilterSectionSummary.vue'
import type { ItemAttributeOption } from '@/features/catalog/types/ItemAttribute'
import type { CatalogFilterSection } from '@/sites/types'
import { getColorSwatch } from '@/features/catalog/utils/colorSwatches'
import { isNumericAttributeValue } from '@/features/catalog/utils/attributeFormatting'
import { normalizeComparableText } from '@/features/catalog/utils/sizeOrdering'

const props = withDefaults(
  defineProps<{
    mobileActions?: boolean
    searchable: boolean
    initiallyOpen: CatalogFilterSection[]
    categories: string[]
    sizes: ItemAttributeOption[]
    colors: ItemAttributeOption[]
    attributesLoaded: boolean
  }>(),
  { mobileActions: false },
)
const emit = defineEmits<{ clear: []; close: []; 'show-products': [] }>()
const selectedCategories = defineModel<string[]>('categoriesModel', { required: true })
const selectedSizes = defineModel<string[]>('sizesModel', { required: true })
const selectedColors = defineModel<string[]>('colorsModel', { required: true })
const categorySearch = ref('')
const colorSearch = ref('')
const openSections = ref<Record<CatalogFilterSection, boolean>>({
  size: props.initiallyOpen.includes('size'),
  category: props.initiallyOpen.includes('category'),
  color: props.initiallyOpen.includes('color'),
})
const hasActiveFilters = computed(
  () => selectedCategories.value.length + selectedSizes.value.length + selectedColors.value.length > 0,
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
</script>
