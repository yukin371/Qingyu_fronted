<template>
  <div class="main-layout">
    <AppHeader />
    <main class="content">
      <router-view />
    </main>
    <BackTop />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/Layout/Header.vue'
import BackTop from '@/design-system/other/BackTop/BackTop.vue'
</script>

<style scoped lang="scss">
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.content {
  flex: 1;
}
</style>
