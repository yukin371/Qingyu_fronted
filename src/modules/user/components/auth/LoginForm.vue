<template>
  <div class="login-form">
    <qy-form
      ref="loginFormRef"
      :model-value="loginForm"
      :rules="loginRules"
      label-width="0"
      @submit.prevent="handleLogin"
    >
      <div class="form-header">
        <h2 class="form-title">登录青羽书城</h2>
        <p class="form-subtitle">欢迎回来，开始您的阅读之旅</p>
      </div>

      <qy-form-item prop="username">
        <qy-input
          v-model="loginForm.username"
          placeholder="请输入用户名或邮箱"
          clearable
          size="lg"
          @keyup.enter="handleLogin"
        />
      </qy-form-item>

      <qy-form-item prop="password">
        <qy-input
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          show-password
          clearable
          size="lg"
          @keyup.enter="handleLogin"
        />
      </qy-form-item>

      <qy-form-item>
        <div class="form-options">
          <qy-checkbox v-model="loginForm.rememberMe">
            记住我
          </qy-checkbox>
          <a class="link-primary" @click="$emit('forgot-password')">
            忘记密码？
          </a>
        </div>
      </qy-form-item>

      <qy-form-item>
        <qy-button
          variant="primary"
          size="lg"
          :loading="loading"
          :disabled="!isFormValid"
          class="login-button"
          @click="handleLogin"
        >
          {{ loading ? '登录中...' : '登录' }}
        </qy-button>
      </qy-form-item>

      <div class="form-footer">
        <span class="register-hint">
          还没有账号？
          <a class="link-primary" @click="$emit('switch-to-register')">
            立即注册
          </a>
        </span>
      </div>
    </qy-form>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import QyForm from '@/design-system/components/advanced/QyForm/QyForm.vue'
import QyFormItem from '@/design-system/components/advanced/QyForm/QyFormItem.vue'
import QyInput from '@/design-system/components/basic/QyInput/QyInput.vue'
import QyButton from '@/design-system/components/basic/QyButton/QyButton.vue'
import QyCheckbox from '@/design-system/components/basic/QyCheckbox/QyCheckbox.vue'
import { message } from '@/design-system/services'

export default {
  name: 'LoginForm',
  components: {
    QyForm,
    QyFormItem,
    QyInput,
    QyButton,
    QyCheckbox
  },
  emits: ['login-success', 'switch-to-register', 'forgot-password'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const loginFormRef = ref()

    // 表单数据
    const loginForm = reactive({
      username: '',
      password: '',
      rememberMe: false
    })

    // 表单验证规则
    const loginRules = {
      username: [
        { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
        { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ]
    }

    // 计算属性
    const loading = computed(() => authStore.loading)
    const isFormValid = computed(() => {
      return loginForm.username.trim() && loginForm.password.trim()
    })

    // 处理登录
    const handleLogin = async () => {
      if (!loginFormRef.value) return

      try {
        // 表单验证
        await loginFormRef.value.validate()

        // 调用登录接口
        await authStore.login({
          username: loginForm.username.trim(),
          password: loginForm.password,
          rememberMe: loginForm.rememberMe
        })

        message.success('登录成功')
        emit('login-success')
      } catch (error) {
        if (error.message) {
          message.error(error.message)
        }
      }
    }

    // 重置表单
    const resetForm = () => {
      if (loginFormRef.value) {
        loginFormRef.value.resetFields()
      }
      Object.assign(loginForm, {
        username: '',
        password: '',
        rememberMe: false
      })
    }

    return {
      loginFormRef,
      loginForm,
      loginRules,
      loading,
      isFormValid,
      handleLogin,
      resetForm
    }
  }
}
</script>

<style scoped>
.login-form {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.form-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
}

.register-hint {
  font-size: 14px;
  color: #606266;
}

.link-primary {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s;
}

.link-primary:hover {
  color: #66b1ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-form {
    padding: 30px 20px;
    margin: 20px;
    box-shadow: none;
    border: 1px solid #ebeef5;
  }

  .form-title {
    font-size: 20px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .login-form {
    background: #1d1e1f;
    border: 1px solid #414243;
  }

  .form-title {
    color: #e5eaf3;
  }

  .form-subtitle {
    color: #a3a6ad;
  }

  .register-hint {
    color: #a3a6ad;
  }
}
</style>
