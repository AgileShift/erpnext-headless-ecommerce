<template>
  <div v-if="loading" class="text-center">
    <h1 class="font-headings">Cargando Producto</h1>
    <SfLoaderCircular size="4xl" />
  </div>
  <div v-else-if="product" class="flex flex-wrap gap-16 place-content-center">
    <section class="md:max-w-[640px]">
      <SfLink href="#">
        <img class="w-full h-auto border rounded-md border-neutral-200"
          :src="product.image" :alt="product.item_name" width="176" height="176"
        />
      </SfLink>
    </section>
    <section class="md:max-w-[640px]">

      <div v-if="product.discount_percent" class="inline-flex items-center justify-center text-sm font-medium text-white bg-secondary-600 py-1.5 px-3 mb-4">
        <SfIconSell size="sm" class="mr-1.5" />
        SALE
      </div>

      <h1 class="mb-1 font-bold typography-headline-4">{{ product.item_name }}</h1>
      <h2 class="mb-4 font-light typography-headline-4">{{ product.item_group }}</h2>

      <strong class="block font-bold typography-headline-3">
        <span class="block pb-2 font-bold typography-text-lg">
          {{ product.price.formatted_price }}
          <del class="pl-1 typography-text-xs text-neutral-500" v-if="product.discount_percent">{{ product.price.formatted_mrp }}</del>
          <a class="pl-2 typography-text-xs text-secondary-700" v-if="product.discount_percent">{{ product.discount_percent }} OFF</a>
        </span>
      </strong>

      <div class="py-4 mb-4 border-gray-200 border-y">

        <div class="items-start xs:flex">
          <SfButton size="lg" class="w-full" tag="a" :href="`https://wa.me/50577020233?text=Tengo interés en el producto: ${product.item_name}`">
            <template #prefix>
              <SfIconShoppingCart size="sm" />
            </template>
            Enviar a WhatsApp
          </SfButton>
        </div>
        <div class="flex justify-center mt-4 gap-x-4">
          <SfButton size="sm" variant="tertiary">
            <SfIconFavorite size="sm" />
            Add to list
          </SfButton>
        </div>
      </div>
      <div class="flex first:mt-4" v-if="!product.discount_percent">
        <SfIconPackage size="sm" class="flex-shrink-0 mr-1 text-neutral-500" />
        <p class="text-sm">Envio Gratis en Managua Centro</p>
      </div>
      <div class="flex mt-4" v-if="product.discount_percent">
        <SfIconSafetyCheck size="sm" class="flex-shrink-0 mr-1 text-neutral-500" />
        <p class="text-sm">Prendas en descuento no aplican a Cambios o Devoluciones.</p>
      </div>
    </section>
  </div>
  <div v-else class="text-center">
    <h1 class="font-headings text-red-500">Producto no encontrado</h1>
  </div>

  <div class="text-right">
    <SfButton size="lg" class="text-center" tag="router-link" to="/">
      <template #prefix>
        <SfIconArrowBack size="sm" />
      </template>
      Volver a la lista
    </SfButton>
  </div>

  <router-link to="/" class="text-primary"></router-link>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/stores/productStore'
import {
  SfButton, SfLink, SfLoaderCircular,
  SfIconFavorite, SfIconPackage, SfIconSafetyCheck, SfIconSell, SfIconShoppingCart, SfIconArrowBack
} from '@storefront-ui/vue'

const route = useRoute()
const productStore = useProductStore()

const product = computed(() => productStore.currentProduct);
const loading = computed(() => productStore.loading);

onMounted(async () => {
  const itemCode = route.params.id as string
  await productStore.loadProduct(itemCode)
})
</script>
