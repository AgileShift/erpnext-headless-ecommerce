<template>
  <button
    ref="toggleButton"
    type="button"
    :aria-expanded="open"
    aria-controls="catalog-filters-drawer"
    :class="[
      'catalog-filter-toggle fixed bottom-5 right-4 z-30 inline-flex max-w-[calc(100vw-2rem)] items-center rounded-full border border-neutral-950 bg-neutral-950 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-neutral-800',
      { 'catalog-filter-toggle--desktop-panel': desktopPanel },
    ]"
    @click="emit('update:open', true)"
  >
    Filtros
    <span
      v-if="activeCount"
      class="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs text-neutral-950"
    >{{ activeCount }}</span>
  </button>

  <aside
    v-if="desktopPanel"
    class="catalog-filter-desktop max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg border border-neutral-200 bg-white p-4"
    aria-label="Filtros del catálogo"
  >
    <CatalogFilterContent
      v-model:categories-model="selectedCategories"
      v-model:sizes-model="selectedSizes"
      v-model:colors-model="selectedColors"
      v-bind="contentProps"
      @clear="emit('clear')"
    />
  </aside>

  <div v-if="open" class="fixed inset-0 z-30 bg-neutral-950/40" aria-hidden="true" />
  <SfDrawer
    id="catalog-filters-drawer"
    v-model="drawerOpen"
    placement="right"
    tag="div"
    role="dialog"
    aria-modal="true"
    class="z-40 h-dvh w-[min(100%,26rem)] overflow-y-auto bg-white p-4 shadow-2xl"
    aria-label="Filtros del catálogo"
  >
    <div ref="drawerContent" class="min-h-full outline-none" data-testid="drawer-content" tabindex="-1">
      <CatalogFilterContent
        v-model:categories-model="selectedCategories"
        v-model:sizes-model="selectedSizes"
        v-model:colors-model="selectedColors"
        v-bind="contentProps"
        mobile-actions
        @clear="emit('clear')"
        @close="closeDrawer"
        @show-products="closeDrawer"
      />
    </div>
  </SfDrawer>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useScrollLock } from '@vueuse/core'
import { SfDrawer, useTrapFocus } from '@storefront-ui/vue'
import CatalogFilterContent from '@/features/catalog/components/CatalogFilterContent.vue'
import type { ItemAttributeOption } from '@/features/catalog/types/ItemAttribute'
import type { CatalogFilterSection } from '@/sites/types'

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
const toggleButton = ref<HTMLButtonElement | null>(null)
const drawerContent = ref<HTMLElement>()
const drawerActive = computed(() => props.open)
const pageScrollLocked = useScrollLock(document.body)
useTrapFocus(drawerContent, { activeState: drawerActive, initialFocus: 'container' })
const activeCount = computed(
  () => selectedCategories.value.length + selectedSizes.value.length + selectedColors.value.length,
)
const contentProps = computed(() => ({
  searchable: props.searchable,
  initiallyOpen: props.initiallyOpen,
  categories: props.categories,
  sizes: props.sizes,
  colors: props.colors,
  attributesLoaded: props.attributesLoaded,
}))
const drawerOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})
const closeDrawer = () => emit('update:open', false)

watch(
  () => props.open,
  (isOpen) => {
    pageScrollLocked.value = isOpen
  },
  { immediate: true },
)

watch(
  () => props.open,
  async (isOpen, wasOpen) => {
    if (!isOpen && wasOpen) {
      await nextTick()
      toggleButton.value?.focus()
    }
  },
)

onUnmounted(() => {
  pageScrollLocked.value = false
})
</script>

<style>
.catalog-filter-desktop {
  display: none;
}

@media (min-width: 1024px) {
  .catalog-filter-toggle--desktop-panel {
    display: none;
  }

  .catalog-filter-desktop {
    display: block;
    position: sticky;
    top: 1rem;
    grid-column: 1;
    grid-row: 1;
  }
}
</style>
