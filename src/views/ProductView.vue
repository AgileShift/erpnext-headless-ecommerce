<template>
  <div v-if="loading" class="text-center">
    <h1 class="font-headings">Cargando Producto</h1>
    <SfLoaderCircular size="4xl" />
  </div>
  <div v-else-if="product" class="mx-auto grid w-full max-w-7xl grid-cols-1 gap-y-4 px-4 md:grid-cols-2 md:items-start md:gap-x-[60px] md:px-8">
    <section class="w-full min-w-0">
      <div class="overflow-hidden rounded-md border border-neutral-200 bg-neutral-50 shadow-sm">
        <img
          class="w-full h-auto"
          :src="product.image"
          :alt="product.item_name"
          width="176"
          height="176"
        />
      </div>
    </section>

    <section class="w-full min-w-0 md:max-w-xl">
      <div v-if="product.price.discount_percent">
        <div class="inline-flex items-center justify-center text-xs font-semibold text-white bg-secondary-700 py-1.5 px-3 mb-2">
          <SfIconSell size="sm" class="mr-1.5" /> SALE
        </div>
      </div>

      <SfLink
        tag="router-link"
        :to="`/category/${product.item_group}`"
        variant="secondary"
        class="block no-underline pt-0.5 pb-1 font-light leading-5 text-neutral-700"
      >
        {{ product.item_group }}
      </SfLink>

      <p class="mb-2 text-lg font-bold leading-snug text-neutral-950 md:text-xl">
        {{ product.item_name }}
      </p>

      <span class="block font-bold text-xl text-neutral-950">
        <a>{{ product.price.local_formatted_price }}</a>
        <a class="font-thin"> | </a>
        <a>{{ product.price.formatted_price }}</a>
      </span>

      <span v-if="product.price.discount_percent" class="max-sm:block block font-bold">
        <del class="text-sm md:text-base text-neutral-400">{{ product.price.formatted_mrp }}</del>
        <a class="pl-2 text-sm md:text-base text-secondary-700"
          >{{ product.price.formatted_discount_percent }} OFF</a
        >
      </span>

      <span
        v-if="product.actual_qty"
        class="mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
        :class="
          product.actual_qty === 1
            ? 'bg-primary-800 text-secondary-100'
            : 'bg-primary-100 text-neutral-700'
        "
      >
        {{
          product.actual_qty === 1
            ? 'Última unidad disponible'
            : `${product.actual_qty} unidades disponibles`
        }}
      </span>

      <div class="py-4 mt-4 mb-4 border-y">
        <div class="justify-center items-start xs:flex">
          <ContactButton
            class="w-full"
            size="lg"
            suffix="Enviar a WhatsApp"
            :item_name="product.item_name"
          />
        </div>
        <div class="hidden flex justify-center mt-4 gap-x-4">
          <SfButton size="sm" variant="tertiary">
            <SfIconFavorite size="sm" />Agregar a mi Lista
          </SfButton>
        </div>
      </div>

      <div
        v-if="!product.price.discount_percent"
        class="flex rounded-md bg-neutral-50 p-3 text-neutral-700"
      >
        <SfIconPackage size="sm" class="flex-shrink-0 mr-2 text-neutral-500" />
        <p class="text-sm">Envio Gratis en Managua Centro</p>
      </div>
      <div v-if="product.price.discount_percent" class="grid gap-3 rounded-md bg-neutral-50 p-3">
        <div class="flex text-neutral-700">
          <SfIconSafetyCheck size="sm" class="flex-shrink-0 mr-2 text-neutral-500" />
          <p class="text-sm">
            Prendas en descuento <strong>no aplican</strong> a Cambios o Devoluciones.
          </p>
        </div>
        <div class="flex text-neutral-700">
          <SfIconPackage size="sm" class="flex-shrink-0 mr-2 text-neutral-500" />
          <p class="text-sm">Prendas en descuento <strong>no se envian a tallar</strong>.</p>
        </div>
      </div>
    </section>
  </div>

  <div v-else class="text-center">
    <h1 class="font-headings text-black">Producto no encontrado</h1>
  </div>

  <div class="mx-auto mt-8 flex w-full max-w-7xl justify-end px-4 md:mt-12 md:px-8">
    <SfButton size="lg" class="text-center" tag="a" @click="$router.go(-1)">
      <template #prefix>
        <SfIconArrowBack size="sm" />
      </template>
      <template #suffix>Volver a la lista</template>
    </SfButton>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/stores/productStore'
import {
  SfButton,
  SfLink,
  SfLoaderCircular,
  SfIconFavorite,
  SfIconPackage,
  SfIconSafetyCheck,
  SfIconSell,
  SfIconArrowBack,
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
