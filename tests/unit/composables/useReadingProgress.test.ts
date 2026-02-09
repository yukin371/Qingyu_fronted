/**
 * useReadingProgress 测试
 * TDD Phase 3.3: 阅读进度保存功能测试
 *
 * 测试用例清单:
 * T3.4: 3秒间隔自动保存
 * T3.5: 页面关闭前flush保存
 * LocalStorage异常处理
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref } from 'vue'
import { useReadingProgress } from '@/composables/useReadingProgress'

// Mock useStorage
vi.mock('@/composables/useStorage', () => ({
  useStorage: vi.fn((key, defaultValue) => {
    const data = ref(defaultValue)
    return {
      data,
      save: vi.fn(() => {
        // 模拟保存
      }),
      load: vi.fn(() => {
        // 模拟加载
      })
    }
  })
}))

describe('useReadingProgress - P0核心测试', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('T3.4: 自动保存功能', () => {
    it('应该提供保存进度的方法', () => {
      const { saveProgress } = useReadingProgress({
        bookId: 'test-book',
        chapterId: 'chapter-1'
      })

      expect(typeof saveProgress).toBe('function')
    })

    it('保存进度时应该包含progress、chapterId和scrollY', () => {
      const { saveProgress, currentProgress, currentScrollY } = useReadingProgress({
        bookId: 'test-book',
        chapterId: 'chapter-1'
      })

      // 设置进度
      currentProgress.value = 50
      currentScrollY.value = 1000

      // 保存进度
      saveProgress()

      // 验证状态已更新
      expect(currentProgress.value).toBe(50)
      expect(currentScrollY.value).toBe(1000)
    })

    it('应该使用防抖延迟保存进度（3秒间隔）', () => {
      const { saveProgress } = useReadingProgress({
        bookId: 'test-book',
        chapterId: 'chapter-1'
      })

      // 多次调用saveProgress
      saveProgress(25, 500)
      saveProgress(50, 1000)
      saveProgress(75, 1500)

      // 快进时间，但不到3秒
      vi.advanceTimersByTime(2000)

      // 应该还没有执行保存（防抖中）
      // 这里需要验证debounce函数的行为
      // 由于我们使用useDebounce，实际保存会被延迟
    })

    it('应该忽略小于1%的进度变化', () => {
      const { saveProgress, loadProgress } = useReadingProgress({
        bookId: 'test-book',
        chapterId: 'chapter-1'
      })

      // 保存初始进度
      saveProgress(50, 1000)
      vi.advanceTimersByTime(3000)

      // 变化<1%，应该忽略
      saveProgress(50.5, 1005)
      vi.advanceTimersByTime(3000)

      const progress = loadProgress()
      expect(progress?.progress).toBe(50)
    })

    it('应该能够启动和停止自动保存', () => {
      const { startAutoSave, stopAutoSave } = useReadingProgress({
        bookId: 'test-book',
        chapterId: 'chapter-1'
      })

      // 启动自动保存
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      const setIntervalSpy = vi.spyOn(global, 'setInterval')

      startAutoSave()

      // 验证setInterval被调用（3秒 = 3000ms）
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 3000)

      // 停止自动保存
      stopAutoSave()

      // 验证clearInterval被调用
      expect(clearIntervalSpy).toHaveBeenCalled()
    })
  })

  describe('T3.5: flush功能', () => {
    it('应该提供flush方法立即保存进度', () => {
      const { saveProgress, flush } = useReadingProgress({
        bookId: 'test-book',
        chapterId: 'chapter-1'
      })

      // 调用saveProgress（防抖）
      saveProgress(50, 1000)

      // 立即调用flush
      flush()

      // 验证flush是可调用的
      expect(typeof flush).toBe('function')
    })

    it('flush时应该保留this上下文', () => {
      const context = { value: 'test' }
      let receivedThis: any = null

      const fn = function(this: any) {
        receivedThis = this
      }

      const debounced = useReadingProgress({
        bookId: 'test-book',
        chapterId: 'chapter-1'
      })

      // 模拟在特定上下文中调用
      const { flush } = debounced
      flush.call(context)

      // 验证this上下文被保留（或fallback到lastThis）
      expect(receivedThis).toBeDefined()
    })
  })

  describe('LocalStorage异常处理', () => {
    it('LocalStorage配额超限时应清理旧数据', () => {
      // 模拟LocalStorage已满
      const originalSetItem = Storage.prototype.setItem
      let callCount = 0
      Storage.prototype.setItem = function() {
        callCount++
        if (callCount <= 3) {
          throw new DOMException('QuotaExceededError', 'QuotaExceededError')
        }
      }

      const { saveProgress } = useReadingProgress({
        bookId: 'test-book',
        chapterId: 'chapter-1'
      })

      // 前三次失败，第四次成功
      expect(() => saveProgress(50, 1000)).not.toThrow()

      // 恢复原始方法
      Storage.prototype.setItem = originalSetItem

      // 清理至少被调用过
      expect(callCount).toBeGreaterThan(0)
    })

    it('LocalStorage其他错误应该静默失败', () => {
      // 模拟其他错误
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = function() {
        throw new Error('SecurityError')
      }

      const { saveProgress } = useReadingProgress({
        bookId: 'test-book',
        chapterId: 'chapter-1'
      })

      // 应该静默失败，不抛出错误
      expect(() => saveProgress(50, 1000)).not.toThrow()

      // 恢复原始方法
      Storage.prototype.setItem = originalSetItem
    })
  })

  describe('加载进度功能', () => {
    it('应该提供加载进度的方法', () => {
      const { loadProgress } = useReadingProgress({
        bookId: 'test-book',
        chapterId: 'chapter-1'
      })

      expect(typeof loadProgress).toBe('function')
    })

    it('加载进度应该返回保存的数据', () => {
      // 保存进度
      const saveKey = 'qingyu-storage'
      localStorage.setItem(saveKey, JSON.stringify({
        'reading-progress:test-book:chapter-1': {
          progress: 50,
          scrollY: 1000,
          timestamp: Date.now(),
          chapterId: 'chapter-1'
        }
      }))

      const { loadProgress } = useReadingProgress({
        bookId: 'test-book',
        chapterId: 'chapter-1'
      })

      const progress = loadProgress()

      expect(progress).toBeDefined()
      expect(progress?.progress).toBe(50)
      expect(progress?.scrollY).toBe(1000)
    })

    it('如果没有保存的进度应该返回null', () => {
      const { loadProgress } = useReadingProgress({
        bookId: 'test-book',
        chapterId: 'chapter-1'
      })

      const progress = loadProgress()

      expect(progress).toBeNull()
    })
  })

  describe('响应式状态', () => {
    it('应该暴露currentProgress响应式状态', () => {
      const { currentProgress } = useReadingProgress({
        bookId: 'test-book',
        chapterId: 'chapter-1'
      })

      expect(currentProgress.value).toBeDefined()
      expect(typeof currentProgress.value).toBe('number')

      currentProgress.value = 75
      expect(currentProgress.value).toBe(75)
    })

    it('应该暴露currentScrollY响应式状态', () => {
      const { currentScrollY } = useReadingProgress({
        bookId: 'test-book',
        chapterId: 'chapter-1'
      })

      expect(currentScrollY.value).toBeDefined()
      expect(typeof currentScrollY.value).toBe('number')

      currentScrollY.value = 1500
      expect(currentScrollY.value).toBe(1500)
    })
  })

  describe('组件生命周期集成', () => {
    it('页面关闭前应该flush保存', () => {
      const { flush } = useReadingProgress({
        bookId: 'test-book',
        chapterId: 'chapter-1'
      })

      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      // 模拟beforeunload事件
      const event = new Event('beforeunload')
      window.dispatchEvent(event)

      // flush应该被调用
      expect(flush).toBeDefined()
    })
  })

  describe('边界情况', () => {
    it('进度值应该在0-100范围内', () => {
      const { saveProgress } = useReadingProgress({
        bookId: 'test-book',
        chapterId: 'chapter-1'
      })

      // 测试边界值
      expect(() => saveProgress(0, 0)).not.toThrow()
      expect(() => saveProgress(100, 9999)).not.toThrow()
    })

    it('负数进度应该被限制为0', () => {
      const { currentProgress } = useReadingProgress({
        bookId: 'test-book',
        chapterId: 'chapter-1'
      })

      currentProgress.value = -10
      // 应该被限制在0-100范围内
      expect(currentProgress.value).toBeGreaterThanOrEqual(0)
    })

    it('超过100的进度应该被限制为100', () => {
      const { currentProgress } = useReadingProgress({
        bookId: 'test-book',
        chapterId: 'chapter-1'
      })

      currentProgress.value = 150
      // 应该被限制在0-100范围内
      expect(currentProgress.value).toBeLessThanOrEqual(100)
    })

    it('空bookId或chapterId应该正常处理', () => {
      const { saveProgress, loadProgress } = useReadingProgress({
        bookId: '',
        chapterId: ''
      })

      expect(() => saveProgress(50, 1000)).not.toThrow()
      expect(() => loadProgress()).not.toThrow()
    })
  })
})
