<template>
  <div class="character-graph-view">
    <!-- 工具栏 -->
    <div class="graph-header">
      <div class="header-left">
        <el-icon class="header-icon">
          <QyIcon name="User" />
        </el-icon>
        <span class="header-title">角色关系图谱</span>
        <el-tag v-if="characters?.length" size="small" type="info">
          {{ characters?.length || 0 }} 个角色
        </el-tag>
      </div>
      <div class="header-actions">
        <el-button size="small" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary" size="small" @click="handleAddCharacter">
          <el-icon><Plus /></el-icon>
          添加角色
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="graph-content">
      <!-- 图谱区域 -->
      <div class="graph-canvas" ref="graphCanvasRef" v-loading="writerStore.characters.loading">
        <div class="graph-stats">
          <SystemStatCard
            label="角色总数"
            :value="characters?.length || 0"
            hint="已收录人物"
            tone="info"
          />
          <SystemStatCard
            label="关系总数"
            :value="relations?.length || 0"
            hint="人物连接边"
            tone="success"
          />
          <SystemStatCard
            label="高强度关系"
            :value="strongRelationsCount"
            hint="强度 >= 70"
            tone="warning"
          />
        </div>

        <!-- 角色关系图谱画布 -->
        <div class="graph-visualization">
          <RelationshipGraph
            :nodes="graphNodes"
            :links="graphLinks"
            @create-link="handleGraphCreateLink"
            @node-click="handleNodeClick"
          />
        </div>
      </div>

      <!-- 详情侧边栏 -->
      <transition name="slide-left">
        <div v-if="selectedCharacter" class="detail-sidebar">
          <div class="sidebar-header">
            <h3>{{ selectedCharacter.name }}</h3>
            <el-button text @click="selectedCharacter = null">
              <el-icon><Close /></el-icon>
            </el-button>
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
            <div
              v-if="selectedCharacter.traits && selectedCharacter.traits.length > 0"
              class="info-section"
            >
              <h4>性格特征</h4>
              <div class="traits-list">
                <el-tag v-for="trait in selectedCharacter.traits" :key="trait" size="small">
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
                      {{
                        getCharacterName(
                          relation.fromId === selectedCharacter.id
                            ? relation.toId
                            : relation.fromId,
                        )
                      }}
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
                <el-empty
                  v-if="getCharacterRelations(selectedCharacter.id).length === 0"
                  description="暂无关系"
                  :image-size="60"
                />
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="sidebar-actions">
              <el-button type="primary" @click="handleEditCharacter(selectedCharacter)">
                编辑角色
              </el-button>
              <el-button @click="handleManageRelations(selectedCharacter)"> 管理关系 </el-button>
            </div>
          </el-scrollbar>
        </div>
      </transition>
    </div>

    <!-- 角色编辑卡片 -->
    <transition name="fade-slide">
      <div v-if="dialogVisible" class="character-edit-card-container">
        <QyCard class="character-edit-card" shadow="always" padding="lg">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <el-icon class="header-icon">
                  <QyIcon name="User" />
                </el-icon>
                <h3 class="header-title">{{ isEdit ? '编辑角色' : '添加角色' }}</h3>
              </div>
              <el-button text @click="dialogVisible = false">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </template>

          <el-form
            ref="formRef"
            :model="characterForm"
            :rules="formRules"
            label-width="100px"
            class="character-form"
          >
            <el-form-item label="角色名称" prop="name">
              <el-input v-model="characterForm.name" placeholder="请输入角色名称" />
            </el-form-item>
            <el-form-item label="别名">
              <div class="tags-container">
                <el-tag
                  v-for="(alias, index) in characterForm.alias"
                  :key="index"
                  closable
                  @close="characterForm.alias.splice(index, 1)"
                >
                  {{ alias }}
                </el-tag>
                <el-input
                  v-if="showAliasInput"
                  ref="aliasInputRef"
                  v-model="newAlias"
                  size="small"
                  @blur="handleAliasInputConfirm"
                  @keyup.enter="handleAliasInputConfirm"
                />
                <el-button v-else size="small" @click="showAliasInput = true">
                  + 添加别名
                </el-button>
              </div>
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
              <div class="tags-container">
                <el-tag
                  v-for="(trait, index) in characterForm.traits"
                  :key="index"
                  closable
                  @close="characterForm.traits.splice(index, 1)"
                >
                  {{ trait }}
                </el-tag>
                <el-input
                  v-if="showTraitInput"
                  ref="traitInputRef"
                  v-model="newTrait"
                  size="small"
                  @blur="handleTraitInputConfirm"
                  @keyup.enter="handleTraitInputConfirm"
                />
                <el-button v-else size="small" @click="showTraitInput = true">
                  + 添加特征
                </el-button>
              </div>
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
              <el-input v-model="characterForm.speechPattern" placeholder="角色说话方式" />
            </el-form-item>
          </el-form>

          <template #footer>
            <div class="card-footer">
              <el-button @click="dialogVisible = false">取消</el-button>
              <el-button type="primary" @click="handleSubmit" :loading="submitting">
                确定
              </el-button>
            </div>
          </template>
        </QyCard>
      </div>
    </transition>

    <!-- 关系管理对话框 -->
    <transition name="fade-slide">
      <div v-if="relationDialogVisible" class="relation-dialog-container">
        <QyCard class="relation-dialog-card" shadow="always" padding="lg">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <el-icon class="header-icon">
                  <QyIcon name="Connection" />
                </el-icon>
                <h3 class="header-title">管理角色关系</h3>
              </div>
              <el-button text @click="relationDialogVisible = false">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </template>

          <div class="relation-dialog-content">
            <!-- 现有关系列表 -->
            <div class="existing-relations">
              <h4>当前角色关系</h4>
              <div v-if="selectedCharacter" class="relations-list-dialog">
                <div
                  v-for="relation in getCharacterRelations(selectedCharacter.id)"
                  :key="relation.id"
                  class="relation-item-dialog"
                >
                  <div class="relation-main">
                    <span class="relation-target">
                      {{
                        getCharacterName(
                          relation.fromId === selectedCharacter.id
                            ? relation.toId
                            : relation.fromId,
                        )
                      }}
                    </span>
                    <el-tag size="small" :type="getRelationTagType(relation.type)">
                      {{ relation.type }}
                    </el-tag>
                    <div class="relation-strength">
                      <el-progress
                        :percentage="relation.strength"
                        :stroke-width="4"
                        :show-text="false"
                      />
                      <span class="strength-value">{{ relation.strength }}</span>
                    </div>
                  </div>
                  <el-button
                    type="danger"
                    text
                    size="small"
                    @click="handleDeleteRelation(relation)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                <el-empty
                  v-if="getCharacterRelations(selectedCharacter.id).length === 0"
                  description="暂无关系"
                  :image-size="60"
                />
              </div>
            </div>

            <el-divider />

            <!-- 创建新关系表单 -->
            <div class="create-relation-form">
              <h4>添加新关系</h4>
              <el-form
                ref="relationFormRef"
                :model="relationForm"
                :rules="relationFormRules"
                label-width="80px"
              >
                <el-form-item label="目标角色" prop="toId">
                  <el-select
                    v-model="relationForm.toId"
                    placeholder="选择目标角色"
                    filterable
                    style="width: 100%"
                  >
                    <el-option
                      v-for="char in availableTargetCharacters"
                      :key="char.id"
                      :label="char.name"
                      :value="char.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="关系类型" prop="type">
                  <el-select
                    v-model="relationForm.type"
                    placeholder="选择关系类型"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="option in RELATION_TYPE_OPTIONS"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="关系强度" prop="strength">
                  <div class="strength-slider">
                    <el-slider v-model="relationForm.strength" :min="0" :max="100" :step="5" />
                    <span class="strength-display">{{ relationForm.strength }}</span>
                  </div>
                </el-form-item>
                <el-form-item label="备注">
                  <el-input
                    v-model="relationForm.notes"
                    type="textarea"
                    :rows="2"
                    placeholder="关系描述（可选）"
                  />
                </el-form-item>
              </el-form>
            </div>
          </div>

          <template #footer>
            <div class="card-footer">
              <el-button @click="relationDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="handleCreateRelation" :loading="relationSubmitting">
                创建关系
              </el-button>
            </div>
          </template>
        </QyCard>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Refresh, Close, Delete } from '@element-plus/icons-vue'
import { useProjectStore } from '../stores/projectStore'
import { useWriterStore } from '../stores/writerStore'
import type { Character, CharacterRelation, RelationType } from '@/types/writer'
import type { CreateCharacterRequest } from '../types/character'
import { RELATION_TYPE_OPTIONS } from '../types/character'
import { QyIcon } from '@/design-system/components'
import QyCard from '@/design-system/components/basic/QyCard/QyCard.vue'
import SystemStatCard from '@/modules/writer/components/system-design/SystemStatCard.vue'
import RelationshipGraph, {
  type GraphNode,
  type GraphLink,
} from '../components/RelationshipGraph.vue'
import { message } from '@/design-system/services'
import { ElMessage } from 'element-plus'
const writerStore = useWriterStore()
const projectStore = useProjectStore()
const selectedCharacter = ref<Character | null>(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()
const showAliasInput = ref(false)
const showTraitInput = ref(false)
const newAlias = ref('')
const newTrait = ref('')

// 关系管理对话框状态
const relationDialogVisible = ref(false)
const relationSubmitting = ref(false)
const relationFormRef = ref()
const relationForm = ref({
  fromId: '',
  toId: '',
  type: '' as RelationType,
  strength: 50,
  notes: '',
})

const characterForm = ref({
  name: '',
  alias: [] as string[],
  summary: '',
  traits: [] as string[],
  background: '',
  personalityPrompt: '',
  speechPattern: '',
  currentState: '',
})

const formRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
}

// 关系表单验证规则
const relationFormRules = {
  toId: [{ required: true, message: '请选择目标角色', trigger: 'change' }],
  type: [{ required: true, message: '请选择关系类型', trigger: 'change' }],
  strength: [{ type: 'number', min: 0, max: 100, message: '强度范围为 0-100', trigger: 'blur' }],
}

const characters = computed(() => writerStore.characters.list || [])
const relations = computed(() => writerStore.characters.relations || [])
const strongRelationsCount = computed(
  () => (relations.value || []).filter((relation) => relation.strength >= 70).length,
)

// 转换角色数据为图谱节点
const graphNodes = computed<GraphNode[]>(() => {
  return characters.value.map((character) => ({
    id: character.id,
    name: character.name,
    importance: character.traits?.length || 0,
  }))
})

// 转换关系数据为图谱链接
const graphLinks = computed<GraphLink[]>(() => {
  return relations.value.map((relation) => ({
    source: relation.fromId,
    target: relation.toId,
    type: relation.type,
    strength: relation.strength,
  }))
})

onMounted(async () => {
  await handleRefresh()
})

const handleRefresh = async () => {
  // 使用 projectStore.currentProjectId，因为 ProjectWorkspace 只设置了这个
  const projectId = projectStore.currentProjectId
  if (projectId) {
    await writerStore.loadCharacters(projectId)
    await writerStore.loadCharacterRelations(projectId)
  }
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
    currentState: character.currentState || '',
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

    // 使用 projectStore.currentProjectId，与 handleRefresh 保持一致
    const projectId = projectStore.currentProjectId
    if (!projectId) {
      message.warning('请先选择项目')
      return
    }

    submitting.value = true
    try {
      if (isEdit.value && selectedCharacter.value) {
        const { updateCharacter } = await import('..')
        await updateCharacter(selectedCharacter.value.id, projectId, characterForm.value)
      } else {
        const { createCharacter } = await import('..')
        const createData: CreateCharacterRequest = {
          projectId,
          name: characterForm.value.name,
          alias: characterForm.value.alias,
          summary: characterForm.value.summary,
          traits: characterForm.value.traits,
          background: characterForm.value.background,
          personalityPrompt: characterForm.value.personalityPrompt,
          speechPattern: characterForm.value.speechPattern,
        }
        await createCharacter(projectId, createData)
      }

      await handleRefresh()
      message.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

const handleManageRelations = (character: Character) => {
  // 设置选中的角色
  selectedCharacter.value = character
  // 打开关系管理对话框
  relationForm.value = {
    fromId: character.id,
    toId: '',
    type: '' as RelationType,
    strength: 50,
    notes: '',
  }
  relationDialogVisible.value = true
}

// 获取可选的目标角色列表（排除自己和已有关系的角色）
const availableTargetCharacters = computed(() => {
  if (!selectedCharacter.value) return []
  const existingRelationIds = new Set(
    getCharacterRelations(selectedCharacter.value.id).map((r) =>
      r.fromId === selectedCharacter.value!.id ? r.toId : r.fromId,
    ),
  )
  return characters.value.filter(
    (c) => c.id !== selectedCharacter.value!.id && !existingRelationIds.has(c.id),
  )
})

// 提交创建关系
const handleCreateRelation = async () => {
  if (!relationFormRef.value) return

  await relationFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    const projectId = projectStore.currentProjectId
    if (!projectId) {
      message.warning('请先选择项目')
      return
    }

    relationSubmitting.value = true
    try {
      await writerStore.createCharacterRelation(projectId, {
        fromId: relationForm.value.fromId,
        toId: relationForm.value.toId,
        type: relationForm.value.type,
        strength: relationForm.value.strength,
        notes: relationForm.value.notes,
      })
      message.success('关系创建成功')
      relationDialogVisible.value = false
      // 刷新关系列表
      await writerStore.loadCharacterRelations(projectId)
    } catch (error: any) {
      message.error(error.message || '创建失败')
    } finally {
      relationSubmitting.value = false
    }
  })
}

// 删除关系
const handleDeleteRelation = async (relation: CharacterRelation) => {
  const projectId = projectStore.currentProjectId
  if (!projectId) return

  try {
    await writerStore.deleteCharacterRelation(relation.id, projectId)
    message.success('关系已删除')
  } catch (error: any) {
    message.error(error.message || '删除失败')
  }
}

const getCharacterRelations = (characterId: string): CharacterRelation[] => {
  return (relations.value || []).filter((r) => r.fromId === characterId || r.toId === characterId)
}

const getCharacterName = (characterId: string): string => {
  const character = characters.value.find((c) => c.id === characterId)
  return character?.name || '未知'
}

const getRelationTagType = (type: RelationType): 'success' | 'info' | 'warning' | 'danger' => {
  const typeMap: Record<RelationType, 'success' | 'info' | 'warning' | 'danger'> = {
    朋友: 'success',
    家庭: 'info',
    恋人: 'danger',
    盟友: 'success',
    敌人: 'warning',
    其他: 'info',
  }
  return typeMap[type] || 'info'
}

// 处理图谱连线创建事件
const handleGraphCreateLink = (fromId: string, toId: string) => {
  // 检查是否已存在关系
  const existingRelation = relations.value.find(
    (r) => (r.fromId === fromId && r.toId === toId) || (r.fromId === toId && r.toId === fromId),
  )
  if (existingRelation) {
    message.warning('这两个角色之间已存在关系')
    return
  }

  // 打开关系创建对话框
  const fromCharacter = characters.value.find((c) => c.id === fromId)
  const toCharacter = characters.value.find((c) => c.id === toId)

  if (fromCharacter && toCharacter) {
    selectedCharacter.value = fromCharacter
    relationForm.value = {
      fromId: fromId,
      toId: toId,
      type: '' as RelationType,
      strength: 50,
      notes: '',
    }
    relationDialogVisible.value = true
  }
}

// 处理节点点击事件
const handleNodeClick = (nodeId: string) => {
  const character = characters.value.find((c) => c.id === nodeId)
  if (character) {
    selectedCharacter.value = character
  }
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
    currentState: '',
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

.graph-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.graph-visualization {
  width: 100%;
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background: #ffffff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .graph-stats {
    grid-template-columns: 1fr;
  }

  .graph-visualization {
    height: 400px;
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
  .graph-stats {
    grid-template-columns: 1fr;
  }

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

  .character-edit-card {
    background: #1a1a1a;
    border-color: #2d2d2d;
  }

  .card-header {
    border-bottom-color: #2d2d2d;

    .header-title {
      color: #e5e5e5;
    }
  }

  .card-footer {
    border-top-color: #2d2d2d;
  }

  .character-form {
    :deep(.el-form-item) {
      border-bottom-color: #2d2d2d;
    }

    :deep(.el-form-item__label) {
      color: #e5e5e5;
    }

    :deep(.el-input__wrapper) {
      border-color: #4b5563;
      background-color: #1f2937;
      height: 32px;

      &:hover {
        border-color: #6b7280;
      }

      &.is-focus {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }
    }

    :deep(.el-textarea__inner) {
      border-color: #4b5563;
      background-color: #1f2937;
      color: #e5e5e5;

      &:hover {
        border-color: #6b7280;
      }

      &:focus {
        border-color: #409eff;
      }
    }

    :deep(.el-input--small .el-input__wrapper) {
      border-color: #4b5563;
      background-color: #1f2937;

      &:hover {
        border-color: #6b7280;
      }

      &.is-focus {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }
    }

    :deep(.el-form-item__error) {
      color: #f87171;
    }
  }
}

/* 角色编辑卡片样式 */
.character-edit-card-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.character-edit-card {
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .header-icon {
      font-size: 24px;
      color: #67c23a;
    }

    .header-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.character-form {
  width: 100%;
  margin: 0;

  :deep(.el-form) {
    width: 100%;
  }

  :deep(.el-form-item) {
    margin-bottom: 24px;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 16px;
    width: 100%;
    display: flex;
    align-items: flex-start;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #303133;
    padding-right: 16px;
    min-width: 100px;
    flex-shrink: 0;
  }

  :deep(.el-form-item__content) {
    flex: 1;
    min-width: 0;
  }

  :deep(.el-input),
  :deep(.el-textarea) {
    width: 100%;
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    width: 100%;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    box-shadow: none;
    transition: border-color 0.2s;

    &:hover {
      border-color: #c0c4cc;
    }
  }

  :deep(.el-input__wrapper) {
    background-color: #ffffff;
    height: 32px;

    &.is-focus {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
    }
  }

  :deep(.el-textarea__inner) {
    padding: 8px 12px;
    background-color: #ffffff;

    &:focus {
      border-color: #409eff;
      outline: none;
    }
  }

  :deep(.el-input--small .el-input__wrapper) {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background-color: #ffffff;

    &:hover {
      border-color: #c0c4cc;
    }

    &.is-focus {
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
    }
  }

  :deep(.el-form-item__error) {
    margin-top: 6px;
    font-size: 12px;
    color: #f56c6c;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    width: 100%;

    :deep(.el-input--small) {
      width: auto;
      min-width: 120px;
    }
  }
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 动画效果 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* 关系管理对话框样式 */
.relation-dialog-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.relation-dialog-card {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.relation-dialog-content {
  padding: 0 8px;
}

.existing-relations h4,
.create-relation-form h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.relations-list-dialog {
  max-height: 200px;
  overflow-y: auto;
}

.relation-item-dialog {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 6px;
  margin-bottom: 8px;
}

.relation-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.relation-strength {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 150px;
}

.strength-value {
  font-size: 12px;
  color: #909399;
  min-width: 24px;
}

.strength-slider {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.strength-display {
  font-size: 14px;
  font-weight: 500;
  color: #409eff;
  min-width: 30px;
}
</style>
