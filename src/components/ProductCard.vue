<template>
  <div class="border border-neutral-200 rounded-md hover:shadow-lg max-w-[280px]">
    <div class="relative">
      <SfLink tag="router-link" :to="`/product/${product.item_code}`" class="block">
        <img :src="product.image" :alt="product.item_name" width="300" height="300"
          class="block object-cover h-auto rounded-md aspect-square"
        />
      </SfLink>
    </div>
    <div class="p-4 border-t border-neutral-200">
      <SfLink tag="router-link" :to="`/product/${product.item_code}`" variant="secondary" class="no-underline">{{ product.item_name }}</SfLink>

      <p class="block py-1 font-light leading-5 typography-text-sm text-neutral-700">{{ product.item_group }}</p>

      <span class="block pb-2 font-bold typography-text-lg">
        {{ product.price.formatted_price }}
        <del class="pl-1 typography-text-xs text-neutral-500" v-if="product.discount_percent">{{ product.price.formatted_mrp }}</del>
        <a class="pl-2 typography-text-xs text-secondary-700" v-if="product.discount_percent">{{ product.discount_percent }} OFF</a>
      </span>

      <SfButton size="sm" tag="a" :href="`https://wa.me/50577020233?text=Tengo interés en el producto: ${product.item_name}`">
        <template #prefix>
          <SfIconShoppingCart size="sm" />
        </template>
        Enviar por WhatsApp
      </SfButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { SfLink, SfButton, SfIconShoppingCart } from '@storefront-ui/vue'
import type { Product } from '@/types/product'

defineProps<{
  product: Product
}>()

</script>
