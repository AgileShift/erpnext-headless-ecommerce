<template>
  <Teleport to="body">
  <div v-if="open" class="fixed inset-0 z-40 bg-black/40" aria-hidden="true" />
  <SfModal v-model="open" tag="section" role="dialog" aria-modal="true" :aria-labelledby="titleId"
    class="z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
    <SfButton variant="tertiary" square class="absolute right-2 top-2 z-10" aria-label="Cerrar" @click="open = false">
        <SfIconClose aria-hidden="true" />
    </SfButton>
    <div class="grid grid-cols-[5rem_minmax(0,1fr)] items-start gap-x-4 gap-y-3 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:gap-6">
    <ProductImage :src="previewImage" :alt="card.item_name" class="aspect-square w-full rounded-lg object-cover sm:row-span-2 sm:aspect-[3/4]" />
    <div class="min-w-0 pr-8 sm:pr-6">
      <h2 :id="titleId" class="text-sm font-semibold text-neutral-600">Elegí tus opciones</h2>
      <p class="mt-1 text-base font-bold text-neutral-950">{{ card.item_name }}</p>
      <p class="mt-2 font-bold text-neutral-950">{{ previewPrice.local_formatted_price }} | {{ previewPrice.formatted_price }}</p>
      <p v-if="variant?.price.discount_percent" class="text-sm font-bold">
        <s class="text-neutral-500">{{ variant.price.formatted_mrp }}</s>
        <span class="ml-1 text-(--site-sale-text)">{{ variant.price.formatted_discount_percent }} OFF</span>
      </p>
    </div>
    <div class="col-span-2 sm:col-span-1 sm:col-start-2">
    <p v-if="loading" role="status" class="mt-5 text-sm">Cargando opciones…</p>
    <div v-else-if="error" class="mt-5 text-sm" role="alert">
      <p>No pudimos cargar las opciones. Intentá de nuevo o revisá el producto.</p>
      <router-link :to="productUrl" class="mt-2 inline-block font-semibold underline">Ver producto</router-link>
    </div>
    <template v-else-if="product">
      <fieldset v-for="group in groups" :key="group.name" class="mt-5">
        <legend class="text-sm font-semibold">{{ group.name }}</legend>
        <div class="mt-2 flex flex-wrap gap-2">
          <ProductAttributeChip
            v-for="value in group.values"
            :key="value"
            :attribute-name="group.name"
            :value="value"
            :label="normalizeAttributeName(group.name) === 'talla' ? formatAttributeValue(value) : value"
            :model-value="selection[group.name] === value"
            :available="isAvailable(group.name, value)"
            @update:model-value="$event === true && (selection[group.name] = value)"
          />
        </div>
      </fieldset>
      <p v-if="limitReached" class="mt-4 text-sm text-neutral-700" role="status">Ya agregaste la cantidad disponible al carrito.</p>
      <SfButton class="mt-6 w-full justify-center site-primary-label" :disabled="!canAdd" @click="add">Agregar al carrito</SfButton>
      <router-link :to="previewProductUrl" class="mt-3 block py-2 text-center text-sm font-semibold text-neutral-700 underline" @click="open = false">Ver detalles</router-link>
    </template>
    </div>
    </div>
  </SfModal>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { SfButton, SfIconClose, SfModal } from '@storefront-ui/vue'
import type { Product } from '@/features/catalog/types/Product'
import { useProductStore } from '@/features/catalog/stores/productStore'
import { useSelectionStore } from '@/features/cart/stores/selectionStore'
import { getAttributeGroups, variantMatchesSelection } from '@/features/catalog/utils/variantSelection'
import { formatAttributeValue, normalizeAttributeName } from '@/features/catalog/utils/attributeFormatting'
import ProductImage from '@/shared/components/ProductImage.vue'
import ProductAttributeChip from './ProductAttributeChip.vue'

const props = defineProps<{ modelValue: boolean; card: Product; color: string | null; productUrl: { path: string; query: { color?: string } } }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; added: [] }>()
const open = computed({ get: () => props.modelValue, set: (value) => emit('update:modelValue', value) })
const titleId = `quick-add-${Math.random().toString(36).slice(2)}`
const productStore = useProductStore()
const cart = useSelectionStore()
const product = ref<Product | null>(null)
const loading = ref(false)
const error = ref(false)
const selection = ref<Record<string, string>>({})
const groups = computed(() => product.value ? getAttributeGroups(product.value) : [])
const matching = computed(() => product.value?.variants.filter((variant) => variantMatchesSelection(variant, selection.value)) || [])
const variant = computed(() => groups.value.every((group) => selection.value[group.name]) && matching.value.length === 1 ? matching.value[0] : null)
const previewImage = computed(() => {
  if (!product.value) return props.card.image
  if (variant.value?.image) return variant.value.image
  const images = [...new Set(matching.value.map((item) => item.image).filter(Boolean))]
  return images.length === 1 && matching.value.every((item) => item.image) ? images[0] : product.value.image
})
const previewPrice = computed(() => variant.value?.price || product.value?.price_summary || props.card.price_summary)
const previewProductUrl = computed(() => {
  const colorGroup = groups.value.find((group) => normalizeAttributeName(group.name) === 'color')
  const color = colorGroup && selection.value[colorGroup.name]
  return { path: props.productUrl.path, query: color ? { color } : {} }
})
const limitReached = computed(() => !!variant.value && (cart.items.find((item) => item.item_code === variant.value?.item_code)?.qty || 0) >= variant.value.actual_qty)
const canAdd = computed(() => !!variant.value?.item_code && variant.value.actual_qty > 0 && !limitReached.value)

const isAvailable = (name: string, value: string) => {
  const candidate = { ...selection.value, [name]: value }
  return !!product.value?.variants.some((item) => item.actual_qty > 0 && variantMatchesSelection(item, candidate))
}

const add = () => {
  if (!canAdd.value || !variant.value || !product.value) return
  const item = variant.value
  cart.addItem({ item_code: item.item_code, product_item_code: product.value.item_code,
    product_name: product.value.item_name, item_name: item.item_name, image: item.image,
    attributes: item.attributes, price: item.price }, item.actual_qty)
  open.value = false
  emit('added')
}

let request = 0
watch(open, async (isOpen) => {
  const current = ++request
  if (!isOpen) return
  product.value = null
  selection.value = {}
  error.value = false
  loading.value = true
  try {
    const result = await productStore.fetchProduct(props.card.item_code)
    if (current !== request) return
    if (!result.variants.length) throw new Error('No variants available')
    product.value = result
    const colorGroup = groups.value.find((group) => normalizeAttributeName(group.name) === 'color')
    const matchingColor = colorGroup?.values.find((value) => normalizeAttributeName(value) === normalizeAttributeName(props.color || ''))
    if (colorGroup && matchingColor) selection.value[colorGroup.name] = matchingColor
    for (const group of groups.value) {
      const options = group.values.filter((value) => isAvailable(group.name, value))
      if (!selection.value[group.name] && options.length === 1 && normalizeAttributeName(group.name) !== 'talla') selection.value[group.name] = options[0]
    }
    if (!groups.value.length && canAdd.value) add()
  } catch {
    if (current === request) error.value = true
  } finally {
    if (current === request) loading.value = false
  }
})
</script>
