<template>
  <EditBookListView :id="id" />
</template>

<script setup lang="ts">
import EditBookListView from '@/modules/booklist/views/EditBookListView.vue'

defineProps<{ id: string }>()
</script>

<route lang="json5">
{
  name: 'booklists:edit',
  props: true,
  meta: { title: '编辑书单', requiresAuth: true }
}
</route>
