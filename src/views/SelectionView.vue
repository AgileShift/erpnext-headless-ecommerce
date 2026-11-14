<template>
  <section class="mx-auto max-w-4xl">
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
      <SfButton tag="router-link" to="/" class="mt-4">Ver catálogo</SfButton>
    </div>

    <div v-else class="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
      <div class="space-y-4">
        <article v-for="group in cartGroups" :key="group.key" class="rounded-xl border border-neutral-200 bg-white">
          <header class="flex items-center gap-4 p-4">
            <router-link :to="getProductLink(group.item)" class="shrink-0">
              <img :src="group.item.image" :alt="group.name" class="h-20 w-16 rounded-md object-cover" />
            </router-link>
            <div class="min-w-0">
              <h2 class="font-semibold leading-snug text-neutral-950">
                <router-link :to="getProductLink(group.item)" class="hover:underline">{{ group.name }}</router-link>
              </h2>
              <p v-if="group.color" class="mt-1 text-sm text-neutral-600">Color: {{ group.color }}</p>
            </div>
          </header>
          <ul class="divide-y divide-neutral-200 border-t border-neutral-200">
            <li
              v-for="item in group.items" :key="item.item_code"
              class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3"
            >
              <div class="min-w-0 basis-full sm:basis-auto">
                <p v-if="variantLabel(item)" class="text-sm font-semibold">{{ variantLabel(item) }}</p>
                <p class="text-xs text-neutral-600">{{ formatCartAmount(item.price.price_list_rate) }} por unidad</p>
              </div>
              <div role="group" :aria-label="variantLabel(item) || group.name" class="inline-flex items-center rounded-full border border-neutral-300">
                <SfButton
                  variant="tertiary" size="sm" square class="!h-10 !w-10 !rounded-l-full !text-neutral-900 disabled:!text-neutral-400"
                  aria-label="Reducir cantidad" :disabled="item.qty <= 1"
                  @click="selection.setQuantity(item.item_code, item.qty - 1)"
                ><SfIconRemove size="sm" /></SfButton>
                <output class="min-w-7 text-center text-sm tabular-nums" aria-label="Cantidad">{{ item.qty }}</output>
                <SfButton
                  variant="tertiary" size="sm" square class="!h-10 !w-10 !rounded-r-full !text-neutral-900 disabled:!text-neutral-400"
                  aria-label="Aumentar cantidad" :disabled="item.maxQty === undefined || item.qty >= item.maxQty"
                  @click="selection.setQuantity(item.item_code, item.qty + 1)"
                ><SfIconAdd size="sm" /></SfButton>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold tabular-nums">
                  {{ formatCartAmount(item.price.price_list_rate * item.qty) }}
                </p>
                <button type="button" class="min-h-8 text-xs text-neutral-700 underline" @click="selection.removeItem(item.item_code)">
                  Quitar
                </button>
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
          tag="a" :href="whatsappHref" class="mt-3 w-full justify-center !text-(--site-on-accent)" size="lg"
        >
          Consultar por WhatsApp
        </SfButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { SfButton, SfIconAdd, SfIconRemove } from '@storefront-ui/vue'
import siteConfig from '@/config'
import { type SelectionItem, useSelectionStore } from '@/stores/selectionStore'
import type { ProductVariantAttributes } from '@/types/Product'

const selection = useSelectionStore()

onMounted(() => {
  selection.reloadFromStorage()
})

const formatAttributes = (attributes: ProductVariantAttributes) =>
  Object.entries(attributes)
    .sort(([first], [second]) => first.localeCompare(second, 'es'))
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

const variantLabel = (item: SelectionItem) =>
  formatAttributes(Object.fromEntries(
    Object.entries(item.attributes).filter(([name]) => name.trim().toLowerCase() !== 'color'),
  ))

const cartGroups = computed(() => {
  const groups = new Map<string, { key: string; name: string; color?: string; item: SelectionItem; items: SelectionItem[] }>()

  for (const item of selection.items) {
    const color = getAttributeValue(item.attributes, 'color')?.trim()
    const key = JSON.stringify([getProductItemCode(item), color?.toLowerCase() ?? ''])
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
  const items = selection.items
    .map(
      (item) =>
        `- ${item.item_name} (${formatAttributes(item.attributes)}) x${item.qty} - ${formatCartAmount(item.price.price_list_rate * item.qty)}`,
    )
    .join('\n')

  return `Hola, quiero consultar mi carrito:\n${items}\nSubtotal: ${formattedCartTotal.value}`
})

const whatsappHref = computed(
  () =>
    `https://wa.me/${siteConfig.contact.whatsApp}?text=${encodeURIComponent(whatsappMessage.value)}`,
)
</script>
