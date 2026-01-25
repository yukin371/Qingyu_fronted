<template>
  <DashboardView />
</template>

<script setup lang="ts">
import DashboardView from '@/modules/admin/views/DashboardView.vue'
</script>

<route lang="json5">
{
  name: 'admin:dashboard',
  meta: { title: '仪表板', requiresAuth: true, roles: ['admin'] }
}
</route>
