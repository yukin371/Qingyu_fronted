<template>
  <div class="community-feed-view">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>社区动态</h1>
        <QyButton variant="primary" @click="goToCreatePost">
          <QyIcon name="Plus" />
          发布动态
        </QyButton>
      </div>

      <!-- 动态列表占位 -->
      <div class="feed-placeholder">
        <QyEmpty description="社区功能开发中，敬请期待...">
          <template #image>
            <QyIcon name="ChatDotRound" :size="120" color="#ddd" />
          </template>
        </QyEmpty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { QyIcon, QyButton, QyEmpty } from '@/design-system/components'
const router = useRouter()

const goToCreatePost = () => {
  router.push('/community/post')
}
</script>

<style scoped lang="scss">
.community-feed-view {
  min-height: 100vh;
  background: #f8f9fb;
  padding: 20px 0;
}

.container {
  max-width: 800px;
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

.feed-placeholder {
  padding: 60px 20px;
  background: #fff;
  border-radius: 20px;
  text-align: center;
}
</style>
