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
    <el-dialog
      v-model="showBackupDialog"
      title="配置备份管理"
      width="600px"
      class="admin-modal-card"
      append-to-body
      align-center
    >
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
import { ref, reactive, onMounted, watch } from 'vue'
import { message, messageBox } from '@/design-system/services'
import {
  Check, Refresh, FolderOpened, Setting, Edit, RefreshRight,
  InfoFilled, Plus, Clock, User, Bell, CreditCard, Document
} from '@element-plus/icons-vue'
import * as adminAPI from '@/modules/admin/api'

type ConfigItem = {
  key: string
  value: string | number | boolean | null
  type: 'string' | 'number' | 'boolean'
  description: string
  editable: boolean
  sensitive?: boolean
}

type ConfigGroup = {
  name: string
  description: string
  items: ConfigItem[]
}

type BackupItem = {
  id: string
  name: string
  time: string
}

const loading = ref(false)
const saving = ref(false)
const configGroups = ref<ConfigGroup[]>([])
const configValues = reactive<Record<string, any>>({})
const initialValues = ref<Record<string, string | number | boolean | null>>({})
const activeGroups = ref<string[]>([])
const showBackupDialog = ref(false)
const backups = ref<BackupItem[]>([])
const loadingBackups = ref(false)

// 统计数据
const stats = reactive({
  groups: 0,
  configs: 0,
  editable: 0
})

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

const syncStats = (groups: ConfigGroup[]) => {
  stats.groups = groups.length
  stats.configs = groups.reduce((sum, group) => sum + (group.items?.length || 0), 0)
  stats.editable = groups.reduce(
    (sum, group) => sum + group.items.filter(item => item.editable).length,
    0,
  )
}

const applyConfigValues = (groups: ConfigGroup[]) => {
  const nextValues: Record<string, string | number | boolean | null> = {}
  groups.forEach(group => {
    group.items.forEach(item => {
      nextValues[item.key] = item.value ?? null
      configValues[item.key] = item.value ?? null
    })
  })
  initialValues.value = nextValues
}

// 加载配置
const loadConfigs = async () => {
  loading.value = true
  try {
    const response = await adminAPI.getAllConfigs() as any
    const payload = response?.groups ? response : (response?.data ?? {})
    const groups = Array.isArray(payload.groups) ? payload.groups as ConfigGroup[] : []
    configGroups.value = groups
    applyConfigValues(groups)
    syncStats(groups)
    activeGroups.value = groups[0]?.name ? [groups[0].name] : []
  } catch (error) {
    configGroups.value = []
    activeGroups.value = []
    syncStats([])
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
    const updates = configGroups.value.flatMap(group =>
      group.items
        .filter(item => item.editable)
        .map(item => ({
          key: item.key,
          value: configValues[item.key],
        })),
    )
    await adminAPI.batchUpdateConfig({ updates } as any)

    message.success('配置保存成功')
    await loadConfigs()
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
    Object.entries(initialValues.value).forEach(([key, value]) => {
      configValues[key] = value
    })
    message.success('已恢复到当前服务端配置')
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error('恢复默认配置失败')
    }
  }
}

// 创建备份
const handleCreateBackup = async () => {
  message.warning('当前后端未提供手动创建配置备份接口')
}

// 恢复备份
const handleRestore = async (backup: BackupItem) => {
  try {
    await messageBox.confirm(`恢复备份 "${backup.name}" 将覆盖当前配置，确定继续吗？`, '警告', {
      type: 'warning'
    })

    await adminAPI.restoreConfigBackup()
    message.success('配置恢复成功')
    showBackupDialog.value = false
    await loadConfigs()
  } catch (error: any) {
    if (error !== 'cancel') {
      message.error('恢复配置失败')
    }
  }
}

// 删除备份
const handleDeleteBackup = async (_backup: BackupItem) => {
  message.warning('当前后端未提供删除配置备份接口')
}

const loadBackups = async () => {
  loadingBackups.value = true
  try {
    const response = await adminAPI.getConfigBackups() as any
    const payload = response?.backups ? response : (response?.data ?? {})
    const list = Array.isArray(payload.backups) ? payload.backups as string[] : []
    backups.value = list.map((name, index) => ({
      id: `backup_${index}_${name}`,
      name,
      time: name,
    }))
  } catch (error) {
    backups.value = []
    message.error('加载配置备份失败')
    console.error(error)
  } finally {
    loadingBackups.value = false
  }
}

watch(showBackupDialog, (visible) => {
  if (visible) {
    void loadBackups()
  } else {
    backups.value = []
  }
})

onMounted(() => {
  void loadConfigs()
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
