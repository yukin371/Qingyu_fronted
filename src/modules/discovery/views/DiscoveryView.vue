<template>
  <div class="discovery-view">
    <div class="container">
      <!-- 推荐Banner -->
      <div class="banner-section">
        <h1 class="page-title">发现</h1>
        <p class="page-subtitle">探索更多精彩内容</p>
      </div>

      <!-- 个性化推荐 -->
      <section class="section">
        <h2 class="section-title">猜你喜欢</h2>
        <el-skeleton :loading="true" animated>
          <template #template>
            <div class="skeleton-grid">
              <el-skeleton-item v-for="i in 6" :key="i" variant="image" style="width: 100%; height: 200px; border-radius: 8px;" />
            </div>
          </template>
        </el-skeleton>
      </section>

      <!-- 新书上架 -->
      <section class="section">
        <h2 class="section-title">新书上架</h2>
        <el-skeleton :loading="true" animated>
          <template #template>
            <div class="skeleton-grid">
              <el-skeleton-item v-for="i in 4" :key="i" variant="image" style="width: 100%; height: 200px; border-radius: 8px;" />
            </div>
          </template>
        </el-skeleton>
      </section>

      <!-- 编辑推荐 -->
      <section class="section">
        <h2 class="section-title">编辑推荐</h2>
        <el-skeleton :loading="true" animated>
          <template #template>
            <div class="skeleton-grid">
              <el-skeleton-item v-for="i in 3" :key="i" variant="image" style="width: 100%; height: 200px; border-radius: 8px;" />
            </div>
          </template>
        </el-skeleton>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('发现页面加载 - 待实现完整功能')
})
</script>

<style scoped lang="scss">
.discovery-view {
  min-height: 100vh;
  background: #f8f9fb;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.banner-section {
  text-align: center;
  padding: 40px 20px;
  margin-bottom: 32px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(102, 177, 255, 0.05) 100%);
  border-radius: 20px;

  .page-title {
    font-size: 36px;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 8px 0;
  }

  .page-subtitle {
    font-size: 16px;
    color: #666;
    margin: 0;
  }
}

.section {
  margin-bottom: 40px;
  padding: 24px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);

  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 20px 0;
  }
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}
</style>
