<template>
  <ProjectListView />
</template>

<script setup lang="ts">
import ProjectListView from '@/modules/writer/views/ProjectListView.vue'
</script>

<route lang="json5">
{
  name: 'writer:projects',
  meta: { title: '我的项目', layout: 'writer', requiresAuth: true, roles: ['writer', 'admin'] }
}
</route>
