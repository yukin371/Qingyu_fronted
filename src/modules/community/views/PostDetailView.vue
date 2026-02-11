<template>
  <div class="post-detail-view">
    <div class="container">
      <QyEmpty description="动态详情页开发中，敬请期待...">
        <template #image>
          <QyIcon name="ChatDotRound" :size="120" color="#ddd" />
        </template>
      </QyEmpty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QyIcon, QyEmpty } from '@/design-system/components'
</script>

<style scoped lang="scss">
.post-detail-view {
  min-height: 100vh;
  background: #f8f9fb;
  padding: 20px 0;
}
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 20px;
}
</style>
