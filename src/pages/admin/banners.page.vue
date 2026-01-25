<template>
  <BannerManagement />
</template>

<script setup lang="ts">
import BannerManagement from '@/modules/admin/views/BannerManagement.vue'
</script>

<route lang="json5">
{
  name: 'admin:banners',
  meta: { title: 'Banner管理', requiresAuth: true, roles: ['admin'] }
}
</route>
