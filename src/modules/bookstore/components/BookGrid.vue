<template>
  <div class="book-grid-container">
    <!-- 头部区域 (可选，如果父组件传了 title) -->
    <div class="grid-header" v-if="title">
      <h3 class="section-title">
        <span class="title-text">{{ title }}</span>
        <span class="title-decoration"></span>
      </h3>
      <div class="header-actions" v-if="showMore">
        <el-button text class="view-more-btn" @click="$emit('view-more')">
          查看全部 <el-icon class="icon-right">
            <ArrowRight />
          </el-icon>
        </el-button>
      </div>
    </div>

    <!-- 加载中：骨架屏 -->
    <div v-if="loading" class="books-layout skeleton-layout">
      <div v-for="n in (limit > 0 ? limit : gridCols * 2)" :key="n" class="skeleton-card">
        <el-skeleton animated>
          <template #template>
            <el-skeleton-item variant="image" class="skeleton-cover" />
            <div style="padding: 12px 4px">
              <el-skeleton-item variant="h3" style="width: 80%; margin-bottom: 8px;" />
              <el-skeleton-item variant="text" style="width: 50%" />
            </div>
          </template>
        </el-skeleton>
      </div>
    </div>

    <!-- 真实数据列表 -->
    <div v-else class="books-layout" :style="gridStyle">
      <div v-for="book in displayBooks" :key="book.id || book._id" class="book-card" :class="[`style-${cardStyle}`]"
        @click="handleBookClick(book)">
        <!-- 封面区域 -->
        <div class="cover-wrapper">
          <el-image :src="book.cover || book.coverUrl" :alt="book.title" class="book-cover" fit="cover" loading="lazy">
            <template #error>
              <div class="image-slot">
                <el-icon>
                  <Picture />
                </el-icon>
              </div>
            </template>
          </el-image>

          <!-- 评分角标 (可选) -->
          <div class="rating-badge" v-if="book.score || book.rating">
            <el-icon>
              <StarFilled />
            </el-icon>
            <span>{{ book.score || book.rating }}</span>
          </div>

          <!-- 悬浮遮罩 -->
          <div class="hover-overlay">
            <el-button type="primary" round class="read-btn">
              立即阅读
            </el-button>
          </div>
        </div>

        <!-- 信息区域 -->
        <div class="info-wrapper">
          <h3 class="book-title" :title="book.title">{{ book.title }}</h3>
          <div class="book-author">{{ book.author }}</div>

          <!-- 底部元数据：价格/标签/浏览量 -->
          <div class="book-footer">
            <div class="tags-group" v-if="book.category || (book.tags && book.tags.length)">
              <span class="mini-tag">{{ book.categoryName || book.category || (book.tags && book.tags[0]) || '精选'
                }}</span>
            </div>

            <div class="meta-right">
              <span v-if="book.price" class="price">
                <span class="symbol">¥</span>{{ book.price }}
              </span>
              <span v-else class="free-badge">免费</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && displayBooks.length === 0" class="empty-wrapper">
      <el-empty :description="emptyText" :image-size="100" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowRight, Picture, StarFilled } from '@element-plus/icons-vue'

// Props 定义
const props = defineProps({
  books: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  },
  showMore: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  maxItems: { // 限制显示数量，0为不限制
    type: Number,
    default: 0
  },
  gridCols: { // 期望的列数（主要用于骨架屏计算，实际布局由CSS Grid自适应）
    type: Number,
    default: 5
  },
  emptyText: {
    type: String,
    default: '暂无相关书籍'
  },
  cardStyle: { // 卡片风格：'standard' | 'premium-mini'
    type: String,
    default: 'standard'
  }
})

// Emits
const emit = defineEmits(['book-click', 'view-more'])

// Logic
const limit = computed(() => props.maxItems)

const displayBooks = computed(() => {
  if (props.maxItems > 0) {
    return props.books.slice(0, props.maxItems)
  }
  return props.books
})

// 计算 Grid 样式
const gridStyle = computed(() => {
  // 使用 repeat(auto-fill) 实现响应式，minmax 控制最小卡片宽度
  // standard: 最小 180px, premium-mini: 最小 150px
  const minWidth = props.cardStyle === 'premium-mini' ? '150px' : '190px'
  return {
    gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`
  }
})

const handleBookClick = (book) => {
  emit('book-click', book)
}

const formatNumber = (num) => {
  if (!num) return '0'
  return num > 9999 ? (num / 10000).toFixed(1) + 'w' : num
}
</script>

<style scoped lang="scss">
.book-grid-container {
  width: 100%;
  /* 移除原有的背景色和 padding，让其融入页面背景 */
}

/* 头部样式 - 极简风格 */
.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;

  .section-title {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
    position: relative;
    display: inline-block;
  }

  .view-more-btn {
    font-size: 14px;
    color: #8590a6;
    transition: color 0.3s;
    padding: 0;
    height: auto;

    &:hover {
      color: #409eff;
      background: transparent;
    }

    .icon-right {
      margin-left: 4px;
      transition: transform 0.3s;
    }

    &:hover .icon-right {
      transform: translateX(4px);
    }
  }
}

/* 网格布局 */
.books-layout {
  display: grid;
  gap: 24px;
  /* 更大的间距，更有呼吸感 */
  width: 100%;
}

/* 卡片通用样式 */
.book-card {
  position: relative;
  border-radius: 16px;
  /* 更大的圆角 */
  background: #fff;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  overflow: hidden;

  /* 默认状态下几乎不可见的阴影，保持干净 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);

    .cover-wrapper .book-cover {
      transform: scale(1.08);
    }

    .hover-overlay {
      opacity: 1;
    }
  }
}

/* 封面区域 */
.cover-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  /* 锁定黄金比例，防止图片拉伸或参差不齐 */
  overflow: hidden;
  background-color: #f5f7fa;

  .book-cover {
    width: 100%;
    height: 100%;
    transition: transform 0.5s ease;
    display: block;
  }

  /* 评分角标 */
  .rating-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    color: #ffb433;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 4px;
    z-index: 2;
  }

  /* 悬浮遮罩 */
  .hover-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;

    .read-btn {
      font-weight: 600;
      padding: 8px 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transform: translateY(10px);
      transition: transform 0.3s;
    }
  }

  &:hover .read-btn {
    transform: translateY(0);
  }

  .image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    color: #dcdfe6;
    font-size: 24px;
  }
}

/* 信息区域 */
.info-wrapper {
  padding: 16px;

  .book-title {
    font-size: 16px;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 6px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .book-author {
    font-size: 13px;
    color: #8590a6;
    margin-bottom: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .book-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .mini-tag {
      font-size: 11px;
      color: #8590a6;
      background: #f4f4f5;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .price {
      color: #f56c6c;
      font-weight: 600;
      font-size: 15px;

      .symbol {
        font-size: 12px;
        margin-right: 1px;
      }
    }

    .free-badge {
      color: #67c23a;
      font-size: 13px;
      font-weight: 600;
    }
  }
}

/* 迷你风格 (用于侧边栏或密集展示) */
.style-premium-mini {
  border-radius: 12px;

  .info-wrapper {
    padding: 12px;

    .book-title {
      font-size: 14px;
    }

    .book-author {
      margin-bottom: 8px;
      font-size: 12px;
    }
  }
}

/* 骨架屏样式 */
.skeleton-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  /* 默认对齐 */
  gap: 24px;
}

.skeleton-card {
  .skeleton-cover {
    width: 100%;
    aspect-ratio: 2 / 3;
    border-radius: 16px;
  }
}

.empty-wrapper {
  padding: 60px 0;
  text-align: center;
}

/* 响应式微调 */
@media (max-width: 768px) {
  .books-layout {
    gap: 16px;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
  }

  .grid-header .section-title {
    font-size: 20px;
  }

  .info-wrapper {
    padding: 12px;

    .book-title {
      font-size: 14px;
    }
  }
}
</style>
