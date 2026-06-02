<template>
  <section class="max-w-7xl mx-auto">
    <div class="mb-3">
      <h1 class="text-3xl font-bold">Constructor de URLs</h1>
    </div>

    <form class="grid gap-6 rounded-lg border border-neutral-200 bg-white p-6" @submit.prevent>
      <div class="grid gap-6 md:grid-cols-2">
        <section class="grid gap-3">
          <div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 class="font-medium">Categorías</h2>
            </div>
          </div>

          <div
            v-if="categoryStore.loading"
            class="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-600"
          >
            Cargando categorías...
          </div>

          <div
            v-else-if="categoryStore.error"
            class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {{ categoryStore.error }}
          </div>

          <div
            v-else-if="categoryOptions.length === 0"
            class="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-600"
          >
            No hay categorías disponibles.
          </div>

          <div v-else class="max-h-[740px] overflow-y-auto rounded-md border border-neutral-200">
            <label
              v-for="option in categoryOptions"
              :key="option.id"
              class="flex cursor-pointer items-center gap-3 border-b border-neutral-100 px-3 py-2 last:border-b-0 hover:bg-neutral-50"
              :class="{
                'bg-primary-100 hover:bg-primary-100': selectedCategoryIds.includes(option.id),
              }"
            >
              <input
                v-model="selectedCategoryIds"
                type="checkbox"
                :value="option.id"
                class="h-4 w-4 shrink-0"
              />
              <span
                class="grid min-w-0 gap-0.5"
                :style="{ paddingLeft: `${option.depth * 0.75}rem` }"
              >
                <span class="flex min-w-0 items-center gap-2">
                  <span class="truncate font-medium text-neutral-900">{{ option.name }}</span>
                  <span
                    v-if="option.hasChildren"
                    class="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
                  >
                    Grupo
                  </span>
                </span>
                <span class="truncate text-xs text-neutral-500">{{ option.breadcrumb }}</span>
              </span>
            </label>
          </div>
        </section>

        <section class="grid gap-3">
          <div class="">
            <h2 class="font-medium">Colores</h2>
          </div>

          <div
            v-if="itemAttributeStore.loading"
            class="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600"
          >
            Cargando colores...
          </div>

          <div
            v-else-if="itemAttributeStore.error"
            class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {{ itemAttributeStore.error }}
          </div>

          <div
            v-else-if="colorOptions.length === 0"
            class="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600"
          >
            No hay colores disponibles.
          </div>

          <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-2">
            <label
              v-for="option in colorOptions"
              :key="option.value"
              class="flex cursor-pointer items-center gap-3 rounded-md border border-neutral-200 px-3 py-2 hover:bg-neutral-50"
            >
              <input
                v-model="selectedColors"
                type="checkbox"
                :value="option.value"
                class="h-4 w-4"
              />
              <span>{{ option.label }}</span>
            </label>
          </div>
        </section>
      </div>

      <section class="grid gap-3">
        <div>
          <h2 class="font-medium">Tallas</h2>
        </div>

        <div
          v-if="itemAttributeStore.loading"
          class="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600"
        >
          Cargando tallas...
        </div>

        <div
          v-else-if="itemAttributeStore.error"
          class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {{ itemAttributeStore.error }}
        </div>

        <div
          v-else-if="sizeOptions.length === 0"
          class="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600"
        >
          No hay tallas disponibles.
        </div>

        <div v-else class="flex flex-wrap gap-2">
          <label v-for="option in sizeOptions" :key="option.value" class="cursor-pointer">
            <input
              v-model="selectedSizes"
              type="checkbox"
              :value="option.value"
              class="peer sr-only"
            />
            <span
              class="inline-flex items-center rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100 peer-checked:border-primary-700 peer-checked:bg-primary-700 peer-checked:text-white"
            >
              {{ option.label }}
            </span>
          </label>
        </div>
      </section>

      <label class="flex items-center gap-3 border-t border-neutral-200 pt-5">
        <input v-model="sale" type="checkbox" class="h-4 w-4" />
        <span class="font-medium">Solo productos en oferta</span>
      </label>

      <div class="grid gap-1 border-t border-neutral-200 pt-3">
        <span class="font-medium">URL generada</span>

        <div class="flex flex-col md:flex-row gap-3">
          <input
            :value="generatedUrl"
            readonly
            class="flex-1 border border-neutral-300 rounded-md px-3 py-2 bg-neutral-50"
          />

          <button
            type="button"
            class="bg-primary-700 text-white rounded-md px-4 py-2 hover:bg-primary-800"
            @click="copyUrl"
          >
            Copiar
          </button>
        </div>

        <p v-if="copied" class="text-sm text-green-700">URL copiada al portapapeles.</p>
      </div>

      <div class="flex flex-col md:flex-row gap-3">
        <RouterLink
          :to="relativeUrl"
          class="text-center bg-neutral-900 text-white rounded-md px-4 py-2 hover:bg-neutral-700"
        >
          Abrir URL
        </RouterLink>

        <button
          type="button"
          class="border border-neutral-300 rounded-md px-4 py-2 hover:bg-neutral-100"
          @click="resetForm"
        >
          Limpiar
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { Category } from '@/types/Category'
import { useCategoryStore } from '@/stores/categoryStore'
import { useItemAttributeStore } from '@/stores/itemAttributeStore'

type CategoryOption = {
  id: string
  name: string
  breadcrumb: string
  depth: number
  hasChildren: boolean
}

const categoryStore = useCategoryStore()
const itemAttributeStore = useItemAttributeStore()
const sale = ref(false)
const copied = ref(false)

const selectedCategoryIds = ref<string[]>([])
const selectedSizes = ref<string[]>([])
const selectedColors = ref<string[]>([])

onMounted(() => {
  categoryStore.loadCategories()
  itemAttributeStore.loadItemAttributes({ color: true, talla: true })
})

const buildCategoryOptions = (
  nodes: Category[] = [],
  parentPath: string[] = [],
): CategoryOption[] => {
  return nodes.flatMap((node) => {
    const children = node.children || []
    const path = [...parentPath, node.name]
    const option = {
      id: path.join(' > '),
      name: node.name,
      breadcrumb: path.join(' / '),
      depth: parentPath.length,
      hasChildren: children.length > 0,
    }

    return [option, ...buildCategoryOptions(children, path)]
  })
}

const categoryOptions = computed(() => buildCategoryOptions(categoryStore.categoryTree.children))

const selectedCategoryOptions = computed(() => {
  const selectedIds = new Set(selectedCategoryIds.value)
  return categoryOptions.value.filter((option) => selectedIds.has(option.id))
})

const normalizedCategory = computed(() =>
  selectedCategoryOptions.value.map((option) => option.name),
)
const sizeOptions = computed(() => itemAttributeStore.sizes)
const colorOptions = computed(() => itemAttributeStore.colors)
const basePath = computed(() => {
  if (sale.value) {
    return '/sale'
  }

  if (normalizedCategory.value.length === 1) {
    return `/category/${encodeURIComponent(normalizedCategory.value[0])}`
  }

  return '/'
})

const queryString = computed(() => {
  const params = new URLSearchParams()

  if (normalizedCategory.value.length > 1 || (sale.value && normalizedCategory.value.length > 0)) {
    params.set('category', normalizedCategory.value.join(','))
  }

  if (selectedSizes.value.length > 0) {
    params.set('size', selectedSizes.value.join(','))
  }

  if (selectedColors.value.length > 0) {
    params.set('color', selectedColors.value.join(','))
  }

  return params.toString()
})

const relativeUrl = computed(() => {
  return queryString.value ? `${basePath.value}?${queryString.value}` : basePath.value
})

const generatedUrl = computed(() => {
  return `${window.location.origin}${relativeUrl.value}`
})

const copyUrl = async () => {
  await navigator.clipboard.writeText(generatedUrl.value)
  copied.value = true

  window.setTimeout(() => {
    copied.value = false
  }, 2000)
}

const resetForm = () => {
  sale.value = false
  selectedCategoryIds.value = []
  selectedSizes.value = []
  selectedColors.value = []
  copied.value = false
}
</script>
<!-- 408-->
