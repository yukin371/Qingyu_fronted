/**
 * useTouchGestures 测试
 * TDD Phase 6: 通用手势操作测试
 *
 * 测试用例清单:
 * - 左右上下滑动手势检测
 * - 长按手势检测
 * - 边缘区域冲突处理（避免iOS左滑返回冲突）
 * - 滑动阈值和参数配置
 * - 事件清理机制
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref } from 'vue'
import { useTouchGestures } from '@/composables/useTouchGestures'

describe('useTouchGestures - P0核心测试', () => {
  let container: HTMLElement

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    // 创建测试容器
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    vi.restoreAllMocks()

    // 清理容器
    if (container.parentNode === document.body) {
      document.body.removeChild(container)
    }
  })

  describe('水平滑动手势', () => {
    it('应该正确检测左滑手势', () => {
      let swipeLeftDetected = false
      let swipeRightDetected = false

      const { init } = useTouchGestures(ref(container), {
        onSwipeLeft: () => { swipeLeftDetected = true },
        onSwipeRight: () => { swipeRightDetected = true },
        swipeThreshold: 50,
        edgeThreshold: 20
      })

      // 手动初始化
      init()

      // 模拟左滑触摸事件 (从右向左)
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

      expect(swipeLeftDetected).toBe(true)
      expect(swipeRightDetected).toBe(false)
    })

    it('应该正确检测右滑手势', () => {
      let swipeRightDetected = false

      const { init } = useTouchGestures(ref(container), {
        onSwipeRight: () => { swipeRightDetected = true },
        swipeThreshold: 50
      })

      init()

      // 模拟右滑触摸事件 (从左向右)
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

      expect(swipeRightDetected).toBe(true)
    })

    it('滑动距离不足时不应触发手势', () => {
      let swipeDetected = false

      const { init } = useTouchGestures(ref(container), {
        onSwipeLeft: () => { swipeDetected = true },
        swipeThreshold: 50
      })

      init()

      // 滑动距离只有30px，小于阈值50px
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 200, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchStart)

      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{ clientX: 170, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchEnd)

      expect(swipeDetected).toBe(false)
    })

    it('垂直滑动不应触发水平手势', () => {
      let swipeDetected = false

      const { init } = useTouchGestures(ref(container), {
        onSwipeLeft: () => { swipeDetected = true },
        swipeThreshold: 50
      })

      init()

      // 垂直滑动100px，水平只有10px
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 200, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchStart)

      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{ clientX: 210, clientY: 400, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchEnd)

      expect(swipeDetected).toBe(false)
    })
  })

  describe('边缘区域冲突处理', () => {
    it('边缘区域应该降低灵敏度（避免iOS左滑返回冲突）', () => {
      let swipeDetected = false

      const { init } = useTouchGestures(ref(container), {
        onSwipeLeft: () => { swipeDetected = true },
        edgeThreshold: 20
      })

      init()

      // 在边缘区域开始滑动（x=15 < edgeThreshold=20）
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
      expect(swipeDetected).toBe(false)
    })
  })

  describe('长按手势', () => {
    it('应该检测长按手势', () => {
      let longPressDetected = false

      const { init } = useTouchGestures(ref(container), {
        onLongPress: () => { longPressDetected = true },
        longPressDelay: 500
      })

      init()

      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 150, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })

      container.dispatchEvent(touchStart)

      // 快进时间到长按延迟之后
      vi.advanceTimersByTime(550)

      expect(longPressDetected).toBe(true)
    })

    it('长按期间移动应该取消长按', () => {
      let longPressDetected = false

      const { init } = useTouchGestures(ref(container), {
        onLongPress: () => { longPressDetected = true },
        longPressDelay: 500
      })

      init()

      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 150, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })

      container.dispatchEvent(touchStart)

      // 移动超过阈值
      const touchMove = new TouchEvent('touchmove', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 200, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchMove)

      // 快进时间
      vi.advanceTimersByTime(550)

      // 移动后不应该触发长按
      expect(longPressDetected).toBe(false)
    })
  })

  describe('垂直滑动手势', () => {
    it('应该正确检测上滑手势', () => {
      let swipeUpDetected = false

      const { init } = useTouchGestures(ref(container), {
        onSwipeUp: () => { swipeUpDetected = true },
        swipeThreshold: 50
      })

      init()

      // 模拟上滑触摸事件 (从下向上)
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 200, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchStart)

      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{ clientX: 200, clientY: 300, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchEnd)

      expect(swipeUpDetected).toBe(true)
    })

    it('应该正确检测下滑手势', () => {
      let swipeDownDetected = false

      const { init } = useTouchGestures(ref(container), {
        onSwipeDown: () => { swipeDownDetected = true },
        swipeThreshold: 50
      })

      init()

      // 模拟下滑触摸事件 (从上向下)
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 200, clientY: 300, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchStart)

      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{ clientX: 200, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchEnd)

      expect(swipeDownDetected).toBe(true)
    })
  })

  describe('事件清理', () => {
    it('组件卸载时应该清理事件监听器', () => {
      const removeSpy = vi.spyOn(container, 'removeEventListener')

      const { stop } = useTouchGestures(ref(container), {
        onSwipeLeft: () => {}
      })

      stop()

      // 验证清理函数被调用至少4次 (touchstart, touchmove, touchend, touchcancel)
      expect(removeSpy.mock.calls.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('参数配置', () => {
    it('应该支持自定义参数配置', () => {
      let swipeDetected = false

      const { init } = useTouchGestures(ref(container), {
        onSwipeLeft: () => { swipeDetected = true },
        swipeThreshold: 100, // 自定义阈值
        edgeThreshold: 30    // 自定义边缘阈值
      })

      init()

      // 使用自定义阈值，滑动90px应该不触发
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 200, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchStart)

      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        changedTouches: [{ clientX: 110, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchEnd)

      expect(swipeDetected).toBe(false)
    })

    it('应该支持自定义长按延迟', () => {
      let longPressDetected = false

      const { init } = useTouchGestures(ref(container), {
        onLongPress: () => { longPressDetected = true },
        longPressDelay: 1000 // 自定义1秒延迟
      })

      init()

      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 150, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })

      container.dispatchEvent(touchStart)

      // 快进时间（小于1000ms）
      vi.advanceTimersByTime(500)

      expect(longPressDetected).toBe(false)
    })
  })

  describe('触摸取消处理', () => {
    it('触摸取消时应该清理长按定时器', () => {
      let longPressDetected = false

      const { init } = useTouchGestures(ref(container), {
        onLongPress: () => { longPressDetected = true },
        longPressDelay: 500
      })

      init()

      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 150, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })

      container.dispatchEvent(touchStart)

      // 触发取消
      const touchCancel = new TouchEvent('touchcancel', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 150, clientY: 500, identifier: 0, target: container, radiusX: 0, radiusY: 0, rotationAngle: 0, force: 0 }] as any
      })
      container.dispatchEvent(touchCancel)

      // 快进时间
      vi.advanceTimersByTime(550)

      // 取消后不应该触发长按
      expect(longPressDetected).toBe(false)
    })
  })
})
