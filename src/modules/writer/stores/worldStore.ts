import { defineStore } from 'pinia'
import { ref } from 'vue'
import { characterApi } from '../api/character'
import { locationApi } from '../api/location'
import { timelineApi } from '../api/timeline'
import type { Character } from '../types/character'
import type { Location } from '../types/location'
import type { Timeline } from '../types/timeline'

export const useWorldStore = defineStore('writer-world', () => {
  // State
  const characters = ref<Character[]>([])
  const timelines = ref<Timeline[]>([])
  const locations = ref<Location[]>([]) // 扁平列表
  const locationTree = ref<Location[]>([]) // 树形结构

  async function loadLocations(projectId: string) {
    // 并行请求：同时获取列表(用于搜索/关系计算)和树(用于展示)
    const [listRes, treeRes] = await Promise.all([
      locationApi.list(projectId),
      locationApi.getTree(projectId),
    ])

    locations.value = listRes
    locationTree.value = treeRes
  }

  // Actions
  async function loadAll(projectId: string) {
    // 并行加载，提升速度
    const [chars, locs, times] = await Promise.all([
      characterApi.list(projectId),
      locationApi.list ? locationApi.list(projectId) : Promise.resolve([]),
      timelineApi.list(projectId),
    ])

    characters.value = chars
    locations.value = locs as Location[]
    timelines.value = times
  }

  // 可以在这里封装特定的 CRUD，或者直接组件调用 API
  // 如果需要 AI Context，这里是一个很好的聚合点
  function getAIContext() {
    return {
      characters: characters.value.slice(0, 20), // 简单截取
      locations: locations.value.slice(0, 10),
      timelines: timelines.value.slice(0, 5),
    }
  }

  return {
    characters,
    locations,
    timelines,
    loadLocations,
    loadAll,
    getAIContext,
  }
})
