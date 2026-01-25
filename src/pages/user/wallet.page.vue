<template>
  <WalletView />
</template>

<script setup lang="ts">
import WalletView from '@/modules/user/views/WalletView.vue'
</script>

<route lang="json5">
{
  name: 'user:wallet',
  meta: { title: '我的钱包', requiresAuth: true }
}
</route>
