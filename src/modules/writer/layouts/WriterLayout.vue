<template>
  <div class="writer-layout">
    <header class="writer-header">
      <div class="writer-header-inner">
        <router-link to="/bookstore" class="brand">青羽创作中心</router-link>
        <nav class="writer-nav">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            custom
            v-slot="{ navigate, isActive }"
          >
            <QyButton
              size="md"
              :variant="isActive ? 'primary' : 'secondary'"
              class="writer-nav-pill"
              @click="navigate"
            >
              <QyIcon :name="item.icon" :size="16" />
              <span>{{ item.label }}</span>
            </QyButton>
          </router-link>
        </nav>
        <div class="writer-user-actions">
          <QyButton size="md" variant="secondary" class="back-bookstore-btn" @click="goBookstore">
            <QyIcon name="ArrowLeft" :size="16" />
            返回书城
          </QyButton>
          <el-dropdown trigger="click" @command="handleUserCommand">
            <button class="avatar-trigger">
              <QyAvatar
                v-if="avatarUrl"
                type="image"
                :src="avatarUrl"
                :text="userName"
                size="md"
                color="blue"
              />
              <div v-else class="default-avatar">
                <QyIcon name="UserFilled" :size="22" />
              </div>
              <span class="user-name">{{ userName }}</span>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>
    <div class="writer-layout-content">
      <div class="writer-content-backdrop"></div>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { QyAvatar, QyButton, QyIcon } from '@/design-system/components'

const router = useRouter()
const authStore = useAuthStore()

const userName = computed(() => authStore.user?.nickname || authStore.user?.username || '用户')
const avatarUrl = computed(() => authStore.user?.avatar || '')
const navItems = [
  { label: '创作工作台', path: '/writer/dashboard', icon: 'Grid' },
  { label: '我的项目', path: '/writer/projects', icon: 'Files' },
  { label: '发布管理', path: '/writer/publish', icon: 'Upload' },
  { label: '数据统计', path: '/writer/statistics', icon: 'DataAnalysis' },
  { label: '稿费收入', path: '/writer/revenue', icon: 'Wallet' }
]

const goBookstore = () => router.push('/bookstore')
const goProfile = () => router.push('/account/profile')

const handleUserCommand = async (command: string) => {
  if (command === 'profile') {
    goProfile()
    return
  }

  if (command === 'logout') {
    try {
      await authStore.logout()
    } finally {
      router.push('/auth')
    }
  }
}
</script>

<style scoped>
.writer-layout {
  min-height: 100vh;
  background-color: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
}

.writer-header {
  background: color-mix(in oklab, var(--el-bg-color) 92%, #ffffff 8%);
  border-bottom: 1px solid var(--el-border-color-light);
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: blur(8px);
}

.writer-header-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
}

.brand {
  font-weight: 700;
  color: var(--el-color-primary);
  text-decoration: none;
  font-size: 20px;
}

.writer-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
}

.writer-nav-pill {
  min-height: 40px;
  font-size: 15px;
  letter-spacing: 0.1px;
}

.writer-nav-pill :deep(.qy-icon) {
  margin-right: 6px;
}

.writer-user-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.back-bookstore-btn {
  min-height: 40px;
  font-size: 14px;
  padding: 0 14px;
}

.avatar-trigger {
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 2px 4px;
}

.user-name {
  color: var(--el-text-color-regular);
  font-size: 14px;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.default-avatar {
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #4f7cff 0%, #3d63d6 100%);
  box-shadow: 0 8px 20px -10px rgba(59, 99, 214, 0.8);
}

.writer-layout-content {
  flex: 1;
  position: relative;
  isolation: isolate;
}

.writer-content-backdrop {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(520px 280px at 92% -8%, rgba(125, 211, 252, 0.2), transparent 70%),
    radial-gradient(420px 220px at 8% 108%, rgba(129, 140, 248, 0.15), transparent 72%),
    linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
}

@media (max-width: 960px) {
  .writer-header-inner {
    flex-wrap: wrap;
  }

  .writer-nav {
    order: 3;
    width: 100%;
    margin-top: 6px;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 2px;
  }

  .user-name {
    display: none;
  }

}
</style>
