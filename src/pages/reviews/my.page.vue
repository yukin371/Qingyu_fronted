<template>
  <MyReviewsView />
</template>

<script setup lang="ts">
import MyReviewsView from '@/modules/review/views/MyReviewsView.vue'
</script>

<route lang="json5">
{
  name: 'reviews:my',
  meta: { title: '我的书评', requiresAuth: true }
}
</route>
