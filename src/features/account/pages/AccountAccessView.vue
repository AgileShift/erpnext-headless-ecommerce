<template>
  <section class="mx-auto max-w-md rounded-xl border border-neutral-200 bg-white p-5 sm:p-8">
    <h1
      id="account-access-title"
      ref="title"
      tabindex="-1"
      class="text-2xl font-semibold text-neutral-950"
    >
      {{ headings[step] }}
    </h1>
    <p class="mt-2 text-sm text-neutral-700">
      <template v-if="step === 'email'"
        >Usá tu correo para iniciar sesión o crear una cuenta.</template
      >
      <template v-else-if="step === 'code'"
        >Ingresá el código de prueba para {{ submittedEmail }}.</template
      >
      <template v-else>Ya podés volver a la tienda.</template>
    </p>
    <p class="mt-4 rounded-md bg-neutral-100 p-3 text-sm text-neutral-800" role="status">
      Vista de prueba. No enviamos correos ni creamos cuentas.
      <template v-if="step === 'code'">
        Código de prueba <strong>{{ demoCode }}</strong>.</template
      >
    </p>

    <form
      v-if="step !== 'complete'"
      class="mt-5 space-y-4"
      :aria-busy="busy"
      @submit.prevent="submit"
    >
      <label v-if="step === 'email'" class="block">
        <span class="mb-1 block text-sm font-medium">Correo electrónico</span>
        <SfInput v-model="email" type="email" autocomplete="email" required :disabled="busy" />
      </label>
      <label v-else class="block">
        <span class="mb-1 block text-sm font-medium">Código de 6 dígitos</span>
        <SfInput
          v-model="code"
          inputmode="numeric"
          autocomplete="one-time-code"
          pattern="[0-9]{6}"
          maxlength="6"
          required
          :disabled="busy"
          :invalid="Boolean(error)"
          :aria-describedby="error ? 'account-error' : undefined"
          @update:model-value="error = ''"
        />
      </label>
      <p v-if="error" id="account-error" role="alert" class="text-sm text-red-700">{{ error }}</p>
      <SfButton type="submit" class="w-full !text-neutral-950" :disabled="busy">
        {{ busy ? 'Un momento…' : step === 'email' ? 'Enviar código' : 'Verificar código' }}
      </SfButton>
      <div v-if="step === 'code'" class="flex flex-wrap justify-between gap-2">
        <SfButton
          type="button"
          variant="tertiary"
          class="!text-neutral-800"
          :disabled="busy"
          @click="changeEmail"
        >
          Cambiar correo
        </SfButton>
        <SfButton
          type="button"
          variant="tertiary"
          class="!text-neutral-800"
          :disabled="busy"
          @click="resend"
        >
          Reenviar código
        </SfButton>
      </div>
      <p v-if="notice" class="text-sm text-neutral-700" role="status">{{ notice }}</p>
    </form>
    <SfButton v-else tag="router-link" :to="returnPath" class="mt-5 w-full !text-neutral-950">
      {{ returnPath === '/cart' ? 'Volver al carrito' : 'Volver al catálogo' }}
    </SfButton>
    <RouterLink
      to="/account/profile"
      class="mt-5 block text-center text-sm underline underline-offset-4"
      >Explorar mi cuenta de prueba</RouterLink
    >
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useRoute } from 'vue-router'
import { SfButton, SfInput } from '@storefront-ui/vue'

const headings = {
  email: 'Ingresá con tu correo',
  code: 'Verificá tu código',
  complete: 'Código de prueba verificado',
}
const route = useRoute()
const returnPath = computed(() => (route.query.from === 'cart' ? '/cart' : '/'))
const demoCode = '123456'
const step = ref<keyof typeof headings>('email')
const title = ref<HTMLElement>()
const email = ref('')
const submittedEmail = ref('')
const code = ref('')
const error = ref('')
const notice = ref('')
const busy = ref(false)

async function moveTo(nextStep: keyof typeof headings) {
  step.value = nextStep
  await nextTick()
  title.value?.focus()
}

async function submit() {
  if (busy.value || step.value === 'complete') return
  busy.value = true
  error.value = ''
  notice.value = ''
  await new Promise((resolve) => setTimeout(resolve, 250))
  busy.value = false

  if (step.value === 'email') {
    submittedEmail.value = email.value.trim()
    await moveTo('code')
  } else if (code.value === demoCode) {
    await moveTo('complete')
  } else {
    error.value = 'El código no coincide. Revisalo e intentá de nuevo.'
  }
}

function changeEmail() {
  code.value = ''
  error.value = ''
  notice.value = ''
  void moveTo('email')
}

function resend() {
  code.value = ''
  error.value = ''
  notice.value = 'El código de prueba está disponible arriba.'
}
</script>
