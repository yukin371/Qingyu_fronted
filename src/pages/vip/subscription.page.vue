<template>
  <VIPSubscriptionView />
</template>

<script setup lang="ts">
import VIPSubscriptionView from '@/modules/vip/views/VIPSubscriptionView.vue'
</script>

<route lang="json5">
{
  name: 'vip:subscription',
  meta: { title: '订阅管理', requiresAuth: true }
}
</route>
