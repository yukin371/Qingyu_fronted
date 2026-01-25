<template>
  <ReviewDetailView :review-id="reviewId" />
</template>

<script setup lang="ts">
import ReviewDetailView from '@/modules/review/views/ReviewDetailView.vue'

defineProps<{ reviewId: string }>()
</script>

<route lang="json5">
{
  name: 'reviews:detail',
  props: true,
  meta: { title: '书评详情' }
}
</route>
