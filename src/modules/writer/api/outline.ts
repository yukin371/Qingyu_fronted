import request from '@/utils/request'
import type {
  OutlineNode,
  CreateOutlineNodeRequest,
  UpdateOutlineNodeRequest
} from '@/types/writer'

// 大纲管理 API

/**
 * 创建大纲节点
 */
export function createOutlineNode(projectId: string, data: CreateOutlineNodeRequest) {
  return request<OutlineNode>({
    url: `/api/v1/projects/${projectId}/outline`,
    method: 'post',
    data
  })
}

/**
 * 获取大纲节点详情
 */
export function getOutlineNode(nodeId: string, projectId: string) {
  return request<OutlineNode>({
    url: `/api/v1/outline/${nodeId}`,
    method: 'get',
    params: { projectId }
  })
}

/**
 * 获取项目大纲树
 */
export function getOutlineTree(projectId: string) {
  return request<OutlineNode[]>({
    url: `/api/v1/projects/${projectId}/outline/tree`,
    method: 'get'
  })
}

/**
 * 更新大纲节点
 */
export function updateOutlineNode(
  nodeId: string,
  projectId: string,
  data: UpdateOutlineNodeRequest
) {
  return request<OutlineNode>({
    url: `/api/v1/outline/${nodeId}`,
    method: 'put',
    params: { projectId },
    data
  })
}

/**
 * 删除大纲节点
 */
export function deleteOutlineNode(nodeId: string, projectId: string) {
  return request<void>({
    url: `/api/v1/outline/${nodeId}`,
    method: 'delete',
    params: { projectId }
  })
}

/**
 * 批量更新大纲节点顺序
 */
export function reorderOutlineNodes(
  projectId: string,
  nodes: Array<{ id: string; order: number; parentId?: string }>
) {
  return request<void>({
    url: `/api/v1/projects/${projectId}/outline/reorder`,
    method: 'post',
    data: { nodes }
  })
}



