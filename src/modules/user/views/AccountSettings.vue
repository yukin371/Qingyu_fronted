<template>
    <div class="account-settings">
        <el-page-header @back="goBack" class="page-header">
            <template #content>
                <span class="page-title">账户设置</span>
            </template>
        </el-page-header>

        <!-- 角色信息卡片 -->
        <el-card class="settings-card role-card">
            <template #header>
                <div class="card-header">
                    <span class="card-title">当前角色</span>
                </div>
            </template>
            <div class="role-info">
                <div class="current-roles">
                    <el-tag
                        v-for="role in userRoles"
                        :key="role"
                        :type="getRoleTagType(role)"
                        size="large"
                        class="role-tag"
                    >
                        {{ getRoleLabel(role) }}
                    </el-tag>
                </div>
                <!-- 降级按钮 - 仅作者可见 -->
                <el-button
                    v-if="canDowngrade"
                    type="danger"
                    plain
                    :icon="ArrowDown"
                    @click="showDowngradeDialog"
                >
                    降级为读者
                </el-button>
            </div>
        </el-card>

        <el-card class="settings-card">
            <qy-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="settings-form">
                <!-- 头像设置 -->
                <qy-form-item label="头像">
                    <div class="avatar-upload-container">
                        <qy-avatar :size="100" :src="form.avatar || userStore.avatar">
                            {{ userStore.displayName.charAt(0) }}
                        </qy-avatar>
                        <div class="avatar-actions">
                            <qy-upload :action="uploadUrl" :headers="uploadHeaders" :show-file-list="false"
                                :before-upload="beforeAvatarUpload" :on-success="handleAvatarSuccess"
                                :on-error="handleUploadError">
                                <qy-button type="primary" :icon="Upload" :loading="uploading">
                                    上传头像
                                </qy-button>
                            </qy-upload>
                            <p class="upload-tip">支持 JPG、PNG 格式，大小不超过 2MB</p>
                        </div>
                    </div>
                </qy-form-item>

                <!-- 昵称 -->
                <qy-form-item label="昵称" prop="nickname">
                    <qy-input v-model="form.nickname" placeholder="请输入昵称" maxlength="50" show-word-limit clearable />
                </qy-form-item>

                <!-- 个人简介 -->
                <qy-form-item label="个人简介" prop="bio">
                    <qy-input v-model="form.bio" type="textarea" placeholder="介绍一下自己吧" :rows="4" maxlength="500"
                        show-word-limit />
                </qy-form-item>

                <!-- 性别 -->
                <qy-form-item label="性别" prop="gender">
                    <el-radio-group v-model="form.gender">
                        <el-radio label="male">男</el-radio>
                        <el-radio label="female">女</el-radio>
                        <el-radio label="other">保密</el-radio>
                    </el-radio-group>
                </qy-form-item>

                <!-- 生日 -->
                <qy-form-item label="生日" prop="birthday">
                    <el-date-picker v-model="form.birthday" type="date" placeholder="选择生日" :disabled-date="disabledDate"
                        value-format="YYYY-MM-DD" />
                </qy-form-item>

                <!-- 所在地 -->
                <qy-form-item label="所在地" prop="location">
                    <qy-input v-model="form.location" placeholder="如：北京市朝阳区" maxlength="100" clearable />
                </qy-form-item>

                <!-- 个人网站 -->
                <qy-form-item label="个人网站" prop="website">
                    <qy-input v-model="form.website" placeholder="https://example.com" maxlength="200" clearable />
                </qy-form-item>

                <!-- 社交账号 -->
                <qy-form-item label="微博">
                    <qy-input v-model="form.social.weibo" placeholder="微博账号" maxlength="50" clearable />
                </qy-form-item>

                <qy-form-item label="微信">
                    <qy-input v-model="form.social.wechat" placeholder="微信号" maxlength="50" clearable />
                </qy-form-item>

                <qy-form-item label="QQ">
                    <qy-input v-model="form.social.qq" placeholder="QQ号" maxlength="20" clearable />
                </qy-form-item>

                <!-- 提交按钮 -->
                <qy-form-item>
                    <qy-button type="primary" :loading="saving" @click="handleSave">
                        保存设置
                    </qy-button>
                    <qy-button @click="handleReset">重置</qy-button>
                </qy-form-item>
            </qy-form>
        </el-card>

        <!-- 降级确认对话框 -->
        <el-dialog
            v-model="downgradeDialogVisible"
            title="降级确认"
            width="400px"
            :before-close="handleDowngradeClose"
        >
            <div class="downgrade-warning">
                <el-icon class="warning-icon"><WarningFilled /></el-icon>
                <p>您确定要降级为读者吗？</p>
                <ul class="downgrade-consequences">
                    <li>将无法访问作者工作台</li>
                    <li>将无法发布新作品</li>
                    <li>已发布的内容将继续保留</li>
                    <li>可以随时重新申请成为作者</li>
                </ul>
            </div>
            <template #footer>
                <el-button @click="handleDowngradeClose">取消</el-button>
                <el-button type="danger" :loading="downgrading" @click="confirmDowngrade">
                    确认降级
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type UploadProps } from 'element-plus'
import { Upload, ArrowDown, WarningFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import storage from '@/utils/storage'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  ROLES: 'roles'
}

// 上传配置
const uploadUrl = ref('/api/upload/avatar')
const uploadHeaders = {
    Authorization: `Bearer ${authStore.token}`
}

// 表单引用
const formRef = ref<FormInstance>()

// 状态
const saving = ref(false)
const uploading = ref(false)
const downgradeDialogVisible = ref(false)
const downgrading = ref(false)

// 用户角色 - 优先使用响应式的authStore，localStorage作为后备
const userRoles = computed(() => {
    // 优先：从authStore获取（响应式数据源，确保UI自动更新）
    const storeRoles = authStore.roles || authStore.user?.roles
    if (storeRoles && storeRoles.length > 0) {
        console.log('[AccountSettings] ✅ Using authStore roles:', storeRoles)
        return storeRoles
    }

    // 后备：从localStorage读取（用于初始化和持久化）
    try {
        const stored = localStorage.getItem('qingyu_roles')
        if (stored) {
            const parsed = JSON.parse(stored) as string[]
            if (parsed && parsed.length > 0) {
                console.log('[AccountSettings] ⚠️ Using localStorage roles as fallback:', parsed)
                // 同步到authStore以保持一致
                ;(authStore as { roles: string[] }).roles = parsed
                return parsed
            }
        }
    } catch (e) {
        console.error('[AccountSettings] Failed to parse localStorage roles:', e)
    }

    console.log('[AccountSettings] ❌ No roles found anywhere')
    return []
})

// 是否可以降级（有author或admin角色）
const canDowngrade = computed(() => {
    return userRoles.value.includes('author') || userRoles.value.includes('admin')
})

// 表单数据
const form = reactive({
    avatar: '',
    nickname: '',
    bio: '',
    gender: 'other',
    birthday: '',
    location: '',
    website: '',
    social: {
        weibo: '',
        wechat: '',
        qq: ''
    }
})

// 验证规则
const rules = {
    nickname: [
        { max: 50, message: '昵称长度不能超过50个字符', trigger: 'blur' }
    ],
    bio: [
        { max: 500, message: '个人简介长度不能超过500个字符', trigger: 'blur' }
    ],
    website: [
        {
            pattern: /^https?:\/\/.+/,
            message: '请输入有效的网址（以http://或https://开头）',
            trigger: 'blur'
        }
    ]
}

// 获取角色标签颜色
const getRoleTagType = (role: string) => {
    const roleTypes: Record<string, string> = {
        admin: 'danger',
        author: 'success',
        reader: 'info'
    }
    return roleTypes[role] || 'info'
}

// 获取角色标签文本
const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
        admin: '管理员',
        author: '作者',
        reader: '读者'
    }
    return roleLabels[role] || role
}

// 显示降级对话框
const showDowngradeDialog = () => {
    downgradeDialogVisible.value = true
}

// 关闭降级对话框
const handleDowngradeClose = () => {
    downgradeDialogVisible.value = false
}

// 确认降级
const confirmDowngrade = async () => {
    try {
        downgrading.value = true

        const token = localStorage.getItem('qingyu_token')
        console.log('[降级] 开始降级流程, token:', token?.substring(0, 20) + '...')

        const response = await fetch('/api/v1/user/role/downgrade', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                target_role: 'reader',
                confirm: true
            })
        })

        console.log('[降级] API响应状态:', response.status, response.statusText)

        if (response.ok) {
            const result = await response.json()
            console.log('[降级] API完整响应:', result)
            console.log('[降级] result.data:', result.data)
            console.log('[降级] result.data.current_roles:', result.data?.current_roles)

            ElMessage.success('降级成功')
            downgradeDialogVisible.value = false

            // 更新 authStore 中的 roles（响应式，确保UI立即更新）
            const newRoles = result.data?.current_roles || ['reader']
            console.log('[降级] 准备更新roles为:', newRoles)

            // 先更新响应式数据，确保UI立即响应
            authStore.roles = newRoles
            if (authStore.user) {
                authStore.user.roles = newRoles
            }
            console.log('[降级] authStore已更新, authStore.roles:', authStore.roles)
            console.log('[降级] authStore.user.roles:', authStore.user?.roles)

            // 然后持久化到 localStorage
            localStorage.setItem('qingyu_roles', JSON.stringify(newRoles))
            console.log('[降级] localStorage已更新')

            // 验证更新是否成功
            const storedRoles = localStorage.getItem('qingyu_roles')
            console.log('[降级] 验证localStorage中的qingyu_roles:', storedRoles)

            // 跳转到首页
            console.log('[降级] 准备跳转到首页')
            router.push('/bookstore')
        } else {
            const data = await response.json()
            console.error('[降级] API错误响应:', data)
            ElMessage.error(data.message || '降级失败')
        }
    } catch (error) {
        console.error('降级失败:', error)
        ElMessage.error('降级失败，请稍后重试')
    } finally {
        downgrading.value = false
    }
}

// 初始化表单
const initForm = () => {
    const profile = userStore.profile as Record<string, unknown>
    form.avatar = (profile?.avatar as string) || ''
    form.nickname = (profile?.nickname as string) || ''
    form.bio = (profile?.bio as string) || ''
    form.gender = (profile?.gender as string) || 'other'
    form.birthday = (profile?.birthday as string) || ''
    form.location = (profile?.location as string) || ''
    form.website = (profile?.website as string) || ''
    form.social = (profile?.social as { weibo: string; wechat: string; qq: string }) || { weibo: '', wechat: '', qq: '' }
}

// 禁用未来日期
const disabledDate = (date: Date) => {
    return date.getTime() > Date.now()
}

// 头像上传前验证
const beforeAvatarUpload: UploadProps['beforeUpload'] = (file) => {
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isImage) {
        ElMessage.error('只能上传 JPG/PNG 格式的图片')
        return false
    }
    if (!isLt2M) {
        ElMessage.error('图片大小不能超过 2MB')
        return false
    }

    uploading.value = true
    return true
}

// 头像上传成功
const handleAvatarSuccess: UploadProps['onSuccess'] = (response: unknown) => {
    uploading.value = false
    const res = response as { code?: number; data?: { url?: string }; message?: string }
    if (res.code === 200 && res.data?.url) {
        form.avatar = res.data.url
        ElMessage.success('头像上传成功')
    } else {
        ElMessage.error(res.message || '上传失败')
    }
}

// 上传失败
const handleUploadError: UploadProps['onError'] = () => {
    uploading.value = false
    ElMessage.error('上传失败,请重试')
}

// 保存设置
const handleSave = async () => {
    if (!formRef.value) return

    try {
        const valid = await formRef.value.validate()
        if (!valid) return

        saving.value = true

        // 准备更新数据
        const updateData: Record<string, unknown> = {}
        if (form.avatar) updateData.avatar = form.avatar
        if (form.nickname) updateData.nickname = form.nickname
        if (form.bio) updateData.bio = form.bio
        if (form.gender) updateData.gender = form.gender
        if (form.birthday) updateData.birthday = form.birthday
        if (form.location) updateData.location = form.location
        if (form.website) updateData.website = form.website
        updateData.social = form.social

        await userStore.updateProfile(updateData)
        ElMessage.success('保存成功')
    } catch (error: unknown) {
        ElMessage.error((error as Error).message || '保存失败')
    } finally {
        saving.value = false
    }
}

// 重置表单
const handleReset = () => {
    initForm()
    formRef.value?.clearValidate()
    ElMessage.info('已重置')
}

// 返回
const goBack = () => {
    router.back()
}

// 初始化
onMounted(async () => {
    await userStore.fetchProfile()
    initForm()

    // 添加：确保roles从localStorage恢复
    if (authStore.token && (!authStore.roles || authStore.roles.length === 0)) {
        console.log('[AccountSettings] authStore.roles为空，尝试从localStorage恢复')
        const savedRoles = storage.get<string[]>(STORAGE_KEYS.ROLES)
        if (savedRoles && savedRoles.length > 0) {
            authStore.roles = savedRoles
            console.log('[AccountSettings] 恢复roles成功:', savedRoles)
        } else {
            // 如果localStorage也没有，调用initAuth
            await authStore.initAuth()
            console.log('[AccountSettings] 调用initAuth后的roles:', authStore.roles)
        }
    }
})
</script>

<style scoped lang="scss">
.account-settings {
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

.settings-card {
    border-radius: 8px;
    margin-bottom: 20px;
}

.role-card {
    .card-header {
        .card-title {
            font-weight: 600;
        }
    }

    .role-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
    }

    .current-roles {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .role-tag {
        font-size: 14px;
    }
}

.settings-form {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px 0;
}

.avatar-upload-container {
    display: flex;
    align-items: center;
    gap: 24px;

    .avatar-actions {
        .upload-tip {
            margin-top: 8px;
            font-size: 12px;
            color: #909399;
        }
    }
}

.downgrade-warning {
    text-align: center;

    .warning-icon {
        font-size: 48px;
        color: #e6a23c;
        margin-bottom: 16px;
    }

    p {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 16px;
    }

    .downgrade-consequences {
        text-align: left;
        padding-left: 20px;
        margin: 0;
        color: #606266;

        li {
            margin: 8px 0;
        }
    }
}

@media (max-width: 768px) {
    .account-settings {
        padding: 10px;
    }

    .settings-form {
        padding: 10px 0;
    }

    .avatar-upload-container {
        flex-direction: column;
        text-align: center;
    }

    .role-info {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>
