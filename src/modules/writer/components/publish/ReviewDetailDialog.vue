<template>
  <el-dialog :model-value="visible" title="审核详情" width="600px" @update:model-value="$emit('update:visible', $event)">
    <div v-if="detail" class="review-detail">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="章节标题" :span="2">
          {{ detail.chapter_title }}
        </el-descriptions-item>
        <el-descriptions-item label="章节号">
          {{ detail.chapter_number }}
        </el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="getReviewStatusType(detail.status)">
            {{ getReviewStatusLabel(detail.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">
          {{ formatDate(detail.submitted_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="审核时间">
          {{ detail.reviewed_at ? formatDate(detail.reviewed_at) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="审核人" :span="2">
          {{ detail.reviewer_name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item
          label="审核意见"
          :span="2"
          v-if="detail.review_comment"
        >
          <div class="review-comment">
            {{ detail.review_comment }}
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">关闭</el-button>
      <el-button
        v-if="detail?.status === 'rejected'"
        type="primary"
        @click="$emit('resubmit')"
      >
        重新提交
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
export interface ReviewDetail {
  id: string
  chapter_title: string
  chapter_number: number
  status: string
  submitted_at: string
  reviewed_at: string | null
  reviewer_name: string | null
  review_comment: string | null
}

defineProps<{
  visible: boolean
  detail: ReviewDetail | null
}>()

defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'resubmit'): void
}>()

// 辅助函数
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const getReviewStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: '审核中',
    approved: '已通过',
    rejected: '已拒绝',
  }
  return map[status] || status
}

const getReviewStatusType = (status: string): 'info' | 'warning' | 'success' | 'danger' => {
  const map: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  }
  return map[status] || 'info'
}
</script>

<style scoped lang="scss">
.review-comment {
  white-space: pre-wrap;
  word-break: break-word;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-top: 8px;
}
</style>
