<template>
  <div class="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10">
    <section class="grid gap-6 border-b border-neutral-200 pb-8 md:grid-cols-[1.1fr_0.9fr] md:items-end">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          {{ siteConfig.siteName }}
        </p>
        <h1 class="mt-1 text-2xl font-bold text-neutral-950 md:text-3xl">Contacto</h1>
        <p class="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 md:text-base">
          Atendemos consultas, disponibilidad y compras por nuestros canales autorizados.
        </p>
      </div>

      <div class="rounded-lg border border-primary-300 bg-primary-50 p-4">
        <div class="flex items-start gap-3">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-700 text-white">
            <SfIconCall size="sm" />
          </span>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-neutral-950">Atención inmediata</p>
            <p class="mt-1 text-sm text-neutral-700">Escribinos por WhatsApp para confirmar opciones.</p>
          </div>
        </div>
        <SfButton
          tag="a"
          :href="`https://wa.me/${siteConfig.contact.whatsApp}`"
          target="_blank"
          rel="noreferrer"
          class="mt-4 w-full !bg-primary-700 !text-white hover:!bg-primary-800"
        >
          <SfIconCall size="sm" />
          WhatsApp +{{ siteConfig.contact.whatsApp }}
        </SfButton>
      </div>
    </section>

    <section class="grid gap-4 py-6 md:grid-cols-[1fr_1fr]">
      <a :class="[contactBlockClass, 'md:row-span-2']" :href="addressLink.href" target="_blank" rel="noreferrer">
        <span :class="contactIconClass">
          <component :is="addressLink.icon" size="sm" />
        </span>
        <span class="min-w-0">
          <span :class="contactLabelClass">{{ addressLink.label }}</span>
          <strong :class="contactValueClass">{{ addressLink.value }}</strong>
          <span class="mt-3 block text-sm font-semibold text-secondary-700">Abrir en Google Maps</span>
        </span>
      </a>

      <a
        v-for="channel in contactChannels"
        :key="channel.label"
        :class="contactBlockClass"
        :href="channel.href"
      >
        <span :class="contactIconClass">
          <component :is="channel.icon" size="sm" />
        </span>
        <span class="min-w-0">
          <span :class="contactLabelClass">{{ channel.label }}</span>
          <strong :class="contactValueClass">{{ channel.value }}</strong>
        </span>
      </a>
    </section>

    <section
      v-if="siteConfig.contact.businessHours?.length"
      class="mb-6 rounded-lg border border-neutral-200 bg-white p-4"
    >
      <div class="flex items-start gap-3">
        <span :class="contactIconClass">
          <SfIconSchedule size="sm" />
        </span>
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Horarios de atención
          </p>
          <ul class="mt-2 space-y-1 text-sm leading-6 text-neutral-700">
            <li v-for="line in siteConfig.contact.businessHours" :key="line">
              {{ line }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <p class="text-sm font-semibold uppercase tracking-wide text-neutral-500">
        Redes sociales
      </p>
      <div class="mt-3 flex flex-wrap gap-2">
        <SfButton
          v-for="social in socialLinks"
          :key="social.label"
          tag="a"
          :href="social.href"
          target="_blank"
          rel="noreferrer"
          variant="secondary"
          size="sm"
          class="!border-neutral-300 !bg-white !text-neutral-900 hover:!border-primary-700"
        >
          <component :is="social.icon" size="sm" />
          {{ social.label }}
        </SfButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  SfButton,
  SfIconCall,
  SfIconSchedule,
} from '@storefront-ui/vue'
import { onMounted } from 'vue'
import siteConfig from '@/config'
import { contactLinks, socialLinks } from '@/utils/contactLinks'
import { setPageMeta } from '@/utils/pageMeta'

const addressLink = contactLinks.find((link) => link.key === 'address')!
const contactChannels = contactLinks.filter((link) => ['email', 'website'].includes(link.key))

const contactBlockClass =
  'flex min-w-0 gap-3.5 rounded-lg border border-neutral-200 p-4 text-neutral-700 transition hover:-translate-y-px hover:border-secondary-700 hover:shadow-lg'
const contactIconClass =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-800'
const contactLabelClass =
  'block text-xs font-bold uppercase tracking-wide text-neutral-500'
const contactValueClass =
  'mt-1 block [overflow-wrap:anywhere] text-neutral-950'

onMounted(() => {
  setPageMeta({
    title: `Contacto - ${siteConfig.siteName}`,
    description: `Canales oficiales de contacto de ${siteConfig.siteName}: WhatsApp, correo, redes sociales, dirección y sitio web.`,
    canonicalPath: '/contact',
  })
})
</script>
