<template>
  <CommentDetailView :comment-id="commentId" />
</template>

<script setup lang="ts">
import CommentDetailView from '@/modules/reader/views/CommentDetailView.vue'

defineProps<{ commentId: string }>()
</script>

<route lang="json5">
{
  name: 'reading:comment-detail',
  props: true,
  meta: { title: '评论详情' }
}
</route>
