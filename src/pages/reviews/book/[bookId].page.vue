<template>
  <BookReviewsView :book-id="bookId" />
</template>

<script setup lang="ts">
import BookReviewsView from '@/modules/review/views/BookReviewsView.vue'

defineProps<{ bookId: string }>()
</script>

<route lang="json5">
{
  name: 'reviews:book-reviews',
  props: true,
  meta: { title: '书评' }
}
</route>
