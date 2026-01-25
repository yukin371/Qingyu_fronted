<template>
  <AIModelsView />
</template>

<script setup lang="ts">
import AIModelsView from '@/modules/ai/views/AIModelsView.vue'
</script>

<route lang="json5">
{
  name: 'admin:ai:models',
  meta: { title: 'AI模型管理', requiresAuth: true, roles: ['admin'] }
}
</route>
