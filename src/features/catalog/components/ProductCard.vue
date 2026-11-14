<template>
  <div
    class="flex h-full max-w-[280px] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white hover:shadow-lg"
  >
    <div class="relative aspect-square overflow-hidden">
      <SfLink tag="router-link" :to="productUrl" class="block h-full">
        <ProductImage
          :src="product.image"
          sizes="(min-width: 1280px) 280px, (min-width: 768px) 33vw, 50vw"
          :alt="product.item_name"
          responsive
          width="300"
          height="300"
          :loading="eager ? 'eager' : 'lazy'"
          decoding="async"
          :fetchpriority="eager ? 'high' : 'low'"
          class="block h-full w-full object-cover"
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
          <span>{{ product.price_summary.local_formatted_price }}</span>
          <span class="font-thin"> | </span>
          <span>{{ product.price_summary.formatted_price }}</span>
        </span>

        <span v-if="product.price.discount_percent" class="block font-bold">
          <s class="text-sm md:text-base text-neutral-400">{{ product.price.formatted_mrp }}</s>
          <span class="pl-1 text-sm md:text-base text-(--site-sale-text)">{{ product.price.formatted_discount_percent }} OFF</span>
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
            <span
            v-for="value in attribute.formattedValues"
            :key="value"
              class="rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-700"
          >
            {{ value }}
            </span>
        </div>
      </div>

      <div class="mt-auto space-y-2 pt-3">
        <SfButton
          size="sm"
          class="w-full justify-center site-primary-label"
          @click="added = false; showQuickAdd = true"
        >
          Agregar al carrito
        </SfButton>
        <ContactButton
          class="w-full justify-center whitespace-nowrap !px-1 !text-xs"
          size="sm"
          suffix="Consultar por WhatsApp"
          secondary
          :item_name="product.item_name"
          :message="whatsappMessage"
        />
      </div>
      <p v-if="added" role="status" class="mt-2 text-center text-xs text-neutral-700">Agregado al carrito</p>
    </div>
    <QuickAddModal v-model="showQuickAdd" :card="product" :color="cardColor" :product-url="productUrl" @added="added = true" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { SfButton, SfLink } from '@storefront-ui/vue'
import type { Product } from '@/features/catalog/types/Product'
import ContactButton from '@/shared/components/ContactButton.vue'
import ProductImage from '@/shared/components/ProductImage.vue'
import QuickAddModal from './QuickAddModal.vue'
import siteConfig from '@/config'
import { formatCompactAttributeValue, normalizeAttributeName } from '@/features/catalog/utils/attributeFormatting'

const props = defineProps<{
  product: Product
  eager?: boolean
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
const showQuickAdd = ref(false)
const added = ref(false)

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
