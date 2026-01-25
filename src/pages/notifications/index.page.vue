<template>
  <NotificationCenter />
</template>

<script setup lang="ts">
import NotificationCenter from '@/modules/notification/views/NotificationCenter.vue'
</script>

<route lang="json5">
{
  name: 'notifications:center',
  meta: { title: '消息中心', requiresAuth: true }
}
</route>
