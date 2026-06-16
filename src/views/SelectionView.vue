<template>
  <section class="mx-auto max-w-4xl">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-neutral-950">Mi selección</h1>
      </div>

      <SfButton v-if="selection.items.length" variant="tertiary" size="sm" @click="selection.clear()">
        Limpiar
      </SfButton>
    </div>

    <div v-if="!selection.items.length" class="rounded-md border border-neutral-200 p-6 text-center">
      <p class="font-medium text-neutral-900">Todavía no agregaste productos.</p>
      <SfButton tag="router-link" to="/" class="mt-4">Ver catálogo</SfButton>
    </div>

    <div v-else class="space-y-3">
      <article
        v-for="item in selection.items"
        :key="item.item_code"
        class="flex gap-3 rounded-md border border-neutral-200 bg-white p-3"
      >
        <router-link :to="getProductLink(item)" class="block flex-shrink-0">
          <img
            :src="item.image"
            :alt="item.item_name"
            loading="lazy"
            decoding="async"
            class="h-24 w-20 rounded-md object-cover"
          />
        </router-link>

        <div class="min-w-0 flex-1">
          <router-link
            :to="getProductLink(item)"
            class="font-semibold leading-snug text-neutral-950 no-underline hover:text-neutral-600"
          >
            {{ item.item_name }}
          </router-link>
          <p class="mt-1 text-sm text-neutral-600">{{ formatAttributes(item.attributes) }}</p>
          <p class="mt-1 text-sm font-bold text-neutral-950">
            {{ item.price.local_formatted_price }} | {{ item.price.formatted_price }}
          </p>
          <p class="text-xs text-neutral-500">Cantidad: {{ item.qty }}</p>
        </div>

        <button
          type="button"
          class="self-start rounded-md px-2 py-1 text-sm font-semibold text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          @click="selection.removeItem(item.item_code)"
        >
          Quitar
        </button>
      </article>

      <div class="rounded-md border border-neutral-200 bg-neutral-50 p-4">
        <p class="text-sm font-semibold text-neutral-900">
          Total de selección: {{ formattedTotal }}
        </p>
        <p class="mt-1 text-sm leading-5 text-neutral-600">
          Esta selección no finaliza una compra en la web. <br>
          Confirmaremos disponibilidad, datos de entrega y forma de pago por nuestros canales autorizados antes de cerrar el pedido.
        </p>
        <SfButton tag="a" :href="whatsappHref" class="mt-3 w-full justify-center" size="lg">
          Enviar selección por WhatsApp
        </SfButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { SfButton } from '@storefront-ui/vue'
import siteConfig from '@/config'
import { type SelectionItem, useSelectionStore } from '@/stores/selectionStore'
import type { ProductVariantAttributes } from '@/types/Product'

const selection = useSelectionStore()

onMounted(() => {
  selection.reloadFromStorage()
})

const formatAttributes = (attributes: ProductVariantAttributes) =>
  Object.entries(attributes)
    .map(([name, value]) => `${name}: ${value}`)
    .join(' | ')

const getAttributeValue = (attributes: ProductVariantAttributes, attributeName: string) =>
  Object.entries(attributes).find(
    ([name]) => name.trim().toLowerCase() === attributeName.toLowerCase(),
  )?.[1]

const normalizeCodePart = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')

const getAttributeCodeParts = (attributes: ProductVariantAttributes) =>
  Object.entries(attributes).flatMap(([name, value]) => {
    const normalizedName = name.trim().toLowerCase()
    const normalizedValue = normalizeCodePart(value)

    if (normalizedName === 'talla') {
      const sizeCodes: Record<string, string> = {
        SMALL: 'S',
        MEDIUM: 'M',
        LARGE: 'L',
        'EXTRA SMALL': 'XS',
        'EXTRA LARGE': 'XL',
      }

      return [normalizedValue, sizeCodes[normalizedValue]].filter(Boolean)
    }

    return [normalizedValue, normalizedValue.replace(/\s+/g, '-')]
  })

const getProductItemCode = (item: SelectionItem) => {
  if (item.product_item_code) {
    return item.product_item_code
  }

  const codeParts = getAttributeCodeParts(item.attributes)
  let itemCode = item.item_code
  let changed = true

  while (changed) {
    changed = false

    for (const codePart of codeParts) {
      if (itemCode.toUpperCase().endsWith(`-${codePart}`)) {
        itemCode = itemCode.slice(0, -codePart.length - 1)
        changed = true
      }
    }
  }

  return itemCode
}

const getProductLink = (item: SelectionItem) => {
  const color = getAttributeValue(item.attributes, 'color')

  return {
    path: `/product/${getProductItemCode(item)}`,
    query: color ? { color } : {},
  }
}

const formattedTotal = computed(() =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(selection.total),
)

const whatsappMessage = computed(() => {
  const items = selection.items
    .map(
      (item) =>
        `- ${item.item_name} (${formatAttributes(item.attributes)}) x${item.qty} - ${item.price.formatted_price}`,
    )
    .join('\n')

  return `Hola, quiero consultar esta selección:\n${items}\nTotal de selección: ${formattedTotal.value}`
})

const whatsappHref = computed(
  () =>
    `https://wa.me/${siteConfig.contact.whatsApp}?text=${encodeURIComponent(whatsappMessage.value)}`,
)
</script>
