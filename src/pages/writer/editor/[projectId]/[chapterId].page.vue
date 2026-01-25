<template>
  <EditorView :project-id="projectId" :chapter-id="chapterId" />
</template>

<script setup lang="ts">
import EditorView from '@/modules/writer/views/EditorView.vue'

defineProps<{ projectId: string; chapterId?: string }>()
</script>

<route lang="json5">
{
  name: 'writer:editor',
  props: true,
  meta: { title: '编辑器', layout: 'blank', requiresAuth: true, roles: ['writer', 'admin'] }
}
</route>
