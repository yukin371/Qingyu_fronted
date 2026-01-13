<template>
  <div class="comment-item">
    <el-avatar :src="comment.avatar" :size="40">
      {{ comment.username?.charAt(0) || 'U' }}
    </el-avatar>

    <div class="comment-content">
      <div class="comment-header">
        <span class="username">{{ comment.username }}</span>
        <span class="time">{{ formatTime(comment.createdAt) }}</span>
      </div>

      <!-- 文字评论 -->
      <p v-if="comment.content" class="text">
        {{ comment.content }}
      </p>

      <!-- 表情评论 -->
      <div v-else-if="comment.emoji" class="emoji">
        {{ comment.emoji }}
      </div>

      <div class="comment-actions">
        <el-button
          text
          :type="comment.likedByMe ? 'primary' : 'default'"
          :icon="comment.likedByMe ? StarFilled : Star"
          @click="$emit('like', comment.id)"
        >
          {{ comment.likes || '点赞' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star, StarFilled } from '@element-plus/icons-vue'
import type { ParagraphComment } from '@/types/reader'

interface Props {
  comment: ParagraphComment
}

defineProps<Props>()

defineEmits<{
  like: [commentId: string]
}>()

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString()
}
</script>

<style scoped lang="scss">
.comment-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .username {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .time {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.text {
  margin: 8px 0;
  line-height: 1.6;
  word-break: break-word;
}

.emoji {
  font-size: 32px;
  margin: 8px 0;
}

.comment-actions {
  margin-top: 8px;
}
</style>
