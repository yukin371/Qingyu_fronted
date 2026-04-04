/**
 * 发布计划Mock生成器
 */

import { mockFactory, MockConfig } from './dynamic-mock-factory'

export const createMockPublishPlan = (config?: MockConfig) =>
  mockFactory.createPublishPlan(config)

export const createMockPublishPlanList = (count = 5, config?: MockConfig) =>
  mockFactory.createBatch(mockFactory.createPublishPlan.bind(mockFactory), count, config)
