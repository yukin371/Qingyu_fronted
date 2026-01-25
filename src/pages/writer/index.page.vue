<template>
  <WriterDashboard />
</template>

<script setup lang="ts">
import WriterDashboard from '@/modules/writer/views/WriterDashboard.vue'
</script>

<route lang="json5">
{
  name: 'writer:dashboard',
  meta: { title: '创作工作台', layout: 'writer', requiresAuth: true, roles: ['writer', 'admin'] }
}
</route>
