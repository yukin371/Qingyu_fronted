<template>
  <div class="book-detail-view">
    <div class="page-shell">
      <Spinner v-if="loading" :size="48" class="loading-spinner" />

      <template v-else-if="book">
        <section class="panel intro-panel" data-testid="book-detail">
          <div class="cover-block">
            <Image :src="book.cover" fit="cover" :alt="book.title" class="book-cover">
              <template #error>
                <div class="image-slot">
                  <Icon name="photo" size="md" />
                </div>
              </template>
            </Image>
          </div>

          <div class="info-block">
            <div class="title-row">
              <h1 class="book-title" data-testid="book-title">{{ book.title }}</h1>
              <span class="author">{{ book.author || '未知作者' }} 著</span>
            </div>

            <div v-if="book.tags && book.tags.length" class="tags-row">
              <Tag v-for="tag in book.tags" :key="tag" size="sm">
                {{ tag }}
              </Tag>
            </div>

            <div class="meta-row">
              <span class="status" :class="`status-${statusType}`">{{ statusText }}</span>
              <span class="updated">最后更新：{{ formattedUpdatedAt }}</span>
            </div>

            <div class="stat-row">
              <span>总点击：<b>{{ formatNumber(book.viewCount) }}</b></span>
              <span>总收藏：<b>{{ formatNumber(book.favoriteCount) }}</b></span>
              <span>总字数：<b>{{ formatNumber(book.wordCount) }}</b></span>
            </div>

            <div class="chapter-info-row">
              <span>章节总数：{{ chapters.length || book.chapterCount || 0 }} 章</span>
              <span>最新章节：{{ latestChapterTitle }}</span>
            </div>

            <div class="rating-row">
              <span class="rating-label">评分概览</span>
              <Rate :model-value="summaryRating" disabled allow-half class="rate-summary" />
              <span class="rating-value">{{ summaryRating.toFixed(1) }}</span>
              <span class="rating-max">/ 5.0</span>
              <span class="rating-count">{{ book.ratingCount || 0 }} 人评分</span>
            </div>

            <div class="action-row">
              <Button
                variant="primary"
                size="lg"
                :data-testid="hasProgress ? 'continue-reading' : 'start-reading'"
                @click="startReading">
                <Icon name="book-open" size="md" class="mr-1" />
                {{ hasProgress ? '继续阅读' : '立即阅读' }}
              </Button>
              <Button size="lg" @click="addToShelf">
                <Icon name="Folder" size="md" class="mr-1" />
                放入书架
              </Button>
              <Button
                size="lg"
                @click="toggleFavorite"
                :loading="checkingFavorite"
                :data-testid="isFavorited ? 'unfavorite-button' : 'favorite-button'">
                <Icon name="star" size="md" class="mr-1" />
                {{ isFavorited ? '已收藏' : '收藏作品' }}
              </Button>
              <Button size="lg" variant="text" @click="jumpToRating">去评分</Button>
              <Button size="lg" variant="text" @click="jumpToComment">写评论</Button>
            </div>

            <div class="intro-text">
              <h3>作品简介</h3>
              <p>{{ book.description || '暂无简介' }}</p>
            </div>
          </div>
        </section>

        <section class="panel chapter-panel">
          <div class="panel-title-row">
            <h2>章节目录</h2>
            <Button variant="text" @click="reverseChapterOrder">
              {{ isReversed ? '正序' : '倒序' }}
            </Button>
          </div>

          <div class="chapter-grid">
            <button
              v-for="chapter in visibleChapters"
              :key="chapter.id"
              class="chapter-item"
              :class="{ 'is-read': chapter.isRead }"
              type="button"
              @click="readChapter(chapter.id)">
              <span class="chapter-title">{{ chapter.title }}</span>
              <span class="chapter-info">
                <Icon v-if="!chapter.isFree" name="Lock" size="xs" />
                {{ chapter.wordCount || 0 }}字
              </span>
            </button>
          </div>

          <div v-if="displayedChapters.length > 18" class="more-row">
            <Button variant="text" @click="expanded = !expanded">
              {{ expanded ? '收起目录' : '展开更多目录' }}
            </Button>
          </div>
        </section>

        <section ref="ratingSectionRef" class="panel rating-panel">
          <div class="panel-title-row">
            <h2>评分与评价</h2>
          </div>
          <RatingSection :book-id="bookId" />
        </section>

        <section ref="commentSectionRef" class="panel comment-panel">
          <div class="panel-title-row">
            <h2>书评区</h2>
            <span>书评总数量：{{ commentTotal || comments.length }} 条</span>
          </div>

          <div class="comment-post">
              <Textarea
                v-model="newComment"
                :rows="4"
                placeholder="快来吐槽这本书吧，注意文明用语哦"
                :maxlength="1000"
                show-word-limit
              />
            <div class="comment-actions">
              <Button variant="primary" @click="submitComment" :loading="submittingComment">
                发表
              </Button>
            </div>
          </div>

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
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookstoreStore } from '@/stores/bookstore'
import { useReaderStore } from '@/stores/reader'
import { useAuthStore } from '@/stores/auth'
import { message, messageBox } from '@/design-system/services'
import { Button, Rate, Empty, Image, Tag, Spinner } from '@/design-system'
import { Icon } from '@/design-system'
import { Textarea } from '@/design-system'
import RatingSection from '@/components/RatingSection.vue'
import CommentItem from '@/components/CommentItem.vue'
import { getBookChapters } from '@/modules/bookstore/api/wrapper'
import { getBookComments, createComment, deleteComment } from '@/modules/reader/api'
import { addToBookshelf } from '@/modules/reader/api'
import { collectionsAPI, type Collection } from '@/modules/reader/api/manual/collections'
import type { ChapterListItem } from '@/types/models'

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
  updatedAt?: string
  updated_at?: string
  updateTime?: string
}

const route = useRoute()
const router = useRouter()
const bookstoreStore = useBookstoreStore()
const readerStore = useReaderStore()
const authStore = useAuthStore()

const bookId = route.params.id as string
const loading = ref(false)
const isReversed = ref(false)
const expanded = ref(false)
const isFavorited = ref(false)
const collectionId = ref<string | null>(null)
const checkingFavorite = ref(false)
const chapters = ref<ChapterListItem[]>([])
const commentSectionRef = ref<HTMLElement | null>(null)
const ratingSectionRef = ref<HTMLElement | null>(null)

const comments = ref<Comment[]>([])
const commentsLoading = ref(false)
const newComment = ref('')
const submittingComment = ref(false)
const commentPage = ref(1)
const commentPageSize = ref(20)
const commentTotal = ref(0)
const loadingMore = ref(false)

const hasMoreComments = computed(() => comments.value.length < commentTotal.value)

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

const formattedUpdatedAt = computed(() => {
  if (!book.value) return '未知'
  const raw = book.value.updatedAt || book.value.updated_at || book.value.updateTime
  if (!raw) return '未知'
  return String(raw).replace('T', ' ').replace('Z', '')
})

const hasProgress = computed(() => false)

const displayedChapters = computed(() => {
  return isReversed.value ? [...chapters.value].reverse() : chapters.value
})

const visibleChapters = computed(() => {
  if (expanded.value) return displayedChapters.value
  return displayedChapters.value.slice(0, 18)
})

const latestChapterTitle = computed(() => {
  const list = chapters.value
  const last = list[list.length - 1]
  return last?.title || '暂无章节'
})

const summaryRating = computed(() => {
  const raw = Number(book.value?.rating ?? 0)
  if (!Number.isFinite(raw) || raw <= 0) return 0
  const normalized = raw > 5 ? raw / 2 : raw
  return Math.max(0, Math.min(5, Math.round(normalized * 10) / 10))
})

const formatNumber = (num?: number): string => {
  const safeNumber = typeof num === 'number' && !Number.isNaN(num) ? num : 0
  if (safeNumber >= 10000) {
    return (safeNumber / 10000).toFixed(1) + '万'
  }
  return safeNumber.toString()
}

const scrollToSection = async (target: HTMLElement | null) => {
  await nextTick()
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const jumpToRating = async () => {
  await scrollToSection(ratingSectionRef.value)
}

const jumpToComment = async () => {
  await scrollToSection(commentSectionRef.value)
}

const startReading = async () => {
  try {
    if (chapters.value.length > 0) {
      readerStore.currentBookId = bookId
      router.push(`/reader/${chapters.value[0].id}`)
    } else {
      message.warning('暂无章节')
    }
  } catch {
    message.error('加载阅读失败')
  }
}

const readChapter = (chapterId: string) => {
  readerStore.currentBookId = bookId
  router.push(`/reader/${chapterId}`)
}

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

const toggleFavorite = async () => {
  if (!authStore.isLoggedIn) {
    message.warning('请先登录')
    router.push({ path: '/auth', query: { redirect: route.fullPath } })
    return
  }

  try {
    if (isFavorited.value) {
      if (collectionId.value) {
        await collectionsAPI.deleteCollection(collectionId.value)
        isFavorited.value = false
        collectionId.value = null
        message.success('取消收藏')
      }
    } else {
      const response = await collectionsAPI.addCollection(bookId)
      if (response.data) {
        isFavorited.value = true
        collectionId.value = response.data.id || response.data._id || (response.data as any).collection_id
        message.success('收藏成功')
      }
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    const errorMsg = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (error as Error).message || '操作失败'
    if (errorMsg.includes('已经收藏') || errorMsg.includes('already')) {
      if (!isFavorited.value) {
        isFavorited.value = true
        message.success('已收藏')
        checkFavoriteStatus().catch(err => console.error('获取收藏状态失败:', err))
      }
    } else {
      message.error(errorMsg)
    }
  }
}

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

const loadComments = async (reset = false) => {
  if (reset) {
    commentPage.value = 1
    comments.value = []
  }

  commentsLoading.value = true
  try {
    const response = await getBookComments({
      bookId,
      page: commentPage.value,
      size: commentPageSize.value,
      sort: 'latest'
    })

    const root = response as {
      data?: Comment[] | { data?: Comment[]; comments?: Comment[]; total?: number }
      total?: number
      pagination?: { total?: number }
    }
    const data = root?.data || response
    const commentList = Array.isArray(data)
      ? data
      : ((data as { data?: Comment[] }).data || (data as { comments?: Comment[] }).comments || [])
    if (reset) {
      comments.value = commentList
    } else {
      comments.value.push(...commentList)
    }
    const totalData = data as { total?: number }
    commentTotal.value = totalData.total ?? root?.total ?? root?.pagination?.total ?? commentList.length
  } catch (error) {
    const errorMessage = (
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      (error as Error)?.message ||
      ''
    ).toLowerCase()
    const isNoComments =
      errorMessage.includes('暂无评论') ||
      errorMessage.includes('评论不存在') ||
      errorMessage.includes('not found') ||
      errorMessage.includes('no comments')

    if (isNoComments) {
      if (reset) {
        comments.value = []
      }
      commentTotal.value = 0
      return
    }
    message.error('加载评论失败')
  } finally {
    commentsLoading.value = false
  }
}

const loadMoreComments = async () => {
  loadingMore.value = true
  commentPage.value++
  await loadComments()
  loadingMore.value = false
}

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
    await createComment({
      bookId,
      content: newComment.value
    })
    message.success('发表成功')
    newComment.value = ''
    await loadComments(true)
  } catch {
    message.error('发表失败')
  } finally {
    submittingComment.value = false
  }
}

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

const onCommentUpdated = async () => {
  await loadComments(true)
}

const reverseChapterOrder = () => {
  isReversed.value = !isReversed.value
}

const loadBookDetail = async () => {
  loading.value = true
  try {
    console.log('[BookDetailView] Loading book detail for ID:', bookId)
    await bookstoreStore.fetchBookDetail(bookId)
    console.log('[BookDetailView] Book loaded, currentBook:', bookstoreStore.currentBook)
    await loadChapters()
  } catch {
    message.error('加载失败')
  } finally {
    loading.value = false
  }
}

const loadChapters = async () => {
  try {
    const response = await (getBookChapters as any)(bookId, { page: 1, size: 1000 })
    const list = Array.isArray(response) ? response : response?.data
    if (Array.isArray(list)) {
      chapters.value = list
    } else {
      chapters.value = []
    }
  } catch {
    message.error('加载章节失败')
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
  background: #f3f4f6;
  padding: 20px 0 28px;
}

.page-shell {
  width: min(1120px, calc(100vw - 32px));
  margin: 0 auto;
}

.panel {
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 24px;
  margin-bottom: 14px;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
}

.intro-panel {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 24px;
}

.cover-block {
  width: 220px;
}

.book-cover {
  width: 220px;
  height: 310px;

  :deep(.image-wrapper) {
    width: 220px;
    height: 310px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;
  }
}

.image-slot {
  display: grid;
  place-items: center;
  height: 100%;
  color: #909399;
  background: #f5f7fa;
}

.title-row {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.book-title {
  margin: 0;
  font-size: 34px;
  line-height: 1.1;
  color: #111827;
}

.author {
  color: #409eff;
  font-size: 22px;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  color: #606266;
  margin-bottom: 12px;
}

.status {
  font-weight: 700;
}

.status-warning {
  color: #e6a23c;
}

.status-success {
  color: #67c23a;
}

.status-info {
  color: #606266;
}

.stat-row {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  color: #606266;
  margin-bottom: 12px;
}

.stat-row b {
  color: #f56c6c;
  font-size: 28px;
  font-style: italic;
  margin-left: 4px;
}

.chapter-info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  color: #606266;
  margin-bottom: 10px;
}

.rating-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0 8px;
}

.rating-label {
  color: #606266;
  min-width: 64px;
}

.rating-value {
  color: #303133;
  font-weight: 600;
}

.rating-count {
  color: #909399;
}

.rating-max {
  color: #909399;
  font-size: 14px;
}

.rate-summary {
  :deep(.text-amber-400),
  :deep(.text-amber-500),
  :deep(.text-yellow-400),
  :deep(.text-yellow-500) {
    color: #f5b301 !important;
  }

  :deep(.text-slate-300),
  :deep(.text-slate-400) {
    color: #d1d5db !important;
  }
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 12px 0 14px;
}

.intro-text h3 {
  margin: 0 0 6px;
  font-size: 18px;
}

.intro-text p {
  margin: 0;
  color: #303133;
  line-height: 1.75;
  white-space: pre-wrap;
}

.panel-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.panel-title-row h2 {
  margin: 0;
  font-size: 28px;
  color: #111827;
}

.chapter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px 18px;
}

.chapter-item {
  text-align: left;
  background: transparent;
  border: 0;
  color: #303133;
  line-height: 1.4;
  padding: 7px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px dashed #eef0f3;
}

.chapter-item:hover {
  color: #e6a23c;
}

.chapter-item.is-read {
  color: #909399;
}

.chapter-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 17px;
  flex: 1;
}

.chapter-info {
  color: #909399;
  font-size: 14px;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.more-row {
  margin-top: 10px;
  text-align: center;
}

.comment-post {
  margin-bottom: 18px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.comments-list {
  min-height: 120px;
  border-top: 1px solid #ebeef5;
  padding-top: 12px;
}

.empty-comments {
  padding: 24px 0;
}

.load-more {
  text-align: center;
  padding: 20px 0;
}

@media (max-width: 900px) {
  .intro-panel {
    grid-template-columns: 1fr;
  }

  .cover-block,
  .book-cover,
  .book-cover :deep(.image-wrapper) {
    width: 180px;
    height: 250px;
  }

  .book-title {
    font-size: 26px;
  }

  .author {
    font-size: 20px;
  }

  .panel-title-row h2 {
    font-size: 22px;
  }

  .chapter-grid {
    grid-template-columns: 1fr;
  }

  .chapter-title {
    font-size: 16px;
  }
}
</style>
