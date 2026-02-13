<template>
  <div class="home-view">
    <!-- 顶部背景装饰 -->
    <div class="hero-background">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
    </div>

    <div class="container main-container">
      <!-- 头部 Hero 区域：左侧文案，右侧轮播 -->
      <section class="hero-section">
        <div class="hero-content animate-up">
          <div class="brand-tag">
            <el-icon class="hero-inline-icon"><Reading /></el-icon>
            沉浸式阅读体验
          </div>
          <h1 class="hero-title">青羽书城<span class="highlight">.</span></h1>
          <p class="hero-subtitle">
            探索未知的世界，<br />
            遇见灵魂的共鸣。
          </p>
          <div class="hero-actions">
            <!-- 搜索框嵌入 -->
            <div class="search-wrapper">
              <QyInput placeholder="搜索书名、作者..." class="hero-search" size="lg">
                <template #prefix>
                  <el-icon class="hero-inline-icon"><Search /></el-icon>
                </template>
              </QyInput>
            </div>
            <QyButton variant="default" rounded class="demo-btn" @click="goToReaderDemo">
              体验阅读器
              <el-icon class="icon-inline-spacer"><ArrowRight /></el-icon>
            </QyButton>
          </div>

          <!-- 统计数据胶囊 -->
          <div class="stats-capsule" v-if="stats">
            <div class="stat-mini">
              <strong>{{ formatNumber(stats.totalBooks) }}</strong>
              <span>藏书</span>
            </div>
            <Divider orientation="vertical" />
            <div class="stat-mini">
              <strong>{{ formatNumber(stats.ongoingBooks) }}</strong>
              <span>连载中</span>
            </div>
          </div>
        </div>

        <div class="hero-banner animate-up delay-1">
          <!-- Loading state -->
          <div
            v-if="loading"
            class="banner-skeleton"
            style="
              width: 100%;
              height: 320px;
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: shimmer 1.5s infinite;
              border-radius: 24px;
            "
          ></div>

          <!-- Content -->
          <div v-else class="banner-wrapper">
            <BannerCarousel
              :banners="banners"
              height="320px"
              indicator-position="none"
              @banner-click="handleBannerClick"
              class="premium-carousel"
            />
            <!-- 装饰性光晕 -->
            <div class="glow-effect"></div>
          </div>
        </div>
      </section>

      <!-- 公告栏 (悬浮式) -->
      <section v-if="announcements.length > 0" class="floating-notice animate-up delay-2">
        <div class="notice-glass">
          <el-icon class="notice-icon"><Bell /></el-icon>
          <div class="notice-swiper">
            <!-- 这里可以用简单的轮播或者显示最新一条 -->
            <span>{{ announcements[0].content }}</span>
          </div>
          <QyButton variant="text" size="sm" @click="announcements = []">
            <el-icon><Close /></el-icon>
          </QyButton>
        </div>
      </section>

      <!-- 主要内容区域 -->
      <div class="content-wrapper">
        <!-- 榜单区域 -->
        <section class="section-block rankings-section animate-on-scroll">
          <!-- 将内容包裹在 card-container 中 -->
          <div class="card-container">
            <div class="section-header">
              <h2 class="section-title">热门榜单</h2>
              <!-- 移动端优化：Tabs 容器 -->
              <div class="section-tabs-wrapper">
                <div class="section-tabs">
                  <span
                    v-for="tab in ['realtime', 'weekly', 'monthly', 'newbie']"
                    :key="tab"
                    :class="{ active: activeRankingTab === tab }"
                    @click="activeRankingTab = tab"
                  >
                    {{ rankingTabName(tab) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="ranking-content">
              <RankingList
                :type="activeRankingTab"
                :items="rankings[activeRankingTab] || []"
                :loading="loading"
                :max-items="6"
                :columns="2"
                layout="premium"
                @view-more="handleViewRanking(activeRankingTab)"
                @item-click="handleBookClick"
              />
            </div>
          </div>
        </section>

        <!-- 编辑推荐 -->
        <section class="section-block recommended-section animate-on-scroll">
          <div class="card-container">
            <div class="section-header flex-between">
              <h2 class="section-title">编辑甄选 <span class="title-en">Editors' Choice</span></h2>
              <QyButton variant="outline" size="sm" @click="handleViewBooks('recommended')"
                >全部</QyButton
              >
            </div>
            <!-- 强制 Grid 组件响应式 -->
            <div class="responsive-grid-wrapper">
              <BookGrid
                :books="recommendedBooks"
                :loading="loading"
                :max-items="8"
                card-style="premium"
                @book-click="handleBookClick"
              />
            </div>
          </div>
        </section>

        <!-- 年度精选 -->
        <section class="section-block featured-section animate-on-scroll">
          <div class="section-header">
            <h2 class="section-title">年度精选 <span class="title-en">Featured</span></h2>
          </div>
          <div class="featured-layout" v-if="!loading">
            <!-- 紧凑的网格布局，显示所有精选书籍 -->
            <BookGrid
              :books="featuredBooks"
              :loading="loading"
              :max-items="6"
              :grid-cols="3"
              card-style="premium"
              @book-click="handleBookClick"
            />
          </div>
          <!-- 骨架屏 -->
          <div v-else class="featured-skeleton">
            <BookGrid :books="[]" :loading="true" :max-items="6" />
          </div>
        </section>

        <!-- 猜你喜欢 (无限滚动) -->
        <section class="section-block infinite-recommendations">
          <div class="section-header center-align">
            <h2 class="section-title">
              <el-icon class="section-title-icon"><Star /></el-icon>
              个人喜好推荐
            </h2>
            <p class="section-desc">基于你的阅读偏好推荐</p>
          </div>

          <div class="masonry-grid">
            <div
              v-for="book in displayRecommendations"
              :key="book.id || book._id"
              class="premium-card"
              @click="handleBookClick(book)"
            >
              <div class="card-image-box">
                <QyImage :src="book.cover" fit="cover" loading="lazy">
                  <template #error>
                    <div class="image-placeholder">
                      <el-icon class="image-placeholder-icon"><Picture /></el-icon>
                    </div>
                  </template>
                </QyImage>
                <div class="card-overlay">
                  <QyButton variant="primary" size="sm" rounded>立即阅读</QyButton>
                </div>
              </div>
              <div class="card-info">
                <h4 class="book-title" :title="book.title">{{ book.title }}</h4>
                <div class="book-meta-row">
                  <span class="author">{{ book.author }}</span>
                  <span class="rating">
                    <el-icon class="rating-star"><Star /></el-icon>
                    {{ formatRating(book.rating) }}
                  </span>
                </div>
                <div class="tags-row" v-if="book.categoryName">
                  <span class="tag">{{ book.categoryName }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="displayRecommendations.length === 0 && !loading" class="recommend-empty">
            暂无推荐内容，正在为你生成个性化书单...
          </div>

          <!-- 加载状态 -->
          <div class="scroll-loader">
            <div v-if="loadingMore" class="loader-animation">
              <span></span><span></span><span></span>
            </div>
            <div
              v-if="!hasMoreRecommendations && displayRecommendations.length > 0"
              class="no-more-text"
            >
              - 到底了，去看看别的吧 -
            </div>
            <div ref="loadMoreElRef" class="load-trigger"></div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookstoreStore } from '../stores/bookstore.store'
import BannerCarousel from '../components/BannerCarousel.vue'
import RankingList from '../components/RankingList.vue'
import BookGrid from '../components/BookGrid.vue'
import { Button as QyButton, Divider, Image as QyImage } from '@/design-system'
import { Input as QyInput } from '@/design-system'
import { ElIcon } from 'element-plus'
import { ArrowRight, Bell, Close, Picture, Reading, Search, Star } from '@element-plus/icons-vue'
import { usePagination } from '@/composables/usePagination'

export default {
  name: 'HomeView',
  components: {
    BannerCarousel,
    RankingList,
    BookGrid,
    QyButton,
    QyInput,
    Divider,
    QyImage,
    ElIcon,
    Reading,
    Search,
    ArrowRight,
    Bell,
    Close,
    Star,
    Picture,
  },
  setup() {
    const router = useRouter()
    const bookstoreStore = useBookstoreStore()
    const loading = ref(false)
    const loadMoreElRef = ref(null)
    const activeRankingTab = ref('realtime')

    // 数据从 store 获取，支持测试模式和真实 API 模式
    const announcements = ref([])
    const banners = computed(() => bookstoreStore.banners)
    const recommendedBooks = computed(() => bookstoreStore.books.recommended)
    const featuredBooks = computed(() => bookstoreStore.books.featured)
    const rankings = computed(() => bookstoreStore.rankings)
    const stats = computed(() => bookstoreStore.homepageData?.stats)
    const displayRecommendations = computed(() => {
      if (Array.isArray(recommendedItems.value) && recommendedItems.value.length > 0) {
        return recommendedItems.value
      }
      if (Array.isArray(recommendedBooks.value) && recommendedBooks.value.length > 0) {
        return recommendedBooks.value.slice(0, 8)
      }
      return []
    })

    // 无限滚动逻辑保持不变
    const {
      items: recommendedItems,
      loading: loadingMore,
      hasMore: hasMoreRecommendations,
      currentPage: recommendationPage,
      total: recommendationTotal,
      setupScrollObserver,
    } = usePagination(
      async (page, pageSize) => {
        try {
          await bookstoreStore.fetchRecommendedBooks(page, pageSize)
          const items = bookstoreStore.books.recommended || []
          return { items, total: items.length + pageSize }
        } catch {
          return { items: [], total: 0 }
        }
      },
      { pageSize: 12, initialLoad: false, autoLoadOnScroll: true },
    )

    // 辅助函数
    const formatRating = (rating) => {
      if (!rating || typeof rating !== 'number') return '0.0'
      return rating.toFixed(1)
    }

    const formatNumber = (num) => {
      if (!num) return '0'
      return num > 9999 ? (num / 10000).toFixed(1) + 'w' : num
    }

    const rankingTabName = (type) => {
      const map = { realtime: '飙升榜', weekly: '周榜', monthly: '月榜', newbie: '新书榜' }
      return map[type]
    }

    // Action Handlers 保持不变
    const handleBannerClick = () => {
      // TODO: Implement banner click handler
    }
    const handleBookClick = (book) => {
      router.push({ name: 'book-detail', params: { id: book.id || book._id } })
    }
    const handleViewRanking = () => {
      // TODO: Implement ranking view handler
    }
    const handleViewBooks = () => {
      // TODO: Implement books view handler
    }
    const goToReaderDemo = () => router.push('/bookstore/reader-demo')

    const loadHomepageData = async () => {
      loading.value = true
      try {
        await bookstoreStore.fetchHomepageData()
      } finally {
        loading.value = false
      }
    }

    // Fix memory leak: store observer reference for cleanup
    let scrollObserver = null

    onMounted(async () => {
      await loadHomepageData()

      if (Array.isArray(recommendedBooks.value) && recommendedBooks.value.length > 0) {
        recommendedItems.value = [...recommendedBooks.value]
        recommendationPage.value = 2
        recommendationTotal.value = recommendedItems.value.length + 12
      }

      if (loadMoreElRef.value) setupScrollObserver(loadMoreElRef.value)

      // 添加简单的滚动显现动画观察器
      scrollObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add('visible')
          })
        },
        { threshold: 0.1 },
      )

      document.querySelectorAll('.animate-on-scroll').forEach((el) => scrollObserver?.observe(el))
    })

    onUnmounted(() => {
      scrollObserver?.disconnect()
    })

    return {
      loading,
      loadingMore,
      hasMoreRecommendations,
      announcements,
      banners,
      recommendedBooks,
      featuredBooks,
      rankings,
      stats,
      recommendedItems,
      displayRecommendations,
      loadMoreElRef,
      activeRankingTab,
      formatNumber,
      formatRating,
      rankingTabName,
      handleBookClick,
      handleBannerClick,
      handleViewRanking,
      handleViewBooks,
      goToReaderDemo,
    }
  },
}
</script>

<style scoped lang="scss">
/*
  定义高级感配色与变量
  建议在全局 variables.scss 中定义，这里作为演示局部定义
*/
:root {
  --primary-color: #2c3e50;
  --accent-color: #c0a062;
  /* 金色点缀 */
  --bg-color: #f8f9fb;
  --card-bg: #ffffff;
  --text-main: #2c3e50;
  --text-secondary: #8590a6;
  --shadow-soft: 0 10px 40px -10px rgba(0, 0, 0, 0.05);
  --shadow-hover: 0 20px 60px -12px rgba(0, 0, 0, 0.12);
  --radius-lg: 24px;
  --radius-md: 16px;
}

.home-view {
  min-height: 100vh;
  background-color: #f8f9fb;
  /* 柔和的灰白背景 */
  position: relative;
  overflow-x: hidden;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.hero-inline-icon {
  font-size: 14px;
  margin-right: 6px;
  vertical-align: middle;
}

.icon-inline-spacer {
  margin-left: 6px;
  vertical-align: middle;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    padding: 0 16px;
    /* 减小左右边距 */
  }
}

/* --- 通用卡片容器样式 --- */
.card-container {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-soft);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  /* 移动端调整内边距 */
  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 16px;
  }
}

/* 背景装饰 */
.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 600px;
  overflow: hidden;
  z-index: 0;
  background: linear-gradient(180deg, #eef1f5 0%, rgba(255, 255, 255, 0) 100%);

  .shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.6;
  }

  .shape-1 {
    top: -100px;
    right: -50px;
    width: 500px;
    height: 500px;
    background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
  }

  .shape-2 {
    top: 100px;
    left: -100px;
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, #fccb90 0%, #d57eeb 100%);
  }

  @media (max-width: 768px) {
    height: 400px;

    .shape {
      opacity: 0.4;
    }
  }
}

/* --- 1. Hero 区域移动端适配 --- */
.hero-section {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 24px;
  padding: 28px 0 16px;
  align-items: center;
  min-height: 380px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    /* 平板/手机变为单列 */
    text-align: center;
    gap: 30px;
    padding-top: 20px;

    /* 反转顺序：让轮播图在手机上显示在标题下方，或者保持上方 */
    /* 如果想让图在上面： display: flex; flex-direction: column-reverse; */
  }
}

.hero-content {
  .brand-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 16px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 30px;
    color: #666;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .hero-title {
    font-size: 44px;
    font-weight: 800;
    line-height: 1.1;
    color: #1a1a1a;
    margin-bottom: 12px;
    font-family: 'Playfair Display', serif;
    /* 推荐引入衬线字体 */

    .highlight {
      color: #409eff;
    }

    @media (max-width: 768px) {
      font-size: 32px;
      /* 手机端字体缩小 */
      margin-bottom: 12px;
    }
  }

  .hero-subtitle {
    font-size: 15px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;

    @media (max-width: 768px) {
      font-size: 15px;
      margin-bottom: 24px;

      br {
        display: none;
      }
    }
  }

  .hero-actions {
    display: flex;
    gap: 16px;
    margin-bottom: 18px;

    @media (max-width: 768px) {
      flex-direction: column;
      /* 垂直排列按钮 */
      align-items: stretch;
      /* 按钮充满宽度 */
      padding: 0 20px;

      .search-wrapper {
        max-width: 100%;
        width: 100%;
      }

      .demo-btn {
        width: 100%;
        margin-top: 10px;
      }
    }

    .search-wrapper {
      flex: 1;
      max-width: 300px;

      :deep(.input-wrapper) {
        border-radius: 30px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        padding-left: 20px;
        background: rgba(255, 255, 255, 0.9);
      }
    }

    .demo-btn {
      border-radius: 30px;
      padding: 0 24px;
      font-weight: 600;
    }
  }

  .stats-capsule {
    display: inline-flex;
    background: #fff;
    padding: 8px 16px;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);

    .stat-mini {
      display: flex;
      flex-direction: column;
      padding: 0 12px;

      strong {
        font-size: 16px;
        color: #333;
      }

      span {
        font-size: 11px;
        color: #999;
        margin-top: 2px;
      }
    }
  }
}

.hero-banner {
  position: relative;

  .banner-wrapper {
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 50px -20px rgba(64, 158, 255, 0.4);
    transition: transform 0.5s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .skeleton,
  :deep(.carousel__container) {
    @media (max-width: 768px) {
      height: 200px !important;
      /* 手机端减小轮播高度 */
    }
  }
}

/* 悬浮公告 */
.floating-notice {
  margin: -8px auto 20px;
  max-width: 600px;
  position: relative;
  z-index: 5;

  .notice-glass {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 50px;
    padding: 8px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.08);

    .notice-icon {
      color: #f56c6c;
      font-size: 18px;
      margin-right: 10px;
    }

    .notice-swiper {
      flex: 1;
      color: #555;
      font-size: 14px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}

/* 通用区块样式 */
.section-block {
  margin-bottom: 56px;
}

.animate-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Tabs 横向滚动优化 */
.section-tabs-wrapper {
  width: 100%;
  overflow-x: auto;
  /* 允许横向滚动 */
  -webkit-overflow-scrolling: touch;
  /* iOS顺滑滚动 */
  padding-bottom: 4px;
  /* 防止滚动条遮挡 */

  /* 隐藏滚动条 */
  &::-webkit-scrollbar {
    display: none;
  }
}

.section-header {
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 20px;

  &.flex-between {
    justify-content: space-between;
  }

  &.center-align {
    flex-direction: column;
    text-align: center;
  }

  .section-title {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a1a;
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    position: relative;

    .title-en {
      font-size: 14px;
      font-weight: 400;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-left: 8px;
    }
  }

  .section-title-icon {
    color: #f59e0b;
  }

  .section-desc {
    color: #666;
    margin-top: 8px;
  }

  .section-tabs {
    display: inline-flex;
    white-space: nowrap;
    background: #eef1f6;
    padding: 4px;
    border-radius: 30px;

    span {
      padding: 6px 20px;
      border-radius: 24px;
      font-size: 14px;
      color: #666;
      cursor: pointer;
      transition: all 0.3s;

      &.active {
        background: #fff;
        color: #409eff;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    &.flex-between {
      flex-direction: row;
      /* 标题和按钮保持一行 */
      align-items: center;
    }
  }
}

/* Featured 精选区域 - 简洁布局 */
.featured-layout {
  /* 使用 BookGrid 自身的响应式布局 */
  width: 100%;

  /* 为年度精选添加特殊的网格样式 */
  :deep(.books-layout) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
  }

  /* 增强卡片视觉效果 */
  :deep(.book-card) {
    border-radius: 20px;
    overflow: hidden;
    box-shadow: var(--shadow-soft);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-hover);
    }
  }
}

/* 年度精选骨架屏 - 简化版 */
.featured-skeleton {
  width: 100%;

  /* 骨架屏使用 BookGrid 自带的骨架屏样式 */
  :deep(.skeleton-layout) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
  }
}

/* 猜你喜欢 (Masonry Grid) 适配 */
.masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 30px;

  @media (max-width: 768px) {
    /* 手机端改为双列，减小间距 */
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

.recommend-empty {
  margin-top: 14px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
}

.premium-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);

    .card-overlay {
      opacity: 1;
    }
  }

  .card-image-box {
    position: relative;
    height: 320px;
    overflow: hidden;

    .image-wrapper {
      width: 100%;
      height: 100%;
    }

    .card-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
      backdrop-filter: blur(2px);
    }

    .card-info {
      padding: 16px;

      .book-title {
        margin: 0 0 8px;
        font-size: 16px;
        font-weight: 700;
        color: #2c3e50;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .book-meta-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        color: #8590a6;

        .rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
          color: #333;
        }

        .rating-star {
          color: #f59e0b;
        }
      }

      .tags-row {
        margin-top: 10px;

        .tag {
          font-size: 10px;
          padding: 2px 8px;
          background: #f2f3f5;
          border-radius: 6px;
          color: #666;
        }
      }
    }
  }

  .scroll-loader {
    text-align: center;
    padding: 40px 0;

    .loader-animation {
      display: inline-block;

      span {
        display: inline-block;
        width: 8px;
        height: 8px;
        background: #409eff;
        border-radius: 50%;
        margin: 0 4px;
        animation: bounce 1.4s infinite ease-in-out both;

        &:nth-child(1) {
          animation-delay: -0.32s;
        }

        &:nth-child(2) {
          animation-delay: -0.16s;
        }
      }
    }

    .no-more-text {
      color: #ccc;
      font-size: 13px;
      letter-spacing: 1px;
    }
  }

  .image-placeholder-icon {
    font-size: 28px;
    color: #9ca3af;
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
    }

    40% {
      transform: scale(1);
    }
  }

  /* 入场动画辅助类 */
  .animate-up {
    animation: fadeInUp 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards;
    opacity: 0;
    transform: translateY(20px);
  }

  .delay-1 {
    animation-delay: 0.1s;
  }

  .delay-2 {
    animation-delay: 0.2s;
  }

  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .card-image-box {
    height: 320px;

    @media (max-width: 768px) {
      height: 220px;
      /* 手机端封面高度减小 */
    }

    /* 手机端默认不显示 hover 遮罩，或者点击触发 */
    .card-overlay {
      display: none;
      /* 手机端简化交互 */
    }
  }

  .card-info {
    @media (max-width: 768px) {
      padding: 10px;
    }

    .book-title {
      font-size: 14px;
      /* 字体缩小 */
    }

    .book-meta-row {
      flex-direction: column;
      /* 作者和评分垂直排列 */
      align-items: flex-start;
      gap: 4px;

      .author {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
