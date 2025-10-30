<template>
  <div class="encyclopedia-view">
    <!-- 工具栏 -->
    <div class="encyclopedia-header">
      <div class="header-left">
        <el-icon class="header-icon"><Collection /></el-icon>
        <span class="header-title">设定百科</span>
      </div>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索..."
          :prefix-icon="Search"
          size="small"
          style="width: 200px;"
          clearable
        />
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="encyclopedia-content">
      <!-- 左侧分类导航 -->
      <div class="category-nav">
        <el-menu
          :default-active="activeCategory"
          @select="handleCategoryChange"
        >
          <el-menu-item index="characters">
            <el-icon><User /></el-icon>
            <span>角色</span>
            <el-badge v-if="characters.length > 0" :value="characters.length" class="nav-badge" />
          </el-menu-item>
          <el-menu-item index="locations">
            <el-icon><LocationInformation /></el-icon>
            <span>地点</span>
            <el-badge v-if="locations.length > 0" :value="locations.length" class="nav-badge" />
          </el-menu-item>
          <el-menu-item index="items" disabled>
            <el-icon><Box /></el-icon>
            <span>物品</span>
            <el-tag size="small" type="info" style="margin-left: auto;">待开发</el-tag>
          </el-menu-item>
          <el-menu-item index="other" disabled>
            <el-icon><Document /></el-icon>
            <span>其他</span>
            <el-tag size="small" type="info" style="margin-left: auto;">待开发</el-tag>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 中间列表区 -->
      <div class="list-panel">
        <!-- 角色列表 -->
        <div v-show="activeCategory === 'characters'" class="list-container">
          <div class="list-header">
            <h3>角色列表</h3>
            <el-button type="primary" size="small" :icon="Plus" @click="handleAddCharacter">
              添加角色
            </el-button>
          </div>
          <el-scrollbar class="list-content">
            <div class="items-grid">
              <div
                v-for="character in filteredCharacters"
                :key="character.id"
                class="item-card"
                :class="{ 'is-selected': selectedItem?.id === character.id }"
                @click="handleSelectItem(character, 'character')"
              >
                <el-avatar :size="50" :src="character.avatarUrl">
                  {{ character.name.charAt(0) }}
                </el-avatar>
                <div class="item-info">
                  <div class="item-name">{{ character.name }}</div>
                  <div v-if="character.summary" class="item-desc">{{ character.summary }}</div>
                </div>
              </div>
            </div>
            <el-empty v-if="filteredCharacters.length === 0" description="暂无角色" />
          </el-scrollbar>
        </div>

        <!-- 地点列表 -->
        <div v-show="activeCategory === 'locations'" class="list-container">
          <div class="list-header">
            <h3>地点列表</h3>
            <el-button type="primary" size="small" :icon="Plus" @click="handleAddLocation">
              添加地点
            </el-button>
          </div>
          <el-scrollbar class="list-content">
            <div class="items-grid">
              <div
                v-for="location in filteredLocations"
                :key="location.id"
                class="item-card"
                :class="{ 'is-selected': selectedItem?.id === location.id }"
                @click="handleSelectItem(location, 'location')"
              >
                <el-avatar :size="50" :src="location.imageUrl" shape="square">
                  <el-icon><LocationInformation /></el-icon>
                </el-avatar>
                <div class="item-info">
                  <div class="item-name">{{ location.name }}</div>
                  <div v-if="location.description" class="item-desc">{{ location.description }}</div>
                </div>
              </div>
            </div>
            <el-empty v-if="filteredLocations.length === 0" description="暂无地点" />
          </el-scrollbar>
        </div>
      </div>

      <!-- 右侧详情面板 -->
      <transition name="slide-left">
        <div v-if="selectedItem && selectedType" class="detail-panel">
          <!-- 角色详情 -->
          <div v-if="selectedType === 'character'" class="detail-content">
            <div class="detail-header">
              <div class="header-info">
                <el-avatar :size="60" :src="(selectedItem as Character).avatarUrl">
                  {{ (selectedItem as Character).name.charAt(0) }}
                </el-avatar>
                <div class="header-text">
                  <h2>{{ (selectedItem as Character).name }}</h2>
                  <p v-if="(selectedItem as Character).alias">{{ (selectedItem as Character).alias?.join('、') }}</p>
                </div>
              </div>
              <div class="header-actions">
                <el-button text :icon="Edit" @click="handleEditItem">编辑</el-button>
                <el-button text :icon="Close" @click="selectedItem = null" />
              </div>
            </div>

            <el-scrollbar class="detail-body">
              <div class="detail-section">
                <h4>简介</h4>
                <p>{{ (selectedItem as Character).summary || '暂无简介' }}</p>
              </div>

              <div v-if="(selectedItem as Character).traits && (selectedItem as Character).traits!.length > 0" class="detail-section">
                <h4>性格特征</h4>
                <div class="tags-container">
                  <el-tag v-for="trait in (selectedItem as Character).traits" :key="trait">
                    {{ trait }}
                  </el-tag>
                </div>
              </div>

              <div v-if="(selectedItem as Character).background" class="detail-section">
                <h4>背景故事</h4>
                <p>{{ (selectedItem as Character).background }}</p>
              </div>

              <div class="detail-section">
                <h4>AI 设定</h4>
                <el-descriptions :column="1" border size="small">
                  <el-descriptions-item label="性格提示">
                    {{ (selectedItem as Character).personalityPrompt || '未设置' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="语言模式">
                    {{ (selectedItem as Character).speechPattern || '未设置' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="当前状态">
                    {{ (selectedItem as Character).currentState || '未设置' }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-scrollbar>
          </div>

          <!-- 地点详情 -->
          <div v-if="selectedType === 'location'" class="detail-content">
            <div class="detail-header">
              <div class="header-info">
                <el-avatar :size="60" :src="(selectedItem as Location).imageUrl" shape="square">
                  <el-icon><LocationInformation /></el-icon>
                </el-avatar>
                <div class="header-text">
                  <h2>{{ (selectedItem as Location).name }}</h2>
                </div>
              </div>
              <div class="header-actions">
                <el-button text :icon="Edit" @click="handleEditItem">编辑</el-button>
                <el-button text :icon="Close" @click="selectedItem = null" />
              </div>
            </div>

            <el-scrollbar class="detail-body">
              <div class="detail-section">
                <h4>描述</h4>
                <p>{{ (selectedItem as Location).description || '暂无描述' }}</p>
              </div>

              <div class="detail-section">
                <h4>地点信息</h4>
                <el-descriptions :column="1" border size="small">
                  <el-descriptions-item label="气候" v-if="(selectedItem as Location).climate">
                    {{ (selectedItem as Location).climate }}
                  </el-descriptions-item>
                  <el-descriptions-item label="文化" v-if="(selectedItem as Location).culture">
                    {{ (selectedItem as Location).culture }}
                  </el-descriptions-item>
                  <el-descriptions-item label="地理" v-if="(selectedItem as Location).geography">
                    {{ (selectedItem as Location).geography }}
                  </el-descriptions-item>
                  <el-descriptions-item label="氛围" v-if="(selectedItem as Location).atmosphere">
                    {{ (selectedItem as Location).atmosphere }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWriterStore } from '../stores/writerStore'
import type { Character, Location } from '@/types/writer'
import {
  Collection,
  Search,
  User,
  LocationInformation,
  Box,
  Document,
  Plus,
  Edit,
  Close
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const writerStore = useWriterStore()
const activeCategory = ref('characters')
const searchKeyword = ref('')
const selectedItem = ref<Character | Location | null>(null)
const selectedType = ref<'character' | 'location' | null>(null)

const characters = computed(() => writerStore.characters.list)
const locations = computed(() => writerStore.locations.list)

const filteredCharacters = computed(() => {
  if (!searchKeyword.value) return characters.value
  const keyword = searchKeyword.value.toLowerCase()
  return characters.value.filter(c =>
    c.name.toLowerCase().includes(keyword) ||
    c.summary?.toLowerCase().includes(keyword) ||
    c.alias?.some(a => a.toLowerCase().includes(keyword))
  )
})

const filteredLocations = computed(() => {
  if (!searchKeyword.value) return locations.value
  const keyword = searchKeyword.value.toLowerCase()
  return locations.value.filter(l =>
    l.name.toLowerCase().includes(keyword) ||
    l.description?.toLowerCase().includes(keyword)
  )
})

onMounted(async () => {
  if (writerStore.currentProjectId) {
    await writerStore.loadCharacters()
    await writerStore.loadLocations()
  }
})

const handleCategoryChange = (index: string) => {
  activeCategory.value = index
  selectedItem.value = null
  selectedType.value = null
}

const handleSelectItem = (item: Character | Location, type: 'character' | 'location') => {
  selectedItem.value = item
  selectedType.value = type
}

const handleAddCharacter = () => {
  ElMessage.info('请使用角色图谱页面添加角色')
}

const handleAddLocation = () => {
  ElMessage.info('地点添加功能开发中...')
}

const handleEditItem = () => {
  ElMessage.info('编辑功能开发中...')
}
</script>

<style scoped lang="scss">
.encyclopedia-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f9fafb;
}

.encyclopedia-header {
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
    color: #e6a23c;
  }

  .header-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.encyclopedia-content {
  flex: 1;
  display: grid;
  grid-template-columns: 200px 1fr 400px;
  overflow: hidden;
}

.category-nav {
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;

  .el-menu {
    border: none;
  }

  .nav-badge {
    margin-left: auto;
  }
}

.list-panel {
  overflow: hidden;
}

.list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
}

.list-content {
  flex: 1;
  padding: 16px;
}

.items-grid {
  display: grid;
  gap: 12px;
}

.item-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &.is-selected {
    border-color: #409eff;
    background: #ecf5ff;
  }
}

.item-info {
  flex: 1;
  min-width: 0;

  .item-name {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }

  .item-desc {
    font-size: 12px;
    color: #909399;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.detail-panel {
  background: #ffffff;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.detail-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;

  .header-info {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;

    .header-text {
      flex: 1;

      h2 {
        margin: 0 0 4px 0;
        font-size: 18px;
        font-weight: 600;
      }

      p {
        margin: 0;
        font-size: 13px;
        color: #909399;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
}

.detail-body {
  flex: 1;
  padding: 16px;
}

.detail-section {
  margin-bottom: 24px;

  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
  }
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
@media (max-width: 1200px) {
  .encyclopedia-content {
    grid-template-columns: 180px 1fr;

    .detail-panel {
      position: fixed;
      right: 0;
      top: 0;
      bottom: 0;
      width: 400px;
      z-index: 1000;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
    }
  }
}

@media (max-width: 768px) {
  .encyclopedia-content {
    grid-template-columns: 1fr;

    .category-nav {
      display: none;
    }

    .detail-panel {
      width: 100%;
    }
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .encyclopedia-view {
    background: #0d0d0d;
  }

  .encyclopedia-header {
    background: #1a1a1a;
    border-bottom-color: #2d2d2d;
  }

  .header-title {
    color: #e5e5e5;
  }

  .category-nav,
  .list-header,
  .detail-panel {
    background: #1a1a1a;
    border-color: #2d2d2d;
  }

  .list-container {
    background: #0d0d0d;
  }

  .list-header h3 {
    color: #e5e5e5;
  }

  .item-card {
    background: #1a1a1a;
    border-color: #2d2d2d;

    &:hover {
      border-color: #409eff;
    }

    &.is-selected {
      background: #1a3a52;
    }
  }

  .item-info .item-name {
    color: #e5e5e5;
  }

  .detail-header {
    border-bottom-color: #2d2d2d;

    .header-text h2 {
      color: #e5e5e5;
    }
  }

  .detail-section {
    h4 {
      color: #e5e5e5;
    }

    p {
      color: #c0c4cc;
    }
  }
}
</style>




