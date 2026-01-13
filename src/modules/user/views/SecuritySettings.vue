<template>
    <div class="security-settings">
        <el-page-header @back="goBack" class="page-header">
            <template #content>
                <span class="page-title">安全设置</span>
            </template>
        </el-page-header>

        <!-- 修改密码 -->
        <el-card class="settings-section">
            <template #header>
                <div class="section-header">
                    <span>修改密码</span>
                </div>
            </template>
            <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="120px"
                class="settings-form">
                <el-form-item label="当前密码" prop="old_password">
                    <el-input v-model="passwordForm.old_password" type="password" placeholder="请输入当前密码" show-password
                        clearable />
                </el-form-item>

                <el-form-item label="新密码" prop="new_password">
                    <el-input v-model="passwordForm.new_password" type="password" placeholder="请输入新密码（至少6位）"
                        show-password clearable />
                </el-form-item>

                <el-form-item label="确认密码" prop="confirm_password">
                    <el-input v-model="passwordForm.confirm_password" type="password" placeholder="请再次输入新密码"
                        show-password clearable />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" :loading="passwordSaving" @click="handleChangePassword">
                        修改密码
                    </el-button>
                    <el-button @click="resetPasswordForm">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 绑定手机 -->
        <el-card class="settings-section">
            <template #header>
                <div class="section-header">
                    <span>手机绑定</span>
                    <el-tag v-if="userStore.profile?.phone" type="success" size="small">已绑定</el-tag>
                    <el-tag v-else type="info" size="small">未绑定</el-tag>
                </div>
            </template>
            <el-form ref="phoneFormRef" :model="phoneForm" :rules="phoneRules" label-width="120px"
                class="settings-form">
                <el-form-item label="当前手机">
                    <el-input :value="formatPhone(userStore.profile?.phone)" disabled />
                </el-form-item>

                <template v-if="phoneEditMode">
                    <el-form-item label="新手机号" prop="phone">
                        <el-input v-model="phoneForm.phone" placeholder="请输入新手机号" maxlength="11" clearable />
                    </el-form-item>

                    <el-form-item label="验证码" prop="code">
                        <div class="code-input">
                            <el-input v-model="phoneForm.code" placeholder="请输入验证码" maxlength="6" clearable />
                            <el-button :disabled="codeCooldown > 0" @click="sendPhoneCode">
                                {{ codeCooldown > 0 ? `${codeCooldown}秒后重试` : '发送验证码' }}
                            </el-button>
                        </div>
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" :loading="phoneSaving" @click="handleBindPhone">
                            确认绑定
                        </el-button>
                        <el-button @click="cancelPhoneEdit">取消</el-button>
                    </el-form-item>
                </template>

                <el-form-item v-else>
                    <el-button type="primary" @click="phoneEditMode = true">
                        {{ userStore.profile?.phone ? '更换手机号' : '绑定手机号' }}
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 绑定邮箱 -->
        <el-card class="settings-section">
            <template #header>
                <div class="section-header">
                    <span>邮箱绑定</span>
                    <el-tag v-if="userStore.profile?.emailVerified" type="success" size="small">已验证</el-tag>
                    <el-tag v-else type="warning" size="small">未验证</el-tag>
                </div>
            </template>
            <el-form ref="emailFormRef" :model="emailForm" :rules="emailRules" label-width="120px"
                class="settings-form">
                <el-form-item label="当前邮箱">
                    <el-input :value="userStore.email" disabled />
                </el-form-item>

                <template v-if="!userStore.profile?.emailVerified">
                    <el-form-item>
                        <el-button type="primary" :loading="emailSending" @click="sendEmailVerification">
                            发送验证邮件
                        </el-button>
                    </el-form-item>
                </template>

                <template v-if="emailEditMode">
                    <el-form-item label="新邮箱" prop="email">
                        <el-input v-model="emailForm.email" placeholder="请输入新邮箱地址" clearable />
                    </el-form-item>

                    <el-form-item label="验证码" prop="code">
                        <div class="code-input">
                            <el-input v-model="emailForm.code" placeholder="请输入验证码" maxlength="6" clearable />
                            <el-button :disabled="emailCooldown > 0" @click="sendEmailCode">
                                {{ emailCooldown > 0 ? `${emailCooldown}秒后重试` : '发送验证码' }}
                            </el-button>
                        </div>
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" :loading="emailSaving" @click="handleBindEmail">
                            确认绑定
                        </el-button>
                        <el-button @click="cancelEmailEdit">取消</el-button>
                    </el-form-item>
                </template>

                <el-form-item v-else-if="userStore.profile?.emailVerified">
                    <el-button type="primary" @click="emailEditMode = true">
                        更换邮箱
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 登录设备 -->
        <el-card class="settings-section">
            <template #header>
                <div class="section-header">
                    <span>登录设备</span>
                </div>
            </template>
            <div class="devices-list">
                <el-empty v-if="loginDevices.length === 0" description="暂无登录设备" />
                <div v-else v-for="device in loginDevices" :key="device.id" class="device-item">
                    <div class="device-icon">
                        <el-icon :size="32">
                            <Monitor v-if="device.deviceType === 'desktop'" />
                            <Iphone v-else-if="device.deviceType === 'mobile'" />
                            <Van v-else />
                        </el-icon>
                    </div>
                    <div class="device-info">
                        <div class="device-name">{{ device.deviceName || device.browser }}</div>
                        <div class="device-meta">
                            <span v-if="device.location">{{ device.location }}</span>
                            <span v-if="device.ip">{{ device.ip }}</span>
                            <span>{{ formatDate(device.lastActiveTime) }}</span>
                        </div>
                    </div>
                    <div class="device-action">
                        <el-tag v-if="device.isCurrent" type="success">当前设备</el-tag>
                        <el-button v-else type="danger" text @click="removeDevice(device.id)">
                            移除
                        </el-button>
                    </div>
                </div>
            </div>
        </el-card>

        <!-- 账号注销 -->
        <el-card class="settings-section danger-section">
            <template #header>
                <div class="section-header">
                    <span>危险操作</span>
                </div>
            </template>
            <div class="danger-content">
                <p>注销账号后，您的所有数据将被永久删除且无法恢复，请谨慎操作。</p>
                <el-button type="danger" @click="handleDeleteAccount">
                    注销账号
                </el-button>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Monitor, Iphone, Van } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import {
  sendPhoneVerifyCode,
  bindPhone,
  changePhone,
  sendEmailVerifyCode,
  bindEmail,
  changeEmail,
  verifyEmail,
  changePassword as changePasswordAPI,
  getLoginDevices,
  removeDevice as removeDeviceAPI,
  cancelAccount,
  type LoginDevice
} from '@/modules/user/api'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()

// 表单引用
const passwordFormRef = ref<FormInstance>()
const phoneFormRef = ref<FormInstance>()
const emailFormRef = ref<FormInstance>()

// 状态
const passwordSaving = ref(false)
const phoneSaving = ref(false)
const emailSaving = ref(false)
const emailSending = ref(false)
const phoneEditMode = ref(false)
const emailEditMode = ref(false)
const codeCooldown = ref(0)
const emailCooldown = ref(0)

// 密码表单
const passwordForm = reactive({
    old_password: '',
    new_password: '',
    confirm_password: ''
})

// 手机表单
const phoneForm = reactive({
    phone: '',
    code: ''
})

// 邮箱表单
const emailForm = reactive({
    email: '',
    code: ''
})

const loginDevices = ref<LoginDevice[]>([])

// 验证规则
const passwordRules = {
    old_password: [
        { required: true, message: '请输入当前密码', trigger: 'blur' }
    ],
    new_password: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少6位', trigger: 'blur' }
    ],
    confirm_password: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value !== passwordForm.new_password) {
                    callback(new Error('两次输入的密码不一致'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ]
}

const phoneRules = {
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
    ],
    code: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { len: 6, message: '验证码为6位数字', trigger: 'blur' }
    ]
}

const emailRules = {
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
    ],
    code: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { len: 6, message: '验证码为6位数字', trigger: 'blur' }
    ]
}

// 修改密码
const handleChangePassword = async () => {
    if (!passwordFormRef.value) return

    try {
        const valid = await passwordFormRef.value.validate()
        if (!valid) return

        await ElMessageBox.confirm('确定要修改密码吗？修改后需要重新登录', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })

        passwordSaving.value = true
        await changePasswordAPI({
            oldPassword: passwordForm.old_password,
            newPassword: passwordForm.new_password
        })

        ElMessage.success('密码修改成功，请重新登录')
        resetPasswordForm()

        // 退出登录
        setTimeout(() => {
            authStore.logout()
        }, 1500)
    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || '修改密码失败')
        }
    } finally {
        passwordSaving.value = false
    }
}

// 重置密码表单
const resetPasswordForm = () => {
    passwordForm.old_password = ''
    passwordForm.new_password = ''
    passwordForm.confirm_password = ''
    passwordFormRef.value?.clearValidate()
}

// 发送手机验证码
const sendPhoneCode = async () => {
    if (!phoneForm.phone) {
        ElMessage.warning('请先输入手机号')
        return
    }

    if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
        ElMessage.warning('请输入有效的手机号')
        return
    }

    try {
        await sendPhoneVerifyCode(phoneForm.phone, userStore.profile?.phone ? 'change' : 'bind')
        ElMessage.success('验证码已发送')

        // 开始倒计时
        codeCooldown.value = 60
        const timer = setInterval(() => {
            codeCooldown.value--
            if (codeCooldown.value <= 0) {
                clearInterval(timer)
            }
        }, 1000)
    } catch (error: any) {
        console.error('发送验证码失败:', error)
        ElMessage.error(error.message || '发送验证码失败')
    }
}

// 绑定手机
const handleBindPhone = async () => {
    if (!phoneFormRef.value) return

    try {
        const valid = await phoneFormRef.value.validate()
        if (!valid) return

        phoneSaving.value = true
        // 根据是否已绑定手机号，调用不同的API
        if (userStore.profile?.phone) {
            await changePhone({
                newPhone: phoneForm.phone,
                code: phoneForm.code
            })
        } else {
            await bindPhone({
                phone: phoneForm.phone,
                code: phoneForm.code
            })
        }

        ElMessage.success('绑定成功')
        phoneEditMode.value = false
        phoneForm.phone = ''
        phoneForm.code = ''
        await userStore.fetchProfile()
    } catch (error: any) {
        ElMessage.error(error.message || '绑定失败')
    } finally {
        phoneSaving.value = false
    }
}

// 取消手机绑定
const cancelPhoneEdit = () => {
    phoneEditMode.value = false
    phoneForm.phone = ''
    phoneForm.code = ''
    phoneFormRef.value?.clearValidate()
}

// 发送邮箱验证
const sendEmailVerification = async () => {
    emailSending.value = true
    try {
        await verifyEmail()
        ElMessage.success('验证邮件已发送，请查收')
    } catch (error) {
        ElMessage.error('发送失败')
    } finally {
        emailSending.value = false
    }
}

// 发送邮箱验证码
const sendEmailCode = async () => {
    if (!emailForm.email) {
        ElMessage.warning('请先输入邮箱地址')
        return
    }

    try {
        await sendEmailVerifyCode(emailForm.email, userStore.profile?.emailVerified ? 'change' : 'bind')
        ElMessage.success('验证码已发送')

        // 开始倒计时
        emailCooldown.value = 60
        const timer = setInterval(() => {
            emailCooldown.value--
            if (emailCooldown.value <= 0) {
                clearInterval(timer)
            }
        }, 1000)
    } catch (error) {
        ElMessage.error('发送验证码失败')
    }
}

// 绑定邮箱
const handleBindEmail = async () => {
    if (!emailFormRef.value) return

    try {
        const valid = await emailFormRef.value.validate()
        if (!valid) return

        emailSaving.value = true
        // 根据邮箱验证状态，调用不同的API
        if (userStore.profile?.emailVerified) {
            await changeEmail({
                newEmail: emailForm.email,
                code: emailForm.code
            })
        } else {
            await bindEmail({
                email: emailForm.email,
                code: emailForm.code
            })
        }

        ElMessage.success('绑定成功')
        emailEditMode.value = false
        emailForm.email = ''
        emailForm.code = ''
        await userStore.fetchProfile()
    } catch (error: any) {
        ElMessage.error(error.message || '绑定失败')
    } finally {
        emailSaving.value = false
    }
}

// 取消邮箱绑定
const cancelEmailEdit = () => {
    emailEditMode.value = false
    emailForm.email = ''
    emailForm.code = ''
    emailFormRef.value?.clearValidate()
}

// 移除设备
const removeDevice = async (deviceId: string) => {
    try {
        await ElMessageBox.confirm('确定要移除此设备吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })

        await removeDeviceAPI(deviceId)
        loginDevices.value = loginDevices.value.filter(d => d.id !== deviceId)
        ElMessage.success('已移除')
    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error('操作失败')
        }
    }
}

// 注销账号
const handleDeleteAccount = async () => {
    try {
        await ElMessageBox.confirm(
            '注销账号后，您的所有数据将被永久删除且无法恢复。确定要继续吗？',
            '警告',
            {
                confirmButtonText: '确定注销',
                cancelButtonText: '取消',
                type: 'error'
            }
        )

        // 需要输入密码确认
        const { value: password } = await ElMessageBox.prompt(
            '请输入您的账号密码以确认注销',
            '确认密码',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputType: 'password',
                inputPattern: /.{6,}/,
                inputErrorMessage: '密码长度至少6位'
            }
        )

        await cancelAccount({
            password: password as string
        })

        ElMessage.success('账号已注销')
        authStore.logout()
    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error('操作失败')
        }
    }
}

// 格式化手机号
const formatPhone = (phone?: string) => {
    if (!phone) return '未绑定'
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
}

// 格式化日期
const formatDate = (date: string) => {
    return new Date(date).toLocaleString('zh-CN')
}

// 返回
const goBack = () => {
    router.back()
}

// 加载登录设备
const loadLoginDevices = async () => {
    try {
        const response: any = await getLoginDevices({ page: 1, size: 50 })
        if (response.data && Array.isArray(response.data)) {
            loginDevices.value = response.data
        }
    } catch (error: any) {
        console.error('加载登录设备失败:', error)
        // 如果API未实现，使用默认数据
        loginDevices.value = []
    }
}

// 初始化
onMounted(async () => {
    await userStore.fetchProfile()
    await loadLoginDevices()
})
</script>

<style scoped lang="scss">
.security-settings {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
}

.page-header {
    margin-bottom: 20px;

    .page-title {
        font-size: 20px;
        font-weight: 600;
    }
}

.settings-section {
    margin-bottom: 20px;
    border-radius: 8px;

    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 16px;
        font-weight: 600;
    }
}

.settings-form {
    max-width: 500px;
    padding: 20px 0;

    .code-input {
        display: flex;
        gap: 12px;

        .el-input {
            flex: 1;
        }
    }
}

.devices-list {
    .device-item {
        display: flex;
        align-items: center;
        padding: 16px 0;
        border-bottom: 1px solid #ebeef5;

        &:last-child {
            border-bottom: none;
        }

        .device-icon {
            margin-right: 16px;
            color: #606266;
        }

        .device-info {
            flex: 1;

            .device-name {
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 4px;
            }

            .device-meta {
                font-size: 12px;
                color: #909399;

                span {
                    margin-right: 16px;
                }
            }
        }
    }
}

.danger-section {
    border-color: #f56c6c;

    .danger-content {
        padding: 20px 0;

        p {
            margin-bottom: 16px;
            color: #606266;
        }
    }
}

@media (max-width: 768px) {
    .security-settings {
        padding: 10px;
    }

    .settings-form {
        padding: 10px 0;
    }

    .code-input {
        flex-direction: column;

        .el-button {
            width: 100%;
        }
    }
}
</style>
