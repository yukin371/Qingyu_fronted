<template>
  <CreateBookListView />
</template>

<script setup lang="ts">
import CreateBookListView from '@/modules/booklist/views/CreateBookListView.vue'
</script>

<route lang="json5">
{
  name: 'booklists:create',
  meta: { title: '创建书单', requiresAuth: true }
}
</route>
