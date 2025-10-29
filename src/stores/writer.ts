import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
  type Project,
  type ProjectCreateData,
  type ProjectUpdateData,
  type ProjectQueryParams
} from '@/modules/writer/api/projects'
import { ElMessage } from 'element-plus'

/**
 * 写作端状态管理
 */
export const useWriterStore = defineStore('writer', () => {
  // 状态
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const loading = ref(false)
  const total = ref(0)

  // 统计数据
  const stats = ref({
    totalWords: 0,
    bookCount: 0,
    todayWords: 0,
    pending: 0
  })

  // 计算属性
  const projectList = computed(() => projects.value)
  const hasProjects = computed(() => projects.value.length > 0)

  // 获取项目列表
  const fetchProjects = async (params?: ProjectQueryParams) => {
    loading.value = true
    try {
      const response = await getProjects(params)
      if (response.code === 200) {
        projects.value = response.data || []
        total.value = response.total || 0
      }
      return response
    } catch (error: any) {
      console.error('获取项目列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 创建项目
  const createNewProject = async (data: ProjectCreateData) => {
    try {
      const response = await createProject(data)
      if (response.code === 200 && response.data) {
        projects.value.unshift(response.data)
        ElMessage.success('项目创建成功')
        return response.data
      }
      return null
    } catch (error: any) {
      console.error('创建项目失败:', error)
      throw error
    }
  }

  // 获取项目详情
  const fetchProjectById = async (projectId: string) => {
    try {
      const response = await getProjectById(projectId)
      if (response.code === 200 && response.data) {
        currentProject.value = response.data
        return response.data
      }
      return null
    } catch (error: any) {
      console.error('获取项目详情失败:', error)
      throw error
    }
  }

  // 更新项目
  const updateProjectData = async (projectId: string, data: ProjectUpdateData) => {
    try {
      const response = await updateProject(projectId, data)
      if (response.code === 200 && response.data) {
        // 更新列表中的项目
        const index = projects.value.findIndex(p => p.projectId === projectId)
        if (index !== -1) {
          projects.value[index] = response.data
        }

        // 更新当前项目
        if (currentProject.value?.projectId === projectId) {
          currentProject.value = response.data
        }

        ElMessage.success('项目更新成功')
        return response.data
      }
      return null
    } catch (error: any) {
      console.error('更新项目失败:', error)
      throw error
    }
  }

  // 删除项目
  const deleteProjectById = async (projectId: string) => {
    try {
      const response = await deleteProject(projectId)
      if (response.code === 200) {
        // 从列表中移除
        projects.value = projects.value.filter(p => p.projectId !== projectId)

        // 如果删除的是当前项目，清空当前项目
        if (currentProject.value?.projectId === projectId) {
          currentProject.value = null
        }

        ElMessage.success('项目删除成功')
        return true
      }
      return false
    } catch (error: any) {
      console.error('删除项目失败:', error)
      throw error
    }
  }

  // 加载统计数据
  const loadStats = async () => {
    try {
      // TODO: 实现统计数据API调用
      // const response = await writerAPI.getStats()
      // stats.value = response.data

      // 临时使用mock数据
      stats.value = {
        totalWords: 125000,
        bookCount: projects.value.length,
        todayWords: 2500,
        pending: 3
      }
    } catch (error: any) {
      console.error('加载统计数据失败:', error)
    }
  }

  // 清空状态
  const clearState = () => {
    projects.value = []
    currentProject.value = null
    total.value = 0
  }

  return {
    // 状态
    projects,
    currentProject,
    loading,
    total,
    stats,

    // 计算属性
    projectList,
    hasProjects,

    // 方法
    fetchProjects,
    createNewProject,
    fetchProjectById,
    updateProjectData,
    deleteProjectById,
    loadStats,
    clearState
  }
})

