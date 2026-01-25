<template>
  <AccountSettings />
</template>

<script setup lang="ts">
import AccountSettings from '@/modules/user/views/AccountSettings.vue'
</script>

<route lang="json5">
{
  name: 'user:settings-account',
  meta: { title: '账户设置', requiresAuth: true }
}
</route>
