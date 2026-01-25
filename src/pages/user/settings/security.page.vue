<template>
  <SecuritySettings />
</template>

<script setup lang="ts">
import SecuritySettings from '@/modules/user/views/SecuritySettings.vue'
</script>

<route lang="json5">
{
  name: 'user:settings-security',
  meta: { title: '安全设置', requiresAuth: true }
}
</route>
