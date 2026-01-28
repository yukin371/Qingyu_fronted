<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/bookstore" class="flex items-center space-x-2">
          <div class="text-2xl font-bold text-primary-600">青羽</div>
          <span class="text-gray-600 text-sm">写作平台</span>
        </router-link>

        <!-- 导航菜单 -->
        <nav class="hidden md:flex items-center space-x-6">
          <router-link
            to="/bookstore"
            class="text-gray-700 hover:text-primary-600 transition-colors"
          >
            书城
          </router-link>
          <router-link
            v-if="authStore.isLoggedIn"
            to="/writer/projects"
            class="text-gray-700 hover:text-primary-600 transition-colors"
          >
            创作中心
          </router-link>
          <router-link
            to="/bookstore/search"
            class="text-gray-700 hover:text-primary-600 transition-colors"
          >
            <QyIcon name="Search" :size="20" />
          </router-link>
        </nav>

        <!-- 用户菜单 -->
        <div class="flex items-center space-x-4">
          <template v-if="authStore.isLoggedIn">
            <!-- 用户下拉菜单 -->
            <el-dropdown @command="handleCommand">
              <div class="flex items-center space-x-2 cursor-pointer">
                <el-avatar
                  :size="32"
                  :src="authStore.user?.avatar"
                >
                  <QyIcon name="UserFilled" :size="20" />
                </el-avatar>
                <span class="text-sm font-medium text-gray-700">
                  {{ authStore.user?.nickname || authStore.user?.username }}
                </span>
                <QyIcon name="ArrowDown" :size="16" />
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="wallet">我的钱包</el-dropdown-item>
                  <el-dropdown-item command="writer" divided>
                    创作中心
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>

          <template v-else>
            <!-- 登录/注册按钮 -->
            <router-link to="/login">
              <el-button type="primary" plain size="small">登录</el-button>
            </router-link>
            <router-link to="/register">
              <el-button type="primary" size="small">注册</el-button>
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { messageBox } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 处理下拉菜单命令
async function handleCommand(command: string) {
  switch (command) {
    case 'profile':
      router.push('/account/profile')
      break
    case 'wallet':
      router.push('/wallet')
      break
    case 'writer':
      router.push('/writer/projects')
      break
    case 'logout':
      await handleLogout()
      break
  }
}

// 退出登录
async function handleLogout() {
  try {
    await messageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await authStore.logout()
    router.push('/bookstore')
  } catch (error) {
    // 用户取消
  }
}
</script>

