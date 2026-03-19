/**
 * useDirectoryOutline - 目录大纲构建 Composable
 *
 * 从 ProjectWorkspace.vue 提取的目录大纲构建逻辑
 */
import { type ComputedRef } from 'vue'
import { DocumentType, type Document } from '@/modules/writer/types/document'
import type { MockProjectData } from './types'

// =======================
// Types
// =======================

/** useDirectoryOutline 参数 */
export interface UseDirectoryOutlineOptions {
  /** 可用文档映射 */
  availableDocMap: ComputedRef<Map<string, Document>>
  /** Mock 项目数据 */
  mockProject: ComputedRef<MockProjectData | null>
}

/** useDirectoryOutline 返回值 */
export interface UseDirectoryOutlineReturn {
  /** 构建目录大纲内容 */
  buildDirectoryOutline: (directoryId: string) => string
}

// =======================
// Composable
// =======================

/**
 * 目录大纲构建
 *
 * @param options 配置选项
 * @returns 构建方法
 */
export function useDirectoryOutline(options: UseDirectoryOutlineOptions): UseDirectoryOutlineReturn {
  const { availableDocMap, mockProject } = options

  /**
   * 构建目录大纲内容
   *
   * @param directoryId 目录 ID
   * @returns 大纲文本内容
   */
  const buildDirectoryOutline = (directoryId: string): string => {
    const directory = availableDocMap.value.get(directoryId)
    if (!directory) return ''

    // 优先使用 mock 数据
    if (mockProject.value?.contentByDocId?.[directoryId]) {
      return mockProject.value.contentByDocId[directoryId]
    }

    // 获取目录下的章节
    const children = Array.from(availableDocMap.value.values())
      .filter((doc) => doc.parentId === directoryId && doc.type === DocumentType.CHAPTER)
      .sort((a, b) => (a.order || 0) - (b.order || 0))

    const chapterLines = children.length > 0
      ? children.map((chapter, index) => `${index + 1}. ${chapter.title}`).join('\n')
      : '- 暂无章节，请在右上角新增章节。'

    return `# ${directory.title} 细纲\n\n## 目录目标\n- 待补充此目录核心冲突与推进目标。\n\n## 章节推进\n${chapterLines}\n`
  }

  return {
    buildDirectoryOutline,
  }
}
