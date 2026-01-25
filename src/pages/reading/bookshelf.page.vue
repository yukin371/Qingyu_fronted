<template>
  <BookshelfView />
</template>

<script setup lang="ts">
import BookshelfView from '@/modules/reader/views/BookshelfView.vue'
</script>

<route lang="json5">
{
  name: 'reading:bookshelf',
  meta: { title: '我的书架', requiresAuth: true }
}
</route>
