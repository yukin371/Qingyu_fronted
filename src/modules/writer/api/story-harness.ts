import { httpService } from '@/core/services/http.service'
import type { StoryHarnessChangeRequestPreview } from '@/modules/writer/stores/v3/storyHarnessStore'

export type StoryHarnessBatchSyncSource = 'remote' | 'local_fallback'

export interface StoryHarnessBatchRecord {
  batchId: string
  projectId: string
  chapterId: string
  chapterTitle: string
  committedAt: number
  source: StoryHarnessBatchSyncSource
  changeRequests: StoryHarnessChangeRequestPreview[]
}

export interface CreateStoryHarnessBatchRequest {
  chapterTitle: string
  changeRequests: StoryHarnessChangeRequestPreview[]
}

const BASE_PROJECT_URL = '/writer/project'

const buildStoryHarnessBatchUrl = (projectId: string, chapterId: string) =>
  `${BASE_PROJECT_URL}/${projectId}/documents/${chapterId}/story-harness/batches`

export const storyHarnessApi = {
  createBatch(projectId: string, chapterId: string, data: CreateStoryHarnessBatchRequest) {
    return httpService.post<StoryHarnessBatchRecord>(buildStoryHarnessBatchUrl(projectId, chapterId), data)
  },

  getLatestBatch(projectId: string, chapterId: string) {
    return httpService.get<StoryHarnessBatchRecord | null>(
      `${buildStoryHarnessBatchUrl(projectId, chapterId)}/latest`,
    )
  },
}

export const createStoryHarnessBatch = (
  projectId: string,
  chapterId: string,
  data: CreateStoryHarnessBatchRequest,
) => storyHarnessApi.createBatch(projectId, chapterId, data)

export const getLatestStoryHarnessBatch = (projectId: string, chapterId: string) =>
  storyHarnessApi.getLatestBatch(projectId, chapterId)
