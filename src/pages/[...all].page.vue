<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面未找到</p>
    <RouterLink to="/bookstore">返回首页</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped lang="scss">
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
}
h1 {
  font-size: 72px;
  margin: 0;
}
</style>
