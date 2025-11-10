<template>
  <div class="home-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">
          <el-icon class="title-icon"><Reading /></el-icon>
          青羽书城
        </h1>
        <p class="page-subtitle">发现优质内容，享受阅读乐趣</p>
        <div class="demo-link" style="margin-top:12px">
          <el-button type="primary" size="small" @click="goToReaderDemo">打开阅读器演示</el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="container">
        <!-- 公告横幅 -->
        <section v-if="announcements.length > 0" class="announcement-section">
          <el-alert
            v-for="announcement in announcements"
            :key="announcement.id"
            :type="getAnnouncementType(announcement.type)"
            :title="announcement.title"
            :description="announcement.content"
            :closable="true"
            show-icon
            @close="handleCloseAnnouncement(announcement.id)"
            class="announcement-item"
          />
        </section>

        <!-- Banner轮播 -->
        <section class="banner-section" v-loading="loading">
          <BannerCarousel
            :banners="banners"
            height="400px"
            @banner-click="handleBannerClick"
          />
        </section>

        <!-- 榜单区域 -->
        <section class="rankings-section">
          <div class="section-header">
            <h2 class="section-title">
              <el-icon><TrendCharts /></el-icon>
              热门榜单
            </h2>
          </div>

          <div class="rankings-grid">
            <RankingList
              type="realtime"
              :items="rankings.realtime || []"
              :loading="loading"
              :max-items="8"
              @view-more="handleViewRanking('realtime')"
              @item-click="handleBookClick"
            />

            <RankingList
              type="weekly"
              :items="rankings.weekly || []"
              :loading="loading"
              :max-items="8"
              @view-more="handleViewRanking('weekly')"
              @item-click="handleBookClick"
            />

            <RankingList
              type="monthly"
              :items="rankings.monthly || []"
              :loading="loading"
              :max-items="8"
              @view-more="handleViewRanking('monthly')"
              @item-click="handleBookClick"
            />

            <RankingList
              type="newbie"
              :items="rankings.newbie || []"
              :loading="loading"
              :max-items="8"
              @view-more="handleViewRanking('newbie')"
              @item-click="handleBookClick"
            />
          </div>
        </section>

        <!-- 推荐书籍 -->
        <section class="recommended-section">
          <BookGrid
            title="编辑推荐"
            :books="recommendedBooks"
            :loading="loading"
            :max-items="8"
            @view-more="handleViewBooks('recommended')"
            @book-click="handleBookClick"
          />
        </section>

        <!-- 精选书籍 -->
        <section class="featured-section">
          <BookGrid
            title="精选好书"
            :books="featuredBooks"
            :loading="loading"
            :max-items="8"
            @view-more="handleViewBooks('featured')"
            @book-click="handleBookClick"
          />
        </section>

        <!-- 推荐给你（无限滚动） -->
        <section class="infinite-recommendations">
          <div class="section-header">
            <h2 class="section-title">
              <el-icon><Star /></el-icon>
              推荐给你
            </h2>
          </div>

          <div v-if="recommendedItems.length > 0" class="recommendations-grid">
            <div
              v-for="book in recommendedItems"
              :key="book.id || book._id"
              class="recommendation-card"
              @click="handleBookClick(book)"
            >
              <el-image :src="book.cover" fit="cover" class="book-cover">
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="book-info">
                <h4>{{ book.title }}</h4>
                <p class="author">{{ book.author }}</p>
                <div class="book-meta">
                  <span><el-icon><View /></el-icon> {{ formatNumber(book.viewCount) }}</span>
                  <span><el-icon><Star /></el-icon> {{ book.rating || 0 }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="loadingMore" class="loading-more">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载中...</span>
          </div>

          <!-- 加载触发器 -->
          <div ref="loadMoreElRef" class="load-trigger"></div>

          <!-- 没有更多 -->
          <div v-if="!hasMoreRecommendations && recommendedItems.length > 0" class="no-more">
            没有更多推荐了
          </div>
        </section>

        <!-- 统计信息 -->
        <section class="stats-section" v-if="stats">
          <div class="stats-container">
            <div class="stat-item">
              <div class="stat-number">{{ formatNumber(stats.totalBooks) }}</div>
              <div class="stat-label">总书籍数</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ formatNumber(stats.publishedBooks) }}</div>
              <div class="stat-label">已发布</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ formatNumber(stats.recommendedBooks) }}</div>
              <div class="stat-label">推荐书籍</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ formatNumber(stats.featuredBooks) }}</div>
              <div class="stat-label">精选书籍</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useBookstoreStore } from '@bookstore/stores/bookstore.store'
import BannerCarousel from '@bookstore/components/BannerCarousel.vue'
import RankingList from '@bookstore/components/RankingList.vue'
import BookGrid from '@bookstore/components/BookGrid.vue'
import { User, Star, Picture, View, Loading } from '@element-plus/icons-vue'
import { usePagination } from '@/composables/usePagination'

export default {
  name: 'HomeView',
  components: {
    BannerCarousel,
    RankingList,
    BookGrid,
    User
  },
  setup() {
    const router = useRouter()
    const bookstoreStore = useBookstoreStore()
    const loading = ref(false)
    const loadMoreElRef = ref<HTMLElement | null>(null)

    // 公告列表
    const announcements = ref([])

    // 无限滚动推荐
    const {
      items: recommendedItems,
      loading: loadingMore,
      hasMore: hasMoreRecommendations,
      setupScrollObserver
    } = usePagination(
      async (page, pageSize) => {
        try {
          // 调用推荐API
          const data = await bookstoreStore.fetchRecommendedBooks(page, pageSize)
          // bookstoreStore 中的数据是直接存储在 books.recommended 中
          const items = bookstoreStore.books.recommended || []
          return {
            items: Array.isArray(items) ? items : [],
            total: items.length
          }
        } catch (error) {
          console.error('加载推荐失败:', error)
          return { items: [], total: 0 }
        }
      },
      {
        pageSize: 12,
        initialLoad: true,
        autoLoadOnScroll: false // 手动设置observer
      }
    )

    // 模板ref在mounted后可用，初始化观察器

    // 计算属性
    const banners = computed(() => bookstoreStore.banners)
    const recommendedBooks = computed(() => bookstoreStore.books.recommended)
    const featuredBooks = computed(() => bookstoreStore.books.featured)
    const rankings = computed(() => bookstoreStore.rankings)
    const stats = computed(() => bookstoreStore.homepageData?.stats)

    // 格式化数字
    const formatNumber = (num) => {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w'
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k'
      }
      return num?.toString() || '0'
    }

    // 加载公告
    const loadAnnouncements = async () => {
      try {
        // TODO: 调用公告API
        // const response = await request.get('/announcements/effective', {
        //   params: { targetUser: 'reader', limit: 3 }
        // })
        // announcements.value = response.data || []

        // 模拟公告数据
        announcements.value = []
      } catch (error) {
        console.error('加载公告失败:', error)
      }
    }

    // 获取公告类型
    const getAnnouncementType = (type) => {
      const typeMap = {
        info: 'info',
        warning: 'warning',
        notice: 'success'
      }
      return typeMap[type] || 'info'
    }

    // 关闭公告
    const handleCloseAnnouncement = (id) => {
      announcements.value = announcements.value.filter(a => a.id !== id)
      // 可以将关闭的公告ID存储到localStorage，避免重复显示
      const closedAnnouncements = JSON.parse(localStorage.getItem('closedAnnouncements') || '[]')
      closedAnnouncements.push(id)
      localStorage.setItem('closedAnnouncements', JSON.stringify(closedAnnouncements))
    }

    // 加载首页数据
    const loadHomepageData = async () => {
      loading.value = true
      try {
        await bookstoreStore.fetchHomepageData()
        await loadAnnouncements()
      } catch (error) {
        console.error('加载首页数据失败:', error)
        const errorMsg = error?.message || '未知错误'
        ElMessage.error('加载首页数据失败: ' + errorMsg)
      } finally {
        loading.value = false
      }
    }

    // 处理榜单查看更多
    const handleViewRanking = (type) => {
      console.log('查看更多榜单:', type)
      ElMessage.info(`查看${type}榜单功能开发中...`)
    }

    // 处理书籍查看更多
    const handleViewBooks = (type) => {
      console.log('查看更多书籍:', type)
      ElMessage.info(`查看${type}书籍功能开发中...`)
    }

    // 处理书籍点击
    const handleBookClick = (book) => {
      console.log('点击书籍:', book)
      const bookId = book.id || book._id
      if (bookId) {
        router.push({ name: 'book-detail', params: { id: String(bookId) } })
      } else {
        ElMessage.warning('书籍ID缺失')
      }
    }

    // 处理Banner点击跳转
    const handleBannerClick = (banner) => {
      try {
        const type = banner.targetType || banner.target_type || banner.type
        if (type === 'book') {
          const targetId = banner.targetId || banner.target || banner.bookId || banner.book_id
          if (targetId) {
            router.push({ name: 'book-detail', params: { id: String(targetId) } })
            return
          }
        }
        if (type === 'category') {
          const categoryId = banner.targetId || banner.target
          if (categoryId) {
            router.push(`/categories/${categoryId}`)
            return
          }
        }
        if (type === 'url' && (banner.targetUrl || banner.target)) {
          const url = banner.targetUrl || banner.target
          window.open(url, '_blank')
          return
        }
        // 兜底：尝试按书籍处理
        const fallbackId = banner.targetId || banner.target
        if (fallbackId) {
          router.push({ name: 'book-detail', params: { id: String(fallbackId) } })
        } else {
          ElMessage.warning('无效的Banner目标')
        }
      } catch (e) {
        console.error('处理Banner点击失败:', e)
      }
    }

    // 跳转到认证页面
    const goToAuth = () => {
      router.push('/auth')
    }

    // 打开阅读器演示页面（便于调试）
    const goToReaderDemo = () => {
      router.push('/bookstore/reader-demo')
    }

    // 组件挂载时加载数据
    onMounted(() => {
      loadHomepageData()

      // 设置无限滚动观察器
      if (loadMoreElRef.value) {
        setupScrollObserver(loadMoreElRef.value)
      }
    })

    // 清理
    onUnmounted(() => {
      // observer会在composable中自动清理
    })

    return {
      loading,
      announcements,
      banners,
      recommendedBooks,
      featuredBooks,
      rankings,
      stats,
      recommendedItems,
      loadingMore,
      hasMoreRecommendations,
      loadMoreElRef,
      formatNumber,
      getAnnouncementType,
      handleCloseAnnouncement,
      handleViewRanking,
      handleViewBooks,
      handleBookClick,
      handleBannerClick,
      goToAuth,
      goToReaderDemo
    }
  }
}
</script>

<style scoped lang="scss">
.home-view {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 0;
  text-align: center;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 36px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 40px;
}

.page-subtitle {
  margin: 0;
  font-size: 18px;
  opacity: 0.9;
}

.main-content {
  padding: 40px 0;
}

.announcement-section {
  margin-bottom: 24px;
}

.announcement-item {
  margin-bottom: 12px;
}

.announcement-item:last-child {
  margin-bottom: 0;
}

.banner-section {
  margin-bottom: 40px;
}

.rankings-section {
  margin-bottom: 40px;
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rankings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.recommended-section,
.featured-section,
.infinite-recommendations {
  margin-bottom: 40px;
}

.infinite-recommendations {
  .recommendations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }

  .recommendation-card {
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .book-cover {
      width: 100%;
      height: 280px;
    }

    .book-info {
      padding: 12px;

      h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 600;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .author {
        margin: 0 0 8px 0;
        font-size: 12px;
        color: #666;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .book-meta {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: #999;

        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
  }

  .loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 40px 0;
    color: #409eff;
    font-size: 14px;

    .el-icon {
      font-size: 20px;
    }
  }

  .load-trigger {
    height: 1px;
  }

  .no-more {
    text-align: center;
    padding: 40px 0;
    color: #999;
    font-size: 14px;
  }

  .image-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background-color: #f5f7fa;
    color: #909399;
    font-size: 40px;
  }
}

.stats-section {
  margin-top: 60px;
  padding: 40px 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  text-align: center;
}

.stat-item {
  padding: 20px;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .page-title {
    font-size: 28px;
  }

  .page-subtitle {
    font-size: 16px;
  }

  .rankings-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .main-content {
    padding: 20px 0;
  }

  .banner-section,
  .rankings-section,
  .recommended-section,
  .featured-section {
    margin-bottom: 24px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .home-view {
    background: #121212;
  }

  .section-title {
    color: #e0e0e0;
  }

  .stats-section {
    background: #1a1a1a;
  }

  .stat-label {
    color: #b0b0b0;
  }
}
</style>
