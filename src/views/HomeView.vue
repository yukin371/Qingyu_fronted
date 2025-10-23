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
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="container">
        <!-- Banner轮播 -->
        <section class="banner-section" v-loading="loading">
          <BannerCarousel
            :banners="banners"
            height="400px"
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useBookstoreStore } from '@/stores/bookstore'
import BannerCarousel from '@/components/BannerCarousel.vue'
import RankingList from '@/components/RankingList.vue'
import BookGrid from '@/components/BookGrid.vue'
import { User } from '@element-plus/icons-vue'

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

    // 加载首页数据
    const loadHomepageData = async () => {
      loading.value = true
      try {
        await bookstoreStore.fetchHomepageData()
      } catch (error) {
        ElMessage.error('加载首页数据失败: ' + error.message)
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
      ElMessage.info(`书籍详情功能开发中...`)
    }

    // 跳转到认证页面
    const goToAuth = () => {
      router.push('/auth')
    }

    // 组件挂载时加载数据
    onMounted(() => {
      loadHomepageData()
    })

    return {
      loading,
      banners,
      recommendedBooks,
      featuredBooks,
      rankings,
      stats,
      formatNumber,
      handleViewRanking,
      handleViewBooks,
      handleBookClick,
      goToAuth
    }
  }
}
</script>

<style scoped>
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
.featured-section {
  margin-bottom: 40px;
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
