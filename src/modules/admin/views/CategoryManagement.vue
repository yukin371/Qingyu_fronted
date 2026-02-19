<template>
  <div class="category-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-info">
        <h2 class="page-title">分类管理</h2>
        <p class="page-subtitle">管理书城分类结构，维护分类树与分类详情</p>
      </div>
      <div class="header-actions">
        <el-button @click="loadCategories">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon parent-icon">
          <el-icon><Folder /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ categories.length }}</span>
          <span class="stat-label">一级分类</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon child-icon">
          <el-icon><FolderOpened /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ totalChildrenCount }}</span>
          <span class="stat-label">二级分类</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon total-icon">
          <el-icon><DataAnalysis /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ categories.length + totalChildrenCount }}</span>
          <span class="stat-label">分类总数</span>
        </div>
      </div>
    </div>

    <div v-loading="loading" class="content-wrapper">
      <div class="main-layout">
        <!-- 左侧：分类树 -->
        <div class="tree-panel">
          <div class="panel-header">
            <h3>
              <el-icon><Share /></el-icon>
              分类树
            </h3>
          </div>

          <el-empty v-if="categories.length === 0 && !loading" description="暂无分类数据">
            <el-button type="primary" @click="handleAddCategory">添加分类</el-button>
          </el-empty>

          <div v-else class="tree-container">
            <el-collapse v-model="activeCollapse" accordion>
              <el-collapse-item
                v-for="category in categories"
                :key="category._id"
                :name="category._id"
              >
                <template #title>
                  <div class="category-header" @click.stop="selectCategory(category)">
                    <el-icon class="folder-icon"><Folder /></el-icon>
                    <span class="category-name">{{ category.name }}</span>
                    <el-tag size="small" type="info" effect="plain">
                      {{ category.children?.length || 0 }}
                    </el-tag>
                    <div class="category-actions" @click.stop>
                      <el-button
                        type="success"
                        size="small"
                        link
                        @click="handleAddChildCategory(category)"
                      >
                        <el-icon><Plus /></el-icon>
                      </el-button>
                      <el-button
                        type="primary"
                        size="small"
                        link
                        @click="handleEditCategory(category)"
                      >
                        <el-icon><Edit /></el-icon>
                      </el-button>
                      <el-button
                        type="danger"
                        size="small"
                        link
                        @click="handleDeleteCategory(category)"
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </template>

                <!-- 子分类列表 -->
                <div class="children-list">
                  <div
                    v-for="child in category.children"
                    :key="child._id"
                    :class="['child-item', { active: selectedCategory?._id === child._id }]"
                    @click="selectCategory(child, category)"
                  >
                    <el-icon><Document /></el-icon>
                    <span class="child-name">{{ child.name }}</span>
                    <span class="child-slug">{{ child.slug }}</span>
                    <div class="child-actions">
                      <el-button
                        type="primary"
                        size="small"
                        link
                        @click.stop="handleEditCategory(child, category)"
                      >
                        <el-icon><Edit /></el-icon>
                      </el-button>
                      <el-button
                        type="danger"
                        size="small"
                        link
                        @click.stop="handleDeleteCategory(child, category)"
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                  <el-button
                    class="add-child-btn"
                    size="small"
                    @click="handleAddChildCategory(category)"
                  >
                    <el-icon><Plus /></el-icon>
                    添加子分类
                  </el-button>
                </div>
              </el-collapse-item>
            </el-collapse>

            <!-- 添加一级分类按钮 -->
            <el-button
              class="add-parent-btn"
              @click="handleAddCategory"
            >
              <el-icon><Plus /></el-icon>
              添加一级分类
            </el-button>
          </div>
        </div>

        <!-- 右侧：分类详情 -->
        <div class="detail-panel">
          <template v-if="selectedCategory">
            <div class="panel-header">
              <h3>
                <el-icon><InfoFilled /></el-icon>
                分类详情
              </h3>
              <div class="detail-actions">
                <el-button type="primary" size="small" @click="handleEditCategory(selectedCategory, parentCategory)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button type="danger" size="small" @click="handleDeleteCategory(selectedCategory, parentCategory)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>

            <div class="detail-content">
              <div class="detail-card">
                <div class="detail-item">
                  <span class="detail-label">分类ID</span>
                  <span class="detail-value"><code>{{ selectedCategory._id }}</code></span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">分类名称</span>
                  <span class="detail-value">{{ selectedCategory.name }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">URL标识</span>
                  <span class="detail-value"><code>{{ selectedCategory.slug }}</code></span>
                </div>
                <div v-if="parentCategory" class="detail-item">
                  <span class="detail-label">父级分类</span>
                  <span class="detail-value">
                    <el-tag type="info">{{ parentCategory.name }}</el-tag>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">分类类型</span>
                  <span class="detail-value">
                    <el-tag :type="selectedCategory.children?.length ? 'primary' : 'success'">
                      {{ selectedCategory.children?.length ? '父级分类' : '子级分类' }}
                    </el-tag>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">子分类数量</span>
                  <span class="detail-value">
                    <el-badge :value="selectedCategory.children?.length || 0" type="primary" />
                  </span>
                </div>
              </div>

              <!-- 子分类列表 -->
              <div v-if="selectedCategory.children?.length" class="children-section">
                <h4>
                  <el-icon><List /></el-icon>
                  子分类列表
                </h4>
                <div class="children-tags">
                  <el-tag
                    v-for="child in selectedCategory.children"
                    :key="child._id"
                    class="child-tag"
                    effect="plain"
                    @click="selectCategory(child, selectedCategory)"
                  >
                    {{ child.name }}
                  </el-tag>
                </div>
              </div>
            </div>
          </template>

          <el-empty v-else class="detail-empty" description="请从左侧选择一个分类查看详情">
            <template #image>
              <el-icon :size="72" color="#cbd5e1"><FolderOpened /></el-icon>
            </template>
          </el-empty>
        </div>
      </div>
    </div>

    <!-- 添加/编辑分类对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑分类' : '添加分类'"
      width="500px"
      class="admin-form-dialog"
      align-center
      append-to-body
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="categoryForm" :rules="formRules" label-width="100px" ref="formRef">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="URL标识" prop="slug">
          <el-input v-model="categoryForm.slug" placeholder="请输入URL标识，如：xuanhuan" />
        </el-form-item>
        <el-form-item v-if="!isEditMode || categoryForm.parentId" label="父级分类">
          <el-select
            v-model="categoryForm.parentId"
            placeholder="选择父级分类（可选）"
            popper-class="admin-select-popper"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="cat in categories"
              :key="cat._id"
              :label="cat.name"
              :value="cat._id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveCategory">
          {{ isEditMode ? '保存' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Plus, Refresh, Folder, FolderOpened, DataAnalysis, Share,
  Edit, Delete, Document, InfoFilled, List
} from '@element-plus/icons-vue'

// 类型定义
interface Category {
  _id: string
  name: string
  slug: string
  children?: Category[]
}

// Mock数据 - 使用ref使其可编辑
const mockCategoriesData = ref<Category[]>([
  {
    _id: 'cat_001',
    name: '玄幻奇幻',
    slug: 'xuanhuan',
    children: [
      { _id: 'cat_001_001', name: '东方玄幻', slug: 'xuanhuan/dongfang' },
      { _id: 'cat_001_002', name: '异世大陆', slug: 'xuanhuan/yishi' },
      { _id: 'cat_001_003', name: '王朝争霸', slug: 'xuanhuan/zhengba' },
      { _id: 'cat_001_004', name: '高武世界', slug: 'xuanhuan/gaowu' }
    ]
  },
  {
    _id: 'cat_002',
    name: '都市生活',
    slug: 'dushi',
    children: [
      { _id: 'cat_002_001', name: '都市异能', slug: 'dushi/yineng' },
      { _id: 'cat_002_002', name: '商战职场', slug: 'dushi/shangzhan' },
      { _id: 'cat_002_003', name: '娱乐明星', slug: 'dushi/yule' }
    ]
  },
  {
    _id: 'cat_003',
    name: '历史军事',
    slug: 'lishi',
    children: [
      { _id: 'cat_003_001', name: '架空历史', slug: 'lishi/jiakong' },
      { _id: 'cat_003_002', name: '历史传记', slug: 'lishi/zhuanji' },
      { _id: 'cat_003_003', name: '军旅生涯', slug: 'lishi/junlu' }
    ]
  },
  {
    _id: 'cat_004',
    name: '科幻未来',
    slug: 'kehuan',
    children: [
      { _id: 'cat_004_001', name: '星际文明', slug: 'kehuan/xingji' },
      { _id: 'cat_004_002', name: '末世危机', slug: 'kehuan/moshi' },
      { _id: 'cat_004_003', name: '时空穿梭', slug: 'kehuan/shikong' }
    ]
  },
  {
    _id: 'cat_005',
    name: '悬疑推理',
    slug: 'xuanyi',
    children: [
      { _id: 'cat_005_001', name: '侦探推理', slug: 'xuanyi/zhentan' },
      { _id: 'cat_005_002', name: '恐怖惊悚', slug: 'xuanyi/kongbu' }
    ]
  },
  {
    _id: 'cat_006',
    name: '浪漫青春',
    slug: 'qingchun',
    children: [
      { _id: 'cat_006_001', name: '校园纯爱', slug: 'qingchun/xiaoyuan' },
      { _id: 'cat_006_002', name: '青春成长', slug: 'qingchun/chengzhang' }
    ]
  }
])

// 状态
const loading = ref(false)
const categories = ref<Category[]>([])
const selectedCategory = ref<Category | null>(null)
const parentCategory = ref<Category | null>(null)
const activeCollapse = ref<string[]>([])

// 对话框
const dialogVisible = ref(false)
const isEditMode = ref(false)
const formRef = ref<FormInstance>()
const categoryForm = reactive({
  _id: '',
  name: '',
  slug: '',
  parentId: ''
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  slug: [{ required: true, message: '请输入URL标识', trigger: 'blur' }]
}

// 计算属性
const totalChildrenCount = computed(() => {
  return categories.value.reduce((sum, cat) => sum + (cat.children?.length || 0), 0)
})

// 方法
const loadCategories = async () => {
  loading.value = true
  try {
    // 使用mock数据（可编辑）
    categories.value = JSON.parse(JSON.stringify(mockCategoriesData.value))

    // 默认展开第一个分类
    if (categories.value.length > 0) {
      activeCollapse.value = [categories.value[0]._id]
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  } finally {
    loading.value = false
  }
}

const selectCategory = (category: Category, parent?: Category) => {
  selectedCategory.value = category
  parentCategory.value = parent || null
}

const handleAddCategory = () => {
  isEditMode.value = false
  categoryForm._id = ''
  categoryForm.name = ''
  categoryForm.slug = ''
  categoryForm.parentId = ''
  dialogVisible.value = true
}

const handleAddChildCategory = (parent: Category) => {
  isEditMode.value = false
  categoryForm._id = ''
  categoryForm.name = ''
  categoryForm.slug = ''
  categoryForm.parentId = parent._id
  dialogVisible.value = true
}

const handleEditCategory = (category: Category, parent?: Category) => {
  isEditMode.value = true
  categoryForm._id = category._id
  categoryForm.name = category.name
  categoryForm.slug = category.slug
  categoryForm.parentId = parent?._id || ''
  dialogVisible.value = true
}

const handleDeleteCategory = async (category: Category, parent?: Category) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类"${category.name}"吗？${category.children?.length ? '其子分类也将被删除。' : ''}`,
      '确认删除',
      { type: 'warning', confirmButtonText: '确认删除' }
    )

    if (parent) {
      // 删除子分类
      const parentCat = mockCategoriesData.value.find(c => c._id === parent._id)
      if (parentCat?.children) {
        const index = parentCat.children.findIndex(c => c._id === category._id)
        if (index > -1) {
          parentCat.children.splice(index, 1)
        }
      }
    } else {
      // 删除一级分类
      const index = mockCategoriesData.value.findIndex(c => c._id === category._id)
      if (index > -1) {
        mockCategoriesData.value.splice(index, 1)
      }
    }

    if (selectedCategory.value?._id === category._id) {
      selectedCategory.value = null
      parentCategory.value = null
    }

    ElMessage.success('删除成功')
    loadCategories()
  } catch {
    // 用户取消
  }
}

const handleSaveCategory = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEditMode.value) {
        // 编辑模式
        const updateCategory = (list: Category[]) => {
          for (const cat of list) {
            if (cat._id === categoryForm._id) {
              cat.name = categoryForm.name
              cat.slug = categoryForm.slug
              return true
            }
            if (cat.children && updateCategory(cat.children)) {
              return true
            }
          }
          return false
        }
        updateCategory(mockCategoriesData.value)
        ElMessage.success('修改成功')
      } else {
        // 添加模式
        const newCategory: Category = {
          _id: `cat_${Date.now()}`,
          name: categoryForm.name,
          slug: categoryForm.slug
        }

        if (categoryForm.parentId) {
          // 添加子分类
          const parent = mockCategoriesData.value.find(c => c._id === categoryForm.parentId)
          if (parent) {
            if (!parent.children) parent.children = []
            parent.children.push(newCategory)
          }
        } else {
          // 添加一级分类
          mockCategoriesData.value.push({ ...newCategory, children: [] })
        }
        ElMessage.success('添加成功')
      }

      dialogVisible.value = false
      loadCategories()
    }
  })
}

// 生命周期
onMounted(() => {
  loadCategories()
})
</script>

<style scoped lang="scss">
.category-management {
  max-width: 1400px;
  margin: 0 auto;
}

// 页面标题
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  .header-info {
    .page-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    }

    .page-subtitle {
      margin: 8px 0 0;
      color: #6b7280;
      font-size: 14px;
    }
  }

  .header-actions {
    display: flex;
    gap: 10px;
  }
}

// 统计卡片
.stats-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;

    &.parent-icon {
      background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
      color: #fff;
    }

    &.child-icon {
      background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
      color: #fff;
    }

    &.total-icon {
      background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
      color: #fff;
    }
  }

  .stat-content {
    display: flex;
    flex-direction: column;

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
    }

    .stat-label {
      font-size: 14px;
      color: #6b7280;
    }
  }
}

// 内容区
.content-wrapper {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.main-layout {
  display: flex;
  min-height: 500px;
}

// 左侧分类树
.tree-panel {
  width: 420px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;

  .panel-header {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;

  :deep(.el-collapse) {
    border: none;
  }

  :deep(.el-collapse-item__header) {
    position: relative;
    display: flex;
    align-items: center;
    height: auto;
    min-height: 54px;
    padding: 0 34px 0 0;
    border: none;
    background: transparent;
    line-height: normal;
  }

  :deep(.el-collapse-item__arrow) {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    margin: 0;
    color: #64748b;
  }

  :deep(.el-collapse-item__wrap) {
    border: none;
  }

  :deep(.el-collapse-item__content) {
    padding: 0;
  }
}

.category-header {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  width: 100%;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
  }

  &.active {
    background: #eff6ff;
    color: #2563eb;
  }

  .folder-icon {
    color: #f59e0b;
    font-size: 18px;
    flex-shrink: 0;
  }

  .category-name {
    flex: 1;
    min-width: 0;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .el-tag {
    flex-shrink: 0;
  }

  .category-actions {
    display: flex;
    flex-wrap: nowrap;
    gap: 4px;
    opacity: 1;
    transition: opacity 0.2s;
    flex-shrink: 0;
    margin-right: 18px;
  }

  &:hover .category-actions {
    opacity: 1;
  }
}

:deep(.admin-form-dialog .el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.admin-form-dialog .el-dialog__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.admin-form-dialog .el-dialog__body) {
  padding: 20px;
}

:deep(.admin-form-dialog .el-dialog__footer) {
  padding: 12px 20px 18px;
  border-top: 1px solid #f1f5f9;
}

.add-parent-btn {
  width: 100%;
  margin-top: 12px;
  padding: 12px;
  color: #6b7280;
  border-style: dashed;
  border-radius: 8px;

  &:hover {
    color: #3b82f6;
    border-color: #3b82f6;
    background: #f0f7ff;
  }

  .el-icon {
    margin-right: 6px;
  }
}

.children-list {
  margin-left: 24px;
  padding: 8px 0;
  border-left: 2px solid #e5e7eb;

  .child-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    margin: 4px 0;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #f3f4f6;
    }

    &.active {
      background: #eff6ff;
      color: #2563eb;
    }

    .el-icon {
      color: #9ca3af;
    }

    .child-name {
      flex: 1;
      font-size: 14px;
    }

    .child-slug {
      font-size: 12px;
      color: #9ca3af;
      font-family: monospace;
    }

    .child-actions {
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover .child-actions {
      opacity: 1;
    }
  }

  .add-child-btn {
    margin: 8px 16px;
    color: #6b7280;
    border-style: dashed;

    &:hover {
      color: #3b82f6;
      border-color: #3b82f6;
    }
  }
}

// 右侧详情
.detail-panel {
  flex: 1;
  display: flex;
  flex-direction: column;

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .detail-actions {
      display: flex;
      gap: 8px;
    }
  }
}

.detail-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.detail-empty .el-empty) {
  margin: 0 auto;
}

:deep(.detail-empty .el-empty__description p) {
  color: #64748b;
  font-size: 14px;
}

.detail-content {
  flex: 1;
  padding: 24px;
}

.detail-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }

  .detail-label {
    width: 100px;
    font-size: 14px;
    color: #6b7280;
  }

  .detail-value {
    flex: 1;
    font-size: 14px;
    color: #1f2937;

    code {
      background: #e5e7eb;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 13px;
      color: #4b5563;
    }
  }
}

.children-section {
  h4 {
    margin: 0 0 16px;
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .children-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .child-tag {
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 20px;
    transition: all 0.2s;

    &:hover {
      background: #3b82f6;
      color: #fff;
      border-color: #3b82f6;
    }
  }
}

// 响应式
@media (max-width: 900px) {
  .stats-cards {
    flex-direction: column;
  }

  .main-layout {
    flex-direction: column;
  }

  .tree-panel {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    max-height: 400px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;

    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
}
</style>
