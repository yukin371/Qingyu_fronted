/**
 * 导出任务Mock生成器
 */

import { mockFactory, MockConfig } from './dynamic-mock-factory'

export const createMockExportTask = (config?: MockConfig) =>
  mockFactory.createExportTask(config)

export const createMockExportTaskList = (count = 5, config?: MockConfig) =>
  mockFactory.createBatch(mockFactory.createExportTask.bind(mockFactory), count, config)
