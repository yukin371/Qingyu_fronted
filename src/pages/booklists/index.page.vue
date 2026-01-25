<template>
  <BookListsView />
</template>

<script setup lang="ts">
import BookListsView from '@/modules/booklist/views/BookListsView.vue'
</script>

<route lang="json5">
{
  name: 'booklists:list',
  meta: { title: '书单广场' }
}
</route>
