<template>
  <MyBookListsView />
</template>

<script setup lang="ts">
import MyBookListsView from '@/modules/booklist/views/MyBookListsView.vue'
</script>

<route lang="json5">
{
  name: 'booklists:my',
  meta: { title: '我的书单', requiresAuth: true }
}
</route>
