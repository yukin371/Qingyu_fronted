<template>
  <ReviewManagement />
</template>

<script setup lang="ts">
import ReviewManagement from '@/modules/admin/views/ReviewManagement.vue'
</script>

<route lang="json5">
{
  name: 'admin:reviews',
  meta: { title: '内容审核', requiresAuth: true, roles: ['admin'] }
}
</route>
