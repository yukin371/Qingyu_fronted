<template>
  <div class="system-config-view">
    <el-card class="header-card">
      <h2>系统配置管理</h2>
      <p class="subtitle">管理系统的各项配置参数</p>
    </el-card>

    <el-card v-loading="loading" class="config-card">
      <template #header>
        <div class="card-header">
          <span>配置列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleSave" :loading="saving">
              <el-icon><Check /></el-icon>
              保存所有修改
            </el-button>
            <el-button @click="handleReload">
              <el-icon><Refresh /></el-icon>
              重新加载
            </el-button>
            <el-button @click="showBackupDialog = true">
              <el-icon><FolderOpened /></el-icon>
              配置备份
            </el-button>
          </div>
        </div>
      </template>

      <el-collapse v-model="activeGroups">
        <el-collapse-item
          v-for="group in configGroups"
          :key="group.name"
          :name="group.name"
          :title="group.description"
        >
          <el-form label-width="200px">
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
              />

              <!-- Number类型 -->
              <el-input-number
                v-else-if="item.type === 'number'"
                v-model="configValues[item.key]"
                :disabled="!item.editable"
                style="width: 300px"
              />

              <!-- String类型 -->
              <el-input
                v-else
                v-model="configValues[item.key]"
                :type="item.sensitive ? 'password' : 'text'"
                :disabled="!item.editable"
                :placeholder="item.sensitive ? '******' : ''"
                style="width: 400px"
                clearable
              />

              <span class="config-key">{{ item.key }}</span>
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- 备份管理对话框 -->
    <el-dialog v-model="showBackupDialog" title="配置备份管理" width="600px">
      <el-alert type="info" :closable="false" style="margin-bottom: 20px">
        <template #title>
          配置备份可以帮助您在修改配置出错时快速恢复
        </template>
      </el-alert>

      <div v-loading="loadingBackups">
        <h4>可用备份</h4>
        <el-empty v-if="backups.length === 0" description="暂无备份" />
        <el-list v-else>
          <el-list-item v-for="(backup, index) in backups" :key="index">
            <span>{{ backup }}</span>
            <template #suffix>
              <el-button type="primary" size="small" @click="handleRestore">
                恢复
              </el-button>
            </template>
          </el-list-item>
        </el-list>
      </div>

      <template #footer>
        <el-button @click="showBackupDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Refresh, FolderOpened } from '@element-plus/icons-vue'
import * as configApi from '../api/system-config.api'

const loading = ref(false)
const saving = ref(false)
const configGroups = ref<configApi.ConfigGroup[]>([])
const configValues = reactive<Record<string, any>>({})
const activeGroups = ref<string[]>([])
const showBackupDialog = ref(false)
const backups = ref<string[]>([])
const loadingBackups = ref(false)

// 加载配置
const loadConfigs = async () => {
  loading.value = true
  try {
    const groups = await configApi.getAllConfigs()
    configGroups.value = groups

    // 初始化配置值
    groups.forEach(group => {
      group.items.forEach(item => {
        configValues[item.key] = item.value
      })
    })

    // 默认展开所有组
    activeGroups.value = groups.map(g => g.name)
  } catch (error) {
    ElMessage.error('加载配置失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 保存配置
const handleSave = async () => {
  try {
    await ElMessageBox.confirm('确定要保存所有修改吗？', '确认', {
      type: 'warning'
    })

    saving.value = true

    // 构建更新请求
    const updates: configApi.UpdateConfigRequest[] = []
    Object.keys(configValues).forEach(key => {
      updates.push({ key, value: configValues[key] })
    })

    await configApi.batchUpdateConfig({ updates })

    ElMessage.success('配置保存成功')
    await loadConfigs() // 重新加载
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('保存配置失败')
      console.error(error)
    }
  } finally {
    saving.value = false
  }
}

// 重新加载
const handleReload = () => {
  loadConfigs()
}

// 加载备份列表
const loadBackups = async () => {
  loadingBackups.value = true
  try {
    backups.value = await configApi.getConfigBackups()
  } catch (error) {
    ElMessage.error('加载备份列表失败')
    console.error(error)
  } finally {
    loadingBackups.value = false
  }
}

// 恢复备份
const handleRestore = async () => {
  try {
    await ElMessageBox.confirm('恢复备份将覆盖当前配置，确定继续吗？', '警告', {
      type: 'warning'
    })

    await configApi.restoreConfigBackup()
    ElMessage.success('配置恢复成功')
    showBackupDialog.value = false
    await loadConfigs()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('恢复配置失败')
      console.error(error)
    }
  }
}

// 监听备份对话框
const handleBackupDialogOpen = () => {
  if (showBackupDialog.value) {
    loadBackups()
  }
}

onMounted(() => {
  loadConfigs()
})
</script>

<style scoped lang="scss">
.system-config-view {
  padding: 20px;
}

.header-card {
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 24px;
    color: #303133;
  }

  .subtitle {
    margin: 8px 0 0;
    color: #909399;
    font-size: 14px;
  }
}

.config-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }
}

.config-key {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

:deep(.el-collapse-item__header) {
  font-size: 16px;
  font-weight: 500;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}
</style>

