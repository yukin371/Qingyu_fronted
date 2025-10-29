<template>
  <div class="character-graph-view">
    <!-- 工具栏 -->
    <div class="graph-header">
      <div class="header-left">
        <el-icon class="header-icon"><User /></el-icon>
        <span class="header-title">角色图谱</span>
        <el-tag v-if="characters.length > 0" size="small" type="info">
          {{ characters.length }} 个角色
        </el-tag>
      </div>
      <div class="header-actions">
        <el-button size="small" @click="handleRefresh" :icon="Refresh">
          刷新
        </el-button>
        <el-button type="primary" size="small" :icon="Plus" @click="handleAddCharacter">
          添加角色
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="graph-content">
      <!-- 图谱区域 -->
      <div class="graph-canvas" ref="graphCanvasRef" v-loading="writerStore.characters.loading">
        <!-- 简化版：使用卡片展示角色关系 -->
        <div class="characters-grid">
          <div
            v-for="character in characters"
            :key="character.id"
            class="character-card"
            :class="{ 'is-selected': selectedCharacter?.id === character.id }"
            @click="handleSelectCharacter(character)"
          >
            <div class="card-avatar">
              <el-avatar :size="64" :src="character.avatarUrl">
                {{ character.name.charAt(0) }}
              </el-avatar>
            </div>
            <div class="card-info">
              <div class="character-name">{{ character.name }}</div>
              <div v-if="character.alias && character.alias.length > 0" class="character-alias">
                {{ character.alias.join('、') }}
              </div>
              <div v-if="character.summary" class="character-summary">
                {{ character.summary }}
              </div>
              <div v-if="character.traits && character.traits.length > 0" class="character-traits">
                <el-tag
                  v-for="trait in character.traits.slice(0, 3)"
                  :key="trait"
                  size="small"
                  effect="plain"
                >
                  {{ trait }}
                </el-tag>
              </div>
            </div>
            <div class="card-actions">
              <el-button text size="small" :icon="Edit" @click.stop="handleEditCharacter(character)" />
              <el-button text size="small" :icon="Delete" @click.stop="handleDeleteCharacter(character)" />
            </div>
          </div>

          <el-empty v-if="characters.length === 0" description="暂无角色，点击右上角添加" />
        </div>
      </div>

      <!-- 详情侧边栏 -->
      <transition name="slide-left">
        <div v-if="selectedCharacter" class="detail-sidebar">
          <div class="sidebar-header">
            <h3>{{ selectedCharacter.name }}</h3>
            <el-button text :icon="Close" @click="selectedCharacter = null" />
          </div>
          <el-scrollbar class="sidebar-content">
            <!-- 基本信息 -->
            <div class="info-section">
              <h4>基本信息</h4>
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="名称">
                  {{ selectedCharacter.name }}
                </el-descriptions-item>
                <el-descriptions-item label="别名" v-if="selectedCharacter.alias">
                  {{ selectedCharacter.alias.join('、') }}
                </el-descriptions-item>
                <el-descriptions-item label="简介" v-if="selectedCharacter.summary">
                  {{ selectedCharacter.summary }}
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 性格特征 -->
            <div v-if="selectedCharacter.traits && selectedCharacter.traits.length > 0" class="info-section">
              <h4>性格特征</h4>
              <div class="traits-list">
                <el-tag
                  v-for="trait in selectedCharacter.traits"
                  :key="trait"
                  size="small"
                >
                  {{ trait }}
                </el-tag>
              </div>
            </div>

            <!-- 背景故事 -->
            <div v-if="selectedCharacter.background" class="info-section">
              <h4>背景故事</h4>
              <p class="background-text">{{ selectedCharacter.background }}</p>
            </div>

            <!-- AI 设定 -->
            <div class="info-section">
              <h4>AI 设定</h4>
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="性格提示" v-if="selectedCharacter.personalityPrompt">
                  {{ selectedCharacter.personalityPrompt }}
                </el-descriptions-item>
                <el-descriptions-item label="语言模式" v-if="selectedCharacter.speechPattern">
                  {{ selectedCharacter.speechPattern }}
                </el-descriptions-item>
                <el-descriptions-item label="当前状态" v-if="selectedCharacter.currentState">
                  {{ selectedCharacter.currentState }}
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 关系列表 -->
            <div class="info-section">
              <h4>角色关系</h4>
              <div class="relations-list">
                <div
                  v-for="relation in getCharacterRelations(selectedCharacter.id)"
                  :key="relation.id"
                  class="relation-item"
                >
                  <div class="relation-info">
                    <span class="relation-target">
                      {{ getCharacterName(relation.fromId === selectedCharacter.id ? relation.toId : relation.fromId) }}
                    </span>
                    <el-tag size="small" :type="getRelationTagType(relation.type)">
                      {{ relation.type }}
                    </el-tag>
                  </div>
                  <el-progress
                    :percentage="relation.strength"
                    :stroke-width="6"
                    :show-text="false"
                  />
                </div>
                <el-empty v-if="getCharacterRelations(selectedCharacter.id).length === 0" description="暂无关系" :image-size="60" />
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="sidebar-actions">
              <el-button type="primary" @click="handleEditCharacter(selectedCharacter)">
                编辑角色
              </el-button>
              <el-button @click="handleManageRelations(selectedCharacter)">
                管理关系
              </el-button>
            </div>
          </el-scrollbar>
        </div>
      </transition>
    </div>

    <!-- 添加/编辑角色对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑角色' : '添加角色'"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="characterForm"
        :rules="formRules"
        label-width="110px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="characterForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="别名">
          <el-tag
            v-for="(alias, index) in characterForm.alias"
            :key="index"
            closable
            @close="characterForm.alias.splice(index, 1)"
            style="margin-right: 8px;"
          >
            {{ alias }}
          </el-tag>
          <el-input
            v-if="showAliasInput"
            ref="aliasInputRef"
            v-model="newAlias"
            size="small"
            style="width: 120px;"
            @blur="handleAliasInputConfirm"
            @keyup.enter="handleAliasInputConfirm"
          />
          <el-button v-else size="small" @click="showAliasInput = true">
            + 添加别名
          </el-button>
        </el-form-item>
        <el-form-item label="角色简介">
          <el-input
            v-model="characterForm.summary"
            type="textarea"
            :rows="2"
            placeholder="请输入角色简介"
          />
        </el-form-item>
        <el-form-item label="性格特征">
          <el-tag
            v-for="(trait, index) in characterForm.traits"
            :key="index"
            closable
            @close="characterForm.traits.splice(index, 1)"
            style="margin-right: 8px; margin-bottom: 8px;"
          >
            {{ trait }}
          </el-tag>
          <el-input
            v-if="showTraitInput"
            ref="traitInputRef"
            v-model="newTrait"
            size="small"
            style="width: 120px;"
            @blur="handleTraitInputConfirm"
            @keyup.enter="handleTraitInputConfirm"
          />
          <el-button v-else size="small" @click="showTraitInput = true">
            + 添加特征
          </el-button>
        </el-form-item>
        <el-form-item label="背景故事">
          <el-input
            v-model="characterForm.background"
            type="textarea"
            :rows="4"
            placeholder="请输入角色背景故事"
          />
        </el-form-item>
        <el-form-item label="性格提示">
          <el-input
            v-model="characterForm.personalityPrompt"
            type="textarea"
            :rows="2"
            placeholder="为 AI 提供角色性格提示"
          />
        </el-form-item>
        <el-form-item label="语言模式">
          <el-input
            v-model="characterForm.speechPattern"
            placeholder="角色说话方式"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useWriterStore } from '../stores/writerStore'
import type { Character, CharacterRelation, RelationType } from '@/types/writer'
import {
  User,
  Plus,
  Edit,
  Delete,
  Close,
  Refresh
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const writerStore = useWriterStore()
const graphCanvasRef = ref()
const selectedCharacter = ref<Character | null>(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()
const showAliasInput = ref(false)
const showTraitInput = ref(false)
const aliasInputRef = ref()
const traitInputRef = ref()
const newAlias = ref('')
const newTrait = ref('')

const characterForm = ref({
  name: '',
  alias: [] as string[],
  summary: '',
  traits: [] as string[],
  background: '',
  personalityPrompt: '',
  speechPattern: '',
  currentState: ''
})

const formRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ]
}

const characters = computed(() => writerStore.characters.list)
const relations = computed(() => writerStore.characters.relations)

onMounted(async () => {
  await handleRefresh()
})

const handleRefresh = async () => {
  if (writerStore.currentProjectId) {
    await writerStore.loadCharacters()
    await writerStore.loadCharacterRelations()
  }
}

const handleSelectCharacter = (character: Character) => {
  selectedCharacter.value = character
  writerStore.setCurrentCharacter(character)
}

const handleAddCharacter = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

const handleEditCharacter = (character: Character) => {
  isEdit.value = true
  selectedCharacter.value = character
  dialogVisible.value = true
  characterForm.value = {
    name: character.name,
    alias: character.alias || [],
    summary: character.summary || '',
    traits: character.traits || [],
    background: character.background || '',
    personalityPrompt: character.personalityPrompt || '',
    speechPattern: character.speechPattern || '',
    currentState: character.currentState || ''
  }
}

const handleDeleteCharacter = async (character: Character) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色"${character.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const projectId = writerStore.currentProjectId
    if (!projectId) return

    const { deleteCharacter } = await import('../api')
    await deleteCharacter(character.id, projectId)
    await handleRefresh()
    if (selectedCharacter.value?.id === character.id) {
      selectedCharacter.value = null
    }
    ElMessage.success('删除成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleAliasInputConfirm = () => {
  if (newAlias.value && !characterForm.value.alias.includes(newAlias.value)) {
    characterForm.value.alias.push(newAlias.value)
  }
  showAliasInput.value = false
  newAlias.value = ''
}

const handleTraitInputConfirm = () => {
  if (newTrait.value && !characterForm.value.traits.includes(newTrait.value)) {
    characterForm.value.traits.push(newTrait.value)
  }
  showTraitInput.value = false
  newTrait.value = ''
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    const projectId = writerStore.currentProjectId
    if (!projectId) {
      ElMessage.warning('请先选择项目')
      return
    }

    submitting.value = true
    try {
      if (isEdit.value && selectedCharacter.value) {
        const { updateCharacter } = await import('../api')
        await updateCharacter(selectedCharacter.value.id, projectId, characterForm.value)
      } else {
        const { createCharacter } = await import('../api')
        await createCharacter(projectId, characterForm.value)
      }

      await handleRefresh()
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
    } catch (error: any) {
      console.error('操作失败:', error)
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

const handleManageRelations = (character: Character) => {
  ElMessage.info('关系管理功能开发中...')
}

const getCharacterRelations = (characterId: string): CharacterRelation[] => {
  return relations.value.filter(
    r => r.fromId === characterId || r.toId === characterId
  )
}

const getCharacterName = (characterId: string): string => {
  const character = characters.value.find(c => c.id === characterId)
  return character?.name || '未知'
}

const getRelationTagType = (type: RelationType): 'success' | 'info' | 'warning' | 'danger' => {
  const typeMap: Record<RelationType, 'success' | 'info' | 'warning' | 'danger'> = {
    '朋友': 'success',
    '家庭': 'info',
    '恋人': 'danger',
    '盟友': 'success',
    '敌人': 'warning',
    '其他': 'info'
  }
  return typeMap[type] || 'info'
}

const resetForm = () => {
  characterForm.value = {
    name: '',
    alias: [],
    summary: '',
    traits: [],
    background: '',
    personalityPrompt: '',
    speechPattern: '',
    currentState: ''
  }
}
</script>

<style scoped lang="scss">
.character-graph-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f9fafb;
}

.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;

  .header-icon {
    font-size: 24px;
    color: #67c23a;
  }

  .header-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.header-actions {
  display: flex;
  gap: 12px;
}

.graph-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.graph-canvas {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.characters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.character-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #409eff;
  }

  &.is-selected {
    border-color: #409eff;
    background: #ecf5ff;
  }
}

.card-avatar {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.card-info {
  .character-name {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    text-align: center;
    margin-bottom: 4px;
  }

  .character-alias {
    font-size: 12px;
    color: #909399;
    text-align: center;
    margin-bottom: 8px;
  }

  .character-summary {
    font-size: 13px;
    color: #606266;
    line-height: 1.5;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .character-traits {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: center;
  }
}

.card-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.detail-sidebar {
  width: 400px;
  background: #ffffff;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
}

.sidebar-content {
  flex: 1;
  padding: 16px;
}

.info-section {
  margin-bottom: 24px;

  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
}

.traits-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.background-text {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.relations-list {
  .relation-item {
    padding: 12px;
    background: #f9fafb;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .relation-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .relation-target {
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.sidebar-actions {
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;

  .el-button {
    flex: 1;
  }
}

/* 动画 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(100%);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .characters-grid {
    grid-template-columns: 1fr;
  }

  .detail-sidebar {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .character-graph-view {
    background: #0d0d0d;
  }

  .graph-header {
    background: #1a1a1a;
    border-bottom-color: #2d2d2d;
  }

  .header-title {
    color: #e5e5e5;
  }

  .character-card {
    background: #1a1a1a;
    border-color: #2d2d2d;

    &:hover {
      border-color: #409eff;
    }

    &.is-selected {
      background: #1a3a52;
    }
  }

  .card-info {
    .character-name {
      color: #e5e5e5;
    }

    .character-summary {
      color: #c0c4cc;
    }
  }

  .card-actions {
    border-top-color: #2d2d2d;
  }

  .detail-sidebar {
    background: #1a1a1a;
    border-left-color: #2d2d2d;
  }

  .sidebar-header {
    border-bottom-color: #2d2d2d;

    h3 {
      color: #e5e5e5;
    }
  }

  .info-section h4 {
    color: #e5e5e5;
  }

  .background-text {
    color: #c0c4cc;
  }

  .relations-list .relation-item {
    background: #0d0d0d;
  }

  .sidebar-actions {
    border-top-color: #2d2d2d;
  }
}
</style>



