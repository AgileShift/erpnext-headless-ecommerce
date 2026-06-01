<template>
  <section class="max-w-5xl mx-auto">
    <div class="mb-8">
      <h1 class="mb-2 text-3xl font-bold">Constructor de URLs</h1>
      <p class="text-neutral-600">
        Construí URLs de catálogo usando categorías reales, oferta, talla y color.
      </p>
    </div>

    <form class="grid gap-6 rounded-lg border border-neutral-200 bg-white p-6" @submit.prevent>
      <section class="grid gap-4">
        <div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 class="font-medium">Categorías en tiempo real</h2>
            <p class="text-sm text-neutral-500">
              La lista se alimenta desde el árbol actual de categorías del catálogo.
            </p>
          </div>

          <span
            class="w-fit rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-600"
          >
            {{ categoryStatusLabel }}
          </span>
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

        <div v-else class="max-h-[420px] overflow-y-auto rounded-md border border-neutral-200">
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

        <p class="text-sm text-neutral-500">
          Si elegís una sola categoría sin oferta, la URL usa
          <span class="font-medium text-neutral-700">/category/:category</span>. Con varias
          categorías u oferta, usa query params.
        </p>
      </section>

      <label class="flex items-center gap-3 border-t border-neutral-200 pt-6">
        <input v-model="sale" type="checkbox" class="h-4 w-4" />
        <span class="font-medium">Solo productos en oferta</span>
      </label>

      <section class="grid gap-3">
        <div>
          <h2 class="font-medium">Tallas</h2>
          <p class="text-sm text-neutral-500">Se cargan desde el atributo Talla de ERPNext.</p>
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

      <section class="grid gap-3">
        <div>
          <h2 class="font-medium">Colores</h2>
          <p class="text-sm text-neutral-500">Se cargan desde el atributo Color de ERPNext.</p>
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
            <input v-model="selectedColors" type="checkbox" :value="option.value" class="h-4 w-4" />
            <span>{{ option.label }}</span>
          </label>
        </div>
      </section>

      <section class="grid gap-3 border-t border-neutral-200 pt-6">
        <div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 class="font-medium">Constructor</h2>
            <p class="text-sm text-neutral-500">
              Los segmentos cambian conforme seleccionás filtros.
            </p>
          </div>
          <span
            class="w-fit rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-600"
          >
            {{ activeFilterCount }} filtros activos
          </span>
        </div>

        <dl class="grid gap-3 md:grid-cols-2">
          <div class="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
            <dt class="text-xs font-medium uppercase text-neutral-500">Ruta base</dt>
            <dd class="break-all font-medium text-neutral-900">{{ basePath }}</dd>
          </div>
          <div class="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
            <dt class="text-xs font-medium uppercase text-neutral-500">Query params</dt>
            <dd class="break-all font-medium text-neutral-900">{{ queryPreview }}</dd>
          </div>
          <div class="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
            <dt class="text-xs font-medium uppercase text-neutral-500">Categorías</dt>
            <dd class="break-words font-medium text-neutral-900">{{ selectedCategorySummary }}</dd>
          </div>
          <div class="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
            <dt class="text-xs font-medium uppercase text-neutral-500">Vista destino</dt>
            <dd class="font-medium text-neutral-900">{{ destinationLabel }}</dd>
          </div>
        </dl>
      </section>

      <div class="grid gap-2 border-t border-neutral-200 pt-6">
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
  itemAttributeStore.loadItemAttributes()
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

const categoryOptions = computed(() => {
  return buildCategoryOptions(categoryStore.categoryTree.children)
})

const selectedCategoryOptions = computed(() => {
  const selectedIds = new Set(selectedCategoryIds.value)
  return categoryOptions.value.filter((option) => selectedIds.has(option.id))
})

const categoryStatusLabel = computed(() => {
  if (categoryStore.loading) {
    return 'Sincronizando'
  }

  if (categoryStore.error) {
    return 'Error al cargar'
  }

  return `${categoryOptions.value.length} categorías`
})

const normalizedCategory = computed(() =>
  selectedCategoryOptions.value.map((option) => option.name),
)
const sizeOptions = computed(() => itemAttributeStore.sizes)
const colorOptions = computed(() => itemAttributeStore.colors)
const normalizedSize = computed(() => selectedSizes.value)
const normalizedColor = computed(() => selectedColors.value)

const selectedCategorySummary = computed(() => {
  if (selectedCategoryOptions.value.length === 0) {
    return 'Sin categorías'
  }

  return selectedCategoryOptions.value.map((option) => option.breadcrumb).join(', ')
})

const activeFilterCount = computed(() => {
  return (
    Number(sale.value) +
    normalizedCategory.value.length +
    normalizedSize.value.length +
    normalizedColor.value.length
  )
})

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

  if (normalizedSize.value.length > 0) {
    params.set('size', normalizedSize.value.join(','))
  }

  if (normalizedColor.value.length > 0) {
    params.set('color', normalizedColor.value.join(','))
  }

  return params.toString()
})

const queryPreview = computed(() =>
  queryString.value ? `?${queryString.value}` : 'Sin parámetros',
)

const relativeUrl = computed(() => {
  return queryString.value ? `${basePath.value}?${queryString.value}` : basePath.value
})

const destinationLabel = computed(() => {
  if (sale.value) {
    return 'Página de ofertas'
  }

  if (normalizedCategory.value.length === 1) {
    return 'Página de categoría'
  }

  return 'Catálogo general'
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
