<template>
  <StoreLayout>
    <RouterView />
  </StoreLayout>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import StoreLayout from '@/app/layouts/StoreLayout.vue'
import { RouterView, useRoute } from 'vue-router'
import siteConfig from '@/config'
import { DEFAULT_META_DESCRIPTION, setPageMeta } from '@/shared/utils/pageMeta'

const route = useRoute()

watchEffect(() => {
  if (!route.meta.legalDocument) {
    setPageMeta({
      title: siteConfig.siteName,
      description: DEFAULT_META_DESCRIPTION,
      canonicalPath: route.path,
    })
  }
})
</script>
