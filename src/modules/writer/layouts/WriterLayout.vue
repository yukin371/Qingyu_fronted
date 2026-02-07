<template>
  <div class="writer-layout">
    <header class="writer-header">
      <div class="writer-header-inner">
        <router-link to="/bookstore" class="brand">青羽创作中心</router-link>
        <nav class="writer-nav">
          <router-link to="/writer/dashboard" class="writer-nav-link">创作工作台</router-link>
          <router-link to="/writer/projects" class="writer-nav-link">我的项目</router-link>
          <router-link to="/writer/publish" class="writer-nav-link">发布管理</router-link>
          <router-link to="/writer/statistics" class="writer-nav-link">数据统计</router-link>
          <router-link to="/writer/revenue" class="writer-nav-link">稿费收入</router-link>
        </nav>
      </div>
    </header>
    <div class="writer-layout-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
// 这里可以处理写作中心通用的逻辑，比如检查是否申请成为了作家
</script>

<style scoped>
.writer-layout {
  min-height: 100vh;
  background-color: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
}

.writer-header {
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  position: sticky;
  top: 0;
  z-index: 30;
}

.writer-header-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.brand {
  font-weight: 700;
  color: var(--el-color-primary);
  text-decoration: none;
}

.writer-nav {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.writer-nav-link {
  color: var(--el-text-color-regular);
  text-decoration: none;
  font-size: 14px;
}

.writer-nav-link.router-link-active {
  color: var(--el-color-primary);
  font-weight: 600;
}

.writer-layout-content {
  flex: 1;
  position: relative;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
