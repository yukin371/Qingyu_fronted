<template>
  <div class="review-card">
    <div class="review-header">
      <el-tag :type="typeTagType">{{ contentTypeName }}</el-tag>
      <span class="review-time">{{ formatTime(item.submittedAt) }}</span>
    </div>

    <div class="review-content">
      <h4 class="review-title">{{ item.title || '无标题' }}</h4>
      <p v-if="item.content" class="review-text">{{ truncatedContent }}</p>
      <div class="review-meta">
        <span class="review-author">提交者: {{ item.submittedBy }}</span>
      </div>
    </div>

    <div class="review-actions">
      <el-button type="success" size="small" @click="handleApprove">
        <QyIcon name="Select" :size="14" />
        批准
      </el-button>
      <el-button type="danger" size="small" @click="handleReject">
        <QyIcon name="CloseBold" :size="14" />
        拒绝
      </el-button>
      <el-button size="small" @click="handleView">
        <QyIcon name="View" :size="14" />
        详情
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QyIcon } from '@/design-system/components'
import type { PendingReview } from '@/types/shared'
import { formatRelativeTime } from '@/utils/format'

interface Props {
  item: PendingReview
}

interface Emits {
  (e: 'approve', item: PendingReview): void
  (e: 'reject', item: PendingReview): void
  (e: 'view', item: PendingReview): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 内容类型名称
const contentTypeName = computed(() => {
  const typeMap: Record<string, string> = {
    document: '文档',
    book: '书籍',
    chapter: '章节',
    comment: '评论'
  }
  return typeMap[props.item.contentType] || props.item.contentType
})

// 类型标签颜色
const typeTagType = computed(() => {
  const typeMap: Record<string, any> = {
    document: 'primary',
    book: 'success',
    chapter: 'warning',
    comment: 'info'
  }
  return typeMap[props.item.contentType] || ''
})

// 截断内容
const truncatedContent = computed(() => {
  if (!props.item.content) return ''
  const maxLength = 100
  return props.item.content.length > maxLength
    ? props.item.content.substring(0, maxLength) + '...'
    : props.item.content
})

// 格式化时间
const formatTime = (time?: string) => {
  if (!time) return '-'
  try {
    return formatRelativeTime(time)
  } catch {
    return time
  }
}

// 事件处理
const handleApprove = () => {
  emit('approve', props.item)
}

const handleReject = () => {
  emit('reject', props.item)
}

const handleView = () => {
  emit('view', props.item)
}
</script>

<style scoped lang="scss">
.review-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
  }
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.review-time {
  font-size: 12px;
  color: #909399;
}

.review-content {
  margin-bottom: 12px;
}

.review-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.5;
}

.review-text {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.review-meta {
  font-size: 13px;
  color: #909399;
}

.review-author {
  margin-right: 16px;
}

.review-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}
</style>

