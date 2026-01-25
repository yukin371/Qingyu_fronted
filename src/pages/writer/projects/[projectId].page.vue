<template>
  <ProjectWorkspace :project-id="projectId" />
</template>

<script setup lang="ts">
import ProjectWorkspace from '@/modules/writer/views/ProjectWorkspace.vue'

defineProps<{ projectId: string }>()
</script>

<route lang="json5">
{
  name: 'writer:project',
  props: true,
  meta: { title: '项目管理', layout: 'writer', requiresAuth: true, roles: ['writer', 'admin'] }
}
</route>
