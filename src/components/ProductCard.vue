<template>
  <div
    class="flex h-full max-w-[280px] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white hover:shadow-lg"
  >
    <div class="relative">
      <SfLink tag="router-link" :to="productUrl" class="block">
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
        :to="productUrl"
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

      <div class="mt-1">
        <span class="block text-sm font-bold leading-tight md:text-base">
          <a>{{ product.price_summary.local_formatted_price }}</a>
          <a class="font-thin"> | </a>
          <a>{{ product.price_summary.formatted_price }}</a>
        </span>

        <span v-if="product.price.discount_percent" class="max-sm:block block font-bold">
          <del class="text-sm md:text-base text-neutral-400">{{ product.price.formatted_mrp }}</del>
          <a class="pl-1 text-sm md:text-base text-secondary-700"
            >{{ product.price.formatted_discount_percent }} OFF</a
          >
        </span>
      </div>

      <div v-if="visibleAttributes.length" class="mt-2 space-y-1.5">
        <div
          v-for="attribute in visibleAttributes"
          :key="attribute.name"
          class="flex min-w-0 flex-wrap items-center gap-1 text-xs text-neutral-700"
          :title="attribute.title"
        >
          <span class="mr-0.5 font-medium text-neutral-500">{{ attribute.name }}:</span>
          <SfChip
            v-for="value in attribute.formattedValues"
            :key="value"
            :model-value="true"
            square
            size="sm"
            class="pointer-events-none min-w-6"
          >
            {{ value }}
          </SfChip>
        </div>
      </div>

      <div class="mt-auto pt-3">
        <ContactButton
          class="w-full justify-center"
          size="sm"
          suffix="WhatsApp"
          :item_name="product.item_name"
          :message="whatsappMessage"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { SfChip, SfLink } from '@storefront-ui/vue'
import type { Product } from '@/types/Product'
import ContactButton from '@/components/ContactButton.vue'
import siteConfig from '@/config'
import { formatCompactAttributeValue, normalizeAttributeName } from '@/utils/attributeFormatting'

const props = defineProps<{
  product: Product
}>()

const visibleAttributeNames = computed(() =>
  (siteConfig.catalog?.productCardVisibleAttributes || ['Talla']).map(normalizeAttributeName),
)

const attributes = computed(() =>
  Object.entries(props.product.available_attributes)
    .filter(
      ([name, values]) =>
        values.length > 0 && visibleAttributeNames.value.includes(normalizeAttributeName(name)),
    )
    .map(([name, values]) => ({
      name,
      formattedValues: values.map(formatCompactAttributeValue),
      title: `${name}: ${values.join(', ')}`,
    })),
)

const visibleAttributes = computed(() => attributes.value)

const cardColor = computed(() => {
  const colorAttribute = Object.entries(props.product.available_attributes).find(
    ([name, values]) => normalizeAttributeName(name) === 'color' && values.length === 1,
  )

  return colorAttribute?.[1][0] || null
})

const productUrl = computed(() => ({
  path: `/product/${props.product.item_code}`,
  query: cardColor.value ? { color: cardColor.value } : {},
}))

const availableOptionsMessage = computed(() =>
  Object.entries(props.product.available_attributes)
    .filter(([, values]) => values.length > 0)
    .map(([name, values]) => `${name}: ${values.join(', ')}`)
    .join(' | '),
)

const whatsappMessage = computed(() => {
  const optionsMessage = availableOptionsMessage.value
    ? ` Opciones disponibles: ${availableOptionsMessage.value}.`
    : ''

  return `Tengo interés en el producto: ${props.product.item_name}.${optionsMessage}`
})
</script>
