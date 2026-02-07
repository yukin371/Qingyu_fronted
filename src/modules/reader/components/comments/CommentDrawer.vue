<template>
  <el-drawer
    v-model="visible"
    direction="rtl"
    :size="400"
    :close-on-click-modal="true"
    @close="handleClose"
  >
    <template #header>
      <CommentDrawerHeader
        :paragraph-index="paragraphIndex"
        :comment-count="commentCount"
      />
    </template>

    <div class="comment-drawer-content">
      <!-- 评论列表 -->
      <CommentList
        :comments="comments"
        :loading="loading"
        @like="handleLike"
      />

      <!-- 空状态 -->
      <el-empty
        v-if="!loading && comments.length === 0"
        description="还没有评论，快来抢沙发吧~"
      />
    </div>

    <template #footer>
      <CommentInput
        @submit="handleSubmit"
        :disabled="loading"
      />
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CommentDrawerHeader from './CommentDrawerHeader.vue'
import CommentList from './CommentList.vue'
import CommentInput from './CommentInput.vue'
import type { ParagraphComment } from '@/types/reader/index'

interface Props {
  modelValue: boolean
  paragraphIndex: number
  comments: ParagraphComment[]
  loading: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'like': [commentId: string]
  'submit': [data: { content: string; emoji?: string }]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const commentCount = computed(() => props.comments.length)

const handleClose = () => {
  visible.value = false
}

const handleLike = (commentId: string) => {
  emit('like', commentId)
}

const handleSubmit = (data: { content: string; emoji?: string }) => {
  emit('submit', data)
}
</script>

<style scoped lang="scss">
.comment-drawer-content {
  height: 100%;
  overflow-y: auto;
  padding: 0 20px;
}
</style>
