<template>
  <AIMainView />
</template>

<script setup lang="ts">
import AIMainView from '@/modules/ai/views/AIMainView.vue'
</script>

<route lang="json5">
{
  name: 'admin:ai:overview',
  meta: { title: 'AI系统总览', requiresAuth: true, roles: ['admin'] }
}
</route>
