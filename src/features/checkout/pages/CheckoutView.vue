<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { SfButton, SfInput } from '@storefront-ui/vue'
import { useSelectionStore } from '@/features/cart/stores/selectionStore'
import { useAccountPreview } from '@/features/account/previewStore'
import ProductImage from '@/shared/components/ProductImage.vue'
const cart = useSelectionStore()
const account = useAccountPreview()
const step = ref<'delivery' | 'review' | 'complete'>('delivery')
const stepHeading = ref<HTMLElement | null>(null)
async function goToStep(next: typeof step.value) {
  step.value = next
  await nextTick()
  stepHeading.value?.focus()
}
const delivery = ref('pickup')
const name = ref(account.name)
const phone = ref(account.phone)
const city = ref(account.city)
const address = ref(account.address)
const nio = computed(() =>
  cart.items.reduce((sum, item) => sum + item.price.local_price_list_rate * item.qty, 0),
)
const formatNio = new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format
const formatUsd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format
const deliveryOptions = [
  { value: 'pickup', label: 'Retiro en tienda' },
  { value: 'shipping', label: 'Entrega a domicilio' },
]
</script>
<template>
  <section class="mx-auto max-w-5xl">
    <RouterLink to="/cart" class="text-sm underline underline-offset-4"
      >Volver al carrito</RouterLink
    >
    <h1 class="mt-3 text-2xl font-bold sm:text-3xl">Prepará tu compra</h1>
    <p role="note" class="mb-5 mt-2 text-sm text-neutral-600">Vista de prueba. No se crean pedidos ni se realizan cobros.</p>
    <div v-if="!cart.items.length" class="rounded-xl border border-neutral-200 p-10 text-center">
      <h2 class="text-xl font-semibold">Tu carrito está vacío</h2>
      <p class="mt-2 text-neutral-600">Elegí un producto para continuar.</p>
      <SfButton tag="router-link" to="/" class="mt-5 !text-neutral-950">Ver catálogo</SfButton>
    </div>
    <template v-else>
      <ol aria-label="Pasos de compra" class="mb-6 flex flex-wrap gap-x-5 gap-y-2 border-b border-neutral-200 pb-3 text-sm text-neutral-600">
        <li :aria-current="step === 'delivery' ? 'step' : undefined">1. Entrega</li>
        <li :aria-current="step === 'review' ? 'step' : undefined">2. Revisión</li>
        <li :aria-current="step === 'complete' ? 'step' : undefined">3. Resultado de prueba</li>
      </ol>
      <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <form
          v-if="step === 'delivery'"
          class="min-w-0 space-y-5"
          @submit.prevent="goToStep('review')"
        >
          <h2 ref="stepHeading" tabindex="-1" class="text-xl font-semibold">Contacto y entrega</h2>
          <fieldset class="grid min-w-0 gap-2 sm:grid-cols-2">
            <legend class="mb-2 font-semibold">¿Cómo querés recibirlo?</legend>
            <label
              v-for="option in deliveryOptions"
              :key="option.value"
              class="flex cursor-pointer items-center gap-3 rounded-lg border p-3"
              :class="delivery === option.value ? 'border-primary-900 bg-primary-100 ring-1 ring-primary-900' : 'border-neutral-300'"
            >
              <input v-model="delivery" type="radio" :value="option.value" name="delivery" class="size-4 shrink-0 accent-primary-900" />
              <span>{{ option.label }}</span>
            </label>
          </fieldset>
          <label class="block"
            >Nombre completo<SfInput v-model="name" autocomplete="name" required
          /></label>
          <label class="block"
            >Teléfono<SfInput v-model="phone" type="tel" autocomplete="tel" required
          /></label>
          <template v-if="delivery === 'shipping'">
            <label class="block"
              >Ciudad o municipio<SfInput v-model="city" autocomplete="address-level2" required
            /></label>
            <label class="block"
              >Dirección y referencias<SfInput
                v-model="address"
                autocomplete="street-address"
                required
            /></label>
          </template>
          <SfButton type="submit" size="lg" class="w-full !text-neutral-950 sm:w-auto">Revisar datos</SfButton>
        </form>
        <section
          v-else-if="step === 'review'"
          class="min-w-0 space-y-4 break-words"
        >
          <h2 ref="stepHeading" tabindex="-1" class="text-xl font-semibold">Revisá tu selección</h2>
          <p>{{ name }} · {{ phone }}</p>
          <p>{{ delivery === 'pickup' ? 'Retiro en tienda' : `${city} · ${address}` }}</p>
          <p class="text-neutral-600">
            Subtotal estimado. Disponibilidad y total final por confirmar.
          </p>
          <div class="flex flex-col gap-2 sm:flex-row">
            <SfButton size="lg" class="!text-neutral-950" @click="goToStep('complete')">Simular confirmación</SfButton>
            <SfButton variant="tertiary" @click="goToStep('delivery')">Editar datos</SfButton>
          </div>
        </section>
        <section
          v-else
          class="space-y-4"
        >
          <h2 ref="stepHeading" tabindex="-1" class="text-xl font-semibold">Recorrido de prueba completado</h2>
          <p>No se ha creado ningún pedido ni realizado ningún cobro. Tu carrito sigue guardado.</p>
          <SfButton tag="router-link" to="/account/orders" class="!text-neutral-950"
            >Explorar mis pedidos</SfButton
          >
          <SfButton variant="tertiary" @click="goToStep('delivery')">Volver a editar</SfButton>
        </section>
        <aside class="min-w-0 rounded-lg bg-neutral-50 p-4 sm:p-5">
          <h2 class="text-lg font-semibold">Tu carrito</h2>
          <p class="text-sm text-neutral-600">{{ cart.count }} {{ cart.count === 1 ? 'unidad' : 'unidades' }}</p>
          <ul class="my-3 divide-y divide-neutral-200">
            <li v-for="item in cart.items" :key="item.item_code" class="flex gap-3 py-3 text-sm">
              <div class="h-16 w-12 shrink-0 overflow-hidden rounded bg-neutral-100">
                <ProductImage :src="item.image" alt="" width="48" height="64" class="h-full w-full object-cover" />
              </div>
              <div class="min-w-0 break-words">
                <p class="font-medium">{{ item.product_name || item.item_name }}</p>
                <p v-if="Object.keys(item.attributes).length" class="text-neutral-600">{{ Object.values(item.attributes).join(' · ') }}</p>
                <p class="text-neutral-600">Cantidad: {{ item.qty }}</p>
              </div>
            </li>
          </ul>
          <dl class="border-t border-neutral-200 pt-3">
            <dt class="text-sm">Subtotal estimado</dt>
            <dd class="text-xl font-bold tabular-nums">{{ formatNio(nio) }}</dd>
            <dd class="text-sm text-neutral-600">Referencia: {{ formatUsd(cart.total) }} USD</dd>
          </dl>
          <p v-if="delivery === 'shipping'" class="mt-3 text-sm text-neutral-600">Costo de envío por confirmar.</p>
        </aside>
      </div>
    </template>
  </section>
</template>
<style scoped>
[aria-current='step'] {
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 6px;
}
</style>
