/**
 * useReaderGestures 测试
 * TDD Phase 3.5: 阅读器手势操作测试
 *
 * 测试用例清单:
 * T3.6: 左右翻页手势
 * 长按显示菜单
 * 边缘区域冲突处理（避免iOS左滑返回冲突）
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref } from 'vue'
import { useReaderGestures } from '@/composables/useReaderGestures'

describe('useReaderGestures - P0核心测试', () => {
  let container: HTMLElement
  let onSwipeLeft: ReturnType<typeof vi.fn>
  let onSwipeRight: ReturnType<typeof vi.fn>
  let onLongPress: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div')
    document.body.appendChild(container)

    // Mock回调函数
    onSwipeLeft = vi.fn()
    onSwipeRight = vi.fn()
    onLongPress = vi.fn()

    vi.useFakeTimers()
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  describe('T3.6: 左右翻页手势', () => {
    it('应该检测左滑手势', () => {
      const { initGestures } = useReaderGestures(ref(container), {
        onSwipeLeft,
        onSwipeRight,
        swipeThreshold: 50
      })

      initGestures()

      // 模拟左滑触摸事件
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 300, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchStart)

      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{ clientX: 100, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchEnd)

      // 验证左滑回调被调用
      expect(onSwipeLeft).toHaveBeenCalled()
    })

    it('应该检测右滑手势', () => {
      const { initGestures } = useReaderGestures(ref(container), {
        onSwipeLeft,
        onSwipeRight,
        swipeThreshold: 50
      })

      initGestures()

      // 模拟右滑触摸事件
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 100, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchStart)

      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{ clientX: 300, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchEnd)

      // 验证右滑回调被调用
      expect(onSwipeRight).toHaveBeenCalled()
    })

    it('滑动距离小于阈值时不应该触发', () => {
      const { initGestures } = useReaderGestures(ref(container), {
        onSwipeLeft,
        onSwipeRight,
        swipeThreshold: 50
      })

      initGestures()

      // 模拟小距离滑动（30px < 50px阈值）
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 300, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchStart)

      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{ clientX: 270, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchEnd)

      // 验证回调不被调用
      expect(onSwipeLeft).not.toHaveBeenCalled()
      expect(onSwipeRight).not.toHaveBeenCalled()
    })
  })

  describe('长按手势', () => {
    it('应该检测长按手势', () => {
      const { initGestures } = useReaderGestures(ref(container), {
        onLongPress,
        longPressDelay: 500
      })

      initGestures()

      // 模拟长按（触摸后保持500ms）
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 200, clientY: 400, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchStart)

      // 快进时间
      vi.advanceTimersByTime(500)

      // 验证长按回调被调用
      expect(onLongPress).toHaveBeenCalled()
    })

    it('触摸时间不足长按阈值时不应该触发', () => {
      const { initGestures } = useReaderGestures(ref(container), {
        onLongPress,
        longPressDelay: 500
      })

      initGestures()

      // 模拟短按
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 200, clientY: 400, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchStart)

      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{ clientX: 200, clientY: 400, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchEnd)

      // 快进时间（小于500ms）
      vi.advanceTimersByTime(300)

      // 验证长按回调不被调用
      expect(onLongPress).not.toHaveBeenCalled()
    })
  })

  describe('边缘区域冲突处理', () => {
    it('左边缘区域应该降低灵敏度（避免iOS左滑返回冲突）', () => {
      const { initGestures } = useReaderGestures(ref(container), {
        onSwipeLeft,
        onSwipeRight,
        swipeThreshold: 50,
        edgeThreshold: 20
      })

      initGestures()

      // 在左边缘区域开始滑动（x=15 < edgeThreshold=20）
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 15, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchStart)

      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{ clientX: -100, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchEnd)

      // 边缘区域应该不触发
      expect(onSwipeLeft).not.toHaveBeenCalled()
    })

    it('右边缘区域应该降低灵敏度', () => {
      // 设置窗口宽度
      global.innerWidth = 375

      const { initGestures } = useReaderGestures(ref(container), {
        onSwipeLeft,
        onSwipeRight,
        swipeThreshold: 50,
        edgeThreshold: 20
      })

      initGestures()

      // 在右边缘区域开始滑动（x=355 > windowWidth - edgeThreshold）
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 355, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchStart)

      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{ clientX: 450, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchEnd)

      // 边缘区域应该不触发
      expect(onSwipeRight).not.toHaveBeenCalled()
    })

    it('非边缘区域应该正常触发手势', () => {
      const { initGestures } = useReaderGestures(ref(container), {
        onSwipeLeft,
        onSwipeRight,
        swipeThreshold: 50,
        edgeThreshold: 20
      })

      initGestures()

      // 在中间区域开始滑动（x=200，远离边缘）
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 200, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchStart)

      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{ clientX: 100, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchEnd)

      // 中间区域应该正常触发
      expect(onSwipeLeft).toHaveBeenCalled()
    })
  })

  describe('手势配置', () => {
    it('应该能够自定义滑动阈值', () => {
      const { initGestures } = useReaderGestures(ref(container), {
        onSwipeLeft,
        swipeThreshold: 100
      })

      initGestures()

      // 滑动90px（小于100px阈值）
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 300, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchStart)

      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{ clientX: 210, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchEnd)

      expect(onSwipeLeft).not.toHaveBeenCalled()
    })

    it('应该能够自定义长按延迟', () => {
      const { initGestures } = useReaderGestures(ref(container), {
        onLongPress,
        longPressDelay: 1000
      })

      initGestures()

      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 200, clientY: 400, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchStart)

      // 快进时间（小于1000ms）
      vi.advanceTimersByTime(500)

      expect(onLongPress).not.toHaveBeenCalled()
    })

    it('应该能够自定义边缘阈值', () => {
      const { initGestures } = useReaderGestures(ref(container), {
        onSwipeLeft,
        edgeThreshold: 50
      })

      initGestures()

      // 在边缘阈值内（x=40 < edgeThreshold=50）
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 40, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchStart)

      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{ clientX: -100, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchEnd)

      expect(onSwipeLeft).not.toHaveBeenCalled()
    })
  })

  describe('手势清理', () => {
    it('应该提供清理方法移除事件监听', () => {
      const { initGestures, cleanup } = useReaderGestures(ref(container), {
        onSwipeLeft
      })

      initGestures()

      // 清理
      cleanup()

      // 清理后手势不应该再触发
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 300, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchStart)

      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{ clientX: 100, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchEnd)

      expect(onSwipeLeft).not.toHaveBeenCalled()
    })
  })
})
