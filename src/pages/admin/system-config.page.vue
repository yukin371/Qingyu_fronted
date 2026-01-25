<template>
  <SystemConfig />
</template>

<script setup lang="ts">
import SystemConfig from '@/modules/admin/views/SystemConfig.vue'
</script>

<route lang="json5">
{
  name: 'admin:system-config',
  meta: { title: '系统配置', requiresAuth: true, roles: ['admin'] }
}
</route>
