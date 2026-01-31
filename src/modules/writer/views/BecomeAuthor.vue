<template>
  <div class="become-author-page">
    <div class="container">
      <!-- 结果展示卡片 -->
      <el-result icon="warning" title="成为作者" sub-title="发布3部作品即可申请成为作者">
        <template #extra>
          <div class="role-info-card">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="当前角色">
                <el-tag type="info" size="large">读者</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="所需角色">
                <el-tag type="success" size="large">作者</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="已发布作品">
                <span class="works-count">{{ publishedWorksCount }}</span>
                <span class="works-target"> / 3</span>
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
              去发布作品
            </el-button>
            <el-button size="large" @click="goToBookstore">
              <el-icon><House /></el-icon>
              返回书城
            </el-button>
            <!-- 当作品数满足条件时显示申请按钮 -->
            <el-button
              v-if="canApply"
              type="success"
              size="large"
              @click="applyForAuthor"
            >
              <el-icon><Check /></el-icon>
              申请成为作者
            </el-button>
          </div>

          <!-- 提示信息 -->
          <el-alert
            v-if="canApply"
            title="您已满足成为作者的条件！"
            type="success"
            :closable="false"
            show-icon
            style="margin-top: 20px;"
          />
          <el-alert
            v-else
            :title="`再发布 ${3 - publishedWorksCount} 部作品即可申请成为作者`"
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { Edit, House, Check } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// 已发布作品数量
const publishedWorksCount = ref(0)

// 进度百分比
const progressPercentage = computed(() => {
  return Math.min((publishedWorksCount.value / 3) * 100, 100)
})

// 进度条颜色
const progressColor = computed(() => {
  if (progressPercentage.value >= 100) return '#67c23a'
  if (progressPercentage.value >= 66) return '#409eff'
  if (progressPercentage.value >= 33) return '#e6a23c'
  return '#f56c6c'
})

// 是否可以申请成为作者
const canApply = computed(() => {
  return publishedWorksCount.value >= 3
})

// 获取已发布作品数量
const fetchPublishedWorksCount = async () => {
  try {
    const token = localStorage.getItem('qingyu_token')
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
  try {
    const token = localStorage.getItem('qingyu_token')
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
      await authStore.fetchUserInfo()
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
