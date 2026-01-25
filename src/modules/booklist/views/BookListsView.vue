<template>
  <div class="book-lists-view">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>书单广场</h1>
        <el-button type="primary" @click="showCreate = true">
          <QyIcon name="Plus"  />
          创建书单
        </el-button>
      </div>

      <!-- 书单列表占位 -->
      <div class="booklists-placeholder">
        <el-empty description="书单系统开发中，敬请期待...">
          <template #image>
            <el-icon :size="120" color="#ddd">
              <Collection />
            </el-icon>
          </template>
        </el-empty>
      </div>

      <!-- 创建书单对话框占位 -->
      <el-dialog v-model="showCreate" title="创建书单" width="500px">
        <el-empty description="书单创建表单开发中..." />
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyIcon } from '@/design-system/components'
const showCreate = ref(false)
</script>

<style scoped lang="scss">
.book-lists-view {
  min-height: 100vh;
  background: #f8f9fb;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
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
  border-radius: 20px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
  }
}

.booklists-placeholder {
  padding: 60px 20px;
  background: #fff;
  border-radius: 20px;
  text-align: center;
}
</style>
