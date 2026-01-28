/**
 * BooklistForm组件测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMockBooklist } from '../../../../tests/fixtures'
import BooklistForm from '../BooklistForm.vue'

// Mock设计系统组件
vi.mock('@/design-system/components', () => ({
  QyInput: {
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" :type="type" :placeholder="placeholder" :rows="rows" :maxlength="maxlength" :show-count="showCount" :size="size" />',
    props: ['modelValue', 'type', 'placeholder', 'rows', 'maxlength', 'showCount', 'size'],
    emits: ['update:modelValue'],
  },
  QyButton: {
    template:
      '<button :disabled="disabled" :loading="loading" @click="$emit(\'click\')"><slot /></button>',
    props: ['variant', 'size', 'loading', 'disabled'],
    emits: ['click'],
  },
  QyBadge: {
    template:
      '<span class="qy-badge" @click="$emit(\'click\')"><slot /></span><button v-if="closable" class="close-btn" @click="$emit(\'close\')">×</button>',
    props: ['variant', 'size', 'closable'],
    emits: ['click', 'close'],
  },
  QyIcon: {
    template: '<i class="qy-icon" />',
    props: ['name', 'size'],
  },
}))

describe('BooklistForm', () => {
  const defaultProps = {
    popularTags: ['玄幻', '仙侠', '都市', '历史', '科幻', '游戏', '军事', '武侠'],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render form correctly in create mode', () => {
      // Act
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })

      // Assert
      expect(wrapper.find('.booklist-form').exists()).toBe(true)
      expect(wrapper.text()).toContain('书单标题')
      expect(wrapper.text()).toContain('书单描述')
      expect(wrapper.text()).toContain('书单封面')
      expect(wrapper.text()).toContain('标签')
      expect(wrapper.text()).toContain('隐私设置')
    })

    it('should render form correctly in edit mode', () => {
      // Arrange
      const booklist = createMockBooklist({
        title: '编辑书单',
        description: '编辑描述',
        tags: ['玄幻', '仙侠'],
      })

      // Act
      const wrapper = mount(BooklistForm, {
        props: {
          ...defaultProps,
          booklist,
        },
      })

      // Assert
      expect(wrapper.text()).toContain('保存')
      expect(wrapper.find('input[type="text"]').element.value).toBe('编辑书单')
    })

    it('should render submit button as "创建" in create mode', () => {
      // Act
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })

      // Assert
      expect(wrapper.text()).toContain('创建')
    })

    it('should render submit button as "保存" in edit mode', () => {
      // Arrange
      const booklist = createMockBooklist()

      // Act
      const wrapper = mount(BooklistForm, {
        props: {
          ...defaultProps,
          booklist,
        },
      })

      // Assert
      expect(wrapper.text()).toContain('保存')
    })

    it('should render popular tags when provided', () => {
      // Act
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })

      // Assert
      expect(wrapper.find('.popular-tags').exists()).toBe(true)
      expect(wrapper.text()).toContain('推荐标签')
      defaultProps.popularTags.forEach((tag) => {
        expect(wrapper.text()).toContain(tag)
      })
    })

    it('should not render popular tags when not provided', () => {
      // Act
      const wrapper = mount(BooklistForm, {
        props: {
          popularTags: [],
        },
      })

      // Assert
      expect(wrapper.find('.popular-tags').exists()).toBe(false)
    })
  })

  describe('form data initialization', () => {
    it('should initialize with empty form data in create mode', () => {
      // Act
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })

      // Assert
      expect(wrapper.vm.$data.formData).toEqual({
        title: '',
        description: '',
        cover: '',
        isPublic: true,
        tags: [],
      })
    })

    it('should initialize with booklist data in edit mode', () => {
      // Arrange
      const booklist = createMockBooklist({
        title: '测试书单',
        description: '测试描述',
        cover: 'https://example.com/cover.jpg',
        isPublic: true,
        tags: ['玄幻', '仙侠'],
      })

      // Act
      const wrapper = mount(BooklistForm, {
        props: {
          ...defaultProps,
          booklist,
        },
      })

      // Assert
      expect(wrapper.vm.$data.formData.title).toBe('测试书单')
      expect(wrapper.vm.$data.formData.description).toBe('测试描述')
      expect(wrapper.vm.$data.formData.cover).toBe('https://example.com/cover.jpg')
      expect(wrapper.vm.$data.formData.isPublic).toBe(true)
      expect(wrapper.vm.$data.formData.tags).toEqual(['玄幻', '仙侠'])
    })

    it('should update form data when booklist prop changes', async () => {
      // Arrange
      const booklist1 = createMockBooklist({ title: '书单1' })
      const booklist2 = createMockBooklist({ title: '书单2' })
      const wrapper = mount(BooklistForm, {
        props: {
          ...defaultProps,
          booklist: booklist1,
        },
      })

      // Act
      await wrapper.setProps({ booklist: booklist2 })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.vm.$data.formData.title).toBe('书单2')
    })
  })

  describe('title input', () => {
    it('should update title when input changes', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      const input = wrapper.find('input[type="text"]')

      // Act
      await input.setValue('新书单标题')
      await input.trigger('input')

      // Assert
      expect(wrapper.vm.$data.formData.title).toBe('新书单标题')
    })
  })

  describe('tag management', () => {
    it('should show tag input when add tag button is clicked', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      const addButton = wrapper.findAll('.qy-button').find((btn) => btn.text() === '添加标签')

      // Act
      await addButton?.trigger('click')
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.vm.$data.inputVisible).toBe(true)
    })

    it('should add tag when tag input is confirmed', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      wrapper.vm.$data.inputVisible = true

      // Act
      wrapper.vm.$data.inputValue = '新标签'
      await wrapper.vm.confirmTag()

      // Assert
      expect(wrapper.vm.$data.formData.tags).toContain('新标签')
      expect(wrapper.vm.$data.inputVisible).toBe(false)
      expect(wrapper.vm.$data.inputValue).toBe('')
    })

    it('should not add duplicate tag', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      wrapper.vm.$data.formData.tags = ['玄幻']
      wrapper.vm.$data.inputVisible = true

      // Act
      wrapper.vm.$data.inputValue = '玄幻'
      await wrapper.vm.confirmTag()

      // Assert
      expect(wrapper.vm.$data.formData.tags.filter((t) => t === '玄幻')).toHaveLength(1)
    })

    it('should remove tag when close button is clicked', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      wrapper.vm.$data.formData.tags = ['玄幻', '仙侠']

      // Act
      await wrapper.vm.removeTag('玄幻')

      // Assert
      expect(wrapper.vm.$data.formData.tags).not.toContain('玄幻')
      expect(wrapper.vm.$data.formData.tags).toContain('仙侠')
    })

    it('should add tag when popular tag is clicked', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })

      // Act
      await wrapper.vm.addTag('玄幻')

      // Assert
      expect(wrapper.vm.$data.formData.tags).toContain('玄幻')
    })

    it('should not add duplicate tag from popular tags', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      wrapper.vm.$data.formData.tags = ['玄幻']

      // Act
      await wrapper.vm.addTag('玄幻')

      // Assert
      expect(wrapper.vm.$data.formData.tags.filter((t) => t === '玄幻')).toHaveLength(1)
    })
  })

  describe('cover upload', () => {
    it('should trigger file input when upload placeholder is clicked', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      wrapper.vm.$refs.fileInput = {
        click: vi.fn(),
      }

      // Act
      await wrapper.vm.triggerUpload()

      // Assert
      expect(wrapper.vm.$refs.fileInput.click).toHaveBeenCalled()
    })

    it('should remove cover when remove button is clicked', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      wrapper.vm.$data.formData.cover = 'https://example.com/cover.jpg'
      wrapper.vm.$refs.fileInput = {
        value: 'old-value',
      }

      // Act
      await wrapper.vm.removeCover()

      // Assert
      expect(wrapper.vm.$data.formData.cover).toBe('')
      expect(wrapper.vm.$refs.fileInput.value).toBe('')
    })
  })

  describe('privacy settings', () => {
    it('should set isPublic to true when public option is selected', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })

      // Act
      wrapper.vm.$data.formData.isPublic = true

      // Assert
      expect(wrapper.vm.$data.formData.isPublic).toBe(true)
    })

    it('should set isPublic to false when private option is selected', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })

      // Act
      wrapper.vm.$data.formData.isPublic = false

      // Assert
      expect(wrapper.vm.$data.formData.isPublic).toBe(false)
    })
  })

  describe('form submission', () => {
    it('should emit submit event with form data when form is valid', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      wrapper.vm.$data.formData = {
        title: '测试书单',
        description: '测试描述',
        cover: 'https://example.com/cover.jpg',
        isPublic: true,
        tags: ['玄幻', '仙侠'],
      }

      // Act
      await wrapper.vm.handleSubmit()

      // Assert
      expect(wrapper.emitted('submit')).toBeTruthy()
      expect(wrapper.emitted('submit')?.[0]).toEqual([
        {
          title: '测试书单',
          description: '测试描述',
          cover: 'https://example.com/cover.jpg',
          isPublic: true,
          tags: ['玄幻', '仙侠'],
        },
      ])
    })

    it('should not emit submit event when form is invalid', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      wrapper.vm.$data.formData.title = '' // Invalid title

      // Act
      await wrapper.vm.handleSubmit()

      // Assert
      expect(wrapper.emitted('submit')).toBeFalsy()
    })

    it('should trim title in submit data', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      wrapper.vm.$data.formData = {
        title: '  测试书单  ',
        description: '  测试描述  ',
        cover: '',
        isPublic: true,
        tags: [],
      }

      // Act
      await wrapper.vm.handleSubmit()

      // Assert
      expect(wrapper.emitted('submit')?.[0]?.[0]?.title).toBe('测试书单')
      expect(wrapper.emitted('submit')?.[0]?.[0]?.description).toBe('测试描述')
    })
  })

  describe('form cancellation', () => {
    it('should emit cancel event when cancel button is clicked', async () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })

      // Act
      await wrapper.vm.handleCancel()

      // Assert
      expect(wrapper.emitted('cancel')).toBeTruthy()
    })
  })

  describe('validation', () => {
    it('should be valid when title has at least 2 characters', () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      wrapper.vm.$data.formData.title = '测试'

      // Act & Assert
      expect(wrapper.vm.$data.isValid).toBe(true)
    })

    it('should be invalid when title is empty', () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      wrapper.vm.$data.formData.title = ''

      // Act & Assert
      expect(wrapper.vm.$data.isValid).toBe(false)
    })

    it('should be invalid when title has only 1 character', () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      wrapper.vm.$data.formData.title = '测'

      // Act & Assert
      expect(wrapper.vm.$data.isValid).toBe(false)
    })

    it('should trim title when validating', () => {
      // Arrange
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })
      wrapper.vm.$data.formData.title = '  测试  '

      // Act & Assert
      expect(wrapper.vm.$data.isValid).toBe(true)
    })
  })

  describe('loading state', () => {
    it('should show loading state when loading prop is true', () => {
      // Act
      const wrapper = mount(BooklistForm, {
        props: {
          ...defaultProps,
          loading: true,
        },
      })

      // Assert
      expect(wrapper.props('loading')).toBe(true)
    })
  })

  describe('computed properties', () => {
    it('should compute isEdit correctly when booklist is provided', () => {
      // Act
      const wrapper = mount(BooklistForm, {
        props: {
          ...defaultProps,
          booklist: createMockBooklist(),
        },
      })

      // Assert
      expect(wrapper.vm.$data.isEdit).toBe(true)
    })

    it('should compute isEdit correctly when booklist is not provided', () => {
      // Act
      const wrapper = mount(BooklistForm, {
        props: defaultProps,
      })

      // Assert
      expect(wrapper.vm.$data.isEdit).toBe(false)
    })
  })
})
