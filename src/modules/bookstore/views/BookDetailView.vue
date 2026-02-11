<template>
  <div class="book-detail-view">
    <div class="detail-container">
      <!-- 加载状态 -->
      <Spinner v-if="loading" :size="48" class="loading-spinner" />

      <template v-else>
        <!-- 返回按钮 -->
        <div class="back-button">
          <Button @click="$router.back()">
            <Icon name="arrow-left" size="sm" class="mr-1" />
            返回
          </Button>
        </div>

        <!-- 书籍信息区 -->
        <div v-if="book" class="book-header" data-testid="book-detail">
          <div class="container">
            <Row :gutter="40">
              <!-- 封面 -->
              <Col :span="6" :xs="24" :sm="8">
                <div class="book-cover">
                  <Image :src="book.cover" fit="cover" :alt="book.title">
                    <template #error>
                      <div class="image-slot">
                        <Icon name="photo" size="md" />
                      </div>
                    </template>
                  </Image>
                </div>
              </Col>

              <!-- 书籍信息 -->
              <Col :span="18" :xs="24" :sm="16">
                <div class="book-info">
                  <h1 class="book-title" data-testid="book-title">{{ book.title }}</h1>

                  <div class="book-meta">
                    <span class="author">
                      <Icon name="user" size="sm" />
                      <span v-if="book.author" class="author-name">
                        {{ book.author }}
                      </span>
                      <span v-else class="author-name">
                        未知作者
                      </span>
                    </span>
                    <span class="category">
                      <Icon name="folder" size="sm" />
                      {{ book.categoryName || book.category || '未分类' }}
                    </span>
                    <Tag :variant="statusType">{{ statusText }}</Tag>
                  </div>

                  <div class="book-stats">
                    <div class="stat-item">
                      <Rate :model-value="book.rating ?? 0" disabled size="sm" />
                      <span class="rating-count">({{ book.ratingCount || 0 }}人评分)</span>
                    </div>
                    <div class="stat-item">
                      <Icon name="eye" size="md" />
                      {{ formatNumber(book.viewCount) }} 阅读
                    </div>
                    <div class="stat-item">
                      <Icon name="star" size="md" />
                      {{ formatNumber(book.favoriteCount) }} 收藏
                    </div>
                    <div class="stat-item">
                      <Icon name="document" size="md" />
                      {{ formatNumber(book.wordCount) }}字 · {{ book.chapterCount || 0 }}章
                    </div>
                  </div>

                  <!-- 标签 -->
                  <div v-if="book.tags && book.tags.length" class="book-tags">
                    <Tag v-for="tag in book.tags" :key="tag" size="sm">
                      {{ tag }}
                    </Tag>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="book-actions">
                    <Button
                      variant="primary"
                      size="lg"
                      :data-testid="hasProgress ? 'continue-reading' : 'start-reading'"
                      @click="startReading">
                      <Icon name="book-open" size="md" class="mr-1" />
                      {{ hasProgress ? '继续阅读' : '开始阅读' }}
                    </Button>
                    <Button size="lg" @click="addToShelf">
                      <Icon name="folder-plus" size="md" class="mr-1" />
                      加入书架
                    </Button>
                    <Button
                      size="lg"
                      @click="toggleFavorite"
                      :loading="checkingFavorite"
                      :data-testid="isFavorited ? 'unfavorite-button' : 'favorite-button'">
                      <Icon name="star" size="md" class="mr-1" />
                      {{ isFavorited ? '已收藏' : '收藏' }}
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </template>

      <!-- 内容区 -->
      <div v-if="book" class="book-content">
        <div class="container">
          <Tabs v-model:active-tab="activeTab">
            <!-- 简介 -->
            <TabPane label="简介" name="intro">
              <div class="book-description">
                <p>{{ book.description || '暂无简介' }}</p>
              </div>
            </TabPane>

            <!-- 章节列表 -->
            <TabPane label="目录" name="chapters">
              <div class="chapter-list">
                <div class="chapter-header">
                  <span>共 {{ book.chapterCount }} 章</span>
                  <Button variant="text" @click="reverseChapterOrder">
                    {{ isReversed ? '正序' : '倒序' }}
                  </Button>
                </div>

                <div class="chapter-scroll" style="max-height: 600px; overflow-y: auto;">
                  <div v-for="chapter in displayedChapters" :key="chapter.id" class="chapter-item"
                    :class="{ 'is-read': chapter.isRead }" @click="readChapter(chapter.id)">
                    <span class="chapter-title">{{ chapter.title }}</span>
                    <span class="chapter-info">
                      <Icon v-if="!chapter.isFree" name="lock-closed" size="xs" />
                      {{ chapter.wordCount }}字
                    </span>
                  </div>
                </div>
              </div>
            </TabPane>

            <!-- 评分 -->
            <TabPane label="评分与评价" name="rating">
              <RatingSection :book-id="bookId" />
            </TabPane>

            <!-- 评论 -->
            <TabPane label="书评" name="comments">
              <div class="comments-container">
                <!-- 发表评论 -->
                <div class="comment-post">
                  <Textarea
                    v-model="newComment"
                    :rows="4"
                    placeholder="写下你的看法..."
                    maxlength="1000"
                    show-word-limit
                  />
                  <div class="comment-actions">
                    <Button variant="primary" @click="submitComment" :loading="submittingComment">
                      发表
                    </Button>
                  </div>
                </div>

                <!-- 评论列表 -->
                <div class="comments-list">
                  <Spinner v-if="commentsLoading" :size="32" class="loading-spinner" />
                  <template v-else>
                    <div v-if="comments.length === 0" class="empty-comments">
                      <Empty title="暂无评论，来发表第一条评论吧" />
                    </div>
                    <CommentItem
                      v-for="comment in comments"
                      :key="comment.id"
                      :comment="comment"
                      @delete="handleDeleteComment"
                      @update="onCommentUpdated"
                    />
                    <div v-if="hasMoreComments" class="load-more">
                      <Button @click="loadMoreComments" :loading="loadingMore">
                        加载更多
                      </Button>
                    </div>
                  </template>
                </div>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>

      <!-- 推荐书籍 -->
      <div v-if="recommendedBooks.length" class="recommended-section">
        <div class="container">
          <h2 class="section-title">相似推荐</h2>
          <Row :gutter="20">
            <Col v-for="item in recommendedBooks" :key="item.id" :xs="12" :sm="8" :md="6" :lg="4">
              <div class="book-card" @click="goToBook(item.id)">
                <Image :src="item.cover" fit="cover">
                  <template #error>
                    <div class="image-slot">
                      <Icon name="photo" size="md" />
                    </div>
                  </template>
                </Image>
                <h4>{{ item.title }}</h4>
                <p>{{ item.author }}</p>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookstoreStore } from '@/stores/bookstore'
import { useReaderStore } from '@/stores/reader'
import { useAuthStore } from '@/stores/auth'
import { message, messageBox } from '@/design-system/services'
import { Button, Tabs, Rate, Empty, Image, Tag, Spinner, Row, Col } from '@/design-system'
import { Icon } from '@/design-system'
import { Textarea } from '@/design-system'
import RatingSection from '@/components/RatingSection.vue'
import CommentItem from '@/components/CommentItem.vue'
import { getBookComments, createComment, deleteComment } from '@/modules/reader/api'
import { addToBookshelf } from '@/modules/reader/api'
import { collectionsAPI, type Collection } from '@/modules/reader/api/manual/collections'
import type { ChapterListItem, BookBrief } from '@/types/models'

// Proper TypeScript interfaces
interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  rating?: number
  createdAt: string
  updatedAt?: string
}

interface Book {
  id: string
  title: string
  author: string
  cover: string
  description: string
  categoryName?: string
  category?: string
  status: string
  rating: number
  ratingCount?: number
  viewCount: number
  favoriteCount: number
  wordCount: number
  chapterCount: number
  tags?: string[]
}

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
const collectionId = ref<string | null>(null) // 收藏记录ID，用于删除收藏
const checkingFavorite = ref(false) // 检查收藏状态loading
const chapters = ref<ChapterListItem[]>([])
const recommendedBooks = ref<BookBrief[]>([])

// 评论相关
const comments = ref<Comment[]>([])
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

const book = computed(() => bookstoreStore.currentBook as Book | null)

const statusType = computed(() => {
  if (!book.value) return 'info'
  return book.value.status === 'completed' ? 'success' : 'warning'
})

const statusText = computed(() => {
  if (!book.value) return ''
  const statusMap: Record<string, string> = {
    serializing: '连载中',
    completed: '已完结',
    paused: '暂停'
  }
  const key = String(book.value.status)
  return statusMap[key] || key
})

const hasProgress = computed(() => {
  return false
})

const displayedChapters = computed(() => {
  return isReversed.value ? [...chapters.value].reverse() : chapters.value
})

// 格式化数字
const formatNumber = (num?: number): string => {
  const safeNumber = typeof num === 'number' && !Number.isNaN(num) ? num : 0
  if (safeNumber >= 10000) {
    return (safeNumber / 10000).toFixed(1) + '万'
  }
  return safeNumber.toString()
}

// 开始阅读
const startReading = async () => {
  try {
    // 从第一章开始
    if (chapters.value.length > 0) {
      // 设置当前bookId到readerStore，以便reader页面可以加载章节
      readerStore.currentBookId = bookId
      router.push(`/reader/${chapters.value[0].id}`)
    } else {
      message.warning('暂无章节')
    }
  } catch {
    message.error('加载阅读失败')
  }
}

// 阅读章节
const readChapter = (chapterId: string) => {
  // 设置当前bookId到readerStore
  readerStore.currentBookId = bookId
  router.push(`/reader/${chapterId}`)
}

// 加入书架
const addToShelf = async () => {
  if (!authStore.isLoggedIn) {
    message.warning('请先登录')
    router.push({ path: '/auth', query: { redirect: route.fullPath } })
    return
  }

  try {
    await addToBookshelf(bookId)
    message.success('已加入书架')
  } catch {
    message.error('添加失败')
  }
}

// 切换收藏
const toggleFavorite = async () => {
  if (!authStore.isLoggedIn) {
    message.warning('请先登录')
    router.push({ path: '/auth', query: { redirect: route.fullPath } })
    return
  }

  try {
    if (isFavorited.value) {
      // 取消收藏
      if (collectionId.value) {
        await collectionsAPI.deleteCollection(collectionId.value)
        // 立即更新状态
        isFavorited.value = false
        collectionId.value = null
        message.success('取消收藏')
      }
    } else {
      // 添加收藏
      const response = await collectionsAPI.addCollection(bookId)
      if (response.data) {
        // 立即更新状态 - 使用返回的数据
        isFavorited.value = true
        // response.data 应该包含收藏记录的完整信息，包括 id
        collectionId.value = response.data.id || response.data._id || (response.data as any).collection_id
        message.success('收藏成功')
      }
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    const errorMsg = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as Error).message || '操作失败'
    // 如果是"已经收藏"的错误，视为成功
    if (errorMsg.includes('已经收藏') || errorMsg.includes('already')) {
      if (!isFavorited.value) {
        // 立即更新状态，避免等待API调用
        isFavorited.value = true
        message.success('已收藏')
        // 异步获取收藏ID
        checkFavoriteStatus().catch(err => console.error('获取收藏状态失败:', err))
      }
    } else {
      message.error(errorMsg)
    }
  }
}

// 检查收藏状态
const checkFavoriteStatus = async () => {
  if (!authStore.isLoggedIn) {
    isFavorited.value = false
    collectionId.value = null
    return
  }

  try {
    checkingFavorite.value = true
    const response = await collectionsAPI.checkCollected(bookId)
    if (response.data?.is_collected) {
      isFavorited.value = true
      // 如果还没有 collectionId，获取收藏列表以找到收藏ID
      if (!collectionId.value) {
        const collections = await collectionsAPI.getCollections({ page: 1, pageSize: 100 })
        if (collections.data?.list) {
          const currentBookCollection = collections.data.list.find(
            (c: Collection) => c.id === bookId || (c as { book_id?: string }).book_id === bookId
          )
          if (currentBookCollection) {
            collectionId.value = currentBookCollection.id || (currentBookCollection as { _id?: string })._id
          }
        }
      }
    } else {
      isFavorited.value = false
      collectionId.value = null
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error)
    isFavorited.value = false
    collectionId.value = null
  } finally {
    checkingFavorite.value = false
  }
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

    const data = (response as { data?: Comment[] | { data?: Comment[]; comments?: Comment[]; total?: number }; total?: number })?.data || response
    if (data) {
      const commentList = Array.isArray(data) ? data : ((data as { data?: Comment[] }).data || (data as { comments?: Comment[] }).comments || [])
      if (reset) {
        comments.value = commentList
      } else {
        comments.value.push(...commentList)
      }
      const totalData = data as { total?: number }
      commentTotal.value = totalData.total || 0
    }
  } catch {
    message.error('加载评论失败')
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
    message.warning('请先登录')
    router.push({ path: '/auth', query: { redirect: route.fullPath } })
    return
  }

  if (!newComment.value.trim()) {
    message.warning('请输入评论内容')
    return
  }

  submittingComment.value = true
  try {
    await createComment(bookId, newComment.value)
    message.success('发表成功')
    newComment.value = ''
    // 重新加载评论列表
    await loadComments(true)
  } catch {
    message.error('发表失败')
  } finally {
    submittingComment.value = false
  }
}

// 删除评论
const handleDeleteComment = async (commentId: string) => {
  try {
    await messageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteComment(commentId)
    message.success('删除成功')
    await loadComments(true)
  } catch (error) {
    if (error !== 'cancel') {
      message.error('删除失败')
    }
  }
}

// 反转章节顺序
const reverseChapterOrder = () => {
  isReversed.value = !isReversed.value
}

// 跳转到其他书籍
const goToBook = (id: string) => {
  router.push({ name: 'book-detail', params: { id } })
}

// 加载书籍详情
const loadBookDetail = async () => {
  loading.value = true
  try {
    console.log('[BookDetailView] Loading book detail for ID:', bookId)
    await bookstoreStore.fetchBookDetail(bookId)

    console.log('[BookDetailView] Book loaded, currentBook:', bookstoreStore.currentBook)

    // 加载章节列表
    await loadChapters()

    // 加载推荐书籍
    await loadRecommendations()

    // 加载阅读进度
    // 调整：当前 readerStore 未提供对应方法
  } catch {
    message.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 加载章节列表
const loadChapters = async () => {
  try {
    // 使用公开的bookstore API（不需要认证）
    const response = await fetch(`http://localhost:8080/api/v1/bookstore/books/${bookId}/chapters?page=1&size=1000`)
    const data = await response.json()
    if (data.code === 0 && Array.isArray(data.data)) {
      chapters.value = data.data
    } else {
      chapters.value = []
    }
  } catch {
    message.error('加载章节失败')
  }
}

// 加载推荐书籍
const loadRecommendations = async () => {
  try {
    const { getSimilarBooks } = await import('@/modules/bookstore/api')
    const response = await getSimilarBooks(bookId, 6)
    recommendedBooks.value = Array.isArray(response) ? response : []
  } catch {
    recommendedBooks.value = []
  }
}

onMounted(() => {
  loadBookDetail()
  loadComments(true)
  checkFavoriteStatus()
})
</script>

<style scoped lang="scss">
.book-detail-view {
  min-height: 100vh;
  background-color: #f5f5f5;

  :deep(.container) {
    flex-direction: column !important;
  }
}

.detail-container {
  position: relative;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
}

.back-button {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.book-header {
  background: white;
  padding: 40px 0;
  margin-bottom: 20px;
  width: 100%;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  width: 100%;
}

.book-cover {
  .image-wrapper {
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

    .author-link {
      color: #409eff;
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: #66b1ff;
        text-decoration: underline;
      }
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
  width: 100%;
}

.book-description {
  padding: 20px;
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
}

.chapter-scroll {
  scrollbar-width: thin;
  scrollbar-color: #dcdfe6 #f5f5f5;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 4px;

    &:hover {
      background: #c0c4cc;
    }
  }
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
  width: 100%;

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

    .image-wrapper {
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

    .button {
      flex: 1;
    }
  }
}
</style>
