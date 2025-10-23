<template>
  <div class="book-detail-view">
    <el-container v-loading="loading">
      <!-- 返回按钮 -->
      <div class="back-button">
        <el-button @click="$router.back()" :icon="ArrowLeft">返回</el-button>
      </div>

      <!-- 书籍信息区 -->
      <div v-if="book" class="book-header">
        <div class="container">
          <el-row :gutter="40">
            <!-- 封面 -->
            <el-col :xs="24" :sm="8" :md="6">
              <div class="book-cover">
                <el-image :src="book.cover" fit="cover" :alt="book.title">
                  <template #error>
                    <div class="image-slot">
                      <el-icon>
                        <Picture />
                      </el-icon>
                    </div>
                  </template>
                </el-image>
              </div>
            </el-col>

            <!-- 书籍信息 -->
            <el-col :xs="24" :sm="16" :md="18">
              <div class="book-info">
                <h1 class="book-title">{{ book.title }}</h1>

                <div class="book-meta">
                  <span class="author">
                    <el-icon>
                      <User />
                    </el-icon>
                    {{ book.author }}
                  </span>
                  <span class="category">
                    <el-icon>
                      <Collection />
                    </el-icon>
                    {{ book.categoryName }}
                  </span>
                  <el-tag :type="statusType">{{ statusText }}</el-tag>
                </div>

                <div class="book-stats">
                  <div class="stat-item">
                    <el-rate v-model="book.rating" disabled show-score text-color="#ff9900" />
                    <span class="rating-count">({{ book.ratingCount }}人评分)</span>
                  </div>
                  <div class="stat-item">
                    <el-icon>
                      <View />
                    </el-icon>
                    {{ formatNumber(book.viewCount) }} 阅读
                  </div>
                  <div class="stat-item">
                    <el-icon>
                      <Star />
                    </el-icon>
                    {{ formatNumber(book.favoriteCount) }} 收藏
                  </div>
                  <div class="stat-item">
                    <el-icon>
                      <Document />
                    </el-icon>
                    {{ book.wordCount }}字 · {{ book.chapterCount }}章
                  </div>
                </div>

                <!-- 标签 -->
                <div v-if="book.tags && book.tags.length" class="book-tags">
                  <el-tag v-for="tag in book.tags" :key="tag" size="small">
                    {{ tag }}
                  </el-tag>
                </div>

                <!-- 操作按钮 -->
                <div class="book-actions">
                  <el-button type="primary" size="large" @click="startReading">
                    <el-icon>
                      <Reading />
                    </el-icon>
                    {{ hasProgress ? '继续阅读' : '开始阅读' }}
                  </el-button>
                  <el-button size="large" @click="addToShelf">
                    <el-icon>
                      <FolderAdd />
                    </el-icon>
                    加入书架
                  </el-button>
                  <el-button size="large" @click="toggleFavorite">
                    <el-icon>
                      <Star />
                    </el-icon>
                    {{ isFavorited ? '已收藏' : '收藏' }}
                  </el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 内容区 -->
      <div v-if="book" class="book-content">
        <div class="container">
          <el-tabs v-model="activeTab">
            <!-- 简介 -->
            <el-tab-pane label="简介" name="intro">
              <div class="book-description">
                <p>{{ book.description || '暂无简介' }}</p>
              </div>
            </el-tab-pane>

            <!-- 章节列表 -->
            <el-tab-pane label="目录" name="chapters">
              <div class="chapter-list">
                <div class="chapter-header">
                  <span>共 {{ book.chapterCount }} 章</span>
                  <el-button text @click="reverseChapterOrder">
                    {{ isReversed ? '正序' : '倒序' }}
                  </el-button>
                </div>

                <el-scrollbar max-height="600px">
                  <div v-for="chapter in displayedChapters" :key="chapter.id" class="chapter-item"
                    :class="{ 'is-read': chapter.isRead }" @click="readChapter(chapter.id)">
                    <span class="chapter-title">{{ chapter.title }}</span>
                    <span class="chapter-info">
                      <el-icon v-if="!chapter.isFree">
                        <Lock />
                      </el-icon>
                      {{ chapter.wordCount }}字
                    </span>
                  </div>
                </el-scrollbar>
              </div>
            </el-tab-pane>

            <!-- 评分 -->
            <el-tab-pane label="评分与评价" name="rating">
              <RatingSection :book-id="bookId" />
            </el-tab-pane>

            <!-- 评论 -->
            <el-tab-pane label="书评" name="comments">
              <div class="comments-container">
                <!-- 发表评论 -->
                <div class="comment-post">
                  <el-input
                    v-model="newComment"
                    type="textarea"
                    :rows="4"
                    placeholder="写下你的看法..."
                    maxlength="1000"
                    show-word-limit
                  />
                  <div class="comment-actions">
                    <el-button type="primary" @click="submitComment" :loading="submittingComment">
                      发表
                    </el-button>
                  </div>
                </div>

                <!-- 评论列表 -->
                <div v-loading="commentsLoading" class="comments-list">
                  <div v-if="comments.length === 0 && !commentsLoading" class="empty-comments">
                    <el-empty description="暂无评论，来发表第一条评论吧" />
                  </div>
                  <CommentItem
                    v-for="comment in comments"
                    :key="comment.id"
                    :comment="comment"
                    @delete="handleDeleteComment"
                    @update="loadComments"
                  />
                  <div v-if="hasMoreComments" class="load-more">
                    <el-button @click="loadMoreComments" :loading="loadingMore">
                      加载更多
                    </el-button>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 推荐书籍 -->
      <div v-if="recommendedBooks.length" class="recommended-section">
        <div class="container">
          <h2 class="section-title">相似推荐</h2>
          <el-row :gutter="20">
            <el-col v-for="item in recommendedBooks" :key="item.id" :xs="12" :sm="8" :md="6" :lg="4">
              <div class="book-card" @click="goToBook(item.id)">
                <el-image :src="item.cover" fit="cover">
                  <template #error>
                    <div class="image-slot">
                      <el-icon>
                        <Picture />
                      </el-icon>
                    </div>
                  </template>
                </el-image>
                <h4>{{ item.title }}</h4>
                <p>{{ item.author }}</p>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookstoreStore } from '@/stores/bookstore'
import { useReaderStore } from '@/stores/reader'
import { useAuthStore } from '@/stores/auth'
import { recommendationAPI } from '@/api/recommendation'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, User, Collection, View, Star, Document,
  Reading, FolderAdd, Picture, Lock
} from '@element-plus/icons-vue'
import RatingSection from '@/components/reading/RatingSection.vue'
import CommentItem from '@/components/reading/CommentItem.vue'
import { getBookComments, createComment, deleteComment } from '@/api/reading/comments'
import { addToBookshelf, checkBookInShelf } from '@/api/reading/bookshelf'
import type { ChapterListItem, BookBrief } from '@/types/models'

const route = useRoute()
const router = useRouter()
const bookstoreStore = useBookstoreStore()
const readerStore = useReaderStore()
const authStore = useAuthStore()

const bookId = route.params.id as string
const loading = ref(false)
const activeTab = ref('intro')
const isReversed = ref(false)
const isFavorited = ref(false)
const chapters = ref<ChapterListItem[]>([])
const recommendedBooks = ref<BookBrief[]>([])

// 评论相关
const comments = ref<any[]>([])
const commentsLoading = ref(false)
const newComment = ref('')
const submittingComment = ref(false)
const commentPage = ref(1)
const commentPageSize = ref(20)
const commentTotal = ref(0)
const loadingMore = ref(false)

const hasMoreComments = computed(() => {
  return comments.value.length < commentTotal.value
})

const book = computed(() => bookstoreStore.currentBook)

const statusType = computed(() => {
  if (!book.value) return 'info'
  return book.value.status === 'completed' ? 'success' : 'warning'
})

const statusText = computed(() => {
  if (!book.value) return ''
  const statusMap = {
    'serializing': '连载中',
    'completed': '已完结',
    'paused': '暂停'
  }
  return statusMap[book.value.status] || book.value.status
})

const hasProgress = computed(() => {
  return !!readerStore.getCurrentProgress(bookId)
})

const displayedChapters = computed(() => {
  return isReversed.value ? [...chapters.value].reverse() : chapters.value
})

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 开始阅读
const startReading = async () => {
  try {
    const progress = readerStore.getCurrentProgress(bookId)
    if (progress) {
      // 继续上次阅读
      router.push(`/reader/${progress.chapterId}`)
    } else {
      // 从第一章开始
      if (chapters.value.length > 0) {
        router.push(`/reader/${chapters.value[0].id}`)
      } else {
        ElMessage.warning('暂无章节')
      }
    }
  } catch (error) {
    ElMessage.error('加载阅读失败')
  }
}

// 阅读章节
const readChapter = (chapterId: string) => {
  router.push(`/reader/${chapterId}`)
}

// 加入书架
const addToShelf = async () => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({ path: '/auth', query: { redirect: route.fullPath } })
    return
  }

  try {
    await addToBookshelf(bookId)
    ElMessage.success('已加入书架')
  } catch (error: any) {
    ElMessage.error(error.message || '添加失败')
  }
}

// 切换收藏
const toggleFavorite = () => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({ path: '/auth', query: { redirect: route.fullPath } })
    return
  }

  isFavorited.value = !isFavorited.value
  ElMessage.success(isFavorited.value ? '收藏成功' : '取消收藏')
}

// 加载评论
const loadComments = async (reset = false) => {
  if (reset) {
    commentPage.value = 1
    comments.value = []
  }

  commentsLoading.value = true
  try {
    const response = await getBookComments(bookId, {
      page: commentPage.value,
      size: commentPageSize.value
    })

    const data = response.data || response
    if (data) {
      const commentList = Array.isArray(data) ? data : (data.data || [])
      if (reset) {
        comments.value = commentList
      } else {
        comments.value.push(...commentList)
      }
      commentTotal.value = data.total || (response as any).total || 0
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载评论失败')
  } finally {
    commentsLoading.value = false
  }
}

// 加载更多评论
const loadMoreComments = async () => {
  loadingMore.value = true
  commentPage.value++
  await loadComments()
  loadingMore.value = false
}

// 提交评论
const submitComment = async () => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({ path: '/auth', query: { redirect: route.fullPath } })
    return
  }

  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  submittingComment.value = true
  try {
    await createComment(bookId, newComment.value)
    ElMessage.success('发表成功')
    newComment.value = ''
    // 重新加载评论列表
    await loadComments(true)
  } catch (error: any) {
    ElMessage.error(error.message || '发表失败')
  } finally {
    submittingComment.value = false
  }
}

// 删除评论
const handleDeleteComment = async (commentId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteComment(commentId)
    ElMessage.success('删除成功')
    await loadComments(true)
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 反转章节顺序
const reverseChapterOrder = () => {
  isReversed.value = !isReversed.value
}

// 跳转到其他书籍
const goToBook = (id: string) => {
  router.push(`/books/${id}`)
}

// 加载书籍详情
const loadBookDetail = async () => {
  loading.value = true
  try {
    await bookstoreStore.fetchBookDetail(bookId)
    await bookstoreStore.incrementBookView(bookId)

    // 加载章节列表
    await loadChapters()

    // 加载推荐书籍
    await loadRecommendations()

    // 加载阅读进度
    await readerStore.loadProgress(bookId)
  } catch (error) {
    console.error('加载书籍详情失败:', error)
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 加载章节列表
const loadChapters = async () => {
  try {
    const response = await readerStore.loadChapterList(bookId, 1, 1000)
    chapters.value = readerStore.chapterList
  } catch (error) {
    console.error('加载章节列表失败:', error)
  }
}

// 加载推荐书籍
const loadRecommendations = async () => {
  try {
    const response = await recommendationAPI.getSimilarItems(bookId, 6)
    if (response.code === 200 && response.data) {
      recommendedBooks.value = response.data as unknown as BookBrief[]
    }
  } catch (error) {
    console.error('加载推荐书籍失败:', error)
  }
}

onMounted(() => {
  loadBookDetail()
  loadComments(true)
})
</script>

<style scoped lang="scss">
.book-detail-view {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.back-button {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.book-header {
  background: white;
  padding: 40px 0;
  margin-bottom: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.book-cover {
  .el-image {
    width: 100%;
    aspect-ratio: 3/4;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
}

.book-info {
  .book-title {
    font-size: 32px;
    font-weight: bold;
    margin: 0 0 16px 0;
    color: #303133;
  }

  .book-meta {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 16px;
    color: #606266;
    flex-wrap: wrap;

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .book-stats {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;
    flex-wrap: wrap;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #909399;

      .rating-count {
        margin-left: 8px;
      }
    }
  }

  .book-tags {
    margin-bottom: 24px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .book-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
}

.book-content {
  background: white;
  padding: 24px 0;
  margin-bottom: 20px;
}

.book-description {
  padding: 20px;
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
}

.chapter-list {
  .chapter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid #ebeef5;
  }

  .chapter-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f5f5f5;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background-color: #f5f7fa;
    }

    &.is-read {
      color: #909399;
    }

    .chapter-title {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .chapter-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #909399;
      font-size: 14px;
    }
  }
}

.comments-container {
  padding: 20px;
}

.comment-post {
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;

  .comment-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }
}

.comments-list {
  min-height: 200px;
}

.empty-comments {
  padding: 40px 0;
}

.load-more {
  text-align: center;
  padding: 20px 0;
}

.recommended-section {
  background: white;
  padding: 40px 0;

  .section-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 24px;
  }

  .book-card {
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-4px);
    }

    .el-image {
      width: 100%;
      aspect-ratio: 3/4;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    h4 {
      margin: 8px 0 4px 0;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    p {
      margin: 0;
      font-size: 12px;
      color: #909399;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 30px;
}

@media (max-width: 768px) {
  .book-info .book-title {
    font-size: 24px;
  }

  .book-actions {
    width: 100%;

    .el-button {
      flex: 1;
    }
  }
}
</style>
