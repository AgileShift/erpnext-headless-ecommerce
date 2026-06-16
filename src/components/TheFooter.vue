<template>
  <footer class="mt-8 border-t border-neutral-200 bg-white">
    <div class="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">
      <div class="grid gap-6 md:grid-cols-4">
        <div class="space-y-2">
          <p class="text-sm font-semibold uppercase tracking-wide text-neutral-500">Legal</p>
          <nav class="flex flex-col gap-2 text-sm text-neutral-700">
            <router-link
              v-for="documentRoute in legalLinks"
              :key="documentRoute.key"
              class="hover:text-neutral-950"
              :to="documentRoute.path"
            >
              {{ documentRoute.label }}
            </router-link>
          </nav>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-semibold uppercase tracking-wide text-neutral-500">Compra</p>
          <router-link
            class="block text-sm text-neutral-700 hover:text-neutral-950"
            to="/selection"
          >
            Mi selección
          </router-link>
          <router-link class="block text-sm text-neutral-700 hover:text-neutral-950" to="/sale">
            SALE
          </router-link>
          <button
            type="button"
            class="block text-left text-sm text-neutral-700 hover:text-neutral-950"
            @click="openCookiePreferences"
          >
            Preferencias de cookies
          </button>
        </div>
        <div class="space-y-2">
          <router-link
            class="block text-sm font-semibold uppercase tracking-wide text-neutral-500 hover:text-neutral-950"
            to="/contact"
          >
            Contacto
          </router-link>
          <a
            v-for="link in footerContactLinks"
            :key="link.key"
            class="flex items-start gap-2 text-sm text-neutral-700 hover:text-neutral-950"
            :href="link.href"
            :target="link.key === 'email' ? undefined : '_blank'"
            :rel="link.key === 'email' ? undefined : 'noreferrer'"
          >
            <component :is="link.icon" class="mt-0.5 h-4 w-4 shrink-0 text-primary-700" size="sm" />
            <span class="[overflow-wrap:anywhere]">{{ link.value }}</span>
          </a>
        </div>
        <div class="space-y-2">
          <p class="text-sm font-semibold uppercase tracking-wide text-neutral-500">Redes</p>
          <a
            v-for="social in socialLinks"
            :key="social.key"
            class="flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-950"
            :href="social.href"
            target="_blank"
            rel="noreferrer"
          >
            <component :is="social.icon" class="h-4 w-4 text-primary-700" size="sm" />
            {{ social.label }}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { getEnabledLegalDocumentRoutes } from '@/router/legalRoutes'
import { contactLinks, socialLinks } from '@/utils/contactLinks'

const legalLinks = getEnabledLegalDocumentRoutes()
const footerContactLinks = contactLinks.filter((link) => ['email', 'whatsapp', 'address'].includes(link.key))

const openCookiePreferences = () => {
  window.dispatchEvent(new Event('cookie-consent:open'))
}
</script>
