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
        </div>

        <div class="mode-switch">
          <button class="mode-btn" :class="{ active: activeMode === 'login' }" @click="setMode('login')">登录</button>
          <button class="mode-btn" :class="{ active: activeMode === 'register' }" @click="setMode('register')">注册</button>
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
              :input-attrs="{ 'data-testid': 'login-username-input', autocomplete: 'username' }"
              :prefix-icon="userIcon"
              @keyup.enter="handleLogin"
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
              :input-attrs="{ 'data-testid': 'login-password-input', autocomplete: 'current-password' }"
              :prefix-icon="lockIcon"
            />
          </QyFormItem>

          <div class="form-options">
            <label class="remember-row">
              <input v-model="rememberMe" type="checkbox" class="remember-checkbox" />
              <span>记住我</span>
            </label>
            <span class="link-text" @click="setMode('reset')">忘记密码？</span>
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
            <QyInput
              v-model="registerForm.username"
              placeholder="设置用户名 (3-20字符)"
              size="lg"
              class="premium-input"
              :prefix-icon="userIcon"
              :input-attrs="{ autocomplete: 'username' }"
            />
          </QyFormItem>

          <QyFormItem prop="email" data-testid="register-email">
            <QyInput
              v-model="registerForm.email"
              placeholder="电子邮箱"
              size="lg"
              class="premium-input"
              :prefix-icon="messageIcon"
              :input-attrs="{ autocomplete: 'email' }"
            />
          </QyFormItem>

          <QyFormItem prop="emailCode" data-testid="register-email-code">
            <div class="code-input-group">
              <QyInput
                v-model="registerForm.emailCode"
                placeholder="6位验证码"
                size="lg"
                class="premium-input"
                :prefix-icon="lockIcon"
                :input-attrs="{ inputmode: 'numeric', maxlength: '6' }"
              />
              <QyButton size="lg" class="code-btn" :disabled="emailCountdown > 0" :loading="sendingEmail" @click="sendEmailCode">
                {{ emailCountdown > 0 ? `${emailCountdown}s` : '获取验证码' }}
              </QyButton>
            </div>
          </QyFormItem>

          <QyFormItem prop="password" data-testid="register-password">
            <QyInput
              v-model="registerForm.password"
              type="password"
              placeholder="设置密码"
              size="lg"
              :show-password="true"
              class="premium-input"
              :prefix-icon="lockIcon"
              :input-attrs="{ autocomplete: 'new-password' }"
            />
            <div v-if="registerForm.password" class="password-strength">
              <div class="strength-bar">
                <div class="strength-fill" :class="`level-${passwordStrength}`" :style="{ width: passwordStrengthPercent }"></div>
              </div>
              <span class="strength-text">{{ passwordStrengthText }}</span>
            </div>
          </QyFormItem>

          <QyFormItem prop="confirmPassword" data-testid="register-confirm-password">
            <QyInput
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="确认密码"
              size="lg"
              :show-password="true"
              class="premium-input"
              :input-attrs="{ autocomplete: 'new-password' }"
              @keyup.enter="handleRegister"
            />
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
              <QyButton variant="primary" class="submit-btn" @click="setMode('login')">立即登录</QyButton>
            </div>
          </template>
        </QyForm>

        <div class="social-login" v-if="activeMode === 'login'">
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
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
type AuthMode = 'login' | 'register' | 'reset'
const REMEMBERED_USERNAME_KEY = 'qingyu_remembered_username'
const activeMode = ref<AuthMode>('login')

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
let emailTimer: ReturnType<typeof setInterval> | null = null
let resetTimer: ReturnType<typeof setInterval> | null = null

const pageTitle = computed(() => activeMode.value === 'login' ? '欢迎回来' : (activeMode.value === 'register' ? '创建账号' : '找回密码'))

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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const resolveModeFromRoute = (routePath: string, modeQuery?: string): AuthMode => {
  if (modeQuery === 'reset') return 'reset'
  if (routePath === '/register') return 'register'
  return 'login'
}

const setMode = (mode: AuthMode, syncRoute = true) => {
  activeMode.value = mode
  if (mode !== 'reset') {
    resetStep.value = 0
  }
  if (!syncRoute) return

  const basePath = mode === 'register' ? '/register' : '/login'
  const query = { ...route.query }
  if (mode === 'reset') {
    query.mode = 'reset'
  } else {
    delete query.mode
  }
  router.replace({ path: mode === 'reset' ? '/auth' : basePath, query })
}

// 方法 (保持原样)
const handleLogin = async () => {
  if (loading.value) return
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await authStore.login(loginForm.value)
        if (rememberMe.value) {
          localStorage.setItem(REMEMBERED_USERNAME_KEY, loginForm.value.username.trim())
        } else {
          localStorage.removeItem(REMEMBERED_USERNAME_KEY)
        }
        message.success('登录成功')
        router.push((route.query.redirect as string) || '/bookstore')
      } catch (e: any) { message.error(e.message || '登录失败') }

      finally { loading.value = false }
    }
  })
}

const sendEmailCode = async () => {
  if (sendingEmail.value || emailCountdown.value > 0) return
  const email = registerForm.value.email.trim()
  if (!email) return message.warning('请输入邮箱')
  if (!EMAIL_REGEX.test(email)) return message.warning('邮箱格式不正确')
  sendingEmail.value = true
  try {
    await sendEmailVerifyCode(email, 'bind')
    message.success('已发送')
    emailCountdown.value = 60
    if (emailTimer) clearInterval(emailTimer)
    emailTimer = setInterval(() => {
      emailCountdown.value--
      if (emailCountdown.value <= 0 && emailTimer) {
        clearInterval(emailTimer)
        emailTimer = null
      }
    }, 1000)
  } catch (e: any) { message.error(e.message) }
  finally { sendingEmail.value = false }
}

const handleRegister = async () => {
  if (loading.value) return
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await authStore.register({
          username: registerForm.value.username.trim(),
          email: registerForm.value.email.trim(),
          password: registerForm.value.password
        })
        message.success('注册成功')
        loginForm.value.username = registerForm.value.username.trim()
        setMode('login')
      } catch (e: any) { message.error(e.message) }
      finally { loading.value = false }
    }
  })
}

// 找回密码功能
const sendResetCode = async () => {
  if (sendingReset.value || resetCountdown.value > 0) return
  if (!resetForm.value.email) {
    ElMessage.warning('请输入邮箱')
    return
  }

  sendingReset.value = true
  try {
    await sendPasswordResetCode(resetForm.value.email)
    ElMessage.success('验证码已发送')
    resetCountdown.value = 60
    if (resetTimer) clearInterval(resetTimer)
    resetTimer = setInterval(() => {
      resetCountdown.value--
      if (resetCountdown.value <= 0 && resetTimer) {
        clearInterval(resetTimer)
        resetTimer = null
      }
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
  const remembered = localStorage.getItem(REMEMBERED_USERNAME_KEY)
  if (remembered) {
    loginForm.value.username = remembered
    rememberMe.value = true
  }
  setMode(resolveModeFromRoute(route.path, route.query.mode as string), false)
})

watch(
  () => [route.path, route.query.mode] as const,
  ([path, mode]) => {
    setMode(resolveModeFromRoute(path, mode as string), false)
  }
)

onBeforeUnmount(() => {
  if (emailTimer) clearInterval(emailTimer)
  if (resetTimer) clearInterval(resetTimer)
})
</script>

<style scoped lang="scss">
.auth-view {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(145deg, #f7fbff 0%, #eef5ff 50%, #f8fbff 100%);
  padding: 10px;
  box-sizing: border-box;
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
  max-width: 460px;
  z-index: 1;
}

.auth-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 14px 12px 8px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
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
  margin-bottom: 8px;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
  cursor: pointer;
}

.logo-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  width: 24px;
  height: 24px;
}

.logo-text {
  font-size: 20px;
  font-weight: 800;
  color: #1e3a5f;
}

.auth-title {
  margin: 0;
  font-size: 20px;
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
  gap: 6px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 6px;
}

.mode-btn {
  border: 0;
  border-radius: 8px;
  min-height: 34px;
  font-size: 13px;
  color: #64748b;
  background: transparent;
  cursor: pointer;
}

.mode-btn.active {
  background: #fff;
  color: #2563eb;
  border: 1px solid #dbeafe;
  box-shadow: none;
}

.auth-form {
  width: 100%;
}

.auth-form :deep(.tw-form-item) {
  display: block;
  width: 100%;
  margin-bottom: 5px;
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
  min-height: 35px;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #dbe6f3;
  box-shadow: none;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.premium-input :deep(input:focus) {
  background: #ffffff;
  border-color: #93c5fd;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.14);
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
  gap: 6px;
  font-size: 13px;
  color: #475569;
}

.remember-checkbox {
  width: 14px;
  height: 14px;
  accent-color: #3b82f6;
  border-radius: 4px;
}

.link-text {
  font-size: 13px;
  color: #3b82f6;
  cursor: pointer;
}

.submit-btn {
  width: 100%;
  min-height: 35px;
  margin-top: 4px;
  border-radius: 10px;
  font-weight: 700;
  box-shadow: none !important;
}

.code-input-group {
  display: flex;
  align-items: stretch;
  gap: 6px;
}

.code-btn {
  flex: 0 0 102px;
  min-height: 35px;
  border-radius: 10px;
  padding: 0 6px;
  font-size: 11px;
  line-height: 1;
  white-space: nowrap;
  box-shadow: none !important;
}

.submit-btn:hover,
.submit-btn:focus,
.submit-btn:active,
.code-btn:hover,
.code-btn:focus,
.code-btn:active {
  box-shadow: none !important;
}

.highlight {
  color: #2563eb;
}

.password-strength {
  margin-top: 2px;
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
  margin-top: 6px;
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
  margin-top: 2px;
  text-align: center;
}

.back-text {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #94a3b8;
  cursor: pointer;
  font-size: 12px;
}

@media (max-width: 768px) {
  .auth-view {
    padding: 8px;
    align-items: flex-start;
  }

  .auth-card {
    padding: 14px 12px 8px;
    border-radius: 16px;
  }

  .auth-title {
    font-size: 19px;
  }

  .logo-text {
    font-size: 18px;
  }

  .code-btn {
    flex-basis: 96px;
  }
}
</style>
