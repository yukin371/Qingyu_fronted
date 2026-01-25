<template>
  <VIPPurchaseView />
</template>

<script setup lang="ts">
import VIPPurchaseView from '@/modules/vip/views/VIPPurchaseView.vue'
</script>

<route lang="json5">
{
  name: 'vip:purchase',
  meta: { title: '购买会员', requiresAuth: true }
}
</route>
