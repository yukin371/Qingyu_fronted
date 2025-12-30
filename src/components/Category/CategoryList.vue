<template>
  <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
    <div
      v-for="category in categories"
      :key="category.id"
      class="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow text-center"
      @click="handleCategoryClick(category.id)"
    >
      <!-- 图标 -->
      <div
        v-if="category.icon"
        class="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl"
      >
        {{ category.icon }}
      </div>
      <div
        v-else
        class="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center"
      >
        <el-icon :size="24" class="text-white"><Grid /></el-icon>
      </div>

      <!-- 分类名称 -->
      <h3 class="text-sm font-bold text-gray-900 mb-1 truncate">
        {{ category.name }}
      </h3>

      <!-- 书籍数量 -->
      <p class="text-xs text-gray-500">{{ category.bookCount }} 本</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Grid } from '@element-plus/icons-vue'
import type { Category } from '@/types/bookstore'

interface Props {
  categories: Category[]
}

defineProps<Props>()

const router = useRouter()

function handleCategoryClick(categoryId: string) {
  router.push(`/bookstore/category/${categoryId}`)
}
</script>













