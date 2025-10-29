<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center px-4">
      <!-- 404图标 -->
      <div class="mb-8">
        <div class="text-9xl font-bold text-gray-300 mb-4">404</div>
        <el-icon :size="100" class="text-gray-400">
          <QuestionFilled />
        </el-icon>
      </div>

      <!-- 提示信息 -->
      <h1 class="text-3xl font-bold text-gray-900 mb-4">页面不存在</h1>
      <p class="text-gray-600 mb-8 max-w-md mx-auto">
        抱歉，您访问的页面不存在或已被删除。
        <br />
        请检查URL是否正确，或返回首页继续浏览。
      </p>

      <!-- 操作按钮 -->
      <div class="flex items-center justify-center space-x-4">
        <el-button type="primary" size="large" @click="goHome">
          返回首页
        </el-button>
        <el-button size="large" @click="goBack">
          返回上一页
        </el-button>
      </div>

      <!-- 快速链接 -->
      <div class="mt-12">
        <p class="text-sm text-gray-500 mb-4">您可能在寻找：</p>
        <div class="flex items-center justify-center space-x-6 text-sm">
          <router-link to="/bookstore" class="text-blue-600 hover:text-blue-700">
            书城首页
          </router-link>
          <router-link
            v-if="userStore.isLoggedIn"
            to="/profile"
            class="text-blue-600 hover:text-blue-700"
          >
            个人中心
          </router-link>
          <router-link
            v-if="userStore.isWriter"
            to="/writer/projects"
            class="text-blue-600 hover:text-blue-700"
          >
            创作中心
          </router-link>
          <router-link
            v-if="userStore.isLoggedIn"
            to="/reading-history"
            class="text-blue-600 hover:text-blue-700"
          >
            阅读历史
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { QuestionFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

function goHome() {
  router.push('/bookstore')
}

function goBack() {
  router.go(-1)
}
</script>




