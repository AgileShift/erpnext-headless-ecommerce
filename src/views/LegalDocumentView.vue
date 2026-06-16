<template>
  <div class="mx-auto w-full max-w-4xl px-4 py-4 md:px-8 md:py-8">
    <div class="border-b border-neutral-200 pb-4">
      <p class="text-sm font-semibold uppercase tracking-wide text-neutral-500">
        {{ siteConfig.siteName }}
      </p>
      <h1 class="mt-1 text-2xl font-bold text-neutral-950 md:text-3xl">
        {{ displayTitle }}
      </h1>
      <p v-if="lastUpdatedOn" class="mt-2 text-xs text-neutral-500">
        Última actualización: {{ lastUpdatedOn }}
      </p>
    </div>

    <div v-if="loading" class="py-8 text-sm text-neutral-600">Cargando información...</div>

    <div
      v-else-if="safeRenderedContent"
      class="wiki-content py-6 text-neutral-700"
      v-html="safeRenderedContent"
    />

    <div v-else-if="errorMessage" class="py-6">
      <div
        class="rounded-lg border border-warning-00 bg-warning-500 px-4 py-3 text-sm font-medium text-neutral-950"
      >
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DOMPurify from 'dompurify'
import { computed, ref, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import siteConfig from '@/config'
import { getLegalDocumentLabel, type LegalDocumentKey } from '@/router/legalRoutes'
import { getLegalDocumentMetaDescription, setPageMeta } from '@/utils/pageMeta'

type WikiPageMessage = {
  title?: string
  route?: string
  rendered_content?: string
  raw_markdown?: string
  last_updated_on?: string
  doc?: {
    is_published?: number
    is_private?: number
  }
}

type WikiPageResponse = {
  message?: WikiPageMessage
}

const props = defineProps<{
  docKey: LegalDocumentKey
}>()

const route = useRoute()
const loading = ref(false)
const errorMessage = ref('')
const wikiPage = ref<WikiPageMessage | null>(null)

const wikiRoute = computed(() =>
  [siteConfig.wiki.routePrefix, siteConfig.wiki.documents[props.docKey]].filter(Boolean).join('/'),
)
const displayTitle = computed(() => wikiPage.value?.title || getLegalDocumentLabel(props.docKey))
const lastUpdatedOn = computed(() => wikiPage.value?.last_updated_on || '')
const safeRenderedContent = computed(() =>
  wikiPage.value?.rendered_content
    ? DOMPurify.sanitize(wikiPage.value.rendered_content, { USE_PROFILES: { html: true } })
    : '',
)

const loadWikiDocument = async () => {
  wikiPage.value = null
  errorMessage.value = ''

  if (!siteConfig.wiki?.baseUrl || !wikiRoute.value) {
    errorMessage.value = 'No se encontró configuración para esta página.'
    return
  }

  loading.value = true

  try {
    const endpoint =
      `${siteConfig.wiki.baseUrl}/api/method/wiki.frappe_wiki.doctype.wiki_document.wiki_document.get_page_data` +
      `?route=${encodeURIComponent(wikiRoute.value)}`
    const response = await fetch(endpoint)

    if (!response.ok) {
      throw new Error('No se pudo cargar el documento.')
    }

    const data = (await response.json()) as WikiPageResponse
    const page = data.message

    if (!page || page.doc?.is_published !== 1 || page.doc?.is_private === 1) {
      throw new Error('El documento no está publicado.')
    }

    wikiPage.value = {
      title: page.title,
      route: page.route,
      rendered_content: page.rendered_content,
      raw_markdown: page.raw_markdown,
      last_updated_on: page.last_updated_on,
      doc: {
        is_published: page.doc?.is_published,
        is_private: page.doc?.is_private,
      },
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? `${error.message} Intentá nuevamente más tarde.`
        : 'No se pudo cargar el documento. Intentá nuevamente más tarde.'
  } finally {
    loading.value = false
  }
}

watch(() => props.docKey, loadWikiDocument, { immediate: true })

watchEffect(() => {
  setPageMeta({
    title: `${displayTitle.value} - ${siteConfig.siteName}`,
    description: getLegalDocumentMetaDescription(displayTitle.value),
    canonicalPath: route.path,
  })
})
</script>

<style scoped>
.wiki-content :deep(h1),
.wiki-content :deep(h2),
.wiki-content :deep(h3) {
  color: rgb(10 10 10);
  font-weight: 700;
  line-height: 1.25;
  margin: 1.5rem 0 0.75rem;
}

.wiki-content :deep(h1) {
  font-size: 1.5rem;
}

.wiki-content :deep(h2) {
  font-size: 1.25rem;
}

.wiki-content :deep(h3) {
  font-size: 1.125rem;
}

.wiki-content :deep(p),
.wiki-content :deep(li) {
  color: rgb(64 64 64);
  font-size: 0.95rem;
  line-height: 1.75;
}

.wiki-content :deep(a) {
  color: rgb(var(--colors-secondary-700));
  font-weight: 600;
  text-decoration: underline;
}

.wiki-content :deep(ul),
.wiki-content :deep(ol) {
  margin: 0.75rem 0;
  padding-left: 1.25rem;
}

.wiki-content :deep(ul) {
  list-style: disc;
}

.wiki-content :deep(ol) {
  list-style: decimal;
}

.wiki-content :deep(table) {
  border-collapse: collapse;
  display: block;
  margin: 1rem 0;
  max-width: 100%;
  overflow-x: auto;
  width: 100%;
}

.wiki-content :deep(th),
.wiki-content :deep(td) {
  border: 1px solid rgb(229 229 229);
  padding: 0.625rem;
}

.wiki-content :deep(th) {
  background: rgb(245 245 245);
  color: rgb(23 23 23);
  font-weight: 700;
}

.wiki-content :deep(hr) {
  border: 0;
  border-top: 1px solid rgb(229 229 229);
  margin: 1.5rem 0;
}
</style>
