<template>
  <div class="border border-neutral-200 rounded-md hover:shadow-lg max-w-[280px]">
    <div class="relative">
      <SfLink tag="router-link" :to="`/product/${product.item_code}`" class="block">
        <img :src="product.image" :alt="product.item_name" width="300" height="300" class="block object-cover h-auto rounded-md aspect-square" />
      </SfLink>
    </div>
    <div class="p-4">
      <SfLink tag="router-link" :to="`/product/${product.item_code}`" variant="secondary" class="no-underline text-sm md:text-base">{{ product.item_name }}</SfLink>
      <SfLink tag="router-link" :to="`/category/${product.item_group}`" variant="secondary" class="hidden md:block no-underline pt-0.5 pb-1 font-light leading-5 text-neutral-700">
        {{ product.item_group }}
      </SfLink>

      <span class="block font-bold">
        <a>{{ product.price.local_formatted_price }}</a>
        <a class="font-thin"> | </a>
        <a>{{ product.price.formatted_price }}</a>
      </span>

      <span v-if="product.price.discount_percent" class="max-sm:block block font-bold">
        <del class="text-sm md:text-base text-neutral-500">{{ product.price.formatted_mrp }}</del>
        <a class="pl-1 text-sm md:text-base text-secondary-700">{{ product.price.formatted_discount_percent }} OFF</a>
      </span>

      <ContactButton class="mt-2" size="sm" suffix="WhatsApp" :item_name="product.item_name" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { SfLink } from '@storefront-ui/vue'
import type { Product } from '@/types/product'
import ContactButton from '@/views/ContactButton.vue'

defineProps<{
  product: Product
}>()

</script>
