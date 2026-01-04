<template>
  <div class="follow-list-view">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-left">
          <h1>{{ pageTitle }}</h1>
          <span class="count">{{ totalCount }} 人</span>
        </div>
        <div class="header-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索用户"
            :prefix-icon="Search"
            clearable
            @input="handleSearch"
          />
        </div>
      </div>

      <!-- 标签切换 -->
      <div class="tabs-wrapper">
        <div class="tabs">
          <div
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-item"
            :class="{ active: currentTab === tab.key }"
            @click="handleTabChange(tab.key)"
          >
            {{ tab.label }}
            <span v-if="tab.count" class="tab-count">({{ tab.count }})</span>
          </div>
        </div>
      </div>

      <!-- 列表内容 -->
      <div v-loading="loading" class="list-content">
        <div v-if="list.length > 0" class="user-list">
          <div
            v-for="item in list"
            :key="item.id"
            class="user-item"
          >
            <div class="user-avatar" @click="goToUserPage(item.id)">
              <el-avatar :size="60" :src="item.avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
            </div>

            <div class="user-info">
              <div class="user-name" @click="goToUserPage(item.id)">
                {{ item.nickname || item.username }}
                <el-tag v-if="item.isMutual" type="danger" size="small" class="mutual-tag">
                  互关
                </el-tag>
              </div>
              <div v-if="item.bio" class="user-bio">{{ item.bio }}</div>
              <div class="user-stats">
                <span>{{ item.followerCount || 0 }} 粉丝</span>
                <span>{{ item.followingCount || 0 }} 关注</span>
              </div>
            </div>

            <div class="user-action">
              <FollowButton
                :user-id="item.id"
                :is-following="item.isFollowing"
                :is-mutual="item.isMutual"
                :show-text="true"
                @follow="handleFollow"
                @unfollow="handleUnfollow"
              />
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty
          v-else-if="!loading"
          :description="emptyText"
          :image-size="120"
        >
          <template #image>
            <el-icon :size="120" color="#ddd">
              <User />
            </el-icon>
          </template>
        </el-empty>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalCount"
          :page-sizes="[20, 40, 60]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, User } from '@element-plus/icons-vue'
import FollowButton from '../components/FollowButton.vue'
import { useSocialStore } from '@/stores/social'
import { ElMessage } from 'element-plus'
import { followAPI } from '@/modules/social/api/follow'

interface UserItem {
  id: string
  username: string
  nickname?: string
  avatar?: string
  bio?: string
  followerCount: number
  followingCount: number
  isFollowing?: boolean
  isMutual?: boolean
}

const route = useRoute()
const router = useRouter()
const socialStore = useSocialStore()

const loading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const list = ref<UserItem[]>([])

const targetUserId = ref<string>('')
const currentTab = ref<'followers' | 'following' | 'mutual'>('followers')

// 标签配置
const tabs = computed(() => [
  {
    key: 'followers',
    label: '粉丝',
    count: socialStore.getStats(targetUserId.value)?.followersCount || 0
  },
  {
    key: 'following',
    label: '关注',
    count: socialStore.getStats(targetUserId.value)?.followingCount || 0
  },
  {
    key: 'mutual',
    label: '互关',
    count: 0 // 需要单独计算
  }
])

const pageTitle = computed(() => {
  const titleMap = {
    followers: '粉丝列表',
    following: '关注列表',
    mutual: '互关列表'
  }
  return titleMap[currentTab.value]
})

const emptyText = computed(() => {
  const textMap = {
    followers: '暂无粉丝',
    following: '还没有关注任何人',
    mutual: '暂无互相关注'
  }
  return textMap[currentTab.value]
})

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    let response
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value || undefined
    }

    if (currentTab.value === 'followers') {
      response = await followAPI.getFollowers(targetUserId.value, params)
    } else if (currentTab.value === 'following') {
      response = await followAPI.getFollowing(targetUserId.value, params)
    } else {
      // 互关列表需要前端过滤
      const followersRes = await followAPI.getFollowers(targetUserId.value, params)
      const followingRes = await followAPI.getFollowing(targetUserId.value, params)

      // 合并并筛选互相关注的用户
      if (followersRes.code === 200 && followingRes.code === 200) {
        const followersList = Array.isArray(followersRes.data)
          ? followersRes.data
          : followersRes.data?.list || []
        const followingList = Array.isArray(followingRes.data)
          ? followingRes.data
          : followingRes.data?.list || []

        const followingIds = new Set(followingList.map((u: any) => u.id))
        const mutualUsers = followersList.filter((u: any) => followingIds.has(u.id))

        list.value = mutualUsers.map((u: any) => ({
          ...u,
          isMutual: true
        }))
        totalCount.value = mutualUsers.length
      }
      loading.value = false
      return
    }

    if (response.code === 200 && response.data) {
      const data = Array.isArray(response.data) ? response.data : response.data.list || []
      list.value = data.map((u: any) => ({
        ...u,
        isMutual: socialStore.isMutualFollow(u.id)
      }))
      totalCount.value = response.data.total || data.length
    }
  } catch (error) {
    console.error('[FollowListView] 加载列表失败:', error)
    ElMessage.error('加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 切换标签
const handleTabChange = (tab: 'followers' | 'following' | 'mutual') => {
  currentTab.value = tab
  currentPage.value = 1
  loadUserList()
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadUserList()
}

// 页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadUserList()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 每页数量变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadUserList()
}

// 关注用户
const handleFollow = (userId: string) => {
  // 更新列表中该用户的状态
  const user = list.value.find(u => u.id === userId)
  if (user) {
    user.isFollowing = true
  }
}

// 取消关注
const handleUnfollow = (userId: string) => {
  const user = list.value.find(u => u.id === userId)
  if (user) {
    user.isFollowing = false

    // 如果是互关列表，移除该用户
    if (currentTab.value === 'mutual') {
      list.value = list.value.filter(u => u.id !== userId)
      totalCount.value--
    }
  }
}

// 跳转到用户页面
const goToUserPage = (userId: string) => {
  router.push(`/account/user/${userId}`)
}

onMounted(async () => {
  // 从路由获取目标用户ID
  targetUserId.value = (route.params.userId || route.query.userId) as string || ''

  // 如果没有指定用户ID，使用当前登录用户的ID
  if (!targetUserId.value) {
    // TODO: 从 auth store 获取当前用户ID
    return
  }

  // 加载关注统计
  await socialStore.fetchFollowStats(targetUserId.value)

  // 从路由获取初始标签
  const tab = route.params.tab as string || route.query.tab as string
  if (tab && ['followers', 'following', 'mutual'].includes(tab)) {
    currentTab.value = tab as any
  }

  // 加载列表
  await loadUserList()
})

// 监听路由变化
watch(() => route.params.userId, (newUserId) => {
  if (newUserId) {
    targetUserId.value = newUserId as string
    loadUserList()
  }
})
</script>

<style scoped lang="scss">
.follow-list-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px 0 40px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .header-left {
    display: flex;
    align-items: baseline;
    gap: 12px;

    h1 {
      font-size: 24px;
      font-weight: 700;
      color: #303133;
      margin: 0;
    }

    .count {
      font-size: 14px;
      color: #909399;
    }
  }

  .header-actions {
    :deep(.el-input) {
      width: 250px;
    }
  }
}

.tabs-wrapper {
  margin-bottom: 20px;
  background: #fff;
  border-radius: 8px;
  padding: 12px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .tabs {
    display: flex;
    gap: 8px;

    .tab-item {
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 14px;
      color: #606266;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: #f5f7fa;
      }

      &.active {
        background: var(--el-color-primary);
        color: #fff;
      }

      .tab-count {
        margin-left: 4px;
        font-size: 12px;
        opacity: 0.8;
      }
    }
  }
}

.list-content {
  min-height: 400px;
}

.user-list {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  gap: 16px;
  transition: background 0.3s;

  &:hover {
    background: #f5f7fa;
  }

  &:last-child {
    border-bottom: none;
  }

  .user-avatar {
    cursor: pointer;
    flex-shrink: 0;
  }

  .user-info {
    flex: 1;
    min-width: 0;

    .user-name {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;

      &:hover {
        color: var(--el-color-primary);
      }

      .mutual-tag {
        font-size: 12px;
      }
    }

    .user-bio {
      font-size: 13px;
      color: #909399;
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-stats {
      font-size: 12px;
      color: #909399;
      display: flex;
      gap: 16px;

      span {
        display: inline-flex;
        align-items: center;
      }
    }
  }

  .user-action {
    flex-shrink: 0;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

// 响应式
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 16px;

    .header-actions :deep(.el-input) {
      width: 100%;
    }
  }

  .user-item {
    padding: 16px;

    .user-avatar :deep(.el-avatar) {
      width: 50px !important;
      height: 50px !important;
    }

    .user-info {
      .user-name {
        font-size: 14px;
      }

      .user-bio {
        font-size: 12px;
      }

      .user-stats {
        flex-direction: column;
        gap: 4px;
        font-size: 11px;
      }
    }
  }

  .pagination {
    :deep(.el-pagination) {
      .el-pagination__sizes {
        display: none;
      }
    }
  }
}
</style>
