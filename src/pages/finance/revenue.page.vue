<template>
  <AuthorRevenueView />
</template>

<script setup lang="ts">
import AuthorRevenueView from '@/modules/finance/views/AuthorRevenueView.vue'
</script>

<route lang="json5">
{
  name: 'finance:revenue',
  meta: { title: '作者收入', requiresAuth: true, roles: ['author'] }
}
</route>
