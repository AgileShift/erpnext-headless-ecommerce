<template>
  <section class="mx-auto max-w-6xl">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-neutral-950">Carrito</h1>
      </div>

      <SfButton v-if="selection.items.length" variant="tertiary" size="sm" class="!text-neutral-800" @click="selection.clear()">
        Vaciar carrito
      </SfButton>
    </div>

    <div v-if="!selection.items.length" class="rounded-md border border-neutral-200 p-6 text-center">
      <p class="font-medium text-neutral-900">
        Tu carrito está vacío
      </p>
      <SfButton tag="router-link" to="/" class="mt-4 site-primary-label">Ver catálogo</SfButton>
    </div>

    <div v-else class="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
      <div class="space-y-4">
        <article v-for="group in cartGroups" :key="group.key" class="cart-product rounded-xl border border-neutral-200 bg-white p-4">
            <router-link :to="getProductLink(group.item)" class="cart-product-image relative">
              <ProductImage :src="group.item.image" :alt="group.name" class="aspect-square w-full rounded-lg object-cover" />
              <SaleBadge v-if="group.items.every((item) => (item.price.discount_percent || 0) > 0)" class="absolute left-1 top-1" />
            </router-link>
            <div class="cart-product-heading min-w-0">
              <h2 class="text-lg font-semibold leading-snug text-neutral-950">
                <router-link :to="getProductLink(group.item)" class="hover:underline">{{ group.name }}</router-link>
              </h2>
              <p v-if="group.color" class="mt-1 text-sm text-neutral-600">Color: {{ formatAttributeDisplayValue('Color', group.color, group.item.attributeAbbreviations?.Color) }}</p>
            </div>
          <ul class="cart-product-variants divide-y divide-neutral-200 border-t border-neutral-200">
            <li
              v-for="item in group.items" :key="item.item_code"
              class="cart-variant-row py-3"
            >
              <div class="cart-variant-label min-w-0">
                <p v-if="variantLabel(item)" class="text-sm font-semibold">{{ variantLabel(item) }}</p>
              </div>
              <div class="cart-variant-controls flex items-center gap-1">
              <div class="flex flex-col items-center">
              <div role="group" :aria-label="variantLabel(item) || group.name" class="relative isolate inline-flex items-center before:pointer-events-none before:absolute before:inset-x-0 before:inset-y-1.5 before:-z-10 before:rounded-full before:border before:border-neutral-300">
                <SfButton
                  variant="tertiary" size="sm" square class="!h-10 !w-7 !rounded-l-full !text-neutral-900 disabled:!text-neutral-400"
                  aria-label="Reducir cantidad" :disabled="item.qty <= 1"
                  @click="selection.setQuantity(item.item_code, item.qty - 1)"
                ><SfIconRemove size="sm" /></SfButton>
                <output class="min-w-5 text-center text-sm tabular-nums" aria-label="Cantidad">{{ item.qty }}</output>
                <SfButton
                  variant="tertiary" size="sm" square class="!h-10 !w-7 !rounded-r-full !text-neutral-900 disabled:!text-neutral-400"
                  aria-label="Aumentar cantidad" :disabled="item.maxQty === undefined || item.qty >= item.maxQty"
                  @click="selection.setQuantity(item.item_code, item.qty + 1)"
                ><SfIconAdd size="sm" /></SfButton>
              </div>
              <p v-if="item.maxQty !== undefined" class="text-center text-xs text-neutral-600" title="Disponibilidad guardada al agregar el producto">
                <strong class="text-neutral-900">{{ item.maxQty }}</strong> {{ item.maxQty === 1 ? 'disponible' : 'disponibles' }}
              </p>
              </div>
                <SfButton
                  variant="tertiary"
                  size="sm"
                  square
                  class="!h-10 !w-10 !text-neutral-600"
                  :aria-label="`Quitar ${variantLabel(item) || group.name} del carrito`"
                  @click="selection.removeItem(item.item_code)"
                >
                  <SfIconDelete size="sm" aria-hidden="true" />
                </SfButton>
              </div>
              <div class="cart-variant-price min-w-0 text-right">
                <p class="text-base font-bold leading-tight tabular-nums text-neutral-950"><span class="sr-only">Subtotal de la variante: </span>{{ formatCartAmount(item.price.price_list_rate * item.qty) }}</p>
                <p v-if="item.qty > 1" class="mt-1 text-xs text-neutral-600">{{ formatCartAmount(item.price.price_list_rate) }} por unidad</p>
                <p v-if="item.price.discount_percent && item.price.formatted_mrp" class="mt-1 text-xs">
                  <span class="sr-only">Precio anterior por unidad: </span><s class="text-neutral-600">{{ item.price.formatted_mrp }}</s>
                  <span class="ml-1 font-semibold text-(--site-sale-text)">{{ item.price.formatted_discount_percent || `${item.price.discount_percent}%` }} OFF</span>
                </p>
              </div>
            </li>
          </ul>
        </article>
      </div>

      <div class="rounded-md border border-neutral-200 bg-neutral-50 p-4">
        <h2 class="font-semibold text-neutral-950">Resumen del carrito</h2>
        <dl class="mt-3 flex flex-wrap justify-between gap-x-2 border-t border-neutral-200 pt-3 text-sm">
          <dt>Subtotal</dt>
          <dd class="font-semibold tabular-nums">{{ formattedCartTotal }}</dd>
        </dl>
        <p class="mt-1 text-sm leading-5 text-neutral-600">
          Confirmamos disponibilidad, entrega y pago por WhatsApp.
        </p>
        <SfButton
          tag="a" :href="whatsappHref" class="mt-3 w-full justify-center site-primary-label" size="lg"
        >
          Consultar por WhatsApp
        </SfButton>
        <SfButton v-if="showCheckoutPreview" tag="router-link" to="/checkout" variant="secondary" class="mt-3 w-full">Probar proceso de compra</SfButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
const showCheckoutPreview = import.meta.env.DEV
import { SfButton, SfIconAdd, SfIconDelete, SfIconRemove } from '@storefront-ui/vue'
import siteConfig from '@/config'
import ProductImage from '@/shared/components/ProductImage.vue'
import SaleBadge from '@/shared/components/SaleBadge.vue'
import { type SelectionItem, useSelectionStore } from '@/features/cart/stores/selectionStore'
import type { ProductVariantAttributes } from '@/features/catalog/types/Product'
import { formatAttributeDisplayValue } from '@/features/catalog/utils/attributeFormatting'

const selection = useSelectionStore()

onMounted(() => {
  selection.reloadFromStorage()
})

const formatAttributes = (item: SelectionItem, includeColor = true) =>
  Object.entries(item.attributes)
    .filter(([name]) => includeColor || name !== 'Color')
    .sort(([first], [second]) => first.localeCompare(second, 'es'))
    .map(([name, value]) => `${name}: ${formatAttributeDisplayValue(name, value, item.attributeAbbreviations?.[name])}`)
    .join(' | ')

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
  const color = item.attributes.Color

  return {
    path: `/product/${getProductItemCode(item)}`,
    query: color ? { color } : {},
  }
}

const variantLabel = (item: SelectionItem) => formatAttributes(item, false)

const cartGroups = computed(() => {
  const groups = new Map<string, { key: string; name: string; color?: string; item: SelectionItem; items: SelectionItem[] }>()

  for (const item of selection.items) {
    const color = item.attributes.Color
    const key = JSON.stringify([getProductItemCode(item), color ?? ''])
    const group = groups.get(key)
    if (group) {
      group.items.push(item)
      continue
    }

    const variantSuffix = /[\s-]+/g
    const nameParts = item.item_name.split(variantSuffix)
    const suffixes = getAttributeCodeParts(item.attributes).map((part) => normalizeCodePart(part).replace(variantSuffix, ' '))
    let end = nameParts.length
    while (end > 1) {
      const suffix = suffixes.find((part) => {
        const length = part.split(' ').length
        return length < end && normalizeCodePart(nameParts.slice(end - length, end).join(' ')) === part
      })
      if (!suffix) break
      end -= suffix.split(' ').length
    }
    const suffixStart = [...item.item_name.matchAll(/[\s-]+/g)][end - 1]?.index
    const name = item.product_name || item.item_name.slice(0, suffixStart ?? item.item_name.length).trim()
    groups.set(key, { key, name, color, item, items: [item] })
  }

  return [...groups.values()]
})

const nioFormatter = new Intl.NumberFormat('es-NI', {
  style: 'currency',
  currency: 'NIO',
  maximumFractionDigits: 0,
})
const cartUsdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})
const formatCartAmount = (amount: number) =>
  `${nioFormatter.format(amount * siteConfig.catalog.exchangeRate)} | ${cartUsdFormatter.format(amount)}`
const formattedCartTotal = computed(() => formatCartAmount(selection.total))

const whatsappMessage = computed(() => {
  const items = cartGroups.value
    .flatMap((group) =>
      group.items.map((item) =>
        [
          `• ${group.name}`,
          formatAttributes(item),
          `Cantidad: ${item.qty}`,
          `Total: ${formatCartAmount(item.price.price_list_rate * item.qty)}`,
        ]
          .filter(Boolean)
          .join('\n'),
      ),
    )
    .join('\n\n')

  return `Hola, quiero consultar mi carrito:\n\n${items}\n\nSubtotal: ${formattedCartTotal.value}`
})

const whatsappHref = computed(
  () =>
    `https://wa.me/${siteConfig.contact.whatsApp}?text=${encodeURIComponent(whatsappMessage.value)}`,
)
</script>

<style scoped>
.cart-product {
  display: grid;
  grid-template-columns: 6rem minmax(0, 1fr);
  grid-template-areas: 'image heading' 'variants variants';
  align-items: start;
  gap: 0.75rem 1rem;
}

.cart-product-image { grid-area: image; }
.cart-product-heading { grid-area: heading; }
.cart-product-variants { grid-area: variants; min-width: 0; }

@media (min-width: 640px) {
  .cart-product {
    grid-template-columns: 10rem minmax(0, 1fr);
    grid-template-areas: 'image heading' 'image variants';
    grid-template-rows: auto 1fr;
  }

  .cart-product-variants {
    align-self: stretch;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}

.cart-variant-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 8rem 11rem;
  align-items: center;
  gap: 0.75rem;
}

.cart-variant-controls {
  grid-column: 2;
}

.cart-variant-price {
  grid-column: 3;
}

@media (max-width: 639px) {
  .cart-variant-row {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.25rem 0.5rem;
  }

  .cart-variant-label { grid-column: 1; grid-row: 1; }
  .cart-variant-controls { grid-column: 2; grid-row: 1 / 3; }
  .cart-variant-price {
    grid-column: 1;
    grid-row: 2;
    text-align: left;
  }
}
</style>
