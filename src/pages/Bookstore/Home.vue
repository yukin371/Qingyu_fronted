<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <Header />

    <!-- Banner 轮播 -->
    <section v-if="homepageData?.banners?.length" class="container mx-auto px-4 py-6">
      <el-carousel height="400px" indicator-position="inside">
        <el-carousel-item v-for="banner in homepageData.banners" :key="banner.id">
          <div
            class="w-full h-full cursor-pointer"
            @click="handleBannerClick(banner)"
          >
            <img
              :src="banner.imageUrl"
              :alt="banner.title"
              class="w-full h-full object-cover rounded-lg"
            />
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- 主要内容 -->
    <div class="container mx-auto px-4 py-8">
      <!-- 推荐书籍 -->
      <section v-if="homepageData?.recommendedBooks?.length" class="mb-12">
        <SectionTitle title="为你推荐" icon="Star" />
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <BookCard
            v-for="book in homepageData.recommendedBooks"
            :key="book.id"
            :book="book"
          />
        </div>
      </section>

      <!-- 精选书籍 -->
      <section v-if="homepageData?.featuredBooks?.length" class="mb-12">
        <SectionTitle title="编辑精选" icon="Trophy" />
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <BookCard
            v-for="book in homepageData.featuredBooks"
            :key="book.id"
            :book="book"
          />
        </div>
      </section>

      <!-- 热门排行 -->
      <section v-if="homepageData?.hotRankings?.length" class="mb-12">
        <SectionTitle title="热门排行" icon="TrendCharts" />
        <RankingList :items="homepageData.hotRankings" />
      </section>

      <!-- 分类推荐 -->
      <section v-if="homepageData?.categories?.length" class="mb-12">
        <SectionTitle title="分类浏览" icon="Grid" />
        <CategoryList :categories="homepageData.categories" />
      </section>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
    </div>

    <!-- Empty -->
    <el-empty
      v-if="!isLoading && !homepageData"
      description="暂无数据"
      class="py-20"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { useBookstoreStore } from '@/stores/bookstore'
import { incrementBannerClick } from '@/api/bookstore/banners'
import type { Banner } from '@/types/bookstore'
import Header from '@/components/Layout/Header.vue'
import SectionTitle from '@/components/Common/SectionTitle.vue'
import BookCard from '@/components/Book/BookCard.vue'
import RankingList from '@/components/Ranking/RankingList.vue'
import CategoryList from '@/components/Category/CategoryList.vue'

const router = useRouter()
const bookstoreStore = useBookstoreStore()

const { homepageData, isLoading } = bookstoreStore

// 加载首页数据
onMounted(async () => {
  try {
    await bookstoreStore.fetchHomepage()
  } catch (error) {
    console.error('加载首页数据失败:', error)
    ElMessage.error('加载失败，请稍后重试')
  }
})

// 处理Banner点击
async function handleBannerClick(banner: Banner) {
  try {
    // 记录点击
    await incrementBannerClick(banner.id)

    // 根据linkType跳转
    if (banner.linkType === 'book' && banner.targetId) {
      router.push(`/book/${banner.targetId}`)
    } else if (banner.linkType === 'category' && banner.targetId) {
      router.push(`/bookstore/category/${banner.targetId}`)
    } else if (banner.linkType === 'external' && banner.linkUrl) {
      window.open(banner.linkUrl, '_blank')
    }
  } catch (error) {
    console.error('处理Banner点击失败:', error)
  }
}
</script>

