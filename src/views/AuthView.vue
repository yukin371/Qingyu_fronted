<template>
  <div class="auth-view">
    <div class="auth-container">
      <!-- 左侧品牌展示 -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="brand-logo">
            <img src="/favicon.ico" alt="青羽书城" class="logo-image" />
            <h1 class="brand-title">青羽书城</h1>
          </div>
          <p class="brand-description">
            发现好书，享受阅读<br />
            您的专属数字图书馆
          </p>
          <div class="brand-features">
            <div class="feature-item">
              <el-icon><Reading /></el-icon>
              <span>海量图书资源</span>
            </div>
            <div class="feature-item">
              <el-icon><Star /></el-icon>
              <span>个性化推荐</span>
            </div>
            <div class="feature-item">
              <el-icon><ChatDotRound /></el-icon>
              <span>社区互动交流</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="form-section">
        <div class="form-container">
          <!-- 切换标签 -->
          <div class="form-tabs">
            <button
              :class="['tab-button', { active: currentTab === 'login' }]"
              @click="switchTab('login')"
            >
              登录
            </button>
            <button
              :class="['tab-button', { active: currentTab === 'register' }]"
              @click="switchTab('register')"
            >
              注册
            </button>
          </div>

          <!-- 表单内容 -->
          <div class="form-content">
            <transition name="slide-fade" mode="out-in">
              <LoginForm
                v-if="currentTab === 'login'"
                key="login"
                @login-success="handleLoginSuccess"
                @switch-to-register="switchTab('register')"
                @forgot-password="handleForgotPassword"
              />
              <RegisterForm
                v-else
                key="register"
                @register-success="handleRegisterSuccess"
                @switch-to-login="switchTab('login')"
              />
            </transition>
          </div>
        </div>
      </div>
    </div>

    <!-- 忘记密码对话框 -->
    <el-dialog
      v-model="forgotPasswordVisible"
      title="重置密码"
      width="400px"
      :close-on-click-modal="false"
    >
      <ForgotPasswordForm
        @reset-success="handleResetSuccess"
        @cancel="forgotPasswordVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm.vue'
import { Reading, Star, ChatDotRound } from '@element-plus/icons-vue'

export default {
  name: 'AuthView',
  components: {
    LoginForm,
    RegisterForm,
    ForgotPasswordForm,
    Reading,
    Star,
    ChatDotRound
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    const currentTab = ref('login')
    const forgotPasswordVisible = ref(false)

    // 初始化标签页
    onMounted(() => {
      // 根据路由参数设置默认标签页
      if (route.query.tab === 'register') {
        currentTab.value = 'register'
      }

      // 如果已经登录，直接跳转到首页
      if (authStore.isLoggedIn) {
        router.push('/')
      }
    })

    // 切换标签页
    const switchTab = (tab) => {
      currentTab.value = tab
      // 更新URL参数
      router.replace({ query: { ...route.query, tab } })
    }

    // 处理登录成功
    const handleLoginSuccess = () => {
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    }

    // 处理注册成功
    const handleRegisterSuccess = () => {
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    }

    // 处理忘记密码
    const handleForgotPassword = () => {
      forgotPasswordVisible.value = true
    }

    // 处理重置密码成功
    const handleResetSuccess = () => {
      forgotPasswordVisible.value = false
      switchTab('login')
    }

    return {
      currentTab,
      forgotPasswordVisible,
      switchTab,
      handleLoginSuccess,
      handleRegisterSuccess,
      handleForgotPassword,
      handleResetSuccess
    }
  }
}
</script>

<style scoped>
.auth-view {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  min-height: 600px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 品牌展示区域 */
.brand-section {
  flex: 1;
  background: #4a5568;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  color: white;
}

.brand-content {
  text-align: center;
  max-width: 300px;
}

.brand-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.logo-image {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
}

.brand-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  color: white;
}

.brand-description {
  font-size: 18px;
  line-height: 1.6;
  margin: 0 0 40px 0;
  opacity: 0.9;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  opacity: 0.9;
}

.feature-item .el-icon {
  font-size: 20px;
}

/* 表单区域 */
.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.form-tabs {
  display: flex;
  margin-bottom: 30px;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 4px;
}

.tab-button {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: #606266;
  font-size: 16px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-button.active {
  background: #409eff;
  color: white;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
}

.tab-button:hover:not(.active) {
  background: #e8f4fd;
  color: #409eff;
}

.form-content {
  position: relative;
}

/* 动画效果 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .auth-container {
    flex-direction: column;
    max-width: 100%;
    min-height: auto;
  }

  .brand-section {
    padding: 40px 20px;
  }

  .brand-title {
    font-size: 24px;
  }

  .brand-description {
    font-size: 16px;
  }

  .form-section {
    padding: 20px;
  }

  .brand-features {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
  }

  .feature-item {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .auth-view {
    padding: 10px;
  }

  .brand-section {
    padding: 30px 15px;
  }

  .form-section {
    padding: 15px;
  }

  .brand-features {
    flex-direction: column;
    gap: 15px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .auth-container {
    background: #1d1e1f;
  }

  .form-tabs {
    background: #2d2e2f;
  }

  .tab-button {
    color: #a3a6ad;
  }

  .tab-button:hover:not(.active) {
    background: #3d3e3f;
    color: #409eff;
  }
}
</style>