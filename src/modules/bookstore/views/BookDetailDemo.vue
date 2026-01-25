<template>
  <div class="book-detail-view">
    <el-container>
      <div class="back-button">
        <el-button @click="$router.back()" :icon="ArrowLeft">返回</el-button>
      </div>

      <div class="container">
        <div class="page-card">
          <div class="book-header">
            <div class="container">
              <el-row :gutter="40">
                <el-col :xs="24" :sm="8" :md="6">
                  <div class="book-cover">
                    <el-image :src="book.cover" fit="cover" :alt="book.title">
                      <template #error>
                        <div class="image-slot">
                          <QyIcon name="Picture"  />
                        </div>
                      </template>
                    </el-image>
                  </div>
                </el-col>

                <el-col :xs="24" :sm="16" :md="18">
                  <div class="book-info">
                    <h1 class="book-title">{{ book.title }}</h1>

                    <div class="book-meta">
                      <span class="author"><QyIcon name="User"  />{{ book.author }}</span>
                      <span class="category"><QyIcon name="Collection"  />{{ book.categoryName }}</span>
                      <el-tag :type="statusType">{{ statusText }}</el-tag>
                    </div>

                    <div class="book-tags" v-if="tags.length">
                      <el-tag v-for="t in tags" :key="t" size="small">{{ t }}</el-tag>
                    </div>

                    <div class="book-stats">
                      <div class="stat-item">
                        <el-rate v-model="book.rating" disabled show-score text-color="#ff9900" />
                        <span class="rating-count">({{ book.ratingCount }}人评分)</span>
                      </div>
                      <div class="stat-item">
                        <QyIcon name="View"  />{{ formatNumber(book.viewCount) }} 阅读
                      </div>
                      <div class="stat-item">
                        <QyIcon name="Star"  />{{ formatNumber(book.favoriteCount) }} 收藏
                      </div>
                      <div class="stat-item">
                        <QyIcon name="Document"  />{{ book.wordCount }}字 · {{ book.chapterCount }}章
                      </div>
                    </div>

                    <div class="book-actions">
                      <el-button type="primary" size="large" @click="startReading">
                        <QyIcon name="Reading"  />{{ hasProgress ? '继续阅读' : '开始阅读' }}
                      </el-button>
                      <el-button size="large" @click="addToShelf" :type="inShelf ? 'success' : 'default'">
                        <QyIcon name="FolderAdd"  />{{ inShelf ? '已在书架' : '加入书架' }}
                      </el-button>
                      <el-button size="large" @click="toggleFavorite" :type="isFavorited ? 'warning' : 'default'">
                        <QyIcon name="Star"  />{{ isFavorited ? '已收藏' : '收藏' }}
                      </el-button>
                      <el-button size="large" @click="copyLink">
                        复制链接
                      </el-button>
                      <el-button size="large" @click="share">
                        分享
                      </el-button>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>

          <div class="book-content">
            <div class="container">
              <el-tabs v-model="activeTab">
                <el-tab-pane label="简介" name="intro">
                  <div class="book-description">
                    <p>{{ book.description }}</p>
                  </div>
                </el-tab-pane>

                <el-tab-pane label="目录" name="chapters">
                  <div class="chapter-list">
                    <div class="chapter-header">
                      <span>共 {{ book.chapterCount }} 章</span>
                      <el-button text @click="reverseChapterOrder">{{ isReversed ? '正序' : '倒序' }}</el-button>
                    </div>
                    <el-scrollbar max-height="600px">
                      <div v-for="chapter in displayedChapters" :key="chapter.id" class="chapter-item" :class="{ 'is-read': chapter.isRead }" @click="readChapter(chapter.id)">
                        <span class="chapter-title">{{ chapter.title }}</span>
                        <span class="chapter-info">{{ chapter.wordCount }}字</span>
                      </div>
                    </el-scrollbar>
                  </div>
                </el-tab-pane>

                <el-tab-pane label="评分与评价（演示）" name="rating">
                  <div class="rating-section">
                    <div class="rating-card">
                      <div class="left">
                        <div class="avg">{{ book.rating.toFixed(1) }}</div>
                        <div class="count">共 {{ formatNumber(book.ratingCount) }} 人评分</div>
                      </div>
                      <div class="right">
                        <el-rate v-model="userRating" show-score allow-half />
                        <el-input v-model="ratingText" placeholder="写下你的评分感受（演示）" />
                        <el-button type="primary" @click="submitRating">提交评分（演示）</el-button>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>

                <el-tab-pane label="书评（演示）" name="comments">
                  <div class="comments-container">
                    <div class="comment-post">
                      <el-input v-model="commentInput" type="textarea" :rows="4" placeholder="写下你的看法（演示）..." maxlength="300" show-word-limit />
                      <div class="comment-actions">
                        <el-button type="primary" @click="submitComment">发表（演示）</el-button>
                      </div>
                    </div>
                    <div class="comments-list">
                      <div v-if="mockComments.length === 0" class="empty-comments">
                        <el-empty description="暂无评论（演示）" />
                      </div>
                      <div v-for="c in mockComments" :key="c.id" class="comment-item">
                        <div class="comment-header">
                          <strong>{{ c.user }}</strong>
                          <span class="time">{{ c.time }}</span>
                        </div>
                        <div class="comment-content">{{ c.content }}</div>
                      </div>
                      <div v-if="hasMoreComments" class="load-more">
                        <el-button @click="loadMoreComments" :loading="loadingMore">加载更多（演示）</el-button>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>

          <div v-if="recommendedBooks.length" class="recommended-section">
            <div class="container">
              <h2 class="section-title">相似推荐（演示）</h2>
              <el-row :gutter="20">
                <el-col v-for="item in recommendedBooks" :key="item.id" :xs="12" :sm="8" :md="6" :lg="4">
                  <div class="book-card" @click="goToBook(item.id)">
                    <el-image :src="item.cover" fit="cover">
                      <template #error>
                        <div class="image-slot"><QyIcon name="Picture"  /></div>
                      </template>
                    </el-image>
                    <h4>{{ item.title }}</h4>
                    <p>{{ item.author }}</p>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
      </div>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { QyIcon } from '@/design-system/components'
// Mock data (no API/auth required)
const router = useRouter()
const activeTab = ref('intro')
const isReversed = ref(false)
const isFavorited = ref(false)
const inShelf = ref(false)
const tags = ref(['奇幻', '冒险', '经典', '热血'])

const book = ref({
  id: 'demo-book-1',
  title: '演示书籍标题',
  author: '演示作者',
  categoryName: '演示分类',
  status: 'serializing',
  rating: 4.5,
  ratingCount: 1234,
  viewCount: 56789,
  favoriteCount: 2345,
  wordCount: 356000,
  chapterCount: 12,
  cover: 'https://via.placeholder.com/300x400?text=Demo+Book',
  description: '这是一个用于验证页面布局的演示数据，不依赖后端接口。'
})

const chapters = ref(
  Array.from({ length: 12 }).map((_, i) => ({
    id: `ch-${i + 1}`,
    title: `第${i + 1}章 演示章节标题`,
    isRead: i < 2,
    wordCount: 3000 + i * 100
  }))
)

const recommendedBooks = ref(
  Array.from({ length: 6 }).map((_, i) => ({
    id: `rec-${i + 1}`,
    title: `推荐书籍 ${i + 1}`,
    author: '演示作者',
    cover: `https://via.placeholder.com/300x400?text=Rec+${i + 1}`
  }))
)

const hasProgress = computed(() => false)
const statusType = computed(() => (book.value.status === 'completed' ? 'success' : 'warning'))
const statusText = computed(() => {
  const map: Record<string, string> = { serializing: '连载中', completed: '已完结', paused: '暂停' }
  return map[book.value.status] || book.value.status
})
const displayedChapters = computed(() => (isReversed.value ? [...chapters.value].reverse() : chapters.value))

const formatNumber = (num?: number): string => {
  if (typeof num !== 'number') return '0'
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  if (num >= 1000) return (num / 1000).toFixed(1) + '千'
  return num.toString()
}

const startReading = () => {
  if (chapters.value.length > 0) {
    ElMessage.success(`开始阅读：${chapters.value[0].title}`)
  } else {
    ElMessage.warning('暂无章节')
  }
}
const readChapter = (id: string) => ElMessage.info(`阅读章节：${id}`)
const reverseChapterOrder = () => (isReversed.value = !isReversed.value)
const addToShelf = () => {
  inShelf.value = true
  ElMessage.success('已加入书架（演示）')
}
const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value
  ElMessage.success(isFavorited.value ? '收藏成功（演示）' : '取消收藏（演示）')
}
const copyLink = async () => {
  const url = location.origin + '/bookstore/books-demo'
  await navigator.clipboard.writeText(url)
  ElMessage.success('链接已复制（演示）')
}
const share = () => {
  ElMessage.info('分享功能演示：可接入 Web Share API 或自定义弹窗')
}
const goToBook = (id: string) => router.push({ name: 'book-detail-demo', params: { id } })

const userRating = ref(4)
const ratingText = ref('')
const submitRating = () => {
  ElMessage.success(`评分成功（演示）：${userRating.value} ⭐`)
  ratingText.value = ''
}

const commentInput = ref('')
const mockComments = ref(Array.from({ length: 5 }).map((_, i) => ({ id: 'c' + i, user: '用户' + (i + 1), time: '刚刚', content: '这是一条演示评论 ' + (i + 1) })))
const hasMoreComments = ref(true)
const loadingMore = ref(false)
const submitComment = () => {
  if (!commentInput.value.trim()) {
    ElMessage.warning('请输入评论内容（演示）')
    return
  }
  mockComments.value.unshift({ id: 'c' + Math.random().toString(36).slice(2), user: '你', time: '刚刚', content: commentInput.value })
  commentInput.value = ''
  ElMessage.success('发表成功（演示）')
}
const loadMoreComments = async () => {
  loadingMore.value = true
  await new Promise(r => setTimeout(r, 600))
  const more = Array.from({ length: 3 }).map((_, i) => ({ id: 'm' + Math.random().toString(36).slice(2), user: '更多用户', time: '1分钟前', content: '更多演示评论 ' + (i + 1) }))
  mockComments.value.push(...more)
  hasMoreComments.value = mockComments.value.length < 20
  loadingMore.value = false
}

onMounted(() => {
  // nothing to fetch in demo
})
</script>

<style scoped lang="scss">
.book-detail-view { min-height: 100vh; background: linear-gradient(180deg,#f7f8fc 0%,#f5f5f5 100%); }
.back-button { padding: 16px 20px; max-width: 1200px; margin: 0 auto; }
.hero { background: linear-gradient(135deg,#eef2ff 0%,#fdf2f8 100%); padding: 40px 0; margin-bottom: 20px; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.book-cover .el-image { width: 100%; aspect-ratio: 3/4; border-radius: 12px; box-shadow: 0 10px 30px rgba(99,102,241,0.2); }
.book-info .book-title { font-size: 32px; font-weight: 800; margin: 0 0 12px 0; color: #111827; letter-spacing: .3px; }
.book-info .book-meta { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; color: #374151; flex-wrap: wrap; }
.book-tags { display: flex; gap: 8px; margin-bottom: 12px; }
.book-info .book-stats { display: flex; gap: 24px; margin: 16px 0; flex-wrap: wrap; color: #6b7280; }
.book-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.book-content { background: white; padding: 24px 0; margin-bottom: 20px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.06); }
.book-description { padding: 20px; line-height: 1.8; color: #374151; white-space: pre-wrap; }
.chapter-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; border-bottom: 1px solid #ebeef5; }
.chapter-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: background .2s; }
.chapter-item:hover { background-color: #f9fafb; }
.recommended-section { background: white; padding: 40px 0; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.06); }
.recommended-section .section-title { font-size: 24px; font-weight: 800; margin-bottom: 24px; color: #111827; }
.recommended-section .el-image { width: 100%; aspect-ratio: 3/4; border-radius: 10px; margin-bottom: 8px; box-shadow: 0 6px 18px rgba(0,0,0,.08); }
.image-slot { display: flex; align-items: center; justify-content: center; height: 100%; background-color: #f3f4f6; color: #9ca3af; font-size: 30px; border-radius: 10px; }
.rating-section { padding: 16px; }
.rating-card { display: flex; gap: 24px; padding: 20px; background: #fafafa; border: 1px solid #eee; border-radius: 12px; }
.rating-card .left { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px 20px; background: white; border-radius: 12px; border: 1px solid #eee; min-width: 140px; }
.rating-card .avg { font-size: 36px; font-weight: 800; color: #111827; }
.rating-card .count { color: #6b7280; font-size: 12px; }
.rating-card .right { flex: 1; display: flex; gap: 10px; align-items: center; }
.comments-container { padding: 16px; }
.comment-post { margin-bottom: 16px; padding: 16px; background: #fafafa; border: 1px solid #eee; border-radius: 12px; }
.comment-actions { display: flex; justify-content: flex-end; margin-top: 8px; }
.comment-item { padding: 14px 0; border-bottom: 1px solid #f3f4f6; }
.comment-header { display: flex; justify-content: space-between; color: #374151; margin-bottom: 6px; }
.comment-content { color: #4b5563; }
@media (max-width: 768px) { .book-info .book-title { font-size: 24px; } .rating-card { flex-direction: column; } }
</style>
