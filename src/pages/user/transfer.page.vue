<template>
  <TransferView />
</template>

<script setup lang="ts">
import TransferView from '@/modules/user/views/TransferView.vue'
</script>

<route lang="json5">
{
  name: 'user:transfer',
  meta: { title: '转账', requiresAuth: true }
}
</route>
