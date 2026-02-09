<!--
  ⚠️ 备用版本 - 已弃用

  此文件是 WriterLayout 的旧版本（使用 Tailwind 样式），目前未被项目引用。

  📍 当前使用版本：
  src/modules/writer/layouts/WriterLayout.vue

  📌 引用位置：
  src/modules/writer/routes.ts

  🔄 版本差异：
  - 此版本：Tailwind 样式，导航简单
  - 当前版本：CSS 变量样式，完整导航（创作工作台、发布管理、稿费收入）
-->
<template>
  <div class="writer-layout min-h-screen bg-gray-100">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-8">
            <router-link to="/bookstore" class="flex items-center space-x-2">
              <div class="text-2xl font-bold text-primary-600">青羽</div>
              <span class="text-gray-600 text-sm">创作中心</span>
            </router-link>

            <!-- 导航菜单 -->
            <nav class="hidden md:flex items-center space-x-6">
              <router-link
                to="/writer/projects"
                class="text-gray-700 hover:text-primary-600 transition-colors"
              >
                我的项目
              </router-link>
              <router-link
                to="/writer/statistics"
                class="text-gray-700 hover:text-primary-600 transition-colors"
              >
                数据统计
              </router-link>
              <router-link
                to="/bookstore"
                class="text-gray-700 hover:text-primary-600 transition-colors"
              >
                返回书城
              </router-link>
            </nav>
          </div>

          <!-- 用户菜单 -->
          <div class="flex items-center space-x-4">
            <el-avatar
              :size="36"
              :src="userStore.avatar"
            >
              <template #icon>
                <QyIcon name="UserFilled" />
              </template>
            </el-avatar>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { QyIcon } from '@/design-system/components'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>
