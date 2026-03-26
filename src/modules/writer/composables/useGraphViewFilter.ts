import { computed } from 'vue'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import { useProjectStore } from '@/modules/writer/stores/projectStore'
import type { CharacterRelation, GraphNode, GraphLink } from '@/modules/writer/types/character'

// 图谱视图过滤条件
export interface GraphViewFilter {
  scopeType: 'project' | 'volume' | 'chapter'
  scopeId?: string
  showOnly?: Set<string>
}

// 图谱视图状态
export interface GraphViewState {
  baseGraph: {
    nodes: GraphNode[]
    links: GraphLink[]
  }
  viewFilter: GraphViewFilter
  visibleNodes: GraphNode[]
  visibleLinks: GraphLink[]
}

export function useGraphViewFilter() {
  const writerStore = useWriterStore()
  const projectStore = useProjectStore()

  // 获取章节顺序映射（用于时序过滤）
  const chapterOrderMap = computed(() => {
    const chapters = writerStore.documentTree || []
    const map = new Map<string, number>()

    // 递归遍历文档树，为每个章节分配顺序号
    function traverse(nodes: any[], order: number = 0): number {
      for (const node of nodes) {
        map.set(node.id, ++order)
        if (node.children && node.children.length > 0) {
          order = traverse(node.children, order)
        }
      }
      return order
    }

    traverse(chapters)
    return map
  })

  // 判断关系在指定章节是否有效
  function isRelationValidAtChapter(
    relation: CharacterRelation,
    chapterId: string
  ): boolean {
    const chapterOrder = chapterOrderMap.value.get(chapterId)
    if (chapterOrder === undefined) return false

    // 如果没有设置生效章节，默认从第1章开始
    const fromOrder = relation.validFromChapterId
      ? (chapterOrderMap.value.get(relation.validFromChapterId) || 1)
      : 1

    // 如果没有设置失效章节，默认持续到故事结束
    const toOrder = relation.validUntilChapterId
      ? (chapterOrderMap.value.get(relation.validUntilChapterId) || Infinity)
      : Infinity

    return chapterOrder >= fromOrder && chapterOrder < toOrder
  }

  // 获取项目级完整图谱
  const baseGraph = computed(() => {
    const characters = writerStore.characters?.list || []
    const relations = writerStore.characters?.relations || []

    const nodes: GraphNode[] = characters.map(char => ({
      id: char.id,
      name: char.name,
      avatar: char.avatarUrl,
      importance: char.traits?.length || 0,
    }))

    const links: GraphLink[] = relations.map(rel => ({
      id: rel.id,
      source: rel.fromId,
      target: rel.toId,
      type: typeof rel.type === 'string' ? rel.type : rel.type,
      strength: rel.strength,
    }))

    return { nodes, links }
  })

  // 当前视图过滤条件（暂时默认为项目级视图）
  const viewFilter = computed<GraphViewFilter>(() => {
    return {
      scopeType: 'project', // 默认项目级视图
    }
  })

  // 应用过滤条件
  const filteredGraph = computed(() => {
    const currentProjectId = projectStore.currentProjectId
    if (!currentProjectId) {
      return { nodes: [], links: [] }
    }

    let nodes = baseGraph.value.nodes
    let links = baseGraph.value.links

    // 如果设置了showOnly过滤
    if (viewFilter.value.showOnly && viewFilter.value.showOnly.size > 0) {
      const visibleIds = new Set<string>()
      viewFilter.value.showOnly.forEach(id => visibleIds.add(id))

      // 过滤节点
      nodes = nodes.filter(node => visibleIds.has(node.id))

      // 过滤关系（只保留两端都可见的关系）
      links = links.filter(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id
        const targetId = typeof link.target === 'string' ? link.target : link.target.id
        return visibleIds.has(sourceId) && visibleIds.has(targetId)
      })
    }

    // 如果是章节视图，还需要根据时序过滤关系
    if (viewFilter.value.scopeType === 'chapter' && viewFilter.value.scopeId) {
      const chapterId = viewFilter.value.scopeId
      const relations = writerStore.characters?.relations || []

      links = links.filter(link => {
        const relation = relations.find(r => r.id === link.id)
        if (!relation) return false
        return isRelationValidAtChapter(relation as CharacterRelation, chapterId)
      })
    }

    return { nodes, links }
  })

  // 可见的节点和链接
  const visibleNodes = computed(() => filteredGraph.value.nodes)
  const visibleLinks = computed(() => filteredGraph.value.links)

  return {
    baseGraph,
    viewFilter,
    visibleNodes,
    visibleLinks,
    isRelationValidAtChapter,
  }
}
