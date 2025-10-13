<template>
  <div class="empty-container">
    <div class="empty-content">
      <!-- 图标 -->
      <el-icon class="empty-icon" :size="iconSize">
        <component :is="iconComponent" />
      </el-icon>

      <!-- 标题 -->
      <h3 class="empty-title">{{ title }}</h3>

      <!-- 描述 -->
      <p v-if="description" class="empty-description">{{ description }}</p>

      <!-- 操作按钮 -->
      <div v-if="showAction" class="empty-action">
        <el-button type="primary" @click="handleAction">
          {{ actionText }}
        </el-button>
      </div>

      <!-- 自定义插槽 -->
      <div v-if="$slots.default" class="empty-slot">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Document,
  Search,
  FolderOpened,
  Box,
  WarnTriangleFilled
} from '@element-plus/icons-vue'

const props = defineProps({
  // 空状态类型
  type: {
    type: String,
    default: 'default', // default, search, data, folder, error
    validator: (value) => ['default', 'search', 'data', 'folder', 'error'].includes(value)
  },
  // 标题
  title: {
    type: String,
    default: ''
  },
  // 描述
  description: {
    type: String,
    default: ''
  },
  // 图标大小
  iconSize: {
    type: Number,
    default: 80
  },
  // 是否显示操作按钮
  showAction: {
    type: Boolean,
    default: false
  },
  // 操作按钮文本
  actionText: {
    type: String,
    default: '返回首页'
  }
})

const emit = defineEmits(['action'])

// 根据类型选择图标
const iconComponent = computed(() => {
  const iconMap = {
    default: Box,
    search: Search,
    data: Document,
    folder: FolderOpened,
    error: WarnTriangleFilled
  }
  return iconMap[props.type] || Box
})

// 默认标题
const title = computed(() => {
  if (props.title) return props.title

  const titleMap = {
    default: '暂无内容',
    search: '没有找到相关内容',
    data: '暂无数据',
    folder: '文件夹为空',
    error: '出错了'
  }
  return titleMap[props.type] || '暂无内容'
})

// 默认描述
const description = computed(() => {
  if (props.description) return props.description

  const descMap = {
    default: '',
    search: '换个关键词试试吧',
    data: '暂时还没有数据哦',
    folder: '还没有上传任何文件',
    error: '请稍后再试'
  }
  return descMap[props.type] || ''
})

// 处理操作按钮点击
const handleAction = () => {
  emit('action')
}
</script>

<style scoped>
.empty-container {
  width: 100%;
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  color: #c0c4cc;
  margin-bottom: 24px;
}

.empty-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.empty-description {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #909399;
  line-height: 1.6;
}

.empty-action {
  margin-bottom: 16px;
}

.empty-slot {
  width: 100%;
  margin-top: 16px;
}

/* 不同类型的图标颜色 */
.empty-container :deep(.empty-icon) {
  transition: color 0.3s;
}

/* 搜索类型 */
.empty-container[data-type="search"] :deep(.empty-icon) {
  color: #909399;
}

/* 错误类型 */
.empty-container[data-type="error"] :deep(.empty-icon) {
  color: #f56c6c;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .empty-icon {
    color: #606266;
  }

  .empty-title {
    color: #e0e0e0;
  }

  .empty-description {
    color: #909399;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .empty-icon {
    font-size: 60px !important;
  }

  .empty-title {
    font-size: 16px;
  }

  .empty-description {
    font-size: 13px;
  }
}
</style>







