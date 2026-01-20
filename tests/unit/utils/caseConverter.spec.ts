/**
 * caseConverter工具函数单元测试
 */

import { describe, it, expect } from 'vitest'
import {
  snakeToCamel,
  camelToSnake,
  convertObjectKeysToCamelCase,
  convertObjectKeysToSnakeCase
} from '@/utils/caseConverter'

describe('caseConverter', () => {
  describe('snakeToCamel', () => {
    it('应该将snake_case转换为camelCase', () => {
      expect(snakeToCamel('hello_world')).toBe('helloWorld')
      expect(snakeToCamel('word_count')).toBe('wordCount')
      expect(snakeToCamel('cover_url')).toBe('coverUrl')
    })

    it('应该处理单个单词', () => {
      expect(snakeToCamel('hello')).toBe('hello')
    })

    it('应该处理多个下划线', () => {
      expect(snakeToCamel('hello_world_foo_bar')).toBe('helloWorldFooBar')
    })
  })

  describe('camelToSnake', () => {
    it('应该将camelCase转换为snake_case', () => {
      expect(camelToSnake('helloWorld')).toBe('hello_world')
      expect(camelToSnake('wordCount')).toBe('word_count')
      expect(camelToSnake('coverUrl')).toBe('cover_url')
    })

    it('应该处理单个单词', () => {
      expect(camelToSnake('hello')).toBe('hello')
    })

    it('应该处理多个驼峰', () => {
      expect(camelToSnake('helloWorldFooBar')).toBe('hello_world_foo_bar')
    })
  })

  describe('convertObjectKeysToCamelCase', () => {
    it('应该转换普通对象的键', () => {
      const input = {
        first_name: 'John',
        last_name: 'Doe',
        user_age: 30
      }
      const expected = {
        firstName: 'John',
        lastName: 'Doe',
        userAge: 30
      }
      expect(convertObjectKeysToCamelCase(input)).toEqual(expected)
    })

    it('应该递归转换嵌套对象', () => {
      const input = {
        user_info: {
          first_name: 'John',
          contact_info: {
            phone_number: '123-456-7890'
          }
        }
      }
      const result = convertObjectKeysToCamelCase(input)
      expect(result).toEqual({
        userInfo: {
          firstName: 'John',
          contactInfo: {
            phoneNumber: '123-456-7890'
          }
        }
      })
    })

    it('应该转换数组中的对象', () => {
      const input = {
        users: [
          { first_name: 'John', last_name: 'Doe' },
          { first_name: 'Jane', last_name: 'Smith' }
        ]
      }
      const result = convertObjectKeysToCamelCase(input)
      expect(result).toEqual({
        users: [
          { firstName: 'John', lastName: 'Doe' },
          { firstName: 'Jane', lastName: 'Smith' }
        ]
      })
    })

    it('应该处理null和undefined', () => {
      expect(convertObjectKeysToCamelCase(null)).toBe(null)
      expect(convertObjectKeysToCamelCase(undefined)).toBe(undefined)
    })

    it('应该保留基本类型不变', () => {
      expect(convertObjectKeysToCamelCase('string')).toBe('string')
      expect(convertObjectKeysToCamelCase(123)).toBe(123)
      expect(convertObjectKeysToCamelCase(true)).toBe(true)
    })
  })

  describe('convertObjectKeysToSnakeCase', () => {
    it('应该转换普通对象的键', () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        userAge: 30
      }
      const expected = {
        first_name: 'John',
        last_name: 'Doe',
        user_age: 30
      }
      expect(convertObjectKeysToSnakeCase(input)).toEqual(expected)
    })

    it('应该递归转换嵌套对象', () => {
      const input = {
        userInfo: {
          firstName: 'John',
          contactInfo: {
            phoneNumber: '123-456-7890'
          }
        }
      }
      const result = convertObjectKeysToSnakeCase(input)
      expect(result).toEqual({
        user_info: {
          first_name: 'John',
          contact_info: {
            phone_number: '123-456-7890'
          }
        }
      })
    })

    it('应该处理null和undefined', () => {
      expect(convertObjectKeysToSnakeCase(null)).toBe(null)
      expect(convertObjectKeysToSnakeCase(undefined)).toBe(undefined)
    })
  })
})
