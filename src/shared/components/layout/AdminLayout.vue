<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="admin-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <h1 v-if="!sidebarCollapsed" class="logo">青羽管理</h1>
        <h1 v-else class="logo-mini">青</h1>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <i :class="item.icon"></i>
          <span v-if="!sidebarCollapsed" class="nav-text">{{ item.label }}</span>
          <span v-if="!sidebarCollapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button class="collapse-btn" @click="toggleSidebar">
          <i :class="sidebarCollapsed ? 'el-icon-arrow-right' : 'el-icon-arrow-left'"></i>
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="admin-main">
      <!-- 顶部工具栏 -->
      <header class="admin-header">
        <div class="header-left">
          <!-- 面包屑导航 -->
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">控制台</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentPageTitle">{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- 通知图标 -->
          <el-badge :value="notificationCount" :max="99" class="notification-badge">
            <el-button :icon="Bell" circle @click="showNotifications" />
          </el-badge>

          <!-- 用户菜单 -->
          <el-dropdown @command="handleUserCommand">
            <div class="user-info">
              <el-avatar :src="userAvatar" :size="32" />
              <span class="username">{{ username }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="settings">设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="admin-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { Bell } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 侧边栏状态
const sidebarCollapsed = ref(false)

// 通知数量（示例数据）
const notificationCount = ref(5)

// 菜单项
const menuItems = ref([
  {
    path: '/admin/dashboard',
    label: '仪表板',
    icon: 'el-icon-data-analysis'
  },
  {
    path: '/admin/reviews',
    label: '内容审核',
    icon: 'el-icon-document-checked',
    badge: 12
  },
  {
    path: '/admin/withdrawals',
    label: '提现审核',
    icon: 'el-icon-wallet',
    badge: 3
  },
  {
    path: '/admin/users',
    label: '用户管理',
    icon: 'el-icon-user'
  },
  {
    path: '/admin/banners',
    label: 'Banner管理',
    icon: 'el-icon-picture'
  },
  {
    path: '/admin/announcements',
    label: '公告管理',
    icon: 'el-icon-bell'
  },
  {
    path: '/admin/system-config',
    label: '系统配置',
    icon: 'el-icon-setting'
  },
  {
    path: '/admin/logs',
    label: '操作日志',
    icon: 'el-icon-document'
  }
])

// 计算属性
const username = computed(() => authStore.userNickname)
const userAvatar = computed(() => authStore.userAvatar)

const currentPageTitle = computed(() => {
  const path = route.path
  const item = menuItems.value.find((m) => m.path === path)
  return item?.label || ''
})

// 方法
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const isActive = (path: string): boolean => {
  return route.path === path || route.path.startsWith(path + '/')
}

const showNotifications = () => {
  ElMessage.info('通知功能开发中')
}

const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      ElMessage.info('设置功能开发中')
      break
    case 'logout':
      authStore.logout()
      break
  }
}
</script>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #f5f7fa;
}

// 侧边栏样式
.admin-sidebar {
  width: 240px;
  background: linear-gradient(180deg, #1a1f3a 0%, #2d3561 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);

  &.collapsed {
    width: 64px;

    .nav-text,
    .nav-badge {
      display: none;
    }

    .nav-item {
      justify-content: center;
      padding: 0 16px;
    }
  }
}

.sidebar-header {
  padding: 24px 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .logo {
    margin: 0;
    font-size: 24px;
    font-weight: bold;
    color: #fff;
    letter-spacing: 2px;
  }

  .logo-mini {
    margin: 0;
    font-size: 24px;
    font-weight: bold;
    color: #fff;
  }
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;

  i {
    font-size: 20px;
    margin-right: 12px;
    min-width: 20px;
  }

  .nav-text {
    flex: 1;
    font-size: 14px;
  }

  .nav-badge {
    background: #f56c6c;
    color: #fff;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
    min-width: 20px;
    text-align: center;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  &.active {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #409eff;
    }
  }
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  .collapse-btn {
    width: 100%;
    padding: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #fff;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    i {
      font-size: 16px;
    }
  }
}

// 主内容区样式
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-header {
  height: 60px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-badge {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s ease;

  &:hover {
    background: #f5f7fa;
  }

  .username {
    font-size: 14px;
    color: #303133;
  }
}

.admin-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f5f7fa;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 4px;

    &:hover {
      background: #c0c4cc;
    }
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 响应式
@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
    transform: translateX(-100%);

    &:not(.collapsed) {
      transform: translateX(0);
    }
  }

  .admin-content {
    padding: 16px;
  }
}
</style>

