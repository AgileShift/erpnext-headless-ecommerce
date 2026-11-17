<template>
  <div v-if="loading" class="text-center">
    <h1 class="font-headings">Cargando Producto</h1>
    <SfLoaderCircular size="4xl" />
  </div>
  <div
    v-else-if="product"
    class="mx-auto grid w-full max-w-7xl grid-cols-1 gap-y-4 px-4 md:grid-cols-2 md:items-start md:gap-x-[60px] md:px-8"
  >
    <section class="w-full min-w-0">
      <div class="flex flex-col gap-3 md:flex-row-reverse md:items-start">
      <div class="relative min-w-0 flex-1">
      <div class="relative overflow-hidden rounded-md border border-neutral-200 bg-neutral-50 shadow-sm">
        <SaleBadge
          v-if="displayedPrice?.discount_percent"
          class="absolute top-3 left-3 z-10"
        />
        <button
          type="button"
          class="group relative block w-full cursor-zoom-in"
          :aria-label="`Ampliar imagen de ${displayedItemName}`"
          @click="openImageZoom"
          @pointermove="moveImageZoom"
          @pointerleave="isHoverZoomOpen = false"
        >
          <ProductImage
            class="h-auto w-full"
            :src="galleryImage"
            :alt="displayedItemName"
            width="176"
            height="176"
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
          <span
            v-if="isHoverZoomOpen"
            class="pointer-events-none absolute h-1/2 w-1/2 border border-neutral-400 bg-white/25"
            :style="lensStyle"
            aria-hidden="true"
          />
          <span
            class="absolute right-3 bottom-3 inline-flex items-center rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-sm transition group-hover:bg-white group-focus-visible:ring-2 group-focus-visible:ring-primary-700"
          >
            <SfIconSearch size="sm" class="mr-1.5" aria-hidden="true" /> Ampliar
          </span>
        </button>
      </div>
      <div
        v-if="isHoverZoomOpen && galleryImage"
        class="pointer-events-none absolute top-0 left-[calc(100%+1rem)] z-20 hidden h-full w-full rounded-md border border-neutral-200 bg-white bg-no-repeat shadow-lg lg:block"
        :style="hoverZoomStyle"
        aria-hidden="true"
      />
      </div>

      <div v-if="galleryImages.length > 1" class="flex gap-2 overflow-x-auto pb-1 md:max-h-[32rem] md:flex-col md:overflow-y-auto md:pb-0" role="group" aria-label="Imágenes del producto">
        <button
          v-for="(image, index) in galleryImages"
          :key="image"
          type="button"
          :aria-label="`Ver imagen ${index + 1} de ${galleryImages.length}`"
          :aria-pressed="galleryIndex === index"
          :class="['h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2', galleryIndex === index ? 'border-primary-700' : 'border-neutral-200']"
          @click="galleryIndex = index; isHoverZoomOpen = false"
        >
          <ProductImage :src="image" alt="" class="h-full w-full object-cover" />
        </button>
      </div>
      </div>

      <div v-if="isImageZoomOpen" class="fixed inset-0 z-50 bg-neutral-950/70" aria-hidden="true" />
      <SfModal
        ref="imageZoomModal"
        v-model="isImageZoomOpen"
        tag="section"
        role="dialog"
        :aria-label="`Imagen ampliada de ${displayedItemName}`"
        aria-modal="true"
        class="z-50 flex h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-6xl flex-col overflow-hidden rounded-lg p-4 md:p-6"
        @keydown.left="handleGalleryArrow($event, -1)"
        @keydown.right="handleGalleryArrow($event, 1)"
      >
        <SfButton
          square
          variant="tertiary"
          class="absolute top-2 right-2 z-10 bg-white shadow-sm"
          aria-label="Cerrar imagen ampliada"
          @click="closeImageZoom"
        >
          <SfIconClose />
        </SfButton>
        <h2 class="border-b border-neutral-200 pb-3 pr-12 text-base font-semibold">Imágenes del producto</h2>
        <div class="flex min-h-0 flex-1 flex-col gap-4 pt-4 md:flex-row">
          <div class="relative min-h-0 min-w-0 flex-1">
            <div tabindex="0" role="region" aria-label="Imagen del producto; desplazar para ver los detalles" class="flex h-full overflow-auto rounded-md bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-700" :class="imageZoomLevel > 1 ? (isDraggingImage ? 'cursor-grabbing select-none' : 'cursor-grab') : ''" @wheel.prevent="zoomWithWheel" @pointerdown="startImageDrag" @pointermove="moveImageDrag" @pointerup="endImageDrag" @pointercancel="endImageDrag" @lostpointercapture="endImageDrag">
              <ProductImage
                class="m-auto shrink-0 object-contain"
                :style="{ height: `${imageZoomLevel * 100}%`, maxWidth: `${imageZoomLevel * 100}%` }"
                :src="galleryImage"
                :alt="displayedItemName"
                draggable="false"
              />
            </div>
            <div class="absolute top-2 right-2 flex flex-col gap-1 rounded-full bg-white p-1 shadow-sm">
              <SfButton square size="sm" variant="tertiary" aria-label="Acercar imagen" :disabled="imageZoomLevel >= 3" @click="changeImageZoom(0.5)"><SfIconAdd aria-hidden="true" /></SfButton>
              <SfButton square size="sm" variant="tertiary" aria-label="Alejar imagen" :disabled="imageZoomLevel <= 1" @click="changeImageZoom(-0.5)"><SfIconRemove aria-hidden="true" /></SfButton>
            </div>
          </div>
          <div class="shrink-0 md:w-52 lg:w-64">
            <p class="mb-2 hidden font-semibold md:block">{{ displayedItemName }}</p>
            <div v-if="galleryImages.length > 1" class="flex max-h-32 gap-2 overflow-auto md:max-h-full md:flex-wrap" role="group" aria-label="Seleccionar imagen">
              <button v-for="(image, index) in galleryImages" :key="image" type="button" :aria-label="`Ver imagen ${index + 1} de ${galleryImages.length}`" :aria-pressed="galleryIndex === index" :class="['h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2', galleryIndex === index ? 'border-primary-700' : 'border-neutral-200']" @click="galleryIndex = index">
                <ProductImage :src="image" alt="" class="h-full w-full object-cover" />
              </button>
            </div>
          </div>
        </div>
      </SfModal>
    </section>

    <section class="w-full min-w-0 md:max-w-xl">
      <SfLink
        tag="router-link"
        :to="`/category/${product.item_group}`"
        variant="secondary"
        class="block no-underline pt-0.5 pb-1 font-light leading-5 text-neutral-700"
      >
        {{ product.item_group }}
      </SfLink>

      <h1 class="mb-2 text-lg font-bold leading-snug text-neutral-950 md:text-xl">
        {{ displayedItemName }}
      </h1>

      <span class="block font-bold text-xl text-neutral-950">
        <span>{{ displayedLocalPrice }}</span>
        <span class="font-thin"> | </span>
        <span>{{ displayedUsdPrice }}</span>
      </span>

      <span v-if="displayedPrice?.discount_percent" class="block font-bold">
        <s class="text-sm text-neutral-400 md:text-base">{{ displayedPrice?.formatted_mrp }}</s>
        <span class="pl-2 text-sm md:text-base text-(--site-sale-text)">{{ displayedPrice?.formatted_discount_percent }} OFF</span>
      </span>

      <span
        v-if="displayedQty"
        class="mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium"
        :class="stockBadgeClass"
      >
        {{ stockBadgeLabel }}
      </span>

      <div v-if="attributeGroups.length" class="mt-5 space-y-4">
        <div v-for="group in attributeGroups" :key="group.name" class="min-w-0">
          <div class="mb-2 flex items-center gap-2 text-sm">
            <span class="font-semibold text-neutral-900">{{ group.name }}</span>
          </div>

          <div class="flex min-w-0 flex-wrap gap-2">
            <ProductAttributeChip
              v-for="option in group.options"
              :key="option.value"
              :attribute-name="group.name"
              :value="option.value"
              :label="option.label"
              :model-value="option.selected"
              :available="option.available"
              @update:model-value="$event === true && selectAttribute(group.name, option.value)"
            />
          </div>
        </div>
      </div>

      <SfButton
        class="mt-5 w-full justify-center site-primary-label"
        :disabled="!canAddSelection"
        @click="addSelectedVariant"
      >
        <template #prefix>
          <SfIconShoppingCart size="sm" />
        </template>
        <template #suffix>{{ selectionButtonLabel }}</template>
      </SfButton>

      <div class="mb-4 mt-4 border-y border-neutral-200 py-4">
        <div class="justify-center items-start xs:flex">
          <ContactButton
            class="w-full"
            size="lg"
            suffix="Consultar por WhatsApp"
            secondary
            :item_name="displayedItemName"
            :message="whatsappMessage"
          />
        </div>
      </div>

      <div
        v-if="!displayedPrice?.discount_percent"
        class="flex rounded-md bg-neutral-50 p-3 text-neutral-700"
      >
        <SfIconPackage size="sm" class="flex-shrink-0 mr-2 text-neutral-500" />
        <p class="text-sm">Envio Gratis en Managua Centro</p>
      </div>
      <div v-if="displayedPrice?.discount_percent" class="grid gap-3 rounded-md bg-neutral-50 p-3">
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
    <SfButton size="lg" class="text-center site-primary-label" tag="router-link" to="/">
      <template #prefix>
        <SfIconArrowBack size="sm" />
      </template>
      <template #suffix>Volver a la lista</template>
    </SfButton>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/features/catalog/stores/productStore'
import {
  SfButton,
  SfLink,
  SfLoaderCircular,
  SfIconPackage,
  SfIconSafetyCheck,
  SfIconSearch,
  SfIconAdd,
  SfIconRemove,
  SfIconClose,
  SfIconArrowBack,
  SfIconShoppingCart,
  SfModal,
  useDisclosure,
} from '@storefront-ui/vue'
import ContactButton from '@/shared/components/ContactButton.vue'
import ProductImage from '@/shared/components/ProductImage.vue'
import SaleBadge from '@/shared/components/SaleBadge.vue'
import ProductAttributeChip from '@/features/catalog/components/ProductAttributeChip.vue'
import { getAttributeGroups, variantMatchesSelection } from '@/features/catalog/utils/variantSelection'
import { useSelectionStore } from '@/features/cart/stores/selectionStore'
import { formatAttributeValue, normalizeAttributeName } from '@/features/catalog/utils/attributeFormatting'
import { getProductMetaDescription, setPageMeta } from '@/shared/utils/pageMeta'

const route = useRoute()
const productStore = useProductStore()
const selectionStore = useSelectionStore()
const imageZoomModal = ref<InstanceType<typeof SfModal> | null>(null)
const imageZoomLevel = ref(1)
const isDraggingImage = ref(false)
let imageDrag: { pointerId: number; x: number; y: number; left: number; top: number } | null = null
const changeImageZoom = (step: number) => {
  imageZoomLevel.value = Math.max(1, Math.min(3, imageZoomLevel.value + step))
}
const zoomWithWheel = async (event: WheelEvent) => {
  if (!event.deltaY) return
  const area = event.currentTarget as HTMLElement
  const image = area.querySelector('img')
  if (!image) return

  const before = image.getBoundingClientRect()
  if (!before.width || !before.height) return
  const x = Math.max(0, Math.min(1, (event.clientX - before.left) / before.width))
  const y = Math.max(0, Math.min(1, (event.clientY - before.top) / before.height))
  const anchorX = before.left + x * before.width
  const anchorY = before.top + y * before.height
  const previousZoom = imageZoomLevel.value
  changeImageZoom(event.deltaY < 0 ? 0.5 : -0.5)
  if (imageZoomLevel.value === previousZoom) return

  await nextTick()
  const after = image.getBoundingClientRect()
  area.scrollLeft += after.left + x * after.width - anchorX
  area.scrollTop += after.top + y * after.height - anchorY
}
const startImageDrag = (event: PointerEvent) => {
  if (event.pointerType !== 'mouse' || event.button !== 0 || imageZoomLevel.value <= 1) return
  const area = event.currentTarget as HTMLElement
  imageDrag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: area.scrollLeft, top: area.scrollTop }
  isDraggingImage.value = true
  area.setPointerCapture(event.pointerId)
  event.preventDefault()
}
const moveImageDrag = (event: PointerEvent) => {
  if (!imageDrag || imageDrag.pointerId !== event.pointerId) return
  const area = event.currentTarget as HTMLElement
  area.scrollLeft = imageDrag.left - (event.clientX - imageDrag.x)
  area.scrollTop = imageDrag.top - (event.clientY - imageDrag.y)
}
const endImageDrag = (event: PointerEvent) => {
  if (imageDrag?.pointerId !== event.pointerId) return
  imageDrag = null
  isDraggingImage.value = false
}
const {
  isOpen: isImageZoomOpen,
  open: openImageZoom,
  close: closeImageZoom,
} = useDisclosure()

watch(isImageZoomOpen, async (isOpen) => {
  imageZoomLevel.value = 1
  if (!isOpen) {
    return
  }

  isHoverZoomOpen.value = false
  await nextTick()
  const modalElement = imageZoomModal.value?.$el as HTMLElement | undefined
  modalElement?.focus()
})

const product = computed(() => productStore.currentProduct)
const loading = computed(() => productStore.loading)
const selectedAttributes = ref<Record<string, string>>({})

const isColorAttribute = (attributeName: string) =>
  normalizeAttributeName(attributeName) === 'color'
const isSizeAttribute = (attributeName: string) => normalizeAttributeName(attributeName) === 'talla'

const getQueryValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : null
  }

  return typeof value === 'string' ? value : null
}

const baseAttributeGroups = computed(() => {
  if (!product.value) {
    return []
  }

  return getAttributeGroups(product.value)
})

const getVariantsForSelection = (selection: Record<string, string>) =>
  product.value?.variants.filter((variant) => variantMatchesSelection(variant, selection)) || []

const getAttributeOptions = (
  attributeName: string,
  values: string[],
  selection: Record<string, string> = selectedAttributes.value,
) =>
  values.map((value) => {
    const optionSelection = isColorAttribute(attributeName)
      ? { [attributeName]: value }
      : { ...selection, [attributeName]: value }
    const variants = getVariantsForSelection(optionSelection)
    const stock = variants.reduce((total, variant) => total + variant.actual_qty, 0)

    return {
      value,
      label: isSizeAttribute(attributeName) ? formatAttributeValue(value) : value,
      available: stock > 0,
      selected: selectedAttributes.value[attributeName] === value,
    }
  })

const getAvailableOptions = (
  attributeName: string,
  values: string[],
  selection: Record<string, string>,
) => getAttributeOptions(attributeName, values, selection).filter((option) => option.available)

const attributeGroups = computed(() =>
  baseAttributeGroups.value.map((group) => ({
    ...group,
    options: getAttributeOptions(group.name, group.values),
  })),
)

const activeVariants = computed(() => getVariantsForSelection(selectedAttributes.value))

const selectedVariant = computed(() =>
  activeVariants.value.length === 1 ? activeVariants.value[0] : null,
)

const selectionIsComplete = computed(() =>
  baseAttributeGroups.value.every((group) => selectedAttributes.value[group.name]),
)

const activeVariantsSharePrice = computed(() => {
  if (activeVariants.value.length === 0) {
    return false
  }

  return new Set(activeVariants.value.map((variant) => variant.price.price_list_rate)).size === 1
})

const displayedPrice = computed(
  () =>
    selectedVariant.value?.price ||
    (activeVariantsSharePrice.value ? activeVariants.value[0]?.price : null) ||
    product.value?.price,
)

const displayedLocalPrice = computed(() => {
  if (selectedVariant.value || activeVariantsSharePrice.value) {
    return displayedPrice.value?.local_formatted_price
  }

  return (
    product.value?.price_summary.local_formatted_price ||
    displayedPrice.value?.local_formatted_price
  )
})

const displayedUsdPrice = computed(() => {
  if (selectedVariant.value || activeVariantsSharePrice.value) {
    return displayedPrice.value?.formatted_price
  }

  return product.value?.price_summary.formatted_price || displayedPrice.value?.formatted_price
})

const displayedImage = computed(
  () => selectedVariant.value?.image || activeVariants.value[0]?.image || product.value?.image,
)
const galleryIndex = ref(0)
watch(galleryIndex, () => { imageZoomLevel.value = 1 })
const isHoverZoomOpen = ref(false)
const zoomPosition = ref({ x: 0.5, y: 0.5 })
const moveImageZoom = (event: PointerEvent) => {
  if (event.pointerType !== 'mouse' || !window.matchMedia('(min-width: 1024px) and (hover: hover)').matches) return
  const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect()
  if (!bounds.width || !bounds.height) return
  zoomPosition.value = {
    x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
    y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)),
  }
  isHoverZoomOpen.value = true
}
const lensStyle = computed(() => ({
  left: `${Math.max(0, Math.min(50, zoomPosition.value.x * 100 - 25))}%`,
  top: `${Math.max(0, Math.min(50, zoomPosition.value.y * 100 - 25))}%`,
}))
const hoverZoomStyle = computed(() => ({
  backgroundImage: `url(${JSON.stringify(galleryImage.value)})`,
  backgroundSize: '200% 200%',
  backgroundPosition: `${Math.max(0, Math.min(100, zoomPosition.value.x * 200 - 50))}% ${Math.max(0, Math.min(100, zoomPosition.value.y * 200 - 50))}%`,
}))
const galleryImages = computed(() => {
  const attachments = selectedVariant.value ? selectedVariant.value.images : product.value?.images
  return [...new Set([displayedImage.value, ...(attachments || [])].filter((image): image is string => !!image))]
})
const galleryImage = computed(() => galleryImages.value[galleryIndex.value] || galleryImages.value[0])
const moveGallery = (direction: number) => {
  if (galleryImages.value.length > 1) {
    galleryIndex.value = (galleryIndex.value + direction + galleryImages.value.length) % galleryImages.value.length
  }
}
const handleGalleryArrow = (event: KeyboardEvent, direction: number) => {
  if (imageZoomLevel.value > 1 && (event.target as HTMLElement).getAttribute('role') === 'region') return
  event.preventDefault()
  moveGallery(direction)
}
watch([() => product.value?.item_code, () => selectedVariant.value?.item_code, displayedImage], () => {
  galleryIndex.value = 0
  isHoverZoomOpen.value = false
})

const displayedItemName = computed(
  () =>
    (selectionIsComplete.value && selectedVariant.value?.item_name) ||
    product.value?.item_name ||
    '',
)

const displayedQty = computed(() => {
  if (selectionIsComplete.value && selectedVariant.value) {
    return selectedVariant.value.actual_qty
  }

  if (baseAttributeGroups.value.length === 0) {
    return product.value?.actual_qty || 0
  }

  return 0
})

const stockBadgeLabel = computed(() =>
  displayedQty.value === 1
    ? 'Última unidad disponible'
    : `Disponible: ${displayedQty.value} unidades`,
)

const stockBadgeClass = computed(() =>
  displayedQty.value === 1
    ? 'border-warning-500 bg-warning-500 text-neutral-950'
    : 'border-neutral-200 bg-neutral-50 text-neutral-700',
)

const selectionItemQty = computed(() => {
  if (!selectedVariant.value) {
    return 0
  }

  return (
    selectionStore.items.find((item) => item.item_code === selectedVariant.value?.item_code)?.qty ||
    0
  )
})

const selectedVariantStock = computed(() => selectedVariant.value?.actual_qty || 0)

const selectionReachedStock = computed(
  () =>
    selectionIsComplete.value &&
    Boolean(selectedVariant.value) &&
    selectionItemQty.value >= selectedVariantStock.value,
)

const canAddSelection = computed(
  () => selectionIsComplete.value && Boolean(selectedVariant.value) && !selectionReachedStock.value,
)

const selectionButtonLabel = computed(() => {
  if (!selectionIsComplete.value || !selectedVariant.value) {
    return 'Seleccioná las opciones para agregar'
  }

  if (selectionReachedStock.value) {
    return selectedVariantStock.value === 1
      ? 'Ya agregaste la unidad disponible'
      : `Ya agregaste ${selectedVariantStock.value} unidades disponibles`
  }

  return selectionItemQty.value
    ? `Agregar otra (${selectionItemQty.value} en el carrito)`
    : 'Agregar al carrito'
})

const addSelectedVariant = () => {
  if (!canAddSelection.value || !selectedVariant.value) {
    return
  }

  selectionStore.addItem({
    item_code: selectedVariant.value.item_code,
    product_item_code: product.value?.item_code,
    product_name: product.value?.item_name,
    item_name: selectedVariant.value.item_name,
    image: selectedVariant.value.image,
    attributes: selectedVariant.value.attributes,
    price: selectedVariant.value.price,
  }, selectedVariant.value.actual_qty)
}

const findAttributeValue = (attributeName: string, value: string | null) => {
  if (!value) {
    return null
  }

  const group = baseAttributeGroups.value.find(
    (attributeGroup) =>
      normalizeAttributeName(attributeGroup.name) === normalizeAttributeName(attributeName),
  )

  return (
    group?.values.find(
      (optionValue) => normalizeAttributeName(optionValue) === normalizeAttributeName(value),
    ) || null
  )
}

const selectOnlyAvailableOptions = (selection: Record<string, string>) => {
  const nextSelections = { ...selection }
  const colorGroup = baseAttributeGroups.value.find((group) => isColorAttribute(group.name))
  let changed = true

  while (changed) {
    changed = false

    for (const group of baseAttributeGroups.value) {
      if (nextSelections[group.name]) {
        continue
      }

      if (colorGroup && !nextSelections[colorGroup.name] && !isColorAttribute(group.name)) {
        continue
      }

      const availableOptions = getAvailableOptions(group.name, group.values, nextSelections)

      if (availableOptions.length === 1) {
        nextSelections[group.name] = availableOptions[0].value
        changed = true
      }
    }
  }

  return nextSelections
}

const initializeSelections = () => {
  if (!product.value) {
    selectedAttributes.value = {}
    return
  }

  const nextSelections: Record<string, string> = {}
  const colorGroup = baseAttributeGroups.value.find((group) => isColorAttribute(group.name))
  const sizeGroup = baseAttributeGroups.value.find((group) => isSizeAttribute(group.name))
  const queryColor = getQueryValue(route.query.color)
  const querySize = getQueryValue(route.query.size)

  if (colorGroup) {
    const selectedColor = findAttributeValue(colorGroup.name, queryColor)
    const selectedColorIsAvailable =
      selectedColor &&
      getAvailableOptions(colorGroup.name, colorGroup.values, nextSelections).some(
        (option) => option.value === selectedColor,
      )

    if (selectedColorIsAvailable) {
      nextSelections[colorGroup.name] = selectedColor
    }
  }

  if (sizeGroup && querySize) {
    const selectedSize = findAttributeValue(sizeGroup.name, querySize)

    if (selectedSize) {
      const sizeIsAvailable = getAttributeOptions(
        sizeGroup.name,
        sizeGroup.values,
        nextSelections,
      ).some((option) => option.value === selectedSize && option.available)

      if (sizeIsAvailable) {
        nextSelections[sizeGroup.name] = selectedSize
      }
    }
  }

  selectedAttributes.value = selectOnlyAvailableOptions(nextSelections)
}

const selectAttribute = (attributeName: string, value: string) => {
  const nextSelections = {
    ...selectedAttributes.value,
    [attributeName]: value,
  }

  for (const group of baseAttributeGroups.value) {
    const selectedValue = nextSelections[group.name]

    if (!selectedValue || group.name === attributeName) {
      continue
    }

    const isStillAvailable = getAttributeOptions(group.name, group.values, nextSelections).some(
      (option) => option.value === selectedValue && option.available,
    )

    if (!isStillAvailable) {
      delete nextSelections[group.name]
    }
  }

  selectedAttributes.value = selectOnlyAvailableOptions(nextSelections)
}

const selectedAttributesMessage = computed(() =>
  Object.entries(selectedAttributes.value)
    .filter(([, value]) => value)
    .map(([name, value]) => `${name}: ${value}`)
    .join(' | '),
)

const availableSizesMessage = computed(() => {
  const sizeGroup = baseAttributeGroups.value.find((group) => isSizeAttribute(group.name))

  if (!sizeGroup || selectedAttributes.value[sizeGroup.name]) {
    return ''
  }

  const availableSizes = getAttributeOptions(sizeGroup.name, sizeGroup.values)
    .filter((option) => option.available)
    .map((option) => option.label)
    .join(', ')

  return availableSizes ? ` Tallas disponibles: ${availableSizes}.` : ''
})

const whatsappMessage = computed(() => {
  if (!product.value) {
    return ''
  }

  const selectedMessage = selectedAttributesMessage.value
    ? ` Selección: ${selectedAttributesMessage.value}.`
    : ''
  const variantMessage = selectedVariant.value ? ` Código: ${selectedVariant.value.item_code}.` : ''

  return `Tengo interés en el producto: ${displayedItemName.value}.${selectedMessage}${variantMessage}${availableSizesMessage.value}`
})

const productMetaDescription = computed(() => {
  const price = [displayedLocalPrice.value, displayedUsdPrice.value].filter(Boolean).join(' | ')

  return product.value?.item_name ? getProductMetaDescription(product.value.item_name, price) : ''
})

watch(
  () => route.params.id,
  async (itemCode) => {
    if (typeof itemCode === 'string') {
      await productStore.loadProduct(itemCode)
    }
  },
  { immediate: true },
)

watch(() => [product.value?.item_code, route.fullPath], initializeSelections, {
  immediate: true,
})

watch(
  () => [
    displayedItemName.value,
    displayedImage.value,
    productMetaDescription.value,
    route.fullPath,
  ],
  () => {
    if (!product.value || !displayedItemName.value) {
      return
    }

    setPageMeta({
      title: product.value.item_name,
      description: productMetaDescription.value,
      canonicalPath: route.fullPath,
      imagePath: displayedImage.value,
    })
  },
  { immediate: true },
)
</script>
