<template>
  <AnnouncementManagement />
</template>

<script setup lang="ts">
import AnnouncementManagement from '@/modules/admin/views/AnnouncementManagement.vue'
</script>

<route lang="json5">
{
  name: 'admin:announcements',
  meta: { title: '公告管理', requiresAuth: true, roles: ['admin'] }
}
</route>
