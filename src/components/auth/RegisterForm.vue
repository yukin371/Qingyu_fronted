<template>
  <div class="register-form">
    <el-form
      ref="registerFormRef"
      :model="registerForm"
      :rules="registerRules"
      label-width="0"
      size="large"
      @submit.prevent="handleRegister"
    >
      <div class="form-header">
        <h2 class="form-title">注册青羽书城</h2>
        <p class="form-subtitle">创建账号，开启您的阅读之旅</p>
      </div>

      <el-form-item prop="username">
        <el-input
          v-model="registerForm.username"
          placeholder="请输入用户名"
          prefix-icon="User"
          clearable
          @blur="checkUsernameAvailable"
        />
      </el-form-item>

      <el-form-item prop="email">
        <el-input
          v-model="registerForm.email"
          type="email"
          placeholder="请输入邮箱地址"
          prefix-icon="Message"
          clearable
          @blur="checkEmailAvailable"
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="registerForm.password"
          type="password"
          placeholder="请输入密码"
          prefix-icon="Lock"
          show-password
          clearable
        />
      </el-form-item>

      <el-form-item prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          placeholder="请确认密码"
          prefix-icon="Lock"
          show-password
          clearable
          @keyup.enter="handleRegister"
        />
      </el-form-item>

      <el-form-item prop="verificationCode" v-if="showVerificationCode">
        <div class="verification-input">
          <el-input
            v-model="registerForm.verificationCode"
            placeholder="请输入验证码"
            prefix-icon="Key"
            clearable
          />
          <el-button
            type="primary"
            :disabled="!canSendCode || codeSending"
            :loading="codeSending"
            @click="sendVerificationCode"
          >
            {{ codeButtonText }}
          </el-button>
        </div>
      </el-form-item>

      <el-form-item prop="agreement">
        <el-checkbox v-model="registerForm.agreement">
          我已阅读并同意
          <el-link type="primary" @click="showTerms">《用户协议》</el-link>
          和
          <el-link type="primary" @click="showPrivacy">《隐私政策》</el-link>
        </el-checkbox>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          :disabled="!isFormValid"
          class="register-button"
          @click="handleRegister"
        >
          {{ loading ? '注册中...' : '注册' }}
        </el-button>
      </el-form-item>

      <div class="form-footer">
        <span class="login-hint">
          已有账号？
          <el-link type="primary" @click="$emit('switch-to-login')">
            立即登录
          </el-link>
        </span>
      </div>
    </el-form>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

export default {
  name: 'RegisterForm',
  emits: ['register-success', 'switch-to-login'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const registerFormRef = ref()

    // 表单数据
    const registerForm = reactive({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      verificationCode: '',
      agreement: false
    })

    // 验证码相关状态
    const showVerificationCode = ref(false)
    const codeSending = ref(false)
    const codeCountdown = ref(0)
    const codeTimer = ref(null)

    // 用户名和邮箱可用性检查
    const usernameChecking = ref(false)
    const emailChecking = ref(false)

    // 自定义验证器
    const validateUsername = async (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入用户名'))
        return
      }
      if (value.length < 3 || value.length > 20) {
        callback(new Error('用户名长度在 3 到 20 个字符'))
        return
      }
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        callback(new Error('用户名只能包含字母、数字和下划线'))
        return
      }
      callback()
    }

    const validateEmail = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入邮箱地址'))
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        callback(new Error('请输入有效的邮箱地址'))
        return
      }
      callback()
    }

    const validatePassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入密码'))
        return
      }
      if (value.length < 6 || value.length > 20) {
        callback(new Error('密码长度在 6 到 20 个字符'))
        return
      }
      if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
        callback(new Error('密码必须包含字母和数字'))
        return
      }
      callback()
    }

    const validateConfirmPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请确认密码'))
        return
      }
      if (value !== registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
        return
      }
      callback()
    }

    const validateAgreement = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请阅读并同意用户协议和隐私政策'))
        return
      }
      callback()
    }

    // 表单验证规则
    const registerRules = {
      username: [{ validator: validateUsername, trigger: 'blur' }],
      email: [{ validator: validateEmail, trigger: 'blur' }],
      password: [{ validator: validatePassword, trigger: 'blur' }],
      confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
      verificationCode: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { len: 6, message: '验证码为6位数字', trigger: 'blur' }
      ],
      agreement: [{ validator: validateAgreement, trigger: 'change' }]
    }

    // 计算属性
    const loading = computed(() => authStore.loading)
    const isFormValid = computed(() => {
      return (
        registerForm.username.trim() &&
        registerForm.email.trim() &&
        registerForm.password.trim() &&
        registerForm.confirmPassword.trim() &&
        registerForm.agreement &&
        (!showVerificationCode.value || registerForm.verificationCode.trim())
      )
    })

    const canSendCode = computed(() => {
      return (
        registerForm.email.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email) &&
        codeCountdown.value === 0
      )
    })

    const codeButtonText = computed(() => {
      if (codeSending.value) return '发送中...'
      if (codeCountdown.value > 0) return `${codeCountdown.value}s后重发`
      return '发送验证码'
    })

    // 监听邮箱变化，决定是否显示验证码输入框
    watch(
      () => registerForm.email,
      (newEmail) => {
        if (newEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
          showVerificationCode.value = true
        } else {
          showVerificationCode.value = false
        }
      }
    )

    // 检查用户名是否可用
    const checkUsernameAvailable = async () => {
      if (!registerForm.username.trim()) return

      usernameChecking.value = true
      try {
        const available = await authStore.checkUsername(registerForm.username)
        if (!available) {
          ElMessage.warning('用户名已被使用')
        }
      } catch (error) {
        console.error('检查用户名失败:', error)
      } finally {
        usernameChecking.value = false
      }
    }

    // 检查邮箱是否可用
    const checkEmailAvailable = async () => {
      if (!registerForm.email.trim()) return

      emailChecking.value = true
      try {
        const available = await authStore.checkEmail(registerForm.email)
        if (!available) {
          ElMessage.warning('邮箱已被注册')
        }
      } catch (error) {
        console.error('检查邮箱失败:', error)
      } finally {
        emailChecking.value = false
      }
    }

    // 发送验证码
    const sendVerificationCode = async () => {
      if (!canSendCode.value) return

      codeSending.value = true
      try {
        await authStore.sendVerificationCode(registerForm.email)
        ElMessage.success('验证码已发送到您的邮箱')
        
        // 开始倒计时
        codeCountdown.value = 60
        codeTimer.value = setInterval(() => {
          codeCountdown.value--
          if (codeCountdown.value <= 0) {
            clearInterval(codeTimer.value)
            codeTimer.value = null
          }
        }, 1000)
      } catch (error) {
        ElMessage.error(error.message || '发送验证码失败')
      } finally {
        codeSending.value = false
      }
    }

    // 处理注册
    const handleRegister = async () => {
      if (!registerFormRef.value) return

      try {
        // 表单验证
        await registerFormRef.value.validate()

        // 调用注册接口
        await authStore.register({
          username: registerForm.username.trim(),
          email: registerForm.email.trim(),
          password: registerForm.password,
          verificationCode: registerForm.verificationCode
        })

        ElMessage.success('注册成功')
        emit('register-success')
      } catch (error) {
        if (error.message) {
          ElMessage.error(error.message)
        }
      }
    }

    // 显示用户协议
    const showTerms = () => {
      // TODO: 实现用户协议弹窗
      ElMessage.info('用户协议功能待实现')
    }

    // 显示隐私政策
    const showPrivacy = () => {
      // TODO: 实现隐私政策弹窗
      ElMessage.info('隐私政策功能待实现')
    }

    // 重置表单
    const resetForm = () => {
      if (registerFormRef.value) {
        registerFormRef.value.resetFields()
      }
      Object.assign(registerForm, {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        verificationCode: '',
        agreement: false
      })
      
      // 清除倒计时
      if (codeTimer.value) {
        clearInterval(codeTimer.value)
        codeTimer.value = null
      }
      codeCountdown.value = 0
      showVerificationCode.value = false
    }

    return {
      registerFormRef,
      registerForm,
      registerRules,
      showVerificationCode,
      codeSending,
      canSendCode,
      codeButtonText,
      loading,
      isFormValid,
      handleRegister,
      checkUsernameAvailable,
      checkEmailAvailable,
      sendVerificationCode,
      showTerms,
      showPrivacy,
      resetForm
    }
  }
}
</script>

<style scoped>
.register-form {
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

.verification-input {
  display: flex;
  gap: 10px;
}

.verification-input .el-input {
  flex: 1;
}

.verification-input .el-button {
  flex-shrink: 0;
  width: 120px;
}

.register-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
}

.login-hint {
  font-size: 14px;
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-form {
    padding: 30px 20px;
    margin: 20px;
    box-shadow: none;
    border: 1px solid #ebeef5;
  }

  .form-title {
    font-size: 20px;
  }

  .verification-input {
    flex-direction: column;
  }

  .verification-input .el-button {
    width: 100%;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .register-form {
    background: #1d1e1f;
    border: 1px solid #414243;
  }

  .form-title {
    color: #e5eaf3;
  }

  .form-subtitle {
    color: #a3a6ad;
  }

  .login-hint {
    color: #a3a6ad;
  }
}
</style>