<template>
    <div class="auth-view">
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <div class="logo" @click="goHome">
                        <img src="/favicon.ico" alt="Logo" class="logo-icon" />
                        <span class="logo-text">青羽阅读</span>
                    </div>
                    <h2 class="auth-title">{{ pageTitle }}</h2>
                    <p class="auth-subtitle">{{ pageSubtitle }}</p>
                </div>

                <el-tabs v-model="activeMode" class="auth-tabs" @tab-change="handleTabChange">
                    <!-- 登录 -->
                    <el-tab-pane label="登录" name="login">
                        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="auth-form"
                            @submit.prevent="handleLogin">
                            <el-form-item prop="username">
                                <el-input v-model="loginForm.username" placeholder="用户名或邮箱" size="large" clearable>
                                    <template #prefix>
                                        <el-icon>
                                            <User />
                                        </el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>

                            <el-form-item prop="password">
                                <el-input v-model="loginForm.password" type="password" placeholder="密码" size="large"
                                    show-password @keyup.enter="handleLogin">
                                    <template #prefix>
                                        <el-icon>
                                            <Lock />
                                        </el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>

                            <el-form-item>
                                <div class="form-options">
                                    <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                                    <el-link type="primary" :underline="false" @click="activeMode = 'reset'">
                                        忘记密码？
                                    </el-link>
                                </div>
                            </el-form-item>

                            <el-form-item>
                                <el-button type="primary" size="large" style="width: 100%" :loading="loading"
                                    @click="handleLogin">
                                    登录
                                </el-button>
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>

                    <!-- 注册 -->
                    <el-tab-pane label="注册" name="register">
                        <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="auth-form"
                            @submit.prevent="handleRegister">
                            <el-form-item prop="username">
                                <el-input v-model="registerForm.username" placeholder="用户名 (3-20字符)" size="large"
                                    clearable>
                                    <template #prefix>
                                        <el-icon>
                                            <User />
                                        </el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>

                            <el-form-item prop="email">
                                <el-input v-model="registerForm.email" placeholder="邮箱地址" size="large" clearable>
                                    <template #prefix>
                                        <el-icon>
                                            <Message />
                                        </el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>

                            <!-- 邮箱验证码 -->
                            <el-form-item prop="emailCode">
                                <div class="code-input-group">
                                    <el-input v-model="registerForm.emailCode" placeholder="邮箱验证码" size="large"
                                        style="flex: 1">
                                        <template #prefix>
                                            <el-icon>
                                                <Key />
                                            </el-icon>
                                        </template>
                                    </el-input>
                                    <el-button size="large" :disabled="emailCountdown > 0" :loading="sendingEmail"
                                        @click="sendEmailCode">
                                        {{ emailCountdown > 0 ? `${emailCountdown}s` : '发送验证码' }}
                                    </el-button>
                                </div>
                            </el-form-item>

                            <!-- 手机号（可选） -->
                            <el-form-item prop="phone">
                                <el-input v-model="registerForm.phone" placeholder="手机号（选填）" size="large" clearable>
                                    <template #prefix>
                                        <el-icon>
                                            <Phone />
                                        </el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>

                            <el-form-item prop="password">
                                <el-input v-model="registerForm.password" type="password"
                                    placeholder="密码 (至少8位，包含字母和数字)" size="large" show-password>
                                    <template #prefix>
                                        <el-icon>
                                            <Lock />
                                        </el-icon>
                                    </template>
                                </el-input>
                                <!-- 密码强度指示器 -->
                                <div v-if="registerForm.password" class="password-strength">
                                    <div class="strength-bar">
                                        <div class="strength-fill" :class="`strength-${passwordStrength}`"
                                            :style="{ width: passwordStrengthPercent }"></div>
                                    </div>
                                    <span class="strength-text">密码强度：{{ passwordStrengthText }}</span>
                                </div>
                            </el-form-item>

                            <el-form-item prop="confirmPassword">
                                <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码"
                                    size="large" show-password @keyup.enter="handleRegister">
                                    <template #prefix>
                                        <el-icon>
                                            <Lock />
                                        </el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>

                            <el-form-item prop="agreement">
                                <el-checkbox v-model="registerForm.agreement">
                                    我已阅读并同意
                                    <el-link type="primary" :underline="false">《用户协议》</el-link>
                                    和
                                    <el-link type="primary" :underline="false">《隐私政策》</el-link>
                                </el-checkbox>
                            </el-form-item>

                            <el-form-item>
                                <el-button type="primary" size="large" style="width: 100%" :loading="loading"
                                    @click="handleRegister">
                                    注册
                                </el-button>
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>

                    <!-- 找回密码 -->
                    <el-tab-pane label="找回密码" name="reset" v-if="activeMode === 'reset'">
                        <el-form ref="resetFormRef" :model="resetForm" :rules="resetRules" class="auth-form"
                            @submit.prevent="handleReset">
                            <el-steps :active="resetStep" finish-status="success" class="reset-steps">
                                <el-step title="验证邮箱"></el-step>
                                <el-step title="重置密码"></el-step>
                                <el-step title="完成"></el-step>
                            </el-steps>

                            <!-- 步骤1：验证邮箱 -->
                            <template v-if="resetStep === 0">
                                <el-form-item prop="email">
                                    <el-input v-model="resetForm.email" placeholder="注册时使用的邮箱" size="large" clearable>
                                        <template #prefix>
                                            <el-icon>
                                                <Message />
                                            </el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>

                                <el-form-item prop="code">
                                    <div class="code-input-group">
                                        <el-input v-model="resetForm.code" placeholder="验证码" size="large"
                                            style="flex: 1">
                                            <template #prefix>
                                                <el-icon>
                                                    <Key />
                                                </el-icon>
                                            </template>
                                        </el-input>
                                        <el-button size="large" :disabled="resetCountdown > 0" :loading="sendingReset"
                                            @click="sendResetCode">
                                            {{ resetCountdown > 0 ? `${resetCountdown}s` : '发送验证码' }}
                                        </el-button>
                                    </div>
                                </el-form-item>

                                <el-form-item>
                                    <el-button type="primary" size="large" style="width: 100%" :loading="loading"
                                        @click="verifyResetCode">
                                        下一步
                                    </el-button>
                                </el-form-item>
                            </template>

                            <!-- 步骤2：重置密码 -->
                            <template v-if="resetStep === 1">
                                <el-form-item prop="newPassword">
                                    <el-input v-model="resetForm.newPassword" type="password"
                                        placeholder="新密码 (至少8位，包含字母和数字)" size="large" show-password>
                                        <template #prefix>
                                            <el-icon>
                                                <Lock />
                                            </el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>

                                <el-form-item prop="confirmNewPassword">
                                    <el-input v-model="resetForm.confirmNewPassword" type="password" placeholder="确认新密码"
                                        size="large" show-password @keyup.enter="handleReset">
                                        <template #prefix>
                                            <el-icon>
                                                <Lock />
                                            </el-icon>
                                        </template>
                                    </el-input>
                                </el-form-item>

                                <el-form-item>
                                    <el-button type="primary" size="large" style="width: 100%" :loading="loading"
                                        @click="handleReset">
                                        重置密码
                                    </el-button>
                                </el-form-item>
                            </template>

                            <!-- 步骤3：完成 -->
                            <template v-if="resetStep === 2">
                                <el-result icon="success" title="密码重置成功">
                                    <template #sub-title>
                                        您的密码已成功重置，请使用新密码登录
                                    </template>
                                    <template #extra>
                                        <el-button type="primary" size="large" @click="activeMode = 'login'">
                                            返回登录
                                        </el-button>
                                    </template>
                                </el-result>
                            </template>
                        </el-form>
                    </el-tab-pane>
                </el-tabs>

                <!-- 社交登录占位 -->
                <div class="social-login" v-if="activeMode !== 'reset'">
                    <div class="divider">
                        <span>或使用以下方式登录</span>
                    </div>
                    <div class="social-buttons">
                        <el-button circle disabled>
                            <el-icon><img src="/favicon.ico" style="width: 100%; height: 100%;" /></el-icon>
                        </el-button>
                        <el-tooltip content="即将上线" placement="top">
                            <el-button circle disabled>微信</el-button>
                        </el-tooltip>
                        <el-tooltip content="即将上线" placement="top">
                            <el-button circle disabled>QQ</el-button>
                        </el-tooltip>
                    </div>
                </div>

                <!-- 返回首页 -->
                <div class="back-home">
                    <el-link type="primary" @click="goHome">返回首页</el-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { User, Lock, Message, Key, Phone } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 当前模式
const activeMode = ref<'login' | 'register' | 'reset'>('login')
const loading = ref(false)
const rememberMe = ref(false)

// 重置密码步骤
const resetStep = ref(0)

// 邮箱验证码倒计时
const emailCountdown = ref(0)
const sendingEmail = ref(false)
const resetCountdown = ref(0)
const sendingReset = ref(false)

// 表单引用
const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()
const resetFormRef = ref<FormInstance>()

// 登录表单
const loginForm = ref({
    username: '',
    password: ''
})

// 注册表单
const registerForm = ref({
    username: '',
    email: '',
    emailCode: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreement: false
})

// 重置密码表单
const resetForm = ref({
    email: '',
    code: '',
    newPassword: '',
    confirmNewPassword: ''
})

// 页面标题
const pageTitle = computed(() => {
    switch (activeMode.value) {
        case 'login':
            return '欢迎回来'
        case 'register':
            return '创建账号'
        case 'reset':
            return '找回密码'
        default:
            return ''
    }
})

const pageSubtitle = computed(() => {
    switch (activeMode.value) {
        case 'login':
            return '登录青羽，开启阅读之旅'
        case 'register':
            return '加入青羽，探索知识海洋'
        case 'reset':
            return '重置您的账号密码'
        default:
            return ''
    }
})

// 密码强度计算
const passwordStrength = computed(() => {
    const pwd = registerForm.value.password
    if (!pwd) return 0

    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[a-z]/.test(pwd)) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++

    return Math.min(strength, 3)
})

const passwordStrengthPercent = computed(() => {
    return `${(passwordStrength.value / 3) * 100}%`
})

const passwordStrengthText = computed(() => {
    const texts = ['弱', '中', '强']
    return texts[passwordStrength.value - 1] || '弱'
})

// 表单验证规则
const loginRules: FormRules = {
    username: [
        { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ]
}

const registerRules: FormRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
    ],
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
    ],
    emailCode: [
        { required: true, message: '请输入邮箱验证码', trigger: 'blur' },
        { len: 6, message: '验证码为6位数字', trigger: 'blur' }
    ],
    phone: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 8, message: '密码长度不能少于8位', trigger: 'blur' },
        {
            pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
            message: '密码必须包含字母和数字',
            trigger: 'blur'
        }
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {
            validator: (rule: any, value: string, callback: any) => {
                if (value !== registerForm.value.password) {
                    callback(new Error('两次输入的密码不一致'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ],
    agreement: [
        {
            validator: (rule: any, value: boolean, callback: any) => {
                if (!value) {
                    callback(new Error('请阅读并同意用户协议和隐私政策'))
                } else {
                    callback()
                }
            },
            trigger: 'change'
        }
    ]
}

const resetRules: FormRules = {
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
    ],
    code: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { len: 6, message: '验证码为6位数字', trigger: 'blur' }
    ],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 8, message: '密码长度不能少于8位', trigger: 'blur' },
        {
            pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
            message: '密码必须包含字母和数字',
            trigger: 'blur'
        }
    ],
    confirmNewPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
            validator: (rule: any, value: string, callback: any) => {
                if (value !== resetForm.value.newPassword) {
                    callback(new Error('两次输入的密码不一致'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ]
}

// 处理登录
const handleLogin = async () => {
    if (!loginFormRef.value) return

    await loginFormRef.value.validate(async (valid) => {
        if (valid) {
            loading.value = true
            try {
                await authStore.login({
                    username: loginForm.value.username,
                    password: loginForm.value.password
                })

                ElMessage.success('登录成功')

                // 跳转到重定向页面或首页
                const redirect = route.query.redirect as string
                router.push(redirect || '/')
            } catch (error: any) {
                ElMessage.error(error.message || '登录失败')
            } finally {
                loading.value = false
            }
        }
    })
}

// 发送邮箱验证码
const sendEmailCode = async () => {
    if (!registerForm.value.email) {
        ElMessage.warning('请先输入邮箱地址')
        return
    }

    // 验证邮箱格式
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(registerForm.value.email)) {
        ElMessage.warning('请输入有效的邮箱地址')
        return
    }

    sendingEmail.value = true
    try {
        // TODO: 调用发送验证码API
        // await authAPI.sendVerificationCode(registerForm.value.email)

        ElMessage.success('验证码已发送，请查收邮箱')
        emailCountdown.value = 60

        const timer = setInterval(() => {
            emailCountdown.value--
            if (emailCountdown.value <= 0) {
                clearInterval(timer)
            }
        }, 1000)
    } catch (error: any) {
        ElMessage.error(error.message || '发送验证码失败')
    } finally {
        sendingEmail.value = false
    }
}

// 处理注册
const handleRegister = async () => {
    if (!registerFormRef.value) return

    await registerFormRef.value.validate(async (valid) => {
        if (valid) {
            loading.value = true
            try {
                await authStore.register({
                    username: registerForm.value.username,
                    email: registerForm.value.email,
                    password: registerForm.value.password,
                    phone: registerForm.value.phone || undefined,
                    emailCode: registerForm.value.emailCode
                })

                ElMessage.success('注册成功，请登录')
                activeMode.value = 'login'

                // 清空表单
                registerForm.value = {
                    username: '',
                    email: '',
                    emailCode: '',
                    phone: '',
                    password: '',
                    confirmPassword: '',
                    agreement: false
                }
            } catch (error: any) {
                ElMessage.error(error.message || '注册失败')
            } finally {
                loading.value = false
            }
        }
    })
}

// 发送重置密码验证码
const sendResetCode = async () => {
    if (!resetForm.value.email) {
        ElMessage.warning('请先输入邮箱地址')
        return
    }

    sendingReset.value = true
    try {
        // TODO: 调用发送验证码API
        // await authAPI.sendVerificationCode(resetForm.value.email)

        ElMessage.success('验证码已发送，请查收邮箱')
        resetCountdown.value = 60

        const timer = setInterval(() => {
            resetCountdown.value--
            if (resetCountdown.value <= 0) {
                clearInterval(timer)
            }
        }, 1000)
    } catch (error: any) {
        ElMessage.error(error.message || '发送验证码失败')
    } finally {
        sendingReset.value = false
    }
}

// 验证重置码
const verifyResetCode = async () => {
    if (!resetFormRef.value) return

    // 只验证邮箱和验证码字段
    await resetFormRef.value.validateField(['email', 'code'], async (valid: boolean) => {
        if (valid) {
            loading.value = true
            try {
                // TODO: 调用验证API
                // await authAPI.verifyEmail(resetForm.value.email, resetForm.value.code)

                ElMessage.success('验证成功')
                resetStep.value = 1
            } catch (error: any) {
                ElMessage.error(error.message || '验证失败')
            } finally {
                loading.value = false
            }
        }
    })
}

// 处理重置密码
const handleReset = async () => {
    if (!resetFormRef.value) return

    await resetFormRef.value.validate(async (valid) => {
        if (valid) {
            loading.value = true
            try {
                // TODO: 调用重置密码API
                // await authAPI.resetPassword({
                //   email: resetForm.value.email,
                //   code: resetForm.value.code,
                //   newPassword: resetForm.value.newPassword
                // })

                ElMessage.success('密码重置成功')
                resetStep.value = 2
            } catch (error: any) {
                ElMessage.error(error.message || '重置密码失败')
            } finally {
                loading.value = false
            }
        }
    })
}

// 切换标签页
const handleTabChange = (name: string) => {
    // 重置表单
    if (name === 'reset') {
        resetStep.value = 0
    }
}

// 返回首页
const goHome = () => {
    router.push('/')
}

// 监听路由查询参数
onMounted(() => {
    const mode = route.query.mode as string
    if (mode && ['login', 'register', 'reset'].includes(mode)) {
        activeMode.value = mode as 'login' | 'register' | 'reset'
    }
})

// 监听模式变化，更新URL
watch(activeMode, (newMode) => {
    if (newMode !== route.query.mode) {
        router.replace({ query: { ...route.query, mode: newMode } })
    }
})
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.auth-view {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: $spacing-lg;
}

.auth-container {
    width: 100%;
    max-width: 480px;
}

.auth-card {
    background: $bg-color;
    border-radius: $border-radius-xl;
    padding: $spacing-xxl;
    box-shadow: $box-shadow-dark;
}

.auth-header {
    text-align: center;
    margin-bottom: $spacing-xl;

    .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: $spacing-sm;
        margin-bottom: $spacing-lg;
        cursor: pointer;
        transition: $transition-base;

        &:hover {
            opacity: $hover-opacity;
        }

        .logo-icon {
            width: 40px;
            height: 40px;
        }

        .logo-text {
            font-size: $font-size-xl;
            font-weight: $font-weight-bold;
            color: $primary-color;
        }
    }

    .auth-title {
        margin: 0 0 $spacing-sm 0;
        font-size: $h2-size;
        font-weight: $font-weight-bold;
        color: $text-primary;
    }

    .auth-subtitle {
        margin: 0;
        font-size: $font-size-md;
        color: $text-secondary;
    }
}

.auth-tabs {
    :deep(.el-tabs__header) {
        margin-bottom: $spacing-lg;
    }

    :deep(.el-tabs__item) {
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
    }
}

.auth-form {
    .el-form-item {
        margin-bottom: $spacing-lg;
    }
}

.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.code-input-group {
    display: flex;
    gap: $spacing-sm;
    width: 100%;
}

.password-strength {
    margin-top: $spacing-sm;

    .strength-bar {
        height: 4px;
        background: $border-lighter;
        border-radius: $border-radius-base;
        overflow: hidden;
        margin-bottom: $spacing-xs;

        .strength-fill {
            height: 100%;
            transition: $transition-base;

            &.strength-1 {
                background: $danger-color;
            }

            &.strength-2 {
                background: $warning-color;
            }

            &.strength-3 {
                background: $success-color;
            }
        }
    }

    .strength-text {
        font-size: $font-size-xs;
        color: $text-secondary;
    }
}

.reset-steps {
    margin-bottom: $spacing-xl;
}

.social-login {
    margin-top: $spacing-xl;

    .divider {
        position: relative;
        text-align: center;
        margin: $spacing-xl 0;

        &::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: $border-base;
        }

        span {
            position: relative;
            background: $bg-color;
            padding: 0 $spacing-md;
            font-size: $font-size-sm;
            color: $text-secondary;
        }
    }

    .social-buttons {
        display: flex;
        justify-content: center;
        gap: $spacing-md;
    }
}

.back-home {
    text-align: center;
    margin-top: $spacing-lg;
}

/* 响应式 */
@media (max-width: $breakpoint-sm) {
    .auth-view {
        padding: $spacing-md;
    }

    .auth-card {
        padding: $spacing-lg;
    }

    .auth-header {
        .auth-title {
            font-size: $h3-size;
        }
    }
}
</style>
