<template>
  <BookmarkManagementView />
</template>

<script setup lang="ts">
import BookmarkManagementView from '@/modules/reader/views/BookmarkManagementView.vue'
</script>

<route lang="json5">
{
  name: 'reading:bookmarks',
  meta: { title: '我的书签', requiresAuth: true }
}
</route>
