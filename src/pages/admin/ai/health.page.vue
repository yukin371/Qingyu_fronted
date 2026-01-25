<template>
  <AIHealthView />
</template>

<script setup lang="ts">
import AIHealthView from '@/modules/ai/views/AIHealthView.vue'
</script>

<route lang="json5">
{
  name: 'admin:ai:health',
  meta: { title: 'AI健康检查', requiresAuth: true, roles: ['admin'] }
}
</route>
