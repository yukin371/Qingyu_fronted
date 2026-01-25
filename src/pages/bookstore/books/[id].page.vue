<template>
  <BookDetailView :book-id="id" />
</template>

<script setup lang="ts">
import BookDetailView from '@/modules/bookstore/views/BookDetailView.vue'

defineProps<{ id: string }>()
</script>

<route lang="json5">
{
  name: 'bookstore:book-detail',
  props: true,
  meta: { title: '书籍详情' }
}
</route>
