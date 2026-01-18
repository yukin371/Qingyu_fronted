<template>
  <div class="writer-layout">
    <!-- 写作中心的公共布局结构 -->
    <!-- 比如：可以在这里加一个写作中心专属的顶部导航栏 -->
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
