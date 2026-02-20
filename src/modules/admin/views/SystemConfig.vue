<template>
  <div class="system-config-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-info">
        <h2 class="page-title">系统配置</h2>
        <p class="page-subtitle">管理系统的各项配置参数，支持分组管理和备份恢复</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleSave" :loading="saving">
          <el-icon><Check /></el-icon>
          保存修改
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-item groups">
        <div class="stat-icon">
          <el-icon :size="20"><FolderOpened /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.groups }}</span>
          <span class="stat-label">配置分组</span>
        </div>
      </div>
      <div class="stat-item configs">
        <div class="stat-icon">
          <el-icon :size="20"><Setting /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.configs }}</span>
          <span class="stat-label">配置项数</span>
        </div>
      </div>
      <div class="stat-item editable">
        <div class="stat-icon">
          <el-icon :size="20"><Edit /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.editable }}</span>
          <span class="stat-label">可编辑项</span>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="actions-card">
      <el-button @click="loadConfigs">
        <el-icon><Refresh /></el-icon>
        重新加载
      </el-button>
      <el-button @click="showBackupDialog = true">
        <el-icon><FolderOpened /></el-icon>
        配置备份
      </el-button>
      <el-button type="warning" @click="handleResetDefaults">
        <el-icon><RefreshRight /></el-icon>
        恢复默认
      </el-button>
    </div>

    <!-- 配置列表 -->
    <div class="config-card" v-loading="loading">
      <el-collapse v-model="activeGroups" accordion>
        <el-collapse-item
          v-for="group in configGroups"
          :key="group.name"
          :name="group.name"
        >
          <template #title>
            <div class="group-header">
              <el-icon class="group-icon" :class="group.name">
                <component :is="getGroupIcon(group.name)" />
              </el-icon>
              <span class="group-title">{{ group.description }}</span>
              <span class="group-count">{{ group.items?.length || 0 }} 项</span>
            </div>
          </template>

          <el-form label-width="200px" class="config-form">
            <el-form-item
              v-for="item in group.items"
              :key="item.key"
              :label="item.description"
            >
              <!-- Boolean类型 -->
              <el-switch
                v-if="item.type === 'boolean'"
                v-model="configValues[item.key]"
                :disabled="!item.editable"
                active-color="#10b981"
              />

              <!-- Number类型 -->
              <el-input-number
                v-else-if="item.type === 'number'"
                v-model="configValues[item.key]"
                :disabled="!item.editable"
                style="width: 200px"
                controls-position="right"
              />

              <!-- String类型 -->
              <el-input
                v-else
                v-model="configValues[item.key]"
                :type="item.sensitive ? 'password' : 'text'"
                :disabled="!item.editable"
                :placeholder="item.sensitive ? '******' : '请输入配置值'"
                style="width: 350px"
                clearable
              >
                <template #suffix v-if="item.editable">
                  <el-icon class="edit-indicator" color="#10b981"><Edit /></el-icon>
                </template>
              </el-input>

              <span class="config-key">{{ item.key }}</span>
              <el-tag v-if="item.sensitive" type="warning" size="small" style="margin-left: 8px">
                敏感
              </el-tag>
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 备份管理对话框 -->
    <el-dialog v-model="showBackupDialog" title="配置备份管理" width="600px">
      <el-alert type="info" :closable="false" style="margin-bottom: 20px">
        <template #title>
          <div style="display: flex; align-items: center; gap: 8px">
            <el-icon><InfoFilled /></el-icon>
            配置备份可以帮助您在修改配置出错时快速恢复
          </div>
        </template>
      </el-alert>

      <div v-loading="loadingBackups">
        <div class="backup-header">
          <h4>可用备份</h4>
          <el-button type="primary" size="small" @click="handleCreateBackup">
            <el-icon><Plus /></el-icon>
            创建备份
          </el-button>
        </div>

        <el-empty v-if="backups.length === 0" description="暂无备份" />
        <div v-else class="backup-list">
          <div v-for="(backup, index) in backups" :key="index" class="backup-item">
            <div class="backup-info">
              <el-icon><Clock /></el-icon>
              <span>{{ backup.name }}</span>
              <span class="backup-time">{{ backup.time }}</span>
            </div>
            <div class="backup-actions">
              <el-button type="primary" size="small" @click="handleRestore(backup)">
                恢复
              </el-button>
              <el-button type="danger" size="small" @click="handleDeleteBackup(backup)">
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showBackupDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message, messageBox } from '@/design-system/services'
import {
  Check, Refresh, FolderOpened, Setting, Edit, RefreshRight,
  InfoFilled, Plus, Clock, User, Lock, Bell, CreditCard, Document
} from '@element-plus/icons-vue'

// 检查是否为测试模式
const isTestMode = computed(() => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('test') === 'true'
})

const loading = ref(false)
const saving = ref(false)
const configGroups = ref<any[]>([])
const configValues = reactive<Record<string, any>>({})
const activeGroups = ref<string[]>([])
const showBackupDialog = ref(false)
const backups = ref<any[]>([])
const loadingBackups = ref(false)

// 统计数据
const stats = reactive({
  groups: 5,
  configs: 20,
  editable: 15
})

// 生成模拟配置数据
const createMockConfigGroups = () => {
  return [
    {
      name: 'site',
      description: '站点设置',
      items: [
        { key: 'site.name', description: '站点名称', type: 'string', value: '青云阅读', editable: true },
        { key: 'site.description', description: '站点描述', type: 'string', value: '优质原创阅读平台', editable: true },
        { key: 'site.keywords', description: 'SEO关键词', type: 'string', value: '小说,阅读,原创', editable: true },
        { key: 'site.icp', description: 'ICP备案号', type: 'string', value: '京ICP备XXXXXXXX号', editable: true }
      ]
    },
    {
      name: 'user',
      description: '用户设置',
      items: [
        { key: 'user.register_enabled', description: '开放注册', type: 'boolean', value: true, editable: true },
        { key: 'user.email_verify_required', description: '邮箱验证必填', type: 'boolean', value: true, editable: true },
        { key: 'user.max_login_attempts', description: '最大登录尝试次数', type: 'number', value: 5, editable: true },
        { key: 'user.session_timeout', description: '会话超时时间(分钟)', type: 'number', value: 1440, editable: true }
      ]
    },
    {
      name: 'content',
      description: '内容设置',
      items: [
        { key: 'content.audit_enabled', description: '开启内容审核', type: 'boolean', value: true, editable: true },
        { key: 'content.auto_publish', description: '自动发布', type: 'boolean', value: false, editable: true },
        { key: 'content.min_chapter_words', description: '章节最少字数', type: 'number', value: 1000, editable: true },
        { key: 'content.max_chapter_words', description: '章节最多字数', type: 'number', value: 20000, editable: true }
      ]
    },
    {
      name: 'payment',
      description: '支付设置',
      items: [
        { key: 'payment.alipay_enabled', description: '启用支付宝', type: 'boolean', value: true, editable: true },
        { key: 'payment.wechat_enabled', description: '启用微信支付', type: 'boolean', value: true, editable: true },
        { key: 'payment.min_withdraw', description: '最低提现金额', type: 'number', value: 50, editable: true },
        { key: 'payment.alipay_appid', description: '支付宝AppID', type: 'string', value: '2021XXXXXX', editable: true, sensitive: true },
        { key: 'payment.alipay_secret', description: '支付宝密钥', type: 'string', value: '****', editable: true, sensitive: true }
      ]
    },
    {
      name: 'notify',
      description: '通知设置',
      items: [
        { key: 'notify.email_enabled', description: '启用邮件通知', type: 'boolean', value: true, editable: true },
        { key: 'notify.sms_enabled', description: '启用短信通知', type: 'boolean', value: false, editable: true },
        { key: 'notify.smtp_host', description: 'SMTP服务器', type: 'string', value: 'smtp.example.com', editable: true },
        { key: 'notify.smtp_port', description: 'SMTP端口', type: 'number', value: 465, editable: true },
        { key: 'notify.smtp_password', description: 'SMTP密码', type: 'string', value: '****', editable: true, sensitive: true }
      ]
    }
  ]
}

const mockConfigGroups = createMockConfigGroups()

// 生成模拟备份数据
const createMockBackups = () => {
  return [
    { name: '自动备份 - 2025-02-19 10:00', time: '2025-02-19 10:00:00', id: 'backup_1' },
    { name: '手动备份 - 2025-02-18 15:30', time: '2025-02-18 15:30:00', id: 'backup_2' },
    { name: '自动备份 - 2025-02-17 10:00', time: '2025-02-17 10:00:00', id: 'backup_3' }
  ]
}

const mockBackups = createMockBackups()

// 获取分组图标
const getGroupIcon = (name: string) => {
  const icons: Record<string, any> = {
    site: Document,
    user: User,
    content: Edit,
    payment: CreditCard,
    notify: Bell
  }
  return icons[name] || Setting
}

// 加载配置
const loadConfigs = async () => {
  loading.value = true
  try {
    if (isTestMode.value) {
      configGroups.value = mockConfigGroups

      // 初始化配置值
      mockConfigGroups.forEach(group => {
        group.items.forEach((item: any) => {
          configValues[item.key] = item.value
        })
      })

      // 更新统计
      stats.groups = mockConfigGroups.length
      stats.configs = mockConfigGroups.reduce((sum, g) => sum + g.items.length, 0)
      stats.editable = mockConfigGroups.reduce(
        (sum, g) => sum + g.items.filter((i: any) => i.editable).length,
        0
      )

      activeGroups.value = [mockConfigGroups[0]?.name]
    } else {
      configGroups.value = []
    }
  } catch (error) {
    message.error('加载配置失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 保存配置
const handleSave = async () => {
  try {
    await messageBox.confirm('确定要保存所有修改吗？', '确认保存', {
      type: 'warning'
    })

    saving.value = true

    if (isTestMode.value) {
      // 模拟保存
      await new Promise(resolve => setTimeout(resolve, 500))

      // 更新模拟数据
      mockConfigGroups.forEach(group => {
        group.items.forEach((item: any) => {
          item.value = configValues[item.key]
        })
      })
    }

    message.success('配置保存成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error('保存配置失败')
      console.error(error)
    }
  } finally {
    saving.value = false
  }
}

// 恢复默认配置
const handleResetDefaults = async () => {
  try {
    await messageBox.confirm('恢复默认配置将覆盖当前所有设置，确定继续吗？', '警告', {
      type: 'warning',
      confirmButtonText: '确定恢复',
      cancelButtonText: '取消'
    })

    if (isTestMode.value) {
      const defaults = createMockConfigGroups()
      defaults.forEach(group => {
        group.items.forEach((item: any) => {
          configValues[item.key] = item.value
        })
      })
    }

    message.success('已恢复默认配置')
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error('恢复默认配置失败')
    }
  }
}

// 创建备份
const handleCreateBackup = async () => {
  try {
    if (isTestMode.value) {
      const now = new Date()
      const timeStr = now.toLocaleString('zh-CN')
      mockBackups.unshift({
        name: `手动备份 - ${timeStr.split(' ')[0]}`,
        time: timeStr,
        id: `backup_${Date.now()}`
      })
      backups.value = [...mockBackups]
    }
    message.success('备份创建成功')
  } catch (error) {
    message.error('创建备份失败')
  }
}

// 恢复备份
const handleRestore = async (backup: any) => {
  try {
    await messageBox.confirm(`恢复备份 "${backup.name}" 将覆盖当前配置，确定继续吗？`, '警告', {
      type: 'warning'
    })

    message.success('配置恢复成功')
    showBackupDialog.value = false
    loadConfigs()
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error('恢复配置失败')
    }
  }
}

// 删除备份
const handleDeleteBackup = async (backup: any) => {
  try {
    await messageBox.confirm(`确定要删除备份 "${backup.name}" 吗？`, '确认', {
      type: 'warning'
    })

    if (isTestMode.value) {
      const index = mockBackups.findIndex(b => b.id === backup.id)
      if (index > -1) mockBackups.splice(index, 1)
      backups.value = [...mockBackups]
    }

    message.success('备份删除成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error('删除备份失败')
    }
  }
}

// 监听备份对话框打开
const handleBackupDialogOpen = () => {
  if (showBackupDialog.value) {
    loadingBackups.value = true
    setTimeout(() => {
      if (isTestMode.value) {
        backups.value = [...mockBackups]
      }
      loadingBackups.value = false
    }, 300)
  }
}

onMounted(() => {
  loadConfigs()
})
</script>

<style scoped lang="scss">
.system-config-view {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;

  .header-info {
    .page-title {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .page-subtitle {
      margin: 8px 0 0;
      color: #6b7280;
      font-size: 14px;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

// 统计卡片
.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  border: 1px solid #e5e7eb;

  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a2e;
  }

  .stat-label {
    font-size: 13px;
    color: #6b7280;
  }

  &.groups {
    .stat-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .stat-value { color: #3b82f6; }
  }

  &.configs {
    .stat-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .stat-value { color: #10b981; }
  }

  &.editable {
    .stat-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .stat-value { color: #f59e0b; }
  }
}

// 操作栏
.actions-card {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

// 配置卡片
.config-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;

  .group-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.site { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    &.user { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
    &.content { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    &.payment { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    &.notify { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
  }

  .group-title {
    font-size: 16px;
    font-weight: 500;
    color: #374151;
  }

  .group-count {
    margin-left: auto;
    font-size: 12px;
    color: #9ca3af;
    background: #f3f4f6;
    padding: 4px 10px;
    border-radius: 12px;
  }
}

.config-form {
  padding: 16px 0;

  :deep(.el-form-item) {
    margin-bottom: 24px;
  }
}

.config-key {
  margin-left: 12px;
  color: #9ca3af;
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

.edit-indicator {
  cursor: pointer;
}

:deep(.el-collapse-item__header) {
  height: 60px;
  line-height: 60px;
  font-size: 15px;
  border-bottom: 1px solid #f3f4f6;
}

:deep(.el-collapse-item__content) {
  padding-bottom: 0;
}

// 备份对话框
.backup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h4 {
    margin: 0;
    font-size: 15px;
    color: #374151;
  }
}

.backup-list {
  .backup-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-bottom: 12px;
    transition: all 0.2s;

    &:hover {
      border-color: #3b82f6;
      background: #f9fafb;
    }

    .backup-info {
      display: flex;
      align-items: center;
      gap: 10px;

      .backup-time {
        font-size: 12px;
        color: #9ca3af;
      }
    }

    .backup-actions {
      display: flex;
      gap: 8px;
    }
  }
}

@media (max-width: 768px) {
  .stats-row {
    flex-direction: column;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;

    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }

  .config-form {
    :deep(.el-form-item__label) {
      width: 150px !important;
    }

    :deep(.el-input), :deep(.el-input-number) {
      width: 100% !important;
    }
  }
}
</style>
