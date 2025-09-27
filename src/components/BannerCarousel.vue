<template>
  <div class="banner-carousel">
    <el-carousel 
      :interval="4000" 
      :height="height"
      indicator-position="outside"
      arrow="hover"
    >
      <el-carousel-item 
        v-for="banner in banners" 
        :key="banner.id"
        @click="handleBannerClick(banner)"
      >
        <div class="banner-item">
          <img 
            :src="banner.image" 
            :alt="banner.title"
            class="banner-image"
            @error="handleImageError"
          />
          <div class="banner-overlay">
            <div class="banner-content">
              <h3 class="banner-title">{{ banner.title }}</h3>
              <p class="banner-description" v-if="banner.description">
                {{ banner.description }}
              </p>
            </div>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script>
import { useBookstoreStore } from '@/stores/bookstore'

export default {
  name: 'BannerCarousel',
  props: {
    banners: {
      type: Array,
      default: () => []
    },
    height: {
      type: String,
      default: '300px'
    }
  },
  setup() {
    const bookstoreStore = useBookstoreStore()

    const handleBannerClick = async (banner) => {
      // 增加点击次数
      await bookstoreStore.incrementBannerClick(banner.id)
      
      // 根据目标类型进行跳转
      switch (banner.targetType) {
        case 'book':
          // 跳转到书籍详情页
          console.log('跳转到书籍:', banner.target)
          break
        case 'category':
          // 跳转到分类页
          console.log('跳转到分类:', banner.target)
          break
        case 'url':
          // 跳转到外部链接
          window.open(banner.target, '_blank')
          break
        default:
          console.log('未知的跳转类型')
      }
    }

    const handleImageError = (event) => {
      // 图片加载失败时使用默认图片
      event.target.src = '/default-book-cover.svg'
    }

    return {
      handleBannerClick,
      handleImageError
    }
  }
}
</script>

<style scoped>
.banner-carousel {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.banner-item {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.banner-item:hover .banner-image {
  transform: scale(1.05);
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 40px 20px 20px;
  color: white;
}

.banner-content {
  max-width: 600px;
}

.banner-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.banner-description {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .banner-carousel {
    box-shadow: 0 2px 12px 0 rgba(255, 255, 255, 0.1);
  }
}
</style>