<template>
  <div class="auth-view">
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>

    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo" @click="goHome">
            <div class="logo-icon-wrapper">
              <img src="/favicon.ico" alt="Logo" class="logo-icon" />
            </div>
            <span class="logo-text">青羽阅读</span>
          </div>
          <h2 class="auth-title">{{ pageTitle }}</h2>
          <p class="auth-subtitle">{{ pageSubtitle }}</p>
        </div>

        <div class="mode-switch">
          <button class="mode-btn" :class="{ active: activeMode === 'login' }" @click="activeMode = 'login'">登录</button>
          <button class="mode-btn" :class="{ active: activeMode === 'register' }" @click="activeMode = 'register'">注册</button>
          <button v-if="activeMode === 'reset'" class="mode-btn active">找回</button>
        </div>

        <QyForm
          v-if="activeMode === 'login'"
          ref="loginFormRef"
          v-model="loginForm"
          :rules="(loginRules as any)"
          class="auth-form"
          @submit.prevent="handleLogin"
        >
          <QyFormItem prop="username" data-testid="login-username">
            <QyInput
              v-model="loginForm.username"
              placeholder="用户名或邮箱"
              size="lg"
              class="premium-input"
              :input-attrs="{ 'data-testid': 'login-username-input' }"
              :prefix-icon="userIcon"
            />
          </QyFormItem>

          <QyFormItem prop="password" data-testid="login-password">
            <QyInput
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              size="lg"
              :show-password="true"
              @keyup.enter="handleLogin"
              class="premium-input"
              :input-attrs="{ 'data-testid': 'login-password-input' }"
              :prefix-icon="lockIcon"
            />
          </QyFormItem>

          <div class="form-options">
            <label class="remember-row">
              <input v-model="rememberMe" type="checkbox" class="remember-checkbox" />
              <span>记住我</span>
            </label>
            <span class="link-text" @click="activeMode = 'reset'">忘记密码？</span>
          </div>

          <QyButton variant="primary" size="lg" class="submit-btn" :loading="loading" @click="handleLogin" data-testid="login-submit">
            立即登录
          </QyButton>
        </QyForm>

        <QyForm
          v-if="activeMode === 'register'"
          ref="registerFormRef"
          v-model="registerForm"
          :rules="(registerRules as any)"
          class="auth-form"
          @submit.prevent="handleRegister"
        >
          <QyFormItem prop="username" data-testid="register-username">
            <QyInput v-model="registerForm.username" placeholder="设置用户名 (3-20字符)" size="lg" class="premium-input" :prefix-icon="userIcon" />
          </QyFormItem>

          <QyFormItem prop="email" data-testid="register-email">
            <QyInput v-model="registerForm.email" placeholder="电子邮箱" size="lg" class="premium-input" :prefix-icon="messageIcon" />
          </QyFormItem>

          <QyFormItem prop="emailCode" data-testid="register-email-code">
            <div class="code-input-group">
              <QyInput v-model="registerForm.emailCode" placeholder="6位验证码" size="lg" class="premium-input" :prefix-icon="lockIcon" />
              <QyButton size="lg" class="code-btn" :disabled="emailCountdown > 0" :loading="sendingEmail" @click="sendEmailCode">
                {{ emailCountdown > 0 ? `${emailCountdown}s` : '获取验证码' }}
              </QyButton>
            </div>
          </QyFormItem>

          <QyFormItem prop="password" data-testid="register-password">
            <QyInput v-model="registerForm.password" type="password" placeholder="设置密码" size="lg" :show-password="true" class="premium-input" :prefix-icon="lockIcon" />
            <div v-if="registerForm.password" class="password-strength">
              <div class="strength-bar">
                <div class="strength-fill" :class="`level-${passwordStrength}`" :style="{ width: passwordStrengthPercent }"></div>
              </div>
              <span class="strength-text">{{ passwordStrengthText }}</span>
            </div>
          </QyFormItem>

          <QyFormItem prop="confirmPassword" data-testid="register-confirm-password">
            <QyInput v-model="registerForm.confirmPassword" type="password" placeholder="确认密码" size="lg" :show-password="true" class="premium-input" />
          </QyFormItem>

          <QyFormItem prop="agreement" data-testid="register-agreement">
            <label class="remember-row">
              <input v-model="registerForm.agreement" type="checkbox" class="remember-checkbox" />
              <span>我已阅读并同意 <span class="highlight">用户协议</span> 与 <span class="highlight">隐私政策</span></span>
            </label>
          </QyFormItem>

          <QyButton variant="primary" size="lg" class="submit-btn" :loading="loading" @click="handleRegister" data-testid="register-submit">
            注册账号
          </QyButton>
        </QyForm>

        <QyForm
          v-if="activeMode === 'reset'"
          ref="resetFormRef"
          v-model="resetForm"
          :rules="(resetRules as any)"
          class="auth-form"
          @submit.prevent="handleReset"
        >
          <div class="reset-steps">
            <span :class="{ active: resetStep >= 0 }">验证</span>
            <span :class="{ active: resetStep >= 1 }">重置</span>
            <span :class="{ active: resetStep >= 2 }">完成</span>
          </div>

          <template v-if="resetStep === 0">
            <QyFormItem prop="email">
              <QyInput v-model="resetForm.email" placeholder="注册邮箱" size="lg" class="premium-input" :prefix-icon="messageIcon" />
            </QyFormItem>
            <QyFormItem prop="code">
              <div class="code-input-group">
                <QyInput v-model="resetForm.code" placeholder="验证码" size="lg" class="premium-input" :prefix-icon="lockIcon" />
                <QyButton size="lg" class="code-btn" :disabled="resetCountdown > 0" :loading="sendingReset" @click="sendResetCode">
                  {{ resetCountdown > 0 ? `${resetCountdown}s` : '发送' }}
                </QyButton>
              </div>
            </QyFormItem>
            <QyButton variant="primary" size="lg" class="submit-btn" :loading="loading" @click="verifyResetCode">下一步</QyButton>
          </template>

          <template v-if="resetStep === 1">
            <QyFormItem prop="newPassword">
              <QyInput v-model="resetForm.newPassword" type="password" placeholder="新密码" size="lg" :show-password="true" class="premium-input" />
            </QyFormItem>
            <QyFormItem prop="confirmNewPassword">
              <QyInput v-model="resetForm.confirmNewPassword" type="password" placeholder="确认新密码" size="lg" :show-password="true" class="premium-input" />
            </QyFormItem>
            <QyButton variant="primary" size="lg" class="submit-btn" :loading="loading" @click="handleReset">提交修改</QyButton>
          </template>

          <template v-if="resetStep === 2">
            <div class="success-result">
              <QyIcon name="CircleCheckFilled" :size="52" class="success-icon" />
              <h3>密码重置成功</h3>
              <QyButton variant="primary" class="submit-btn" @click="activeMode = 'login'">立即登录</QyButton>
            </div>
          </template>
        </QyForm>

        <div class="social-login" v-if="activeMode !== 'reset'">
          <QyDivider content="第三方登录" content-position="center" />
          <div class="social-buttons">
            <button class="social-btn wechat" title="微信登录">W</button>
            <button class="social-btn qq" title="QQ登录">Q</button>
          </div>
        </div>

        <div class="back-home">
          <span class="back-text" @click="goHome">返回首页 <QyIcon name="ArrowRight" /></span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { message } from '@/design-system/services'
import { QyIcon, QyForm, QyFormItem, QyInput, QyButton, QyDivider } from '@/design-system/components'
import { getIconSVG } from '@/design-system/utils/icon-mapper'
import type { FormInstance, FormRules } from 'element-plus'
// 假设 api 已正确定义
import {
  sendEmailVerifyCode,
  sendPasswordResetCode,
  verifyResetCode as verifyResetCodeAPI,
  resetPassword as resetPasswordAPI
} from '@/modules/user/api'
import { ElMessage } from 'element-plus'

// 图标 SVG 计算属性
const userIcon = computed(() => getIconSVG('User') || '')
const lockIcon = computed(() => getIconSVG('Lock') || '')
const messageIcon = computed(() => getIconSVG('ChatDotRound') || '')

// ... (脚本逻辑部分不需要大幅修改，保持原有的业务逻辑即可)
// 为了节省篇幅，这里保留原有的 script 内容
// 请直接复制您原始代码中的 <script setup> 逻辑部分放到这里
// 唯一需要注意的是：确保引入了图标组件 CircleCheckFilled, ArrowRight
// -------------------------------------------------------

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 类型定义
const activeMode = ref<'login' | 'register' | 'reset'>('login')

const loading = ref(false)
const rememberMe = ref(false)
const resetStep = ref(0)
// 倒计时
const emailCountdown = ref(0)
const sendingEmail = ref(false)
const resetCountdown = ref(0)
const sendingReset = ref(false)
// 表单 Ref - 使用 Element Plus 的 FormInstance 因为 validate 方法签名兼容
const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()
const resetFormRef = ref<FormInstance>()
// 表单数据
const loginForm = ref({ username: '', password: '' })
const registerForm = ref({ username: '', email: '', emailCode: '', phone: '', password: '', confirmPassword: '', agreement: false })
const resetForm = ref({ email: '', code: '', newPassword: '', confirmNewPassword: '' })

const pageTitle = computed(() => activeMode.value === 'login' ? '欢迎回来' : (activeMode.value === 'register' ? '创建账号' : '找回密码'))
const pageSubtitle = computed(() => activeMode.value === 'login' ? '登录以继续您的阅读之旅' : (activeMode.value === 'register' ? '加入青羽，探索无限世界' : '安全重置您的账户密码'))

// 密码强度
const passwordStrength = computed(() => {
  const pwd = registerForm.value.password
  if (!pwd) return 0
  let s = 0
  if (pwd.length >= 8) s++
  if (/[A-Za-z]/.test(pwd) && /[0-9]/.test(pwd)) s++
  if (/[^A-Za-z0-9]/.test(pwd)) s++
  return s
})
const passwordStrengthPercent = computed(() => ['0%', '33%', '66%', '100%'][passwordStrength.value])
const passwordStrengthText = computed(() => ['弱', '弱', '中', '强'][passwordStrength.value])

// 验证规则 - 使用 Element Plus 的 FormRules 类型
const loginRules: FormRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}
// ... 其他规则省略，请保持原有代码 ...
const registerRules: FormRules = {
  // ... 请保留您的验证规则 ...
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '格式不正确', trigger: 'blur' }],
  // 注意：后端注册API不需要验证码字段，所以emailCode改为可选
  emailCode: [],  // 移除required，改为可选
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '至少6位', trigger: 'blur' }],
  confirmPassword: [{
    validator: (_rule, value, callback) => value !== registerForm.value.password ? callback(new Error('密码不一致')) : callback(),
    trigger: 'blur'
  }],
  agreement: [{ validator: (_rule, value, callback) => !value ? callback(new Error('请同意协议')) : callback(), trigger: 'change' }]
}
const resetRules: FormRules = {
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '格式不正确', trigger: 'blur' }],
  code: [{ required: true, message: '验证码必填', trigger: 'blur' }],
  newPassword: [{ required: true, message: '新密码必填', trigger: 'blur' }],
  confirmNewPassword: [{
    validator: (_rule, value, callback) => value !== resetForm.value.newPassword ? callback(new Error('密码不一致')) : callback(),
    trigger: 'blur'
  }]
}

// 方法 (保持原样)
const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await authStore.login(loginForm.value)
        message.success('登录成功')
        router.push((route.query.redirect as string) || '/bookstore')
      } catch (e: any) { message.error(e.message || '登录失败') }

      finally { loading.value = false }
    }
  })
}

const sendEmailCode = async () => {
  // 模拟发送逻辑
  if (!registerForm.value.email) return message.warning('请输入邮箱')
  sendingEmail.value = true
  try {
    await sendEmailVerifyCode(registerForm.value.email, 'bind')
    message.success('已发送')
    emailCountdown.value = 60
    const t = setInterval(() => {
      emailCountdown.value--
      if (emailCountdown.value <= 0) clearInterval(t)
    }, 1000)
  } catch (e: any) { message.error(e.message) }
  finally { sendingEmail.value = false }
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await authStore.register(registerForm.value)
        message.success('注册成功')
        activeMode.value = 'login'
      } catch (e: any) { message.error(e.message) }
      finally { loading.value = false }
    }
  })
}

// 找回密码功能
const sendResetCode = async () => {
  if (!resetForm.value.email) {
    ElMessage.warning('请输入邮箱')
    return
  }

  sendingReset.value = true
  try {
    await sendPasswordResetCode(resetForm.value.email)
    ElMessage.success('验证码已发送')
    resetCountdown.value = 60
    const timer = setInterval(() => {
      resetCountdown.value--
      if (resetCountdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (error: any) {
    ElMessage.error(error.message || '发送验证码失败')
  } finally {
    sendingReset.value = false
  }
}

const verifyResetCode = async () => {
  if (!resetFormRef.value) return

  await resetFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await verifyResetCodeAPI(resetForm.value.email, resetForm.value.code)
        resetStep.value = 1
      } catch (error: any) {
        ElMessage.error(error.message || '验证码错误')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleReset = async () => {
  if (!resetFormRef.value) return

  await resetFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await resetPasswordAPI({
          account: resetForm.value.email,
          code: resetForm.value.code,
          newPassword: resetForm.value.newPassword
        })
        resetStep.value = 2
        ElMessage.success('密码重置成功')
      } catch (error: any) {
        ElMessage.error(error.message || '重置密码失败')
      } finally {
        loading.value = false
      }
    }
  })
}
const goHome = () => router.push('/')

onMounted(() => {
  const mode = route.query.mode as string
  if (mode && ['login', 'register', 'reset'].includes(mode)) activeMode.value = mode as any
})
</script>

<style scoped lang="scss">
.auth-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(145deg, #f7fbff 0%, #eef5ff 50%, #f8fbff 100%);
  padding: 20px;
}

.bg-shape {
  position: absolute;
  border-radius: 999px;
  filter: blur(72px);
  opacity: 0.36;
  pointer-events: none;
}

.shape-1 {
  width: 320px;
  height: 320px;
  background: #60a5fa;
  left: -80px;
  top: -90px;
}

.shape-2 {
  width: 260px;
  height: 260px;
  background: #34d399;
  right: -80px;
  bottom: -60px;
}

.auth-container {
  width: 100%;
  max-width: 500px;
  z-index: 1;
}

.auth-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 28px 26px 22px;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
}

.auth-card::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 3px;
  background: linear-gradient(90deg, #22c55e, #3b82f6);
}

.auth-header {
  text-align: center;
  margin-bottom: 18px;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  cursor: pointer;
}

.logo-icon-wrapper {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  width: 30px;
  height: 30px;
}

.logo-text {
  font-size: 28px;
  font-weight: 800;
  color: #1e3a5f;
}

.auth-title {
  margin: 0 0 4px;
  font-size: 24px;
  color: #111827;
}

.auth-subtitle {
  margin: 0;
  color: #94a3b8;
  font-size: 15px;
}

.mode-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 5px;
  border-radius: 12px;
  margin-bottom: 14px;
}

.mode-btn {
  border: 0;
  border-radius: 8px;
  min-height: 38px;
  font-size: 14px;
  color: #64748b;
  background: transparent;
  cursor: pointer;
}

.mode-btn.active {
  background: #fff;
  color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.14);
}

.auth-form {
  width: 100%;
}

.auth-form :deep(.tw-form-item) {
  display: block;
  width: 100%;
  margin-bottom: 12px;
}

.auth-form :deep(.tw-form-item-content),
.auth-form :deep(.tw-form-item-content-left),
.auth-form :deep(.tw-form-item-content-top) {
  width: 100%;
  padding-left: 0 !important;
}

.premium-input {
  width: 100%;
}

.premium-input :deep(input) {
  min-height: 48px;
  border-radius: 12px;
  background: #f8fbff;
  border: 1px solid #dbe6f3;
  box-shadow: 0 8px 18px rgba(148, 163, 184, 0.24), 0 1px 2px rgba(15, 23, 42, 0.08);
  transition: box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.premium-input :deep(input:focus) {
  background: #ffffff;
  border-color: #93c5fd;
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.2), 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2px;
}

.remember-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #475569;
}

.remember-checkbox {
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
  border-radius: 4px;
}

.link-text {
  font-size: 14px;
  color: #3b82f6;
  cursor: pointer;
}

.submit-btn {
  width: 100%;
  min-height: 48px;
  margin-top: 12px;
  border-radius: 12px;
  font-weight: 700;
}

.code-input-group {
  display: grid;
  grid-template-columns: 1fr 110px;
  gap: 10px;
}

.code-btn {
  min-height: 48px;
  border-radius: 12px;
}

.highlight {
  color: #2563eb;
}

.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.strength-bar {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: #e2e8f0;
}

.strength-fill {
  height: 100%;
  border-radius: 999px;
  background: #ef4444;
}

.strength-fill.level-2 {
  background: #f59e0b;
}

.strength-fill.level-3 {
  background: #22c55e;
}

.strength-text {
  font-size: 12px;
  color: #64748b;
}

.reset-steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.reset-steps span {
  text-align: center;
  font-size: 12px;
  padding: 6px 0;
  color: #94a3b8;
  border-radius: 999px;
  background: #f1f5f9;
}

.reset-steps span.active {
  color: #2563eb;
  background: #dbeafe;
}

.success-result {
  text-align: center;
  padding: 12px 0 4px;
}

.success-icon {
  color: #22c55e;
}

.social-login {
  margin-top: 16px;
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 14px;
}

.social-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #dbe3ef;
  background: #fff;
  color: #64748b;
}

.back-home {
  margin-top: 12px;
  text-align: center;
}

.back-text {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #94a3b8;
  cursor: pointer;
  font-size: 14px;
}

@media (max-width: 768px) {
  .auth-view {
    padding: 12px;
    align-items: flex-start;
  }

  .auth-card {
    padding: 20px 16px;
    border-radius: 16px;
  }

  .auth-title {
    font-size: 22px;
  }

  .logo-text {
    font-size: 24px;
  }
}
</style>

