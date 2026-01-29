/**
 * 组件测试工具
 * 提供Vue组件测试的辅助函数
 */

import { mount, VueWrapper } from '@vue/test-utils'
import { ComponentPublicInstance } from 'vue'

/**
 * 组件挂载选项的扩展类型
 */
export interface ComponentMountOptions<V extends ComponentPublicInstance> {
  props?: Record<string, any>
  slots?: Record<string, string>
  global?: {
    stubs?: Record<string, boolean | Record<string, any>>
    mocks?: Record<string, any>
    plugins?: any[]
  }
}

/**
 * 创建一个组件wrapper的便捷方法
 * @param component Vue组件
 * @param options 挂载选项
 */
export const createWrapper = <V extends ComponentPublicInstance>(
  component: any,
  options: ComponentMountOptions<V> = {}
): VueWrapper<V> => {
  return mount<V>(component, {
    props: options.props,
    slots: options.slots,
    global: {
      stubs: options.global?.stubs,
      mocks: {
        $router: {
          push: vi.fn(),
          replace: vi.fn(),
          go: vi.fn(),
          back: vi.fn(),
          forward: vi.fn(),
        },
        $route: {
          path: '/',
          params: {},
          query: {},
          meta: {},
        },
        ...options.global?.mocks,
      },
      plugins: options.global?.plugins || [],
    },
  })
}

/**
 * 等待组件更新完成
 * @param wrapper 组件wrapper
 * @param timeout 超时时间 (默认1000ms)
 */
export const waitForUpdate = async (
  wrapper: VueWrapper,
  timeout: number = 1000
): Promise<void> => {
  await wrapper.vm.$nextTick()
  await new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * 等待异步操作完成
 * @param callback 异步回调函数
 * @param timeout 超时时间 (默认1000ms)
 */
export const waitFor = async (
  callback: () => boolean | Promise<boolean>,
  timeout: number = 1000
): Promise<void> => {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const result = await callback()
    if (result) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, 10))
  }

  throw new Error(`waitFor timeout after ${timeout}ms`)
}

/**
 * 触发组件事件
 * @param wrapper 组件wrapper
 * @param eventName 事件名称
 * @param payload 事件载荷
 */
export const emitEvent = <T = any>(
  wrapper: VueWrapper,
  eventName: string,
  payload?: T
): void => {
  wrapper.vm.$emit(eventName, payload)
}

/**
 * 验证组件是否渲染了特定文本
 * @param wrapper 组件wrapper
 * @param text 期望的文本
 * @param shouldContain 是否应该包含 (默认true)
 */
export const expectTextContent = (
  wrapper: VueWrapper,
  text: string,
  shouldContain: boolean = true
): void => {
  const actual = wrapper.text()
  if (shouldContain) {
    expect(actual).toContain(text)
  } else {
    expect(actual).not.toContain(text)
  }
}

/**
 * 验证组件是否存在特定元素
 * @param wrapper 组件wrapper
 * @param selector CSS选择器
 * @param shouldExist 是否应该存在 (默认true)
 */
export const expectElementExists = (
  wrapper: VueWrapper,
  selector: string,
  shouldExist: boolean = true
): void => {
  const element = wrapper.find(selector)
  if (shouldExist) {
    expect(element.exists()).toBe(true)
  } else {
    expect(element.exists()).toBe(false)
  }
}

/**
 * 获取组件的props
 * @param wrapper 组件wrapper
 * @param propName prop名称
 */
export const getProp = <T = any>(
  wrapper: VueWrapper,
  propName: string
): T | undefined => {
  return wrapper.props(propName) as T
}

/**
 * 设置组件的props
 * @param wrapper 组件wrapper
 * @param props props对象
 */
export const setProps = async (
  wrapper: VueWrapper,
  props: Record<string, any>
): Promise<void> => {
  await wrapper.setProps(props)
}

/**
 * 获取组件发出的特定事件
 * @param wrapper 组件wrapper
 * @param eventName 事件名称
 */
export const getEmittedEvents = <T = any>(
  wrapper: VueWrapper,
  eventName: string
): T[] | undefined => {
  return wrapper.emitted<T[]>(eventName)
}

/**
 * 验证组件是否发出了特定事件
 * @param wrapper 组件wrapper
 * @param eventName 事件名称
 * @param count 期望的事件数量 (可选)
 */
export const expectEventEmitted = (
  wrapper: VueWrapper,
  eventName: string,
  count?: number
): void => {
  const events = wrapper.emitted(eventName)
  expect(events).toBeDefined()

  if (count !== undefined) {
    expect(events?.length).toBe(count)
  }
}
