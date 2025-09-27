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
              <span class="stat-item">
                <el-icon><Star /></el-icon>
                {{ formatNumber(book.likeCount) }}
              </span>
            </div>
            
            <div class="book-rating" v-if="book.rating">
              <el-rate 
                :model-value="book.rating" 
                disabled 
                size="small"
                :max="5"
                show-score
                text-color="#ff9900"
              />
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

      <!-- 空状态 -->
      <div v-if="!loading && displayBooks.length === 0" class="empty-state">
        <el-empty description="暂无书籍数据" />
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useBookstoreStore } from '@/stores/bookstore'

export default {
  name: 'BookGrid',
  props: {
    title: {
      type: String,
      default: ''
    },
    books: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    maxItems: {
      type: Number,
      default: 8
    },
    showMore: {
      type: Boolean,
      default: true
    },
    columns: {
      type: Number,
      default: 4
    }
  },
  emits: ['view-more', 'book-click'],
  setup(props, { emit }) {
    const bookstoreStore = useBookstoreStore()

    const displayBooks = computed(() => {
      return props.books.slice(0, props.maxItems)
    })

    const formatNumber = (num) => {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w'
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k'
      }
      return num?.toString() || '0'
    }

    const handleBookClick = async (book) => {
      // 增加书籍浏览量
      await bookstoreStore.incrementBookView(book.id)
      
      emit('book-click', book)
    }

    const handleImageError = (event) => {
      // 图片加载失败时使用默认图片
      event.target.src = '/default-book-cover.svg'
    }

    return {
      displayBooks,
      formatNumber,
      handleBookClick,
      handleImageError
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
  background: rgba(0, 0, 0, 0.5);
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
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.book-author {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-meta {
  margin-bottom: 8px;
}

.book-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  margin-bottom: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #999;
}

.book-rating {
  margin-bottom: 8px;
}

.book-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.empty-state {
  grid-column: 1 / -1;
  padding: 40px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .book-list {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }
  
  .book-cover-container {
    height: 200px;
  }
  
  .book-title {
    font-size: 14px;
  }
  
  .book-author {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .book-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .book-cover-container {
    height: 180px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .book-grid {
    background: #1a1a1a;
    color: #e0e0e0;
  }
  
  .grid-title {
    color: #e0e0e0;
  }
  
  .book-title {
    color: #e0e0e0;
  }
  
  .book-author {
    color: #b0b0b0;
  }
}
</style>