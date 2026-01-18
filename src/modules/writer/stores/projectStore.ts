import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { projectApi } from '../api/project'
import type {
  ProjectSummary,
  ProjectDetail,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../types/project'

export const useProjectStore = defineStore('writer-project', () => {
  // State
  const projects = ref<ProjectSummary[]>([])
  const currentProject = ref<ProjectDetail | null>(null)
  const loading = ref(false)
  const total = ref(0)

  // Getters
  const currentProjectId = computed(() => currentProject.value?.id)

  // Actions
  async function loadList(params: { page?: number; pageSize?: number; status?: string } = {}) {
    loading.value = true
    try {
      const res = await projectApi.list(params)
      projects.value = res.projects
      total.value = res.total
    } finally {
      loading.value = false
    }
  }

  async function loadDetail(id: string) {
    loading.value = true
    try {
      currentProject.value = await projectApi.getDetail(id)
    } finally {
      loading.value = false
    }
  }

  async function create(data: CreateProjectRequest) {
    const res = await projectApi.create(data)
    // 创建后重新加载列表或直接添加
    await loadList()
    return res
  }

  async function update(id: string, data: UpdateProjectRequest) {
    await projectApi.update(id, data)
    if (currentProject.value?.id === id) {
      // 简单合并或重新拉取
      await loadDetail(id)
    }
  }

  async function remove(id: string) {
    await projectApi.delete(id)
    projects.value = projects.value.filter((p) => p.id !== id)
    if (currentProject.value?.id === id) {
      currentProject.value = null
    }
  }

  return {
    projects,
    currentProject,
    loading,
    total,
    currentProjectId,
    loadList,
    loadDetail,
    create,
    update,
    remove,
  }
})
