<template>
  <div class="comment-list">
    <CommentItem
      v-for="comment in comments"
      :key="comment.id"
      :comment="comment"
      @like="$emit('like', $event)"
    />

    <el-skeleton
      v-if="loading"
      :rows="3"
      animated
    />
  </div>
</template>

<script setup lang="ts">
import CommentItem from './CommentItem.vue'
import type { ParagraphComment } from '@/types/reader/index'

interface Props {
  comments: ParagraphComment[]
  loading: boolean
}

defineProps<Props>()

defineEmits<{
  like: [commentId: string]
}>()
</script>

<style scoped lang="scss">
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
