/**
 * 角色Mock生成器
 */

import { mockFactory, MockConfig } from './dynamic-mock-factory'

export const createMockCharacter = (config?: MockConfig) =>
  mockFactory.createCharacter(config)

export const createMockCharacterRelation = (config?: MockConfig) =>
  mockFactory.createCharacterRelation(config)

export const createMockCharacterList = (count = 5, config?: MockConfig) =>
  mockFactory.createBatch(mockFactory.createCharacter.bind(mockFactory), count, config)
