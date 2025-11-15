<template>
  <div class="book-grid">
    <div class="grid-header" v-if="title">
      <h3 class="grid-title">{{ title }}</h3>
      <el-button
        type="text"
        size="small"
        @click="$emit('view-more')"
        v-if="showMore"
        class="view-more-btn"
      >
        查看更多
        <el-icon><ArrowRight /></el-icon>
      </el-button>
    </div>

    <div class="book-list" v-loading="loading">
      <div
        v-for="book in displayBooks"
        :key="book.id"
        class="book-card"
        @click="handleBookClick(book)"
      >
        <div class="book-cover-container">
          <img
            :src="book.cover || '/default-book-cover.svg'"
            :alt="book.title"
            class="book-cover"
            @error="handleImageError"
            loading="lazy"
          />
          <div class="book-overlay">
            <el-button type="primary" size="small" circle>
              <el-icon><View /></el-icon>
            </el-button>
          </div>
        </div>

        <div class="book-info">
          <h4 class="book-title" :title="book.title">{{ book.title }}</h4>
          <p class="book-author" :title="book.author">{{ book.author }}</p>

          <div class="book-meta">
            <div class="book-stats">
              <span class="stat-item">
                <el-icon><View /></el-icon>
                {{ formatNumber(book.viewCount) }}
              </span>
              <span class="stat-item" v-if="book.likeCount">
                <el-icon><Star /></el-icon>
                {{ formatNumber(book.likeCount) }}
              </span>
            </div>

            <div class="book-price" v-if="book.price !== undefined">
              <span class="price-current">
                {{ book.price === 0 ? '免费' : `¥${book.price}` }}
              </span>
              <span class="price-original" v-if="book.originalPrice && book.originalPrice > book.price">
                ¥{{ book.originalPrice }}
              </span>
            </div>
          </div>

          <div class="book-tags" v-if="book.tags && book.tags.length">
            <el-tag
              v-for="tag in book.tags.slice(0, 2)"
              :key="tag"
              size="small"
              type="info"
              effect="plain"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!displayBooks.length && !loading" class="empty-state">
      <el-empty :description="emptyText" />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { ArrowRight, View, Star } from '@element-plus/icons-vue'

export default {
  name: 'BookGrid',
  components: {
    ArrowRight,
    View,
    Star
  },
  props: {
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
    maxItems: {
      type: Number,
      default: 0
    },
    emptyText: {
      type: String,
      default: '暂无书籍'
    },
    gridCols: {
      type: Number,
      default: 5,
      validator: (value) => [3, 4, 5, 6].includes(value)
    }
  },
  emits: ['book-click', 'view-more'],
  setup(props, { emit }) {
    // 计算显示的书籍列表
    const displayBooks = computed(() => {
      if (props.maxItems > 0) {
        return props.books.slice(0, props.maxItems)
      }
      return props.books
    })

    // 处理书籍点击：仅向外发出事件，由父组件决定后续行为
    const handleBookClick = (book) => {
      emit('book-click', book)
    }

    // 处理图片加载错误
    const handleImageError = (event) => {
      event.target.src = '/default-book-cover.svg'
    }

    // 格式化数字
    const formatNumber = (num) => {
      if (!num) return '0'
      if (num < 1000) return num.toString()
      if (num < 10000) return (num / 1000).toFixed(1) + 'k'
      if (num < 100000) return (num / 10000).toFixed(1) + 'w'
      return (num / 10000).toFixed(0) + 'w'
    }

    return {
      displayBooks,
      handleBookClick,
      handleImageError,
      formatNumber
    }
  }
}
</script>

<style scoped>
.book-grid {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.grid-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.view-more-btn {
  color: #409eff;
  padding: 0;
  font-weight: 500;
}

.view-more-btn:hover {
  color: #66b1ff;
}

.book-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  min-height: 200px;
}

.book-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.book-cover-container {
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 12px;
}

.book-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.book-card:hover .book-cover {
  transform: scale(1.05);
}

.book-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.book-card:hover .book-overlay {
  opacity: 1;
}

.book-info {
  padding: 0 4px;
}

.book-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  font-size: 12px;
  color: #666;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.book-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  color: #999;
}

.stat-item .el-icon {
  font-size: 12px;
}

.book-price {
  display: flex;
  align-items: center;
  gap: 4px;
}

.price-current {
  font-size: 14px;
  font-weight: 600;
  color: #e74c3c;
}

.price-original {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

.book-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.book-tags .el-tag {
  font-size: 10px;
  height: 18px;
  line-height: 16px;
  padding: 0 4px;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: #f5f7fa;
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .book-list {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .book-grid {
    padding: 16px;
  }

  .book-list {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .book-cover-container {
    height: 200px;
  }

  .grid-title {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .book-list {
    grid-template-columns: repeat(2, 1fr);
  }

  .book-cover-container {
    height: 180px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .book-grid {
    background: #1d1e1f;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .book-card {
    background: #1d1e1f;
  }

  .grid-title {
    color: #e5eaf3;
  }

  .book-title {
    color: #e5eaf3;
  }

  .book-author {
    color: #a3a6ad;
  }

  .stat-item {
    color: #a3a6ad;
  }

  .empty-state {
    background: #2d2e2f;
  }
}
</style>
