<template>
    <div class="account-settings">
        <el-page-header @back="goBack" class="page-header">
            <template #content>
                <span class="page-title">账户设置</span>
            </template>
        </el-page-header>

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
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, type UploadProps } from '@/design-system/services'
import { Upload } from '@element-plus/icons-vue'
import QyForm from '@/design-system/components/advanced/QyForm/QyForm.vue'
import QyFormItem from '@/design-system/components/advanced/QyForm/QyFormItem.vue'
import QyInput from '@/design-system/components/basic/QyInput/QyInput.vue'
import QyButton from '@/design-system/components/basic/QyButton/QyButton.vue'
import QyCard from '@/design-system/components/basic/QyCard/QyCard.vue'
import QyAvatar from '@/design-system/components/basic/QyAvatar/QyAvatar.vue'
import QyUpload from '@/design-system/form/Upload/Upload.vue'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()

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

// 初始化表单
const initForm = () => {
    const profile = userStore.profile as any
    form.avatar = profile?.avatar || ''
    form.nickname = profile?.nickname || ''
    form.bio = profile?.bio || ''
    form.gender = profile?.gender || 'other'
    form.birthday = profile?.birthday || ''
    form.location = profile?.location || ''
    form.website = profile?.website || ''
    form.social = profile?.social || { weibo: '', wechat: '', qq: '' }
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
        message.error('只能上传 JPG/PNG 格式的图片')
        return false
    }
    if (!isLt2M) {
        message.error('图片大小不能超过 2MB')
        return false
    }

    uploading.value = true
    return true
}

// 头像上传成功
const handleAvatarSuccess: UploadProps['onSuccess'] = (response) => {
    uploading.value = false
    if (response.code === 200) {
        form.avatar = response.data.url
        message.success('头像上传成功')
    } else {
        message.error(response.message || '上传失败')
    }
}

// 上传失败
const handleUploadError: UploadProps['onError'] = () => {
    uploading.value = false
    message.error('上传失败,请重试')
}

// 保存设置
const handleSave = async () => {
    if (!formRef.value) return

    try {
        const valid = await formRef.value.validate()
        if (!valid) return

        saving.value = true

        // 准备更新数据
        const updateData: any = {}
        if (form.avatar) updateData.avatar = form.avatar
        if (form.nickname) updateData.nickname = form.nickname
        if (form.bio) updateData.bio = form.bio
        if (form.gender) updateData.gender = form.gender
        if (form.birthday) updateData.birthday = form.birthday
        if (form.location) updateData.location = form.location
        if (form.website) updateData.website = form.website
        updateData.social = form.social

        await userStore.updateProfile(updateData)
        message.success('保存成功')
    } catch (error: any) {
        message.error(error.message || '保存失败')
    } finally {
        saving.value = false
    }
}

// 重置表单
const handleReset = () => {
    initForm()
    formRef.value?.clearValidate()
    message.info('已重置')
}

// 返回
const goBack = () => {
    router.back()
}

// 初始化
onMounted(async () => {
    await userStore.fetchProfile()
    initForm()
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
}
</style>
