/**
 * 地点Mock生成器
 */

import { mockFactory, MockConfig } from './dynamic-mock-factory'

export const createMockLocation = (config?: MockConfig) =>
  mockFactory.createLocation(config)

export const createMockLocationRelation = (config?: MockConfig) =>
  mockFactory.createLocationRelation(config)

export const createMockLocationTree = (config?: MockConfig, depth?: number) => {
  // 创建地点树结构
  const rootLocation = mockFactory.createLocation({ ...config, includeChildren: true })

  if (depth && depth > 0) {
    rootLocation.children = []
    for (let i = 0; i < depth; i++) {
      const child = mockFactory.createLocation(config)
      child.parentId = rootLocation.id
      rootLocation.children!.push(child)
    }
  }

  return rootLocation
}

export const createMockLocationList = (count = 5, config?: MockConfig) =>
  mockFactory.createBatch(mockFactory.createLocation.bind(mockFactory), count, config)
