/**
 * Vitest单元测试设置
 * 在所有单元测试运行前执行
 */

import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { h, defineComponent } from 'vue'
import '@testing-library/jest-dom'

// ============================================
// 工具函数
// ============================================

/**
 * 创建 Element Plus 图标组件的 Mock
 * @param name 图标组件名称
 * @returns Vue 组件定义
 */
const createIconStub = (name: string) =>
  defineComponent({
    name,
    setup() {
      return () => h('span', { class: `el-icon-${name}` }, name)
    },
  })

/**
 * 创建基础按钮组件的 Mock
 * @param name 组件名称
 * @param defaultTag 默认HTML标签
 * @returns Vue 组件定义
 */
const createButtonStub = (name: string, defaultTag: string = 'button') =>
  defineComponent({
    name,
    props: ['type', 'size', 'disabled', 'loading', 'icon', 'plain', 'round', 'circle', 'text', 'bg', 'link', 'autofocus', 'nativeType', 'autoInsertSpace', 'onClick'],
    emits: ['click'],
    setup(props, { emit, slots }) {
      return () => h(defaultTag, {
        class: [name.toLowerCase(), `${name.toLowerCase()}--${props.type || 'default'}`, `${name.toLowerCase()}--${props.size || 'default'}`],
        disabled: props.disabled,
        onClick: (e) => emit('click', e),
      }, slots.default ? slots.default() : [])
    },
  })

// ============================================
// 全局组件 Stubs 配置
// ============================================

config.global.stubs = {
  // ============================================
  // 基础组件
  // ============================================
  'el-button': createButtonStub('ElButton', 'button'),
  'el-icon': defineComponent({
    name: 'ElIcon',
    props: ['size', 'color'],
    setup(props, { slots }) {
      return () => h('div', {
        class: 'el-icon',
        style: { fontSize: props.size ? `${props.size}px` : undefined, color: props.color },
      }, slots.default ? slots.default() : [])
    },
  }),

  // ============================================
  // 表单组件
  // ============================================
  'el-radio-group': defineComponent({
    name: 'ElRadioGroup',
    props: ['modelValue', 'size', 'disabled', 'textColor', 'fill'],
    emits: ['update:modelValue', 'change'],
    setup(props, { emit, slots }) {
      return () => h('div', {
        class: 'el-radio-group',
        role: 'radiogroup',
      }, slots.default ? slots.default() : [])
    },
  }),
  'el-radio-button': defineComponent({
    name: 'ElRadioButton',
    props: ['label', 'value', 'disabled', 'name'],
    emits: ['change'],
    setup(props, { slots }) {
      return () => h('label', {
        class: ['el-radio-button', { 'is-disabled': props.disabled }],
      }, slots.default ? slots.default() : props.label)
    },
  }),

  // ============================================
  // 数据展示组件
  // ============================================
  'el-empty': defineComponent({
    name: 'ElEmpty',
    props: ['description', 'image'],
    setup(props, { slots }) {
      return () => h('div', { class: 'el-empty' }, [
        slots.image ? slots.image() : null,
        h('div', { class: 'el-empty__description' }, props.description),
        slots.default ? slots.default() : null,
      ])
    },
  }),
  'el-skeleton': defineComponent({
    name: 'ElSkeleton',
    props: ['loading', 'animated', 'count', 'rows', 'throttle'],
    setup(props, { slots }) {
      if (props.loading === false && slots.default) {
        return () => slots.default()
      }
      return () => h('div', { class: 'el-skeleton' }, [
        h('div', { class: 'el-skeleton__item' }),
        h('div', { class: 'el-skeleton__item' }),
        h('div', { class: 'el-skeleton__item' }),
      ])
    },
  }),
  'el-skeleton-item': defineComponent({
    name: 'ElSkeletonItem',
    props: ['variant', 'style'],
    setup(props) {
      return () => h('div', {
        class: ['el-skeleton__item', `el-skeleton__item--${props.variant || 'text'}`],
        style: props.style,
      })
    },
  }),

  // ============================================
  // 反馈组件
  // ============================================
  'el-dialog': defineComponent({
    name: 'ElDialog',
    props: ['modelValue', 'title', 'width', 'fullscreen', 'top', 'modal', 'modalClass', 'appendToBody', 'lockScroll', 'customClass', 'closeOnClickModal', 'closeOnPressEscape', 'showClose', 'beforeClose', 'draggable', 'center', 'alignCenter', 'destroyOnClose'],
    emits: ['update:modelValue', 'open', 'opened', 'close', 'closed'],
    setup(props, { emit, slots }) {
      if (!props.modelValue) return () => null
      return () => h('div', {
        class: ['el-dialog', props.customClass],
        style: { width: props.width },
      }, [
        slots.default ? slots.default() : [],
      ])
    },
  }),

  // ============================================
  // Element Plus 图标组件
  // ============================================
  // 编辑操作图标
  'EditPen': createIconStub('EditPen'),
  'Delete': createIconStub('Delete'),
  'Edit': createIconStub('Edit'),

  // 添加/关闭图标
  'Plus': createIconStub('Plus'),
  'Close': createIconStub('Close'),
  'Check': createIconStub('Check'),

  // 方向箭头图标
  'ArrowLeft': createIconStub('ArrowLeft'),
  'ArrowRight': createIconStub('ArrowRight'),
  'ArrowUp': createIconStub('ArrowUp'),
  'ArrowDown': createIconStub('ArrowDown'),

  // 通用功能图标
  'Search': createIconStub('Search'),
  'Refresh': createIconStub('Refresh'),
  'More': createIconStub('More'),
  'User': createIconStub('User'),
  'Setting': createIconStub('Setting'),

  // 时间与文档图标
  'Calendar': createIconStub('Calendar'),
  'Clock': createIconStub('Clock'),
  'Document': createIconStub('Document'),
  'Folder': createIconStub('Folder'),

  // 交互图标
  'Star': createIconStub('Star'),
  'Share': createIconStub('Share'),
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

// Mock localStorage
const localStorageMock = {
  getItem: (key: string) => null,
  setItem: (key: string, value: string) => {},
  removeItem: (key: string) => {},
  clear: () => {},
}
global.localStorage = localStorageMock as any

// Mock sessionStorage
const sessionStorageMock = {
  getItem: (key: string) => null,
  setItem: (key: string, value: string) => {},
  removeItem: (key: string) => {},
  clear: () => {},
}
global.sessionStorage = sessionStorageMock as any

// Mock design-system services (message, notification, messageBox)
vi.mock('@/design-system/services', () => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    show: vi.fn(),
  },
  notification: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    show: vi.fn(),
  },
  messageBox: {
    alert: vi.fn(),
    confirm: vi.fn(),
    prompt: vi.fn(),
  },
  useMessage: () => ({
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    show: vi.fn(),
  }),
  useNotification: () => ({
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    show: vi.fn(),
  }),
  useMessageBox: () => ({
    alert: vi.fn(),
    confirm: vi.fn(),
    prompt: vi.fn(),
  }),
}))

console.log('✅ Unit test setup completed')
