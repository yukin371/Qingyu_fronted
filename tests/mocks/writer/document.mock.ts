/**
 * 文档Mock生成器
 */

import { mockFactory, MockConfig } from './dynamic-mock-factory'

export const createMockDocument = (config?: MockConfig) =>
  mockFactory.createDocument(config)

export const createMockDocumentTree = (config?: MockConfig, depth?: number) =>
  mockFactory.createDocumentTree(config, depth)

export const createMockDocumentList = (count = 5, config?: MockConfig) =>
  mockFactory.createBatch(mockFactory.createDocument.bind(mockFactory), count, config)
