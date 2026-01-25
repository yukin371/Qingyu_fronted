<template>
  <PublishManagementView />
</template>

<script setup lang="ts">
import PublishManagementView from '@/modules/writer/views/PublishManagementView.vue'
</script>

<route lang="json5">
{
  name: 'writer:publish',
  meta: { title: '发布管理', layout: 'writer', requiresAuth: true, roles: ['writer', 'admin'] }
}
</route>
