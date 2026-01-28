<template>
  <div class="notification-container">
    <el-card>
      <template #header>
        <div class="header-content">
          <h3>通知中心</h3>
          <div class="header-actions">
            <el-dropdown @command="handleFilterChange">
              <span class="filter-trigger">
                {{ currentFilterText }}
                <QyIcon name="ArrowDown"  />
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="all">全部通知</el-dropdown-item>
                  <el-dropdown-item command="unread">未读通知</el-dropdown-item>
                  <el-dropdown-item command="system">系统通知</el-dropdown-item>
                  <el-dropdown-item command="comment">评论通知</el-dropdown-item>
                  <el-dropdown-item command="like">点赞通知</el-dropdown-item>
                  <el-dropdown-item command="follow">关注通知</el-dropdown-item>
                  <el-dropdown-item command="message">私信通知</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button
              type="primary"
              size="small"
              @click="handleMarkAllRead"
              :disabled="unreadCount === 0"
            >
              全部已读
            </el-button>
            <el-button
              size="small"
              @click="showSettingsDialog = true"
            >
              <QyIcon name="Setting"  />
            </el-button>
          </div>
        </div>
      </template>

      <!-- 操作栏 -->
      <div class="toolbar" v-if="selectedIds.length > 0">
        <span class="selection-info">已选择 {{ selectedIds.length }} 条通知</span>
        <div class="toolbar-actions">
          <el-button size="small" @click="handleBatchMarkRead">
            标记已读
          </el-button>
          <el-button size="small" type="danger" @click="handleBatchDelete">
            删除
          </el-button>
          <el-button size="small" @click="selectedIds = []">
            取消选择
          </el-button>
        </div>
      </div>

      <!-- 通知列表 -->
      <div class="notification-list" v-loading="loading">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'notification-item',
            { 'notification-item--unread': notification.status === 'unread' },
            { 'notification-item--selected': selectedIds.includes(notification.id) }
          ]"
          @click="handleNotificationClick(notification)"
        >
          <el-checkbox
            :model-value="selectedIds.includes(notification.id)"
            @change="handleSelectChange(notification.id, $event)"
            @click.stop
          />

          <div class="notification-icon">
            <el-icon :size="20" :color="getNotificationColor(notification.type)">
              <component :is="getNotificationIcon(notification.type)" />
            </el-icon>
          </div>

          <div class="notification-content">
            <div class="notification-title">
              <span :class="{ 'title-unread': notification.status === 'unread' }">
                {{ notification.title }}
              </span>
              <el-tag
                v-if="notification.priority === 'high'"
                type="danger"
                size="small"
              >
                重要
              </el-tag>
              <el-tag
                v-else-if="notification.priority === 'urgent'"
                type="danger"
                size="small"
                effect="dark"
              >
                紧急
              </el-tag>
            </div>
            <div class="notification-text">
              {{ notification.content }}
            </div>
            <div class="notification-meta">
              <span class="notification-time">{{ formatRelativeTime(notification.created_at) }}</span>
              <div class="notification-actions">
                <el-button
                  v-if="notification.status === 'unread'"
                  type="primary"
                  link
                  size="small"
                  @click.stop="handleMarkAsRead(notification.id)"
                >
                  标记已读
                </el-button>
                <el-button
                  type="danger"
                  link
                  size="small"
                  @click.stop="handleDelete(notification.id)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty
          v-if="!loading && notifications.length === 0"
          :description="emptyText"
        >
          <el-button v-if="currentFilter !== 'all'" type="primary" @click="handleFilterChange('all')">
            查看全部通知
          </el-button>
        </el-empty>
      </div>

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next, jumper"
        @current-change="loadNotifications"
        class="pagination"
      />
    </el-card>

    <!-- 设置对话框 -->
    <el-dialog
      v-model="showSettingsDialog"
      title="通知设置"
      width="500px"
    >
      <el-form :model="preferences" label-width="100px">
        <h4>通知渠道</h4>
        <el-form-item label="站内通知">
          <el-switch v-model="preferences.channel_enabled.in_app" />
        </el-form-item>
        <el-form-item label="邮件通知">
          <el-switch v-model="preferences.channel_enabled.email" />
        </el-form-item>
        <el-form-item label="短信通知">
          <el-switch v-model="preferences.channel_enabled.sms" />
        </el-form-item>
        <el-form-item label="推送通知">
          <el-switch v-model="preferences.channel_enabled.push" />
        </el-form-item>

        <el-divider />

        <h4>通知类型</h4>
        <el-form-item label="系统通知">
          <el-switch v-model="preferences.type_enabled.system" />
        </el-form-item>
        <el-form-item label="评论通知">
          <el-switch v-model="preferences.type_enabled.comment" />
        </el-form-item>
        <el-form-item label="点赞通知">
          <el-switch v-model="preferences.type_enabled.like" />
        </el-form-item>
        <el-form-item label="关注通知">
          <el-switch v-model="preferences.type_enabled.follow" />
        </el-form-item>
        <el-form-item label="私信通知">
          <el-switch v-model="preferences.type_enabled.message" />
        </el-form-item>

        <el-divider />

        <h4>免打扰时段</h4>
        <el-form-item label="启用免打扰">
          <el-switch v-model="quietHoursEnabled" />
        </el-form-item>
        <el-form-item label="开始时间" v-if="quietHoursEnabled">
          <el-time-picker
            v-model="quietHoursStart"
            format="HH:mm"
            value-format="HH:mm"
          />
        </el-form-item>
        <el-form-item label="结束时间" v-if="quietHoursEnabled">
          <el-time-picker
            v-model="quietHoursEnd"
            format="HH:mm"
            value-format="HH:mm"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showSettingsDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveSettings">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message, messageBox } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import {
  getNotifications,
  getUnreadCount,
  getNotificationStats,
  markAsRead,
  markMultipleAsRead,
  markAllAsRead,
  deleteNotification,
  deleteMultipleNotifications,
  clearReadNotifications,
  getNotificationPreference,
  updateNotificationPreference,
  type Notification,
  type NotificationPreference,
  type NotificationType
} from '@/modules/notification/api'

const notifications = ref<Notification[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const currentFilter = ref<string>('all')
const selectedIds = ref<string[]>([])
const unreadCount = ref(0)
const stats = ref<any>({})

const showSettingsDialog = ref(false)
const preferences = ref<NotificationPreference>({
  user_id: '',
  channel_enabled: {
    in_app: true,
    email: false,
    sms: false,
    push: false
  },
  type_enabled: {
    system: true,
    comment: true,
    like: true,
    follow: true,
    message: true,
    achievement: true
  }
})

const quietHoursEnabled = ref(false)
const quietHoursStart = ref('22:00')
const quietHoursEnd = ref('08:00')

// 当前筛选器文本
const currentFilterText = computed(() => {
  const map: Record<string, string> = {
    all: '全部通知',
    unread: '未读通知',
    system: '系统通知',
    comment: '评论通知',
    like: '点赞通知',
    follow: '关注通知',
    message: '私信通知'
  }
  return map[currentFilter.value] || '全部通知'
})

// 空状态文本
const emptyText = computed(() => {
  const map: Record<string, string> = {
    all: '暂无通知',
    unread: '暂无未读通知',
    system: '暂无系统通知',
    comment: '暂无评论通知',
    like: '暂无点赞通知',
    follow: '暂无关注通知',
    message: '暂无私信通知'
  }
  return map[currentFilter.value] || '暂无通知'
})

// 获取通知列表
const loadNotifications = async (page = currentPage.value) => {
  loading.value = true
  try {
    const params: any = {
      page,
      page_size: pageSize.value
    }

    if (currentFilter.value !== 'all') {
      if (currentFilter.value === 'unread') {
        params.status = 'unread'
      } else {
        params.type = currentFilter.value
      }
    }

    const res = await getNotifications(params)
    notifications.value = res.data?.items || []
    total.value = res.data?.total || 0
    currentPage.value = page
  } catch (error) {
    message.error('获取通知列表失败')
  } finally {
    loading.value = false
  }
}

// 获取未读数量
const loadUnreadCount = async () => {
  try {
    const res = await getUnreadCount()
    unreadCount.value = res.data?.count || 0
  } catch (error) {
    console.error('获取未读数量失败', error)
  }
}

// 筛选变更
const handleFilterChange = (filter: string) => {
  currentFilter.value = filter
  selectedIds.value = []
  currentPage.value = 1
  loadNotifications(1)
}

// 点击通知
const handleNotificationClick = (notification: Notification) => {
  if (notification.status === 'unread') {
    handleMarkAsRead(notification.id)
  }
  // 这里可以添加跳转到相关页面的逻辑
}

// 标记已读
const handleMarkAsRead = async (id: string) => {
  try {
    await markAsRead(id)
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.status = 'read'
      notification.read_at = new Date().toISOString()
    }
    loadUnreadCount()
  } catch (error) {
    message.error('标记失败')
  }
}

// 批量标记已读
const handleBatchMarkRead = async () => {
  try {
    await markMultipleAsRead(selectedIds.value)
    message.success(`已标记 ${selectedIds.value.length} 条通知为已读`)
    selectedIds.value = []
    loadNotifications(currentPage.value)
    loadUnreadCount()
  } catch (error) {
    message.error('批量标记失败')
  }
}

// 全部标记已读
const handleMarkAllRead = async () => {
  try {
    const res = await markAllAsRead()
    message.success(`已标记 ${res.data?.count || 0} 条通知为已读`)
    loadNotifications(currentPage.value)
    loadUnreadCount()
  } catch (error) {
    message.error('操作失败')
  }
}

// 删除通知
const handleDelete = async (id: string) => {
  try {
    await deleteNotification(id)
    notifications.value = notifications.value.filter(n => n.id !== id)
    total.value--
    loadUnreadCount()
  } catch (error) {
    message.error('删除失败')
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await messageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条通知吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteMultipleNotifications(selectedIds.value)
    message.success('删除成功')
    selectedIds.value = []
    loadNotifications(currentPage.value)
    loadUnreadCount()
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error('删除失败')
    }
  }
}

// 选择变更
const handleSelectChange = (id: string, checked: boolean) => {
  if (checked) {
    selectedIds.value.push(id)
  } else {
    const index = selectedIds.value.indexOf(id)
    if (index > -1) {
      selectedIds.value.splice(index, 1)
    }
  }
}

// 获取通知图标
const getNotificationIcon = (type: NotificationType) => {
  const map: Record<string, any> = {
    system: Bell,
    comment: ChatDotRound,
    like: Star,
    follow: User,
    message: Message,
    achievement: Trophy
  }
  return map[type] || Bell
}

// 获取通知颜色
const getNotificationColor = (type: NotificationType) => {
  const map: Record<string, string> = {
    system: '#409eff',
    comment: '#67c23a',
    like: '#e6a23c',
    follow: '#f56c6c',
    message: '#909399',
    achievement: '#ffd666'
  }
  return map[type] || '#409eff'
}

// 格式化相对时间
const formatRelativeTime = (date: string) => {
  const now = new Date()
  const target = new Date(date)
  const diff = now.getTime() - target.getTime()

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`
  } else {
    return target.toLocaleDateString('zh-CN')
  }
}

// 加载偏好设置
const loadPreferences = async () => {
  try {
    const res = await getNotificationPreference()
    preferences.value = res.data

    if (res.data.quiet_hours_start && res.data.quiet_hours_end) {
      quietHoursEnabled.value = true
      quietHoursStart.value = res.data.quiet_hours_start
      quietHoursEnd.value = res.data.quiet_hours_end
    }
  } catch (error) {
    console.error('获取通知设置失败', error)
  }
}

// 保存设置
const handleSaveSettings = async () => {
  try {
    const data: any = {
      channel_enabled: preferences.value.channel_enabled,
      type_enabled: preferences.value.type_enabled
    }

    if (quietHoursEnabled.value) {
      data.quiet_hours_start = quietHoursStart.value
      data.quiet_hours_end = quietHoursEnd.value
    }

    await updateNotificationPreference(data)
    message.success('设置保存成功')
    showSettingsDialog.value = false
  } catch (error) {
    message.error('保存失败')
  }
}

onMounted(() => {
  loadNotifications()
  loadUnreadCount()
  loadPreferences()
})
</script>

<style scoped lang="scss">
.notification-container {
  padding: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .filter-trigger {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border-radius: 4px;
    transition: background 0.2s;

    &:hover {
      background: var(--el-fill-color-light);
    }
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 16px;
  background: var(--el-fill-color-light);
  border-radius: 4px;

  .selection-info {
    color: var(--el-text-color-regular);
    font-size: 14px;
  }

  .toolbar-actions {
    display: flex;
    gap: 8px;
  }
}

.notification-list {
  min-height: 400px;

  .notification-item {
    display: flex;
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: var(--el-fill-color-light);
    }

    &--unread {
      background: var(--el-fill-color-extra-light);
    }

    &--selected {
      background: var(--el-color-primary-light-9);
    }

    .el-checkbox {
      margin-right: 12px;
    }

    .notification-icon {
      margin-right: 16px;
      flex-shrink: 0;
    }

    .notification-content {
      flex: 1;
      min-width: 0;

      .notification-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .title-unread {
          font-weight: 600;
        }
      }

      .notification-text {
        color: var(--el-text-color-regular);
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 8px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .notification-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .notification-time {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }

        .notification-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

// 设置对话框
h4 {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 600;
}

.el-divider {
  margin: 16px 0;
}
</style>
