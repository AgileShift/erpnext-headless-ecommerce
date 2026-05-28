<template>
  <div
    class="flex h-full max-w-[280px] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white hover:shadow-lg"
  >
    <div class="relative">
      <SfLink tag="router-link" :to="`/product/${product.item_code}`" class="block">
        <img
          :src="product.image"
          :alt="product.item_name"
          width="300"
          height="300"
          class="block aspect-square h-auto w-full object-cover"
        />
      </SfLink>
    </div>
    <div class="flex flex-1 flex-col p-4 pt-2">
      <SfLink
        tag="router-link"
        :to="`/product/${product.item_code}`"
        variant="secondary"
        class="text-sm font-medium no-underline md:text-base"
        >{{ product.item_name }}</SfLink
      >
      <SfLink
        tag="router-link"
        :to="`/category/${product.item_group}`"
        variant="secondary"
        class="hidden pb-1 pt-0.5 font-thin leading-4 text-neutral-700 no-underline md:block"
      >
        {{ product.item_group }}
      </SfLink>

      <div>
        <span class="block font-bold">
          <a>{{ product.price.local_formatted_price }}</a>
          <a class="font-thin"> | </a>
          <a>{{ product.price.formatted_price }}</a>
        </span>

        <span v-if="product.price.discount_percent" class="max-sm:block block font-bold">
          <del class="text-sm md:text-base text-neutral-400">{{ product.price.formatted_mrp }}</del>
          <a class="pl-1 text-sm md:text-base text-secondary-700"
            >{{ product.price.formatted_discount_percent }} OFF</a
          >
        </span>
      </div>

      <div class="mt-auto pt-1">
        <ContactButton
          class="w-full justify-center"
          size="sm"
          suffix="Enviar a WhatsApp"
          :item_name="product.item_name"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { SfLink } from '@storefront-ui/vue'
import type { Product } from '@/types/Product'
import ContactButton from '@/components/ContactButton.vue'

defineProps<{
  product: Product
}>()
</script>
