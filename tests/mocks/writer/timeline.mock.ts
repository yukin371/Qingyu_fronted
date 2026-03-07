/**
 * 时间线Mock生成器
 */

import { mockFactory, MockConfig } from './dynamic-mock-factory'

export const createMockTimeline = (config?: MockConfig) =>
  mockFactory.createTimeline(config)

export const createMockEvent = (config?: MockConfig) =>
  mockFactory.createEvent(config)

export const createMockTimelineList = (count = 5, config?: MockConfig) =>
  mockFactory.createBatch(mockFactory.createTimeline.bind(mockFactory), count, config)
