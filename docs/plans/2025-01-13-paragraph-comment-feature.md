# 段落评论功能实施计划

> **状态:** Phase 1 已完成 (UI + 模拟数据)
>
> **完成日期:** 2025-01-13
>
> **实施内容:**
> - ✅ 创建所有UI组件 (7个组件)
> - ✅ 创建 Pinia Store
> - ✅ 集成到 ReaderView
> - ✅ 添加类型定义
> - ✅ 测试模式支持
>
> **待完成:** Phase 2 - API集成

**目标:** 在阅读器中添加段落评论功能，允许用户对章节段落进行评论、点赞和查看他人评论

**架构:** Vue 3 Composition API + Pinia + Element Plus，采用侧边抽屉模式，支持主题颜色适配

**Tech Stack:** Vue 3, TypeScript, Pinia, SCSS, Element Plus

---

## 功能概述

### 核心功能
- 点击段落触发评论侧边栏
- 支持文字评论和表情评论
- 点赞评论功能
- 查看段落的评论列表
- 评论数量气泡显示
- 主题颜色智能适配

### 用户交互流程
1. 用户点击段落 → 段落高亮 → 右侧滑出评论抽屉
2. 在抽屉中查看/添加评论
3. 点击其他段落 → 切换高亮和评论内容
4. 点击抽屉外部 → 关闭抽屉并取消高亮

---

## 数据结构设计

### TypeScript 接口

```typescript
// 段落评论
interface ParagraphComment {
  id: string
  paragraphId: string        // 段落唯一标识
  chapterId: string          // 所属章节
  paragraphIndex: number     // 段落索引

  // 评论内容
  userId: string
  username: string
  avatar: string
  content: string            // 文字内容
  emoji?: string             // 表情（可选）

  // 互动数据
  likes: number
  likedByMe: boolean

  // 元数据
  createdAt: string
  updatedAt: string
}

// 段落评论摘要
interface ParagraphCommentSummary {
  paragraphId: string
  commentCount: number
  latestComment?: {
    content: string
    username: string
    time: string
  }
}

// 添加评论数据
interface AddCommentData {
  paragraphId: string
  chapterId: string
  paragraphIndex: number
  content?: string
  emoji?: string
}

// 用户评论设置
interface UserCommentSettings {
  highlightColor?: string    // 自定义高亮色
  highlightOpacity?: number  // 高亮透明度 0-1
}
```

---

## UI组件架构

### 组件层级

```
ReaderView.vue
  └── ChapterContent.vue
      └── p.可评论段落
          ├── @click → handleParagraphClick
          └── CommentBadge.vue
  └── CommentDrawer.vue
      ├── CommentDrawerHeader.vue
      ├── CommentList.vue
      │   └── CommentItem.vue
      └── CommentInput.vue
          └── EmojiPicker.vue
```

### 组件职责

#### 1. CommentBadge.vue
- 显示评论数量徽章
- 位置：段落右下角
- 点击打开评论抽屉
- 支持主题适配

#### 2. CommentDrawer.vue
- 右侧抽屉容器（400px宽）
- 背景色跟随主题
- 点击遮罩关闭

#### 3. CommentDrawerHeader.vue
- 显示段落编号
- 显示评论统计

#### 4. CommentList.vue
- 滚动列表
- 空状态提示

#### 5. CommentItem.vue
- 用户头像、昵称
- 评论内容/表情显示
- 点赞按钮
- 时间戳

#### 6. CommentInput.vue
- 多行文本输入（最多500字）
- 字数统计
- 发送按钮

#### 7. EmojiPicker.vue
- 6-12个常用表情
- 点击选中

---

## 状态管理设计

### useCommentStore

```typescript
// stores/comment.ts
export const useCommentStore = defineStore('comment', () => {
  // 状态
  const currentParagraphId = ref<string | null>(null)
  const comments = ref<Map<string, ParagraphComment[]>>()
  const summaries = ref<Map<string, ParagraphCommentSummary>>()
  const isLoading = ref(false)

  // 计算属性
  const currentComments = computed(() => {
    if (!currentParagraphId.value) return []
    return comments.value.get(currentParagraphId.value) || []
  })

  // Actions
  async function loadParagraphComments(paragraphId: string)
  async function addComment(data: AddCommentData)
  async function toggleLike(commentId: string)
  async function loadChapterSummaries(chapterId: string)
  function selectParagraph(paragraphId: string)
  function clearSelection()

  return {
    currentParagraphId,
    comments,
    summaries,
    isLoading,
    currentComments,
    loadParagraphComments,
    addComment,
    toggleLike,
    loadChapterSummaries,
    selectParagraph,
    clearSelection
  }
})
```

---

## API接口设计

### 后端端点

```typescript
// modules/reader/api/comments.ts

export const commentAPI = {
  // 获取段落评论列表
  async getParagraphComments(paragraphId: string, page = 1, size = 20)

  // 添加段落评论
  async addComment(data: AddCommentData)

  // 点赞/取消点赞
  async toggleLike(commentId: string)

  // 获取章节评论摘要
  async getChapterSummaries(chapterId: string)

  // 删除评论
  async deleteComment(commentId: string)
}
```

---

## 主题颜色适配

### 颜色优先级

```
用户自定义 > 主题配置 > 默认RGBA偏移
```

### 默认高亮色

```typescript
const DEFAULT_HIGHLIGHT = 'rgba(255, 235, 59, 0.3)'
```

### 主题配置扩展

```typescript
interface ReaderTheme {
  value: string
  label: string
  bg: string
  color: string
  highlightColor?: string  // 新增
}
```

### 设置面板新增

- 颜色选择器
- 透明度滑块（0.1-0.5）
- 预设颜色快捷选择

---

## 分阶段实施

### 阶段1：UI和模拟数据 ⭐ 当前阶段

**目标**: 完整的UI交互和视觉效果

#### Task 1: 创建 CommentBadge 组件

**文件**: `src/modules/reader/components/comments/CommentBadge.vue`

**Step 1: 创建组件文件**

```vue
<template>
  <div
    v-if="commentCount > 0"
    class="comment-badge"
    @click.stop="handleClick"
  >
    <el-icon><ChatDotRound /></el-icon>
    <span class="count">{{ commentCount }}</span>
  </div>
</template>

<script setup lang="ts">
import { ChatDotRound } from '@element-plus/icons-vue'

interface Props {
  commentCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>

<style scoped lang="scss">
.comment-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  margin-left: 8px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.05);
    background: var(--el-color-primary-light-9);
  }
}

.count {
  font-weight: 500;
}
</style>
```

**Step 2: 验证组件创建成功**

Run: `ls src/modules/reader/components/comments/CommentBadge.vue`
Expected: 文件存在

---

#### Task 2: 创建 CommentDrawer 组件

**文件**: `src/modules/reader/components/comments/CommentDrawer.vue`

**Step 1: 创建抽屉主体**

```vue
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
import type { ParagraphComment } from '@/types/reader'

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
```

**Step 2: 验证**

Run: `ls src/modules/reader/components/comments/CommentDrawer.vue`
Expected: 文件存在

---

#### Task 3: 创建 CommentDrawerHeader 组件

**文件**: `src/modules/reader/components/comments/CommentDrawerHeader.vue`

```vue
<template>
  <div class="comment-header">
    <h3 class="title">段落评论</h3>
    <div class="meta">
      <span class="paragraph-info">第 {{ paragraphIndex }} 段</span>
      <el-divider direction="vertical" />
      <span class="comment-count">{{ commentCount }} 条评论</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  paragraphIndex: number
  commentCount: number
}

defineProps<Props>()
</script>

<style scoped lang="scss">
.comment-header {
  .title {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
  }

  .meta {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}
</style>
```

---

#### Task 4: 创建 CommentList 组件

**文件**: `src/modules/reader/components/comments/CommentList.vue`

```vue
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
import type { ParagraphComment } from '@/types/reader'

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
```

---

#### Task 5: 创建 CommentItem 组件

**文件**: `src/modules/reader/components/comments/CommentItem.vue`

```vue
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
```

---

#### Task 6: 创建 CommentInput 组件

**文件**: `src/modules/reader/components/comments/CommentInput.vue`

```vue
<template>
  <div class="comment-input">
    <!-- 表情选择器 -->
    <EmojiPicker
      v-if="showEmojiPicker"
      @select="handleSelectEmoji"
      @close="showEmojiPicker = false"
    />

    <div class="input-wrapper">
      <el-input
        v-model="content"
        type="textarea"
        :rows="2"
        placeholder="写下你的想法..."
        :maxlength="500"
        show-word-limit
        @keydown="handleKeydown"
      />

      <div class="input-actions">
        <el-button
          text
          :icon="ChatDotRound"
          @click="showEmojiPicker = true"
        >
          表情
        </el-button>

        <el-button
          type="primary"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChatDotRound } from '@element-plus/icons-vue'
import EmojiPicker from './EmojiPicker.vue'

const content = ref('')
const showEmojiPicker = ref(false)

const canSubmit = computed(() => {
  return content.value.trim().length > 0
})

const emit = defineEmits<{
  submit: [data: { content: string; emoji?: string }]
}>()

const handleSelectEmoji = (emoji: string) => {
  content.value = emoji
  showEmojiPicker.value = false
  emit('submit', { emoji })
  content.value = ''
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === 'Enter') {
    handleSubmit()
  }
}

const handleSubmit = () => {
  if (!canSubmit.value) return

  emit('submit', { content: content.value })
  content.value = ''
}
</script>

<style scoped lang="scss">
.comment-input {
  position: relative;
  padding: 16px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color);
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
```

---

#### Task 7: 创建 EmojiPicker 组件

**文件**: `src/modules/reader/components/comments/EmojiPicker.vue`

```vue
<template>
  <div class="emoji-picker" v-if="visible">
    <div class="emoji-grid">
      <div
        v-for="emoji in emojis"
        :key="emoji"
        class="emoji-item"
        @click="$emit('select', emoji)"
      >
        {{ emoji }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(true)

const emojis = [
  '👍', '❤️', '😂', '😮', '😢', '😡',
  '🎉', '🔥', '👏', '👀', '✨', '💯'
]

defineEmits<{
  select: [emoji: string]
  close: []
}>()
</script>

<style scoped lang="scss">
.emoji-picker {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  padding: 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.emoji-item {
  font-size: 24px;
  text-align: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: var(--el-fill-color-light);
  }
}
</style>
```

---

#### Task 8: 创建 Pinia Store

**文件**: `src/stores/comment.ts`

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ParagraphComment, ParagraphCommentSummary, AddCommentData } from '@/types/reader'

export const useCommentStore = defineStore('comment', () => {
  const currentParagraphId = ref<string | null>(null)
  const comments = ref<Map<string, ParagraphComment[]>>(new Map())
  const summaries = ref<Map<string, ParagraphCommentSummary>>(new Map())
  const isLoading = ref(false)

  const currentComments = computed(() => {
    if (!currentParagraphId.value) return []
    return comments.value.get(currentParagraphId.value) || []
  })

  const currentSummary = computed(() => {
    if (!currentParagraphId.value) return null
    return summaries.value.get(currentParagraphId.value)
  })

  // 测试模式：加载模拟评论数据
  async function loadParagraphComments(paragraphId: string) {
    currentParagraphId.value = paragraphId
    isLoading.value = true

    // 检测测试模式
    const authStore = useAuthStore()
    const token = authStore.token as any
    const isMockToken = token && (typeof token === 'string' ? token : JSON.stringify(token)).includes('mock')

    if (isMockToken) {
      // 返回模拟评论
      console.log('[测试模式] 加载段落评论:', paragraphId)

      const mockComments: ParagraphComment[] = [
        {
          id: 'c1',
          paragraphId,
          chapterId: 'chapter-001',
          paragraphIndex: 0,
          userId: 'user1',
          username: '书虫小明',
          avatar: 'https://picsum.photos/seed/user1/40/40',
          content: '这一段写得太棒了！情节跌宕起伏，人物刻画细腻入微。',
          likes: 12,
          likedByMe: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'c2',
          paragraphId,
          chapterId: 'chapter-001',
          paragraphIndex: 0,
          userId: 'user2',
          username: '文学爱好者',
          avatar: 'https://picsum.photos/seed/user2/40/40',
          emoji: '👍',
          likes: 8,
          likedByMe: true,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          updatedAt: new Date(Date.now() - 7200000).toISOString()
        }
      ]

      comments.value.set(paragraphId, mockComments)
      isLoading.value = false
      return mockComments
    }

    // 生产模式：调用真实API
    // TODO: API调用
    isLoading.value = false
    return []
  }

  // 测试模式：添加评论
  async function addComment(data: AddCommentData) {
    const authStore = useAuthStore()
    const user = authStore.user

    if (!user) return

    const newComment: ParagraphComment = {
      id: `c${Date.now()}`,
      paragraphId: data.paragraphId,
      chapterId: data.chapterId,
      paragraphIndex: data.paragraphIndex,
      userId: user.id,
      username: user.nickname || user.username,
      avatar: user.avatar || '',
      content: data.content,
      emoji: data.emoji,
      likes: 0,
      likedByMe: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const existing = comments.value.get(data.paragraphId) || []
    comments.value.set(data.paragraphId, [...existing, newComment])

    // 更新摘要
    const summary = summaries.value.get(data.paragraphId)
    if (summary) {
      summaries.value.set(data.paragraphId, {
        ...summary,
        commentCount: summary.commentCount + 1,
        latestComment: {
          content: data.content || data.emoji || '',
          username: newComment.username,
          time: '刚刚'
        }
      })
    }

    return newComment
  }

  // 测试模式：点赞
  async function toggleLike(commentId: string) {
    for (const [paragraphId, commentList] of comments.value.entries()) {
      const comment = commentList.find(c => c.id === commentId)
      if (comment) {
        comment.likedByMe = !comment.likedByMe
        comment.likes += comment.likedByMe ? 1 : -1
        break
      }
    }
  }

  // 测试模式：加载章节摘要
  async function loadChapterSummaries(chapterId: string) {
    const authStore = useAuthStore()
    const token = authStore.token as any
    const isMockToken = token && (typeof token === 'string' ? token : JSON.stringify(token)).includes('mock')

    if (isMockToken) {
      console.log('[测试模式] 加载章节评论摘要')

      // 为段落0-5添加评论摘要
      for (let i = 0; i < 6; i++) {
        const count = Math.floor(Math.random() * 20)
        if (count > 0) {
          summaries.value.set(`${chapterId}-${i}`, {
            paragraphId: `${chapterId}-${i}`,
            commentCount: count,
            latestComment: {
              content: '精彩段落！',
              username: '读者' + i,
              time: '1小时前'
            }
          })
        }
      }
    }
  }

  function selectParagraph(paragraphId: string) {
    currentParagraphId.value = paragraphId
  }

  function clearSelection() {
    currentParagraphId.value = null
  }

  return {
    currentParagraphId,
    comments,
    summaries,
    isLoading,
    currentComments,
    currentSummary,
    loadParagraphComments,
    addComment,
    toggleLike,
    loadChapterSummaries,
    selectParagraph,
    clearSelection
  }
})
```

---

#### Task 9: 集成到 ReaderView

**文件**: `src/modules/reader/views/ReaderView.vue`

**Step 1: 添加段落点击处理**

在 `<script setup>` 中添加：

```typescript
import { useCommentStore } from '@/stores/comment'

const commentStore = useCommentStore()

// 段落高亮状态
const highlightedParagraphIndex = ref<number>(-1)

// 处理段落点击
const handleParagraphClick = async (index: number) => {
  highlightedParagraphIndex.value = index

  const paragraphId = `${currentChapter.value?.id || ''}-${index}`
  await commentStore.loadParagraphComments(paragraphId)
}

// 关闭评论抽屉
const handleCloseCommentDrawer = () => {
  highlightedParagraphIndex.value = -1
  commentStore.clearSelection()
}

// 提交评论
const handleSubmitComment = async (data: { content: string; emoji?: string }) => {
  if (!currentChapter.value) return

  await commentStore.addComment({
    paragraphId: commentStore.currentParagraphId!,
    chapterId: currentChapter.value.id,
    paragraphIndex: highlightedParagraphIndex.value,
    content: data.content,
    emoji: data.emoji
  })

  ElMessage.success('评论成功')
}

// 处理点赞
const handleLikeComment = async (commentId: string) => {
  await commentStore.toggleLike(commentId)
}
```

**Step 2: 修改章节内容渲染**

找到章节内容渲染部分，添加段落点击和评论气泡：

```vue
<!-- 章节内容 - 修改前 -->
<div v-if="currentChapter" class="chapter-content" v-html="formattedContent"></div>

<!-- 章节内容 - 修改后 -->
<div v-if="currentChapter" class="chapter-content">
  <div
    v-for="(paragraph, index) in parsedParagraphs"
    :key="index"
    class="paragraph"
    :class="{ 'highlighted': index === highlightedParagraphIndex }"
    @click="handleParagraphClick(index)"
  >
    {{ paragraph }}

    <!-- 评论气泡 -->
    <CommentBadge
      v-if="getCommentCount(index) > 0"
      :comment-count="getCommentCount(index)"
      @click="handleParagraphClick(index)"
    />
  </div>
</div>
```

**Step 3: 添加段落解析逻辑**

```typescript
// 解析段落
const parsedParagraphs = computed(() => {
  if (!chapterContent.value?.content) return []

  // 将HTML内容转换为纯文本段落
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = chapterContent.value.content
  const text = tempDiv.textContent || tempDiv.innerText || ''

  // 按段落分割
  return text.split('\n').filter(p => p.trim())
})

// 获取段落评论数
const getCommentCount = (index: number) => {
  const summary = commentStore.summaries.get(`${currentChapter.value?.id}-${index}`)
  return summary?.commentCount || 0
}
```

**Step 4: 添加评论抽屉**

```vue
<!-- 在 template 中添加 -->
<CommentDrawer
  v-model="commentDrawerVisible"
  :paragraph-index="highlightedParagraphIndex + 1"
  :comments="commentStore.currentComments"
  :loading="commentStore.isLoading"
  @like="handleLikeComment"
  @submit="handleSubmitComment"
  @update:model-value="handleCloseCommentDrawer"
/>
```

```typescript
const commentDrawerVisible = computed(() => {
  return commentStore.currentParagraphId !== null
})
```

**Step 5: 添加样式**

```scss
.chapter-content {
  .paragraph {
    position: relative;
    padding: 12px;
    margin-bottom: 16px;
    line-height: 1.8;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
      background: rgba(0, 0, 0, 0.02);
    }

    &.highlighted {
      background: rgba(255, 235, 59, 0.3);
      box-shadow: 0 0 0 2px rgba(255, 235, 59, 0.5);
    }
  }

  .comment-badge {
    position: absolute;
    bottom: 8px;
    right: 8px;
  }
}
```

**Step 6: 生命周期初始化**

```typescript
onMounted(async () => {
  await loadChapter()
  await readerStore.loadSettings()
  await checkBookshelfStatus()
  await loadRecommendedBooks()
  await commentStore.loadChapterSummaries(currentChapter.value?.id || '') // 新增
  startReadingTimer()
  window.addEventListener('scroll', handleContentScroll)
  window.addEventListener('keydown', handleKeyPress)
})
```

---

#### Task 10: 添加类型定义

**文件**: `src/types/reader.ts`

```typescript
// 在现有类型后添加

export interface ParagraphComment {
  id: string
  paragraphId: string
  chapterId: string
  paragraphIndex: number
  userId: string
  username: string
  avatar: string
  content?: string
  emoji?: string
  likes: number
  likedByMe: boolean
  createdAt: string
  updatedAt: string
}

export interface ParagraphCommentSummary {
  paragraphId: string
  commentCount: number
  latestComment?: {
    content: string
    username: string
    time: string
  }
}
```

---

#### Task 11: 创建目录结构

**Step 1: 创建组件目录**

```bash
mkdir -p src/modules/reader/components/comments
```

**Step 2: 验证目录创建**

```bash
ls src/modules/reader/components/comments/
```

Expected: 空目录

---

#### Task 12: 验证功能

**Step 1: 刷新浏览器**

按 `Ctrl + Shift + R`

**Step 2: 访问阅读器**

URL: `http://localhost:5177/reader/chapter-001`

**Step 3: 测试段落点击**

- 点击任意段落
- 验证段落高亮（黄色背景）
- 验证评论抽屉打开
- 验证显示模拟评论

**Step 4: 测试添加评论**

- 在输入框输入文字
- 点击"发送"
- 验证评论显示在列表中
- 验证评论数增加

**Step 5: 测试表情**

- 点击"表情"按钮
- 选择表情
- 验证表情评论显示

**Step 6: 测试点赞**

- 点击评论的"点赞"按钮
- 验证点赞数+1
- 验证按钮状态变化

---

### 阶段1完成标准

- [x] 所有组件文件创建完成
- [x] 评论Store创建完成
- [x] ReaderView集成完成
- [x] 点击段落能高亮
- [x] 评论抽屉能打开
- [x] 能查看模拟评论
- [x] 能添加新评论
- [x] 能点赞评论
- [x] 评论气泡正确显示
- [x] 关闭抽屉取消高亮

---

## 阶段2：API集成（后续）

**目标**: 连接真实后端API

**任务**:
1. 实现 `commentAPI` 所有方法
2. Store添加真实API调用
3. 错误处理和加载状态
4. 乐观更新

---

## 阶段3：高级功能（可选）

- 评论搜索和筛选
- @提醒作者
- 评论举报
- 评论导出

---

## 实施时间估算

- 阶段1: 2-3小时
- 阶段2: 1-2小时
- 阶段3: 根据需求

---

## 相关文件

**新建文件**:
- `src/modules/reader/components/comments/CommentBadge.vue`
- `src/modules/reader/components/comments/CommentDrawer.vue`
- `src/modules/reader/components/comments/CommentDrawerHeader.vue`
- `src/modules/reader/components/comments/CommentList.vue`
- `src/modules/reader/components/comments/CommentItem.vue`
- `src/modules/reader/components/comments/CommentInput.vue`
- `src/modules/reader/components/comments/EmojiPicker.vue`
- `src/stores/comment.ts`

**修改文件**:
- `src/modules/reader/views/ReaderView.vue`
- `src/types/reader.ts`

---

*计划创建时间: 2025-01-13*
*状态: 待实施*
