<template>
  <AIProvidersView />
</template>

<script setup lang="ts">
import AIProvidersView from '@/modules/ai/views/AIProvidersView.vue'
</script>

<route lang="json5">
{
  name: 'admin:ai:providers',
  meta: { title: 'AI提供商管理', requiresAuth: true, roles: ['admin'] }
}
</route>
