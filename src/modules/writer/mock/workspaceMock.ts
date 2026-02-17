import { DocumentStatus, DocumentType, type Document } from '../types/document'
import {
  YUNLAN_BOOK_ID,
  YUNLAN_BOOK_TITLE,
  createYunlanReaderChapters,
  yunlanBookMeta,
} from '@/modules/bookstore/yunlanDemo.mock'

export interface WorkspaceProjectSummary {
  id: string
  title: string
  status: string
  wordCount: number
  chapterCount: number
  updatedAt: string
}

export interface WorkspaceChapterSummary {
  id: string
  projectId: string
  chapterNum: number
  title: string
  wordCount: number
  updatedAt: string
  status: 'draft' | 'published'
  nodeType?: 'directory' | 'chapter'
  sortOrder?: number
}

export interface WorkspaceSceneSummary {
  id: string
  title: string
  hook: string
  chapterIds: string[]
}

export interface WorkspaceMockProject {
  project: WorkspaceProjectSummary
  docs: Document[]
  chapters: WorkspaceChapterSummary[]
  scenes: WorkspaceSceneSummary[]
  contentByDocId: Record<string, string>
}

const now = Date.now()
const iso = (offsetMs: number) => new Date(now - offsetMs).toISOString()

const WRITER_YUNLAN_PROJECT_ID = 'project-yljs-1'

const readerChapters = createYunlanReaderChapters(3)

const createYunlanDocs = (projectId: string): Document[] => {
  const sceneId1 = `${projectId}-scene-1`
  const sceneId2 = `${projectId}-scene-2`
  const sceneDocs: Document[] = [
    {
      id: sceneId1,
      projectId,
      title: '目录一 雨夜入城（小高潮）',
      type: DocumentType.SCENE,
      level: 0,
      order: 1,
      status: DocumentStatus.WRITING,
      wordCount: 0,
      createdAt: iso(7 * 24 * 60 * 60 * 1000),
      updatedAt: iso(2 * 60 * 60 * 1000),
    },
    {
      id: sceneId2,
      projectId,
      title: '目录二 灯下问卷（推进）',
      type: DocumentType.SCENE,
      level: 0,
      order: 2,
      status: DocumentStatus.WRITING,
      wordCount: 0,
      createdAt: iso(5 * 24 * 60 * 60 * 1000),
      updatedAt: iso(40 * 60 * 1000),
    }
  ]

  const chapterDocs = readerChapters.map((chapter) => ({
    id: chapter.id,
    projectId,
    parentId: chapter.chapterNum < 3 ? sceneId1 : sceneId2,
    title: chapter.title,
    type: DocumentType.CHAPTER,
    level: 1,
    order: chapter.chapterNum,
    status: chapter.chapterNum < 3 ? DocumentStatus.COMPLETED : DocumentStatus.WRITING,
    wordCount: chapter.content.length,
    createdAt: iso((7 - chapter.chapterNum) * 24 * 60 * 60 * 1000),
    updatedAt: iso((4 - chapter.chapterNum) * 30 * 60 * 1000),
  }))

  return [...sceneDocs, ...chapterDocs]
}

const createYunlanScenes = (projectId: string): WorkspaceSceneSummary[] => [
  {
    id: `${projectId}-scene-1`,
    title: '目录一 雨夜入城（小高潮）',
    hook: '林砚入城并在听雨斋开始接触云岚城暗线。',
    chapterIds: readerChapters.filter((chapter) => chapter.chapterNum < 3).map((chapter) => chapter.id),
  },
  {
    id: `${projectId}-scene-2`,
    title: '目录二 灯下问卷（推进）',
    hook: '线索转向书院深处，主角首次触碰更深谜团。',
    chapterIds: readerChapters.filter((chapter) => chapter.chapterNum >= 3).map((chapter) => chapter.id),
  },
]

const createYunlanChapterSummary = (projectId: string): WorkspaceChapterSummary[] => {
  const sceneEntries: WorkspaceChapterSummary[] = [
    {
      id: `${projectId}-scene-1`,
      projectId,
      chapterNum: 0,
      title: '目录一 雨夜入城（小高潮）',
      wordCount: 0,
      updatedAt: iso(2 * 60 * 60 * 1000),
      status: 'published',
      nodeType: 'directory',
      sortOrder: 1,
    },
    {
      id: `${projectId}-scene-2`,
      projectId,
      chapterNum: 0,
      title: '目录二 灯下问卷（推进）',
      wordCount: 0,
      updatedAt: iso(40 * 60 * 1000),
      status: 'draft',
      nodeType: 'directory',
      sortOrder: 4,
    }
  ]

  const chapterEntries: WorkspaceChapterSummary[] = readerChapters.map((chapter) => ({
    id: chapter.id,
    projectId,
    chapterNum: chapter.chapterNum,
    title: chapter.title,
    wordCount: chapter.content.length,
    updatedAt: iso((4 - chapter.chapterNum) * 30 * 60 * 1000),
    status: chapter.chapterNum < 3 ? 'published' : 'draft',
    nodeType: 'chapter',
    sortOrder: chapter.chapterNum + 1,
  }))

  return [...sceneEntries, ...chapterEntries].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
}

const createYunlanContentByDocId = (projectId: string): Record<string, string> => {
  const entries: Array<[string, string]> = [
    [
      `${projectId}-scene-1`,
      '# 目录一 雨夜入城（小高潮）\n\n这一目录聚焦主角初入云岚城，完成初次落脚并接触暗线人物，情绪节奏以压抑转安定为主。'
    ],
    [
      `${projectId}-scene-2`,
      '# 目录二 灯下问卷（推进）\n\n这一目录承接前文线索，把叙事重心推进到书院内部谜团，并埋入后续冲突触发点。'
    ],
    ...readerChapters.map((chapter) => [chapter.id, `# ${chapter.title}\n\n${chapter.content}`]),
  ]
  return Object.fromEntries(entries)
}

const buildYunlanMock = (projectId: string): WorkspaceMockProject => ({
  project: {
    id: projectId,
    title: YUNLAN_BOOK_TITLE,
    status: 'writing',
    wordCount: yunlanBookMeta.wordCount,
    chapterCount: 3,
    updatedAt: new Date(yunlanBookMeta.lastUpdate.replace(' ', 'T')).toISOString(),
  },
  docs: createYunlanDocs(projectId),
  chapters: createYunlanChapterSummary(projectId),
  scenes: createYunlanScenes(projectId),
  contentByDocId: createYunlanContentByDocId(projectId),
})

const workspaceMockProjects: Record<string, WorkspaceMockProject> = {
  [WRITER_YUNLAN_PROJECT_ID]: buildYunlanMock(WRITER_YUNLAN_PROJECT_ID),
  [YUNLAN_BOOK_ID]: buildYunlanMock(YUNLAN_BOOK_ID),
}

const YUNLAN_PROJECT_ALIASES = new Set([WRITER_YUNLAN_PROJECT_ID, YUNLAN_BOOK_ID])

export const getWorkspaceMockProject = (projectId?: string | null): WorkspaceMockProject | null => {
  if (!projectId) return null
  if (workspaceMockProjects[projectId]) return workspaceMockProjects[projectId]

  if (YUNLAN_PROJECT_ALIASES.has(projectId)) {
    return buildYunlanMock(projectId)
  }
  return null
}
