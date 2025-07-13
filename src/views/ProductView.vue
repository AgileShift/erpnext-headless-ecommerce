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

      <div v-if="product.price.discount_percent">
        <div class="inline-flex items-center justify-center text-xs font-medium text-white bg-secondary-600 py-1.5 px-3 mb-1">
          <SfIconSell size="sm" class="mr-1.5" /> SALE
        </div>
      </div>

      <h1 class="mb-1 font-bold">{{ product.item_name }}</h1>
      <h2 class="mb-4 font-light">{{ product.item_group }}</h2>

      <span class="block font-bold text-lg">
        <a>{{ product.price.local_formatted_price }}</a>
        <a class="font-thin"> | </a>
        <a>{{ product.price.formatted_price }}</a>
      </span>

      <span v-if="product.price.discount_percent" class="max-sm:block block font-bold">
        <del class="text-sm md:text-base text-neutral-500">{{ product.price.formatted_mrp }}</del>
        <a class="pl-2 text-sm md:text-base text-secondary-700">{{ product.price.formatted_discount_percent }} OFF</a>
      </span>

      <div class="py-4 mt-3 mb-4 border-gray-200 border-y">
        <div class="items-start xs:flex">
          <ContactButton class="w-full" size="lg" suffix="Enviar a WhatsApp" :item_name="product.item_name" />
        </div>
        <div class="hidden flex justify-center mt-4 gap-x-4">
          <SfButton size="sm" variant="tertiary">
            <SfIconFavorite size="sm" />Agregar a mi Lista
          </SfButton>
        </div>
      </div>
      <div class="flex first:mt-4" v-if="!product.price.discount_percent">
        <SfIconPackage size="sm" class="flex-shrink-0 mr-1 text-neutral-500" />
        <p class="text-sm">Envio Gratis en Managua Centro</p>
      </div>
      <div class="flex mt-4" v-if="product.price.discount_percent">
        <SfIconSafetyCheck size="sm" class="flex-shrink-0 mr-1 text-neutral-500" />
        <p class="text-sm">Prendas en descuento <strong>no aplican</strong> a Cambios o Devoluciones.</p>
      </div>
    </section>
  </div>

  <div v-else class="text-center">
    <h1 class="font-headings text-red-500">Producto no encontrado</h1>
  </div>

  <div class="text-right mt-16">
    <SfButton size="lg" class="text-center" tag="a" @click="$router.go(-1)">
      <template #prefix>
        <SfIconArrowBack size="sm" />
      </template>
      <template #suffix>
        Volver a la lista
      </template>
    </SfButton>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/stores/productStore'
import {
  SfButton, SfLink, SfLoaderCircular,
  SfIconFavorite, SfIconPackage, SfIconSafetyCheck, SfIconSell, SfIconArrowBack, SfIconCalendarToday, SfIconSchedule
} from '@storefront-ui/vue'
import ContactButton from '@/components/ContactButton.vue'

const route = useRoute()
const productStore = useProductStore()

const product = computed(() => productStore.currentProduct)
const loading = computed(() => productStore.loading)

onMounted(async () => {
  const itemCode = route.params.id as string
  await productStore.loadProduct(itemCode)
})
</script>
