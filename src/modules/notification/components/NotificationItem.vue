<template>
  <div
    class="notification-item"
    :class="{ unread: !notification.isRead, selected }"
    @click="handleClick"
  >
    <!-- 选择框 -->
    <el-checkbox
      v-if="showCheckbox"
      :model-value="selected"
      @change="handleSelectChange"
      @click.stop
    />

    <!-- 图标 -->
    <div class="notification-icon">
      <el-icon :size="20" :color="iconColor">
        <component :is="iconComponent" />
      </el-icon>
    </div>

    <!-- 内容 -->
    <div class="notification-content">
      <div class="notification-header">
        <span class="notification-title">{{ notification.title }}</span>
        <span class="notification-time">{{ timeAgo }}</span>
      </div>

      <div class="notification-text">{{ notification.content }}</div>

      <!-- 操作按钮 -->
      <div v-if="!notification.isRead" class="notification-actions">
        <el-button type="primary" size="small" @click.stop="handleMarkRead">
          标为已读
        </el-button>
        <el-button size="small" @click.stop="handleDelete">
          删除
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Bell,
  ChatDotRound,
  Star,
  User,
  Trophy,
  Wallet,
  Reading,
  Promotion
} from '@element-plus/icons-vue'
import type { NotificationMessage, NotificationType } from '@/types/notification'

interface Props {
  notification: NotificationMessage
  selected?: boolean
  showCheckbox?: boolean
}

interface Emits {
  (e: 'select', id: string, selected: boolean): void
  (e: 'read', id: string): void
  (e: 'delete', id: string): void
  (e: 'click', notification: NotificationMessage): void
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  showCheckbox: false
})

const emit = defineEmits<Emits>()

// 图标组件映射
const iconMap: Record<NotificationType, any> = {
  system: Bell,
  comment: ChatDotRound,
  like: Star,
  follow: User,
  reward: Wallet,
  vip: Trophy,
  achievement: Trophy,
  book_update: Reading,
  mention: Promotion
}

// 颜色映射
const colorMap: Record<NotificationType, string> = {
  system: '#409eff',
  comment: '#67c23a',
  like: '#f56c6c',
  follow: '#e6a23c',
  reward: '#f56c6c',
  vip: '#f56c6c',
  achievement: '#e6a23c',
  book_update: '#409eff',
  mention: '#409eff'
}

const iconComponent = computed(() => {
  return iconMap[props.notification.type] || Bell
})

const iconColor = computed(() => {
  return colorMap[props.notification.type] || '#909399'
})

// 相对时间
const timeAgo = computed(() => {
  const now = Date.now()
  const time = new Date(props.notification.createdAt).getTime()
  const diff = now - time

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return new Date(props.notification.createdAt).toLocaleDateString()
})

// 点击通知
const handleClick = () => {
  emit('click', props.notification)
}

// 选择状态变化
const handleSelectChange = (checked: boolean) => {
  emit('select', props.notification.id, checked)
}

// 标记已读
const handleMarkRead = () => {
  emit('read', props.notification.id)
}

// 删除
const handleDelete = () => {
  emit('delete', props.notification.id)
}
</script>

<style scoped lang="scss">
.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;
  gap: 12px;

  &:hover {
    background: #f5f7fa;
  }

  &:last-child {
    border-bottom: none;
  }

  &.unread {
    background: #ecf5ff;

    &:hover {
      background: #d9ecff;
    }

    .notification-title {
      font-weight: 600;
    }
  }

  &.selected {
    background: #fef0f0;
  }
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 50%;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  gap: 12px;
}

.notification-title {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  flex-shrink: 0;
}

.notification-time {
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
}

.notification-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
}

.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;

  .el-button {
    padding: 4px 12px;
    font-size: 12px;
  }
}

// 响应式
@media (max-width: 768px) {
  .notification-item {
    padding: 12px;

    .notification-icon {
      width: 36px;
      height: 36px;
    }
  }

  .notification-title {
    font-size: 13px;
  }

  .notification-text {
    font-size: 12px;
  }

  .notification-actions {
    flex-wrap: wrap;

    .el-button {
      flex: 1;
      min-width: 60px;
    }
  }
}
</style>
