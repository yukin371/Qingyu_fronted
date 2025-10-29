import request from '@/utils/request'
import type {
  Location,
  LocationRelation,
  LocationTree,
  CreateLocationRequest,
  UpdateLocationRequest,
  CreateLocationRelationRequest
} from '@/types/writer'

// 地点管理 API

/**
 * 创建地点
 */
export function createLocation(projectId: string, data: CreateLocationRequest) {
  return request<Location>({
    url: `/api/v1/projects/${projectId}/locations`,
    method: 'post',
    data
  })
}

/**
 * 获取地点详情
 */
export function getLocation(locationId: string, projectId: string) {
  return request<Location>({
    url: `/api/v1/locations/${locationId}`,
    method: 'get',
    params: { projectId }
  })
}

/**
 * 获取项目地点列表
 */
export function listLocations(projectId: string) {
  return request<Location[]>({
    url: `/api/v1/projects/${projectId}/locations`,
    method: 'get'
  })
}

/**
 * 获取地点层级树
 */
export function getLocationTree(projectId: string) {
  return request<LocationTree[]>({
    url: `/api/v1/projects/${projectId}/locations/tree`,
    method: 'get'
  })
}

/**
 * 更新地点
 */
export function updateLocation(
  locationId: string,
  projectId: string,
  data: UpdateLocationRequest
) {
  return request<Location>({
    url: `/api/v1/locations/${locationId}`,
    method: 'put',
    params: { projectId },
    data
  })
}

/**
 * 删除地点
 */
export function deleteLocation(locationId: string, projectId: string) {
  return request<void>({
    url: `/api/v1/locations/${locationId}`,
    method: 'delete',
    params: { projectId }
  })
}

// 地点关系管理

/**
 * 创建地点关系
 */
export function createLocationRelation(
  projectId: string,
  data: CreateLocationRelationRequest
) {
  return request<LocationRelation>({
    url: '/api/v1/locations/relations',
    method: 'post',
    params: { projectId },
    data
  })
}

/**
 * 获取地点关系列表
 */
export function listLocationRelations(projectId: string, locationId?: string) {
  return request<LocationRelation[]>({
    url: `/api/v1/projects/${projectId}/locations/relations`,
    method: 'get',
    params: locationId ? { locationId } : undefined
  })
}

/**
 * 删除地点关系
 */
export function deleteLocationRelation(relationId: string, projectId: string) {
  return request<void>({
    url: `/api/v1/locations/relations/${relationId}`,
    method: 'delete',
    params: { projectId }
  })
}


