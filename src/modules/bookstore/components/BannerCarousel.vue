<template>
  <div class="banner-carousel">
    <el-carousel
      :interval="4000"
      :height="height"
      indicator-position="outside"
      arrow="hover"
      @change="handleCarouselChange"
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
            loading="lazy"
          />
          <div class="banner-overlay">
            <div class="banner-content">
              <h3 class="banner-title">{{ banner.title }}</h3>
              <p class="banner-description" v-if="banner.description">
                {{ banner.description }}
              </p>
              <el-button
                v-if="banner.buttonText"
                type="primary"
                size="large"
                class="banner-button"
                @click.stop="handleButtonClick(banner)"
              >
                {{ banner.buttonText }}
              </el-button>
            </div>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- 空状态 -->
    <div v-if="!banners.length && !loading" class="empty-state">
      <el-empty description="暂无轮播内容" />
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state" :style="{ height }">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="image" :style="{ height: '100%' }" />
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script>
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
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['banner-click', 'button-click', 'carousel-change'],
  setup(props, { emit }) {
    // 处理轮播图点击：仅向外发出事件，由父组件或 store 处理统计等副作用
    const handleBannerClick = (banner) => {
      emit('banner-click', banner)
    }

    // 处理按钮点击
    const handleButtonClick = (banner) => {
      emit('button-click', banner)
    }

    // 处理轮播变化
    const handleCarouselChange = (index) => {
      emit('carousel-change', index)
    }

    // 处理图片加载错误
    const handleImageError = (event) => {
      // 使用本地默认图片
      event.target.src = new URL('@/assets/default-book-cover.svg', import.meta.url).href
    }

    return {
      handleBannerClick,
      handleButtonClick,
      handleCarouselChange,
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
  margin: 0 0 16px 0;
  opacity: 0.9;
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.banner-button {
  margin-top: 8px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: #f5f7fa;
  border-radius: 8px;
}

.loading-state {
  border-radius: 8px;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner-overlay {
    padding: 20px 15px 15px;
  }

  .banner-title {
    font-size: 18px;
  }

  .banner-description {
    font-size: 12px;
  }

  .banner-button {
    font-size: 14px;
    padding: 8px 16px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .banner-carousel {
    box-shadow: 0 2px 12px 0 rgba(255, 255, 255, 0.1);
  }
}
</style>
