<template>
  <section class="max-w-3xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">URL Builder</h1>
      <p class="text-neutral-600">
        Construí URLs de catálogo usando categoría, oferta, talla y color.
      </p>
    </div>

    <form class="grid gap-6 bg-white border border-neutral-200 rounded-lg p-6" @submit.prevent>
      <label class="grid gap-2">
        <span class="font-medium">Tipo de URL</span>
        <select v-model="urlMode" class="border border-neutral-300 rounded-md px-3 py-2">
          <option value="query">Query: /?category=...</option>
          <option value="categoryPath">Path: /category/:category</option>
          <option value="salePath">Oferta: /sale</option>
        </select>
      </label>

      <label class="grid gap-2">
        <span class="font-medium">Categoría</span>
        <input
          v-model.trim="category"
          type="text"
          class="border border-neutral-300 rounded-md px-3 py-2"
          placeholder="Ej: Maxi Vestidos"
        />
      </label>

      <label class="flex items-center gap-3">
        <input v-model="sale" type="checkbox" class="w-4 h-4" />
        <span class="font-medium">Solo productos en oferta</span>
      </label>

      <label class="grid gap-2">
        <span class="font-medium">Talla</span>
        <input
          v-model.trim="size"
          type="text"
          class="border border-neutral-300 rounded-md px-3 py-2"
          placeholder="Ej: S, M, L, 38"
        />
      </label>

      <label class="grid gap-2">
        <span class="font-medium">Color</span>
        <input
          v-model.trim="color"
          type="text"
          class="border border-neutral-300 rounded-md px-3 py-2"
          placeholder="Ej: Rojo, Negro, Azul"
        />
      </label>

      <div class="grid gap-2">
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

        <p v-if="copied" class="text-sm text-green-700">
          URL copiada al portapapeles.
        </p>
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
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

type UrlMode = 'query' | 'categoryPath' | 'salePath'

const urlMode = ref<UrlMode>('query')
const category = ref('')
const sale = ref(false)
const size = ref('')
const color = ref('')
const copied = ref(false)

const queryString = computed(() => {
  const params = new URLSearchParams()

  if (urlMode.value === 'query' && category.value) {
    params.set('category', category.value)
  }

  if (urlMode.value !== 'salePath' && sale.value) {
    params.set('sale', '1')
  }

  if (size.value) {
    params.set('talla', size.value)
  }

  if (color.value) {
    params.set('color', color.value)
  }

  return params.toString()
})

const basePath = computed(() => {
  if (urlMode.value === 'salePath') {
    return '/sale'
  }

  if (urlMode.value === 'categoryPath' && category.value) {
    return `/category/${encodeURIComponent(category.value)}`
  }

  return '/'
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
  urlMode.value = 'query'
  category.value = ''
  sale.value = false
  size.value = ''
  color.value = ''
  copied.value = false
}
</script>