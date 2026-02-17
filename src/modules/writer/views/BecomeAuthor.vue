<template>
  <div class="become-author-page">
    <div class="container">
      <!-- 结果展示卡片 -->
      <el-result icon="info" title="作者工作台开放" sub-title="读者可直接创作，首次发布后自动获得作者身份">
        <template #extra>
          <div class="role-info-card">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="当前角色">
                <el-tag :type="hasAuthorRole ? 'success' : 'info'" size="large">
                  {{ hasAuthorRole ? '作者' : '读者' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="所需角色">
                <el-tag type="success" size="large">作者</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="已发布作品">
                <span class="works-count">{{ publishedWorksCount }}</span>
                <span class="works-target"> / 首次发布解锁</span>
                <el-progress
                  :percentage="progressPercentage"
                  :color="progressColor"
                  :show-text="false"
                  style="margin-left: 12px; width: 100px;"
                />
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button type="primary" size="large" @click="goToPublish">
              <el-icon><Edit /></el-icon>
              进入创作工作台
            </el-button>
            <el-button size="large" @click="goToBookstore">
              <el-icon><House /></el-icon>
              返回书城
            </el-button>
            <el-button
              v-if="!hasAuthorRole && canApply"
              type="success"
              size="large"
              @click="applyForAuthor"
            >
              <el-icon><Check /></el-icon>
              手动同步作者身份
            </el-button>
          </div>

          <!-- 提示信息 -->
          <el-alert
            v-if="hasAuthorRole"
            title="当前账号已具备作者身份，可使用发布管理与数据统计功能。"
            type="success"
            :closable="false"
            show-icon
            style="margin-top: 20px;"
          />
          <el-alert
            v-else
            title="发布任意作品后，系统将自动为您增加作者身份。"
            type="info"
            :closable="false"
            show-icon
            style="margin-top: 20px;"
          />
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { Edit, House, Check } from '@element-plus/icons-vue'
import { useWriterStore } from '@/stores/writer'
import { isTestModeActive } from '@/router/test-mode-guard'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const writerStore = useWriterStore()
const isTestMode = computed(() => route.query.test === 'true' || isTestModeActive())

// 已发布作品数量
const publishedWorksCount = ref(0)
const hasAuthorRole = computed(() => authStore.hasAuthorRole)

// 进度百分比
const progressPercentage = computed(() => {
  return publishedWorksCount.value > 0 ? 100 : 0
})

// 进度条颜色
const progressColor = computed(() => {
  if (progressPercentage.value >= 100) return '#67c23a'
  return '#f56c6c'
})

// 是否可以申请成为作者
const canApply = computed(() => {
  return publishedWorksCount.value > 0
})

// 获取已发布作品数量
const fetchPublishedWorksCount = async () => {
  if (isTestMode.value) {
    try {
      await writerStore.fetchProjects()
      publishedWorksCount.value = (writerStore.projectList || []).filter((item: any) => {
        const status = (item.status || '').toString().toLowerCase()
        return status === 'published' || status === 'completed'
      }).length
    } catch {
      publishedWorksCount.value = 1
    }
    if (publishedWorksCount.value > 0) {
      authStore.promoteToAuthorByPublishing(false)
    }
    return
  }

  try {
    const token = localStorage.getItem('qingyu_token') || localStorage.getItem('token')
    if (!token) {
      publishedWorksCount.value = 0
      return
    }

    const response = await fetch('/api/v1/user/stats/works', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      publishedWorksCount.value = data.data?.published_count || 0
      if (publishedWorksCount.value > 0) {
        authStore.promoteToAuthorByPublishing(false)
      }
    }
  } catch (error) {
    console.error('获取作品数量失败:', error)
    publishedWorksCount.value = 0
  }
}

// 去发布作品
const goToPublish = () => {
  router.push('/writer/projects')
}

// 返回书城
const goToBookstore = () => {
  router.push('/bookstore')
}

// 申请成为作者
const applyForAuthor = async () => {
  if (isTestMode.value || canApply.value) {
    authStore.promoteToAuthorByPublishing(false)
    ElMessage.success('作者身份已同步')
    router.push('/writer/dashboard')
    return
  }

  try {
    const token = localStorage.getItem('qingyu_token') || localStorage.getItem('token')
    const response = await fetch('/api/v1/user/upgrade-role', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        targetRole: 'author'
      })
    })

    if (response.ok) {
      ElMessage.success('申请成为作者成功！')
      // 更新用户信息
      await authStore.getUserInfo()
      // 跳转到作者工作台
      router.push('/writer/dashboard')
    } else {
      const data = await response.json()
      ElMessage.error(data.message || '申请失败，请稍后重试')
    }
  } catch (error) {
    console.error('申请成为作者失败:', error)
    ElMessage.error('申请失败，请稍后重试')
  }
}

onMounted(() => {
  fetchPublishedWorksCount()
})
</script>

<style scoped lang="scss">
.become-author-page {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  width: 100%;
  max-width: 600px;
}

.role-info-card {
  width: 100%;
  margin: 24px 0;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.works-count {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.works-target {
  font-size: 16px;
  color: #909399;
  margin-left: 4px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

:deep(.el-result) {
  padding: 40px 20px;
}

:deep(.el-result__icon) {
  font-size: 80px;
}

:deep(.el-result__title) {
  font-size: 28px;
  margin-top: 20px;
}

:deep(.el-result__subtitle) {
  font-size: 16px;
  margin-top: 12px;
}
</style>
