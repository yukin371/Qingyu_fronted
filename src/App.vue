<template>
  <div id="app">
    <!-- 导航栏 -->
    <el-header class="app-header">
      <div class="header-content">
        <div class="logo">
          <el-icon class="logo-icon"><Reading /></el-icon>
          <span class="logo-text">青羽书城</span>
        </div>

        <div class="nav-menu">
          <el-menu
            mode="horizontal"
            :default-active="$route.path"
            router
            class="nav-menu-items"
          >
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/rankings">榜单</el-menu-item>
            <el-menu-item index="/books">书籍</el-menu-item>
            <el-menu-item index="/categories">分类</el-menu-item>
            <el-menu-item index="/writer">创作</el-menu-item>
            <el-menu-item index="/api-test">
              <el-icon><Setting /></el-icon>
              API测试
            </el-menu-item>
          </el-menu>
        </div>

        <div class="header-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索书籍..."
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #suffix>
              <el-icon class="search-icon" @click="handleSearch">
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-main class="app-main">
      <router-view />
    </el-main>

    <!-- 页脚 -->
    <el-footer class="app-footer">
      <div class="footer-content">
        <p>&copy; 2024 青羽书城. All rights reserved.</p>
        <p>发现优质内容，享受阅读乐趣</p>
      </div>
    </el-footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Setting } from '@element-plus/icons-vue'

const router = useRouter()
const searchKeyword = ref('')

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/search',
      query: { keyword: searchKeyword.value.trim() }
    })
  }
}
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f7fa;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
.app-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  height: 64px;
  line-height: 64px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  color: #409eff;
  cursor: pointer;
}

.logo-icon {
  font-size: 24px;
}

.nav-menu {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-menu-items {
  border-bottom: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 240px;
}

.search-icon {
  cursor: pointer;
  color: #409eff;
}

.search-icon:hover {
  color: #66b1ff;
}

/* 主要内容区域 */
.app-main {
  flex: 1;
  padding: 0;
  background: #f5f7fa;
}

/* 页脚样式 */
.app-footer {
  background: #2c3e50;
  color: white;
  text-align: center;
  padding: 20px 0;
  height: auto;
}

.footer-content p {
  margin: 4px 0;
}

.footer-content p:first-child {
  font-weight: 500;
}

.footer-content p:last-child {
  font-size: 14px;
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }

  .nav-menu {
    display: none;
  }

  .search-input {
    width: 180px;
  }

  .logo-text {
    display: none;
  }
}

/* Element Plus 组件样式覆盖 */
.el-menu--horizontal > .el-menu-item {
  border-bottom: none;
}

.el-menu--horizontal > .el-menu-item.is-active {
  border-bottom: 2px solid #409eff;
  color: #409eff;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #121212;
    color: #e0e0e0;
  }

  .app-header {
    background: #1a1a1a;
    border-bottom: 1px solid #333;
  }

  .app-main {
    background: #121212;
  }
}
</style>
