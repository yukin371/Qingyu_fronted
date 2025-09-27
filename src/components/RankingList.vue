<template>
  <div class="ranking-list">
    <div class="ranking-header">
      <h3 class="ranking-title">
        <el-icon class="title-icon">
          <Trophy v-if="type === 'realtime'" />
          <Calendar v-else-if="type === 'weekly'" />
          <Clock v-else-if="type === 'monthly'" />
          <Star v-else />
        </el-icon>
        {{ getRankingTitle() }}
      </h3>
      <el-button 
        type="text" 
        size="small" 
        @click="$emit('view-more')"
        class="view-more-btn"
      >
        查看更多
        <el-icon><ArrowRight /></el-icon>
      </el-button>
    </div>

    <div class="ranking-content" v-loading="loading">
      <div 
        v-for="(item, index) in displayItems" 
        :key="item.id"
        class="ranking-item"
        @click="handleItemClick(item)"
      >
        <div class="rank-number" :class="getRankClass(index + 1)">
          {{ index + 1 }}
        </div>
        
        <div class="book-cover">
          <img 
            :src="item.book?.cover || '/default-book-cover.svg'" 
            :alt="item.book?.title"
            class="cover-image"
            @error="handleImageError"
          />
        </div>
        
        <div class="book-info">
          <h4 class="book-title">{{ item.book?.title || '未知书籍' }}</h4>
          <p class="book-author">{{ item.book?.author || '未知作者' }}</p>
          <div class="book-stats">
            <span class="stat-item">
              <el-icon><View /></el-icon>
              {{ formatNumber(item.viewCount) }}
            </span>
            <span class="stat-item">
              <el-icon><Star /></el-icon>
              {{ formatNumber(item.likeCount) }}
            </span>
            <span class="score">{{ item.score?.toFixed(1) || '0.0' }}</span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && displayItems.length === 0" class="empty-state">
        <el-empty description="暂无榜单数据" />
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useBookstoreStore } from '@/stores/bookstore'

export default {
  name: 'RankingList',
  props: {
    type: {
      type: String,
      required: true,
      validator: (value) => ['realtime', 'weekly', 'monthly', 'newbie'].includes(value)
    },
    items: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    maxItems: {
      type: Number,
      default: 10
    }
  },
  emits: ['view-more', 'item-click'],
  setup(props, { emit }) {
    const bookstoreStore = useBookstoreStore()

    const displayItems = computed(() => {
      return props.items.slice(0, props.maxItems)
    })

    const getRankingTitle = () => {
      const titles = {
        realtime: '实时榜',
        weekly: '周榜',
        monthly: '月榜',
        newbie: '新人榜'
      }
      return titles[props.type] || '榜单'
    }

    const getRankClass = (rank) => {
      if (rank === 1) return 'rank-first'
      if (rank === 2) return 'rank-second'
      if (rank === 3) return 'rank-third'
      return 'rank-normal'
    }

    const formatNumber = (num) => {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + 'w'
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k'
      }
      return num?.toString() || '0'
    }

    const handleItemClick = async (item) => {
      // 增加书籍浏览量
      if (item.book?.id) {
        await bookstoreStore.incrementBookView(item.book.id)
      }
      
      emit('item-click', item)
    }

    const handleImageError = (event) => {
      // 图片加载失败时使用默认图片
      event.target.src = '/default-book-cover.svg'
    }

    return {
      displayItems,
      getRankingTitle,
      getRankClass,
      formatNumber,
      handleItemClick,
      handleImageError
    }
  }
}
</script>

<style scoped>
.ranking-list {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.ranking-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: #409eff;
}

.view-more-btn {
  color: #409eff;
  padding: 0;
}

.ranking-content {
  min-height: 200px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.ranking-item:hover {
  background-color: #f8f9fa;
  border-radius: 6px;
  margin: 0 -8px;
  padding: 12px 8px;
}

.ranking-item:last-child {
  border-bottom: none;
}

.rank-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  margin-right: 12px;
  border-radius: 4px;
}

.rank-first {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #b8860b;
}

.rank-second {
  background: linear-gradient(135deg, #c0c0c0, #e5e5e5);
  color: #696969;
}

.rank-third {
  background: linear-gradient(135deg, #cd7f32, #daa520);
  color: #8b4513;
}

.rank-normal {
  background: #f0f0f0;
  color: #666;
}

.book-cover {
  width: 40px;
  height: 56px;
  margin-right: 12px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-info {
  flex: 1;
  min-width: 0;
}

.book-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #999;
}

.score {
  color: #409eff;
  font-weight: 500;
}

.empty-state {
  padding: 40px 0;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .ranking-list {
    background: #1a1a1a;
    color: #e0e0e0;
  }
  
  .ranking-title {
    color: #e0e0e0;
  }
  
  .book-title {
    color: #e0e0e0;
  }
  
  .ranking-item:hover {
    background-color: #2a2a2a;
  }
}
</style>