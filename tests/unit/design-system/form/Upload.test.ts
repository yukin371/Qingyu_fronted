/**
 * Upload 组件单元测试
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Upload from '@/design-system/form/Upload/Upload.vue'
import type { FileItem } from '@/design-system/form/Upload/types'

describe('Upload 组件', () => {
  // 模拟文件
  const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
  const mockPdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })

  describe('基础渲染', () => {
    it('应该正确渲染上传组件', () => {
      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
        },
      })

      expect(wrapper.find('input[type="file"]').exists()).toBe(true)
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('应该渲染拖拽上传区域', () => {
      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          drag: true,
        },
      })

      expect(wrapper.find('.border-dashed').exists()).toBe(true)
    })

    it('应该隐藏文件输入框', () => {
      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
        },
      })

      const input = wrapper.find('input[type="file"]')
      expect(input.classes()).toContain('hidden')
    })
  })

  describe('Props 测试', () => {
    it('应该正确设置 accept 属性', () => {
      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          accept: 'image/*',
        },
      })

      const input = wrapper.find('input[type="file"]')
      expect(input.attributes('accept')).toBe('image/*')
    })

    it('应该正确设置 multiple 属性', () => {
      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          multiple: true,
        },
      })

      const input = wrapper.find('input[type="file"]')
      expect(input.attributes('multiple')).toBeDefined()
    })

    it('应该正确设置 disabled 属性', () => {
      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          disabled: true,
        },
      })

      const input = wrapper.find('input[type="file"]')
      expect(input.attributes('disabled')).toBeDefined()
    })

    it('应该正确设置 listType 属性', () => {
      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          listType: 'picture-card',
          fileList: [],
        },
      })

      expect(wrapper.props('listType')).toBe('picture-card')
    })
  })

  describe('文件选择测试', () => {
    it('应该能够选择单个文件', async () => {
      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          autoUpload: false,
        },
      })

      const input = wrapper.find('input[type="file"]')
      const files = [mockFile] as any

      Object.defineProperty(input.element, 'files', {
        value: files,
        writable: false,
      })

      await input.trigger('change')
      await nextTick()

      expect(wrapper.emitted('change')).toBeTruthy()
    })

    it('应该能够选择多个文件', async () => {
      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          multiple: true,
          autoUpload: false,
        },
      })

      const input = wrapper.find('input[type="file"]')
      const files = [mockFile, mockPdfFile] as any

      Object.defineProperty(input.element, 'files', {
        value: files,
        writable: false,
      })

      await input.trigger('change')
      await nextTick()

      expect(wrapper.emitted('change')).toBeTruthy()
    })

    it('应该在选择文件后触发 update:fileList 事件', async () => {
      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          autoUpload: false,
        },
      })

      const input = wrapper.find('input[type="file"]')
      const files = [mockFile] as any

      Object.defineProperty(input.element, 'files', {
        value: files,
        writable: false,
      })

      await input.trigger('change')
      await nextTick()

      expect(wrapper.emitted('update:fileList')).toBeTruthy()
    })
  })

  describe('文件限制测试', () => {
    it('应该在超过数量限制时触发 exceed 事件', async () => {
      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          limit: 1,
          multiple: true,
          autoUpload: false,
        },
      })

      const input = wrapper.find('input[type="file"]')
      const files = [mockFile, mockPdfFile] as any

      Object.defineProperty(input.element, 'files', {
        value: files,
        writable: false,
      })

      await input.trigger('change')
      await nextTick()

      expect(wrapper.emitted('exceed')).toBeTruthy()
    })

    it('应该在达到限制后禁用上传', async () => {
      const fileList: FileItem[] = [
        {
          uid: '1',
          name: 'existing.jpg',
          size: 1024,
          status: 'success',
        },
      ]

      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          limit: 1,
          fileList,
        },
      })

      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })
  })

  describe('拖拽上传测试', () => {
    it('应该在拖拽进入时显示拖拽状态', async () => {
      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          drag: true,
        },
      })

      const dragArea = wrapper.find('.border-dashed')

      await dragArea.trigger('dragover', {
        preventDefault: () => {},
      })

      await nextTick()

      expect(dragArea.classes()).toContain('border-primary-500')
    })

    it('应该在拖拽离开时隐藏拖拽状态', async () => {
      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          drag: true,
        },
      })

      const dragArea = wrapper.find('.border-dashed')

      await dragArea.trigger('dragover', { preventDefault: () => {} })
      await nextTick()

      await dragArea.trigger('dragleave', { preventDefault: () => {} })
      await nextTick()

      expect(dragArea.classes()).not.toContain('border-primary-500')
    })
  })

  describe('文件列表测试', () => {
    it('应该正确显示文件列表', () => {
      const fileList: FileItem[] = [
        {
          uid: '1',
          name: 'test.jpg',
          size: 102400,
          type: 'image/jpeg',
          status: 'success',
        },
      ]

      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          fileList,
          showFileList: true,
        },
      })

      expect(wrapper.text()).toContain('test.jpg')
    })

    it('应该隐藏文件列表', () => {
      const fileList: FileItem[] = [
        {
          uid: '1',
          name: 'test.jpg',
          size: 102400,
          status: 'success',
        },
      ]

      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          fileList,
          showFileList: false,
        },
      })

      expect(wrapper.text()).not.toContain('test.jpg')
    })

    it('应该显示上传进度', () => {
      const fileList: FileItem[] = [
        {
          uid: '1',
          name: 'test.jpg',
          size: 102400,
          status: 'uploading',
          percent: 50,
        },
      ]

      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          fileList,
        },
      })

      expect(wrapper.text()).toContain('50')
    })

    it('应该显示成功状态', () => {
      const fileList: FileItem[] = [
        {
          uid: '1',
          name: 'test.jpg',
          size: 102400,
          status: 'success',
        },
      ]

      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          fileList,
        },
      })

      expect(wrapper.find('.text-green-500').exists()).toBe(true)
    })

    it('应该显示错误状态', () => {
      const fileList: FileItem[] = [
        {
          uid: '1',
          name: 'test.jpg',
          size: 102400,
          status: 'error',
          error: new Error('Upload failed'),
        },
      ]

      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          fileList,
        },
      })

      expect(wrapper.find('.text-red-500').exists()).toBe(true)
    })
  })

  describe('文件操作测试', () => {
    it('应该能够删除文件', async () => {
      const fileList: FileItem[] = [
        {
          uid: '1',
          name: 'test.jpg',
          size: 102400,
          status: 'success',
        },
      ]

      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          fileList,
        },
      })

      const deleteButton = wrapper.findAll('button').find((btn) =>
        btn.classes().includes('hover:text-slate-600')
      )

      expect(deleteButton).toBeDefined()

      if (deleteButton) {
        await deleteButton.trigger('click')
        await nextTick()

        expect(wrapper.emitted('update:fileList')).toBeTruthy()
      }
    })
  })

  describe('事件测试', () => {
    it('应该触发 change 事件', async () => {
      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          autoUpload: false,
        },
      })

      const input = wrapper.find('input[type="file"]')
      const files = [mockFile] as any

      Object.defineProperty(input.element, 'files', {
        value: files,
        writable: false,
      })

      await input.trigger('change')
      await nextTick()

      expect(wrapper.emitted('change')).toBeTruthy()
    })

    it('应该触发 progress 事件', async () => {
      const mockRequest = vi.fn()
      mockRequest.mockImplementation(async (options: any) => {
        options.onProgress(50)
        options.onSuccess({})
      })

      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          httpRequest: mockRequest,
        },
      })

      const input = wrapper.find('input[type="file"]')
      const files = [mockFile] as any

      Object.defineProperty(input.element, 'files', {
        value: files,
        writable: false,
      })

      await input.trigger('change')
      await nextTick()
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(wrapper.emitted('progress')).toBeTruthy()
    })

    it('应该触发 success 事件', async () => {
      const mockRequest = vi.fn()
      mockRequest.mockImplementation(async (options: any) => {
        options.onSuccess({ url: 'https://example.com/file.jpg' })
      })

      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          httpRequest: mockRequest,
        },
      })

      const input = wrapper.find('input[type="file"]')
      const files = [mockFile] as any

      Object.defineProperty(input.element, 'files', {
        value: files,
        writable: false,
      })

      await input.trigger('change')
      await nextTick()
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(wrapper.emitted('success')).toBeTruthy()
    })

    it('应该触发 error 事件', async () => {
      const mockRequest = vi.fn()
      mockRequest.mockImplementation(async (options: any) => {
        options.onError(new Error('Upload failed'))
      })

      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          httpRequest: mockRequest,
        },
      })

      const input = wrapper.find('input[type="file"]')
      const files = [mockFile] as any

      Object.defineProperty(input.element, 'files', {
        value: files,
        writable: false,
      })

      await input.trigger('change')
      await nextTick()
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(wrapper.emitted('error')).toBeTruthy()
    })
  })

  describe('beforeUpload 钩子测试', () => {
    it('应该在 beforeUpload 返回 false 时阻止上传', async () => {
      const beforeUpload = vi.fn(() => false)

      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          beforeUpload,
          autoUpload: true,
        },
      })

      const input = wrapper.find('input[type="file"]')
      const files = [mockFile] as any

      Object.defineProperty(input.element, 'files', {
        value: files,
        writable: false,
      })

      await input.trigger('change')
      await nextTick()

      expect(beforeUpload).toHaveBeenCalledWith(mockFile)
    })

    it('应该在 beforeUpload 返回 true 时继续上传', async () => {
      const beforeUpload = vi.fn(() => true)

      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          beforeUpload,
          autoUpload: true,
        },
      })

      const input = wrapper.find('input[type="file"]')
      const files = [mockFile] as any

      Object.defineProperty(input.element, 'files', {
        value: files,
        writable: false,
      })

      await input.trigger('change')
      await nextTick()

      expect(beforeUpload).toHaveBeenCalledWith(mockFile)
    })
  })

  describe('边界情况测试', () => {
    it('应该处理空文件列表', () => {
      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          fileList: [],
        },
      })

      expect(wrapper.vm).toBeTruthy()
    })

    it('应该处理没有 action 的情况', () => {
      const wrapper = mount(Upload, {
        props: {
          autoUpload: false,
        },
      })

      expect(wrapper.vm).toBeTruthy()
    })

    it('应该处理禁用状态下的点击', async () => {
      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          disabled: true,
        },
      })

      const button = wrapper.find('button')
      await button.trigger('click')

      // 禁用状态下不应该触发文件选择
      expect(wrapper.emitted('change')).toBeFalsy()
    })

    it('应该处理没有 raw 对象的文件项', () => {
      const fileList: FileItem[] = [
        {
          uid: '1',
          name: 'test.jpg',
          status: 'success',
        },
      ]

      const wrapper = mount(Upload, {
        props: {
          action: '/api/upload',
          fileList,
        },
      })

      expect(wrapper.text()).toContain('test.jpg')
    })
  })

  describe('自定义上传测试', () => {
    it('应该使用自定义上传函数', async () => {
      const mockRequest = vi.fn()
      mockRequest.mockResolvedValue({ url: 'https://example.com/file.jpg' })

      const wrapper = mount(Upload, {
        props: {
          httpRequest: mockRequest,
        },
      })

      const input = wrapper.find('input[type="file"]')
      const files = [mockFile] as any

      Object.defineProperty(input.element, 'files', {
        value: files,
        writable: false,
      })

      await input.trigger('change')
      await nextTick()
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(mockRequest).toHaveBeenCalled()
    })
  })
})
