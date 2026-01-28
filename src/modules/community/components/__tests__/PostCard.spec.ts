/**
 * PostCard组件测试
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMockPost } from '../../../../tests/fixtures'

// Mock设计系统组件 - 必须在导入组件之前
vi.mock('@/design-system/components', () => {
  const { h, defineComponent } = require('vue')

  const MockQyAvatar = defineComponent({
    name: 'QyAvatar',
    props: {
      src: { type: String },
      name: { type: String, default: '' },
      size: { type: String, default: 'md' },
    },
    setup(props) {
      return () => h('div', { class: ['qy-avatar', `qy-avatar--${props.size}`] }, props.name || '头像')
    },
  })

  const MockQyBadge = defineComponent({
    name: 'QyBadge',
    props: {
      variant: { type: String, default: 'default' },
      size: { type: String, default: 'medium' },
      closable: { type: Boolean, default: false },
    },
    emits: ['click', 'close'],
    setup(props, { emit, slots }) {
      const children = [
        slots.default ? slots.default() : '',
      ]
      if (props.closable) {
        children.push(
          h('span', {
            class: 'close-btn',
            onClick: (e) => {
              e.stopPropagation()
              emit('close')
            },
          }, '×')
        )
      }
      return () => h(
        'span',
        {
          class: ['qy-badge', `qy-badge--${props.variant}`, `qy-badge--${props.size}`],
          onClick: () => emit('click'),
        },
        children
      )
    },
  })

  const MockQyIcon = defineComponent({
    name: 'QyIcon',
    props: {
      name: { type: String, required: true },
      size: { type: Number, default: 16 },
    },
    setup(props) {
      return () => h('i', { class: `qy-icon qy-icon--${props.name}`, style: { fontSize: `${props.size}px` } })
    },
  })

  return {
    QyAvatar: MockQyAvatar,
    QyBadge: MockQyBadge,
    QyIcon: MockQyIcon,
  }
})

import PostCard from '../PostCard.vue'

describe('PostCard', () => {
  const defaultProps = {
    post: createMockPost({
      content: '这是一个测试动态',
      likeCount: 10,
      commentCount: 5,
      isLiked: false,
      topics: ['玄幻', '仙侠'],
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    }),
  }

  describe('rendering', () => {
    it('should render post card correctly', () => {
      // Act
      const wrapper = mount(PostCard, {
        props: defaultProps,
      })

      // Assert
      expect(wrapper.find('.post-card').exists()).toBe(true)
      expect(wrapper.text()).toContain('这是一个测试动态')
    })

    it('should render user info', () => {
      // Act
      const wrapper = mount(PostCard, {
        props: defaultProps,
      })

      // Assert
      expect(wrapper.find('.post-header').exists()).toBe(true)
      expect(wrapper.find('.nickname').exists()).toBe(true)
      expect(wrapper.find('.post-time').exists()).toBe(true)
    })

    it('should render post content', () => {
      // Act
      const wrapper = mount(PostCard, {
        props: defaultProps,
      })

      // Assert
      expect(wrapper.find('.post-content').exists()).toBe(true)
      expect(wrapper.find('.content-text').exists()).toBe(true)
      expect(wrapper.text()).toContain('这是一个测试动态')
    })

    it('should render images when post has images', () => {
      // Act
      const wrapper = mount(PostCard, {
        props: defaultProps,
      })

      // Assert
      expect(wrapper.find('.content-images').exists()).toBe(true)
      const images = wrapper.findAll('.content-images img')
      expect(images).toHaveLength(2)
    })

    it('should not render images when post has no images', () => {
      // Arrange
      const post = createMockPost({ images: [] })

      // Act
      const wrapper = mount(PostCard, {
        props: { post },
      })

      // Assert
      expect(wrapper.find('.content-images').exists()).toBe(false)
    })

    it('should limit images to 9', () => {
      // Arrange
      const images = Array.from({ length: 15 }, (_, i) => `https://example.com/image${i}.jpg`)
      const post = createMockPost({ images })

      // Act
      const wrapper = mount(PostCard, {
        props: { post },
      })

      // Assert
      const renderedImages = wrapper.findAll('.content-images img')
      expect(renderedImages).toHaveLength(9)
    })

    it('should render book card when post has book', () => {
      // Arrange
      const post = createMockPost({
        book: {
          id: 'book_123',
          title: '测试书籍',
          author: '测试作者',
          cover: 'https://example.com/cover.jpg',
        },
      })

      // Act
      const wrapper = mount(PostCard, {
        props: { post },
      })

      // Assert
      expect(wrapper.find('.book-card').exists()).toBe(true)
      expect(wrapper.text()).toContain('测试书籍')
      expect(wrapper.text()).toContain('测试作者')
    })

    it('should render topics', () => {
      // Act
      const wrapper = mount(PostCard, {
        props: defaultProps,
      })

      // Assert
      expect(wrapper.find('.post-topics').exists()).toBe(true)
      expect(wrapper.text()).toContain('#玄幻')
      expect(wrapper.text()).toContain('#仙侠')
    })

    it('should not render topics when post has no topics', () => {
      // Arrange
      const post = createMockPost({ topics: [] })

      // Act
      const wrapper = mount(PostCard, {
        props: { post },
      })

      // Assert
      expect(wrapper.find('.post-topics').exists()).toBe(false)
    })

    it('should render action buttons', () => {
      // Act
      const wrapper = mount(PostCard, {
        props: defaultProps,
      })

      // Assert
      expect(wrapper.find('.post-actions').exists()).toBe(true)
      const buttons = wrapper.findAll('.action-btn')
      expect(buttons).toHaveLength(3) // 点赞、评论、分享
    })

    it('should render like count', () => {
      // Act
      const wrapper = mount(PostCard, {
        props: defaultProps,
      })

      // Assert
      const likeButton = wrapper.findAll('.action-btn')[0]
      expect(likeButton.text()).toContain('10')
    })

    it('should render comment count', () => {
      // Act
      const wrapper = mount(PostCard, {
        props: defaultProps,
      })

      // Assert
      const commentButton = wrapper.findAll('.action-btn')[1]
      expect(commentButton.text()).toContain('5')
    })

    it('should show active class when post is liked', () => {
      // Arrange
      const post = createMockPost({ isLiked: true })

      // Act
      const wrapper = mount(PostCard, {
        props: { post },
      })

      // Assert
      const likeButton = wrapper.findAll('.action-btn')[0]
      expect(likeButton.classes()).toContain('active')
    })

    it('should not show active class when post is not liked', () => {
      // Act
      const wrapper = mount(PostCard, {
        props: defaultProps,
      })

      // Assert
      const likeButton = wrapper.findAll('.action-btn')[0]
      expect(likeButton.classes()).not.toContain('active')
    })
  })

  describe('interactions', () => {
    it('should emit click event when card is clicked', async () => {
      // Arrange
      const wrapper = mount(PostCard, {
        props: defaultProps,
      })

      // Act
      await wrapper.find('.post-card').trigger('click')

      // Assert
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')?.[0]).toEqual([defaultProps.post])
    })

    it('should emit like event when like button is clicked', async () => {
      // Arrange
      const wrapper = mount(PostCard, {
        props: defaultProps,
      })

      // Act
      const likeButton = wrapper.findAll('.action-btn')[0]
      await likeButton.trigger('click')

      // Assert
      expect(wrapper.emitted('like')).toBeTruthy()
      expect(wrapper.emitted('like')?.[0]).toEqual([defaultProps.post])
    })

    it('should emit comment event when comment button is clicked', async () => {
      // Arrange
      const wrapper = mount(PostCard, {
        props: defaultProps,
      })

      // Act
      const commentButton = wrapper.findAll('.action-btn')[1]
      await commentButton.trigger('click')

      // Assert
      expect(wrapper.emitted('comment')).toBeTruthy()
      expect(wrapper.emitted('comment')?.[0]).toEqual([defaultProps.post])
    })

    it('should emit share event when share button is clicked', async () => {
      // Arrange
      const wrapper = mount(PostCard, {
        props: defaultProps,
      })

      // Act
      const shareButton = wrapper.findAll('.action-btn')[2]
      await shareButton.trigger('click')

      // Assert
      expect(wrapper.emitted('share')).toBeTruthy()
      expect(wrapper.emitted('share')?.[0]).toEqual([defaultProps.post])
    })

    it('should emit topic event when topic badge is clicked', async () => {
      // Arrange
      const wrapper = mount(PostCard, {
        props: defaultProps,
      })

      // Act
      const topicBadge = wrapper.findAll('.qy-badge')[0]
      await topicBadge.trigger('click')
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.emitted('topic')).toBeDefined()
      expect(wrapper.emitted('topic')?.[0]).toEqual(['玄幻'])
    })

    it('should stop propagation when action buttons are clicked', async () => {
      // Arrange
      const wrapper = mount(PostCard, {
        props: defaultProps,
      })

      // Act
      const likeButton = wrapper.findAll('.action-btn')[0]
      await likeButton.trigger('click')

      // Assert
      // click事件应该只触发like，不触发card的click
      expect(wrapper.emitted('click')).toBeFalsy()
      expect(wrapper.emitted('like')).toBeTruthy()
    })

    it('should stop propagation when topic badge is clicked', async () => {
      // Arrange
      const wrapper = mount(PostCard, {
        props: defaultProps,
      })

      // Act
      const topicBadge = wrapper.findAll('.qy-badge')[0]
      await topicBadge.trigger('click')
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper.emitted('click')).toBeUndefined()
      expect(wrapper.emitted('topic')).toBeDefined()
    })
  })

  describe('formatTime function', () => {
    it('should format time as "刚刚" for recent posts', () => {
      // Arrange
      const now = new Date()
      const post = createMockPost({
        createdAt: new Date(now.getTime() - 30000).toISOString(), // 30秒前
      })

      // Act
      const wrapper = mount(PostCard, {
        props: { post },
      })

      // Assert
      expect(wrapper.vm.formatTime(post.createdAt)).toBe('刚刚')
    })

    it('should format time as "X分钟前" for posts within an hour', () => {
      // Arrange
      const now = new Date()
      const post = createMockPost({
        createdAt: new Date(now.getTime() - 1800000).toISOString(), // 30分钟前
      })

      // Act
      const wrapper = mount(PostCard, {
        props: { post },
      })

      // Assert
      expect(wrapper.vm.formatTime(post.createdAt)).toBe('30分钟前')
    })

    it('should format time as "X小时前" for posts within 24 hours', () => {
      // Arrange
      const now = new Date()
      const post = createMockPost({
        createdAt: new Date(now.getTime() - 3600000 * 5).toISOString(), // 5小时前
      })

      // Act
      const wrapper = mount(PostCard, {
        props: { post },
      })

      // Assert
      expect(wrapper.vm.formatTime(post.createdAt)).toBe('5小时前')
    })

    it('should format time as "X天前" for posts within 7 days', () => {
      // Arrange
      const now = new Date()
      const post = createMockPost({
        createdAt: new Date(now.getTime() - 86400000 * 3).toISOString(), // 3天前
      })

      // Act
      const wrapper = mount(PostCard, {
        props: { post },
      })

      // Assert
      expect(wrapper.vm.formatTime(post.createdAt)).toBe('3天前')
    })

    it('should format time as date for older posts', () => {
      // Arrange
      const post = createMockPost({
        createdAt: '2024-01-01T00:00:00Z',
      })

      // Act
      const wrapper = mount(PostCard, {
        props: { post },
      })

      // Assert
      expect(wrapper.vm.formatTime(post.createdAt)).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/)
    })
  })

  describe('edge cases', () => {
    it('should handle post with no likes', () => {
      // Arrange
      const post = createMockPost({
        likeCount: 0,
      })

      // Act
      const wrapper = mount(PostCard, {
        props: { post },
      })

      // Assert
      const likeButton = wrapper.findAll('.action-btn')[0]
      expect(likeButton.text()).toContain('点赞')
    })

    it('should handle post with no comments', () => {
      // Arrange
      const post = createMockPost({
        commentCount: 0,
      })

      // Act
      const wrapper = mount(PostCard, {
        props: { post },
      })

      // Assert
      const commentButton = wrapper.findAll('.action-btn')[1]
      expect(commentButton.text()).toContain('评论')
    })

    it('should handle post with no user', () => {
      // Arrange
      const post = createMockPost({
        user: undefined,
      })

      // Act
      const wrapper = mount(PostCard, {
        props: { post },
      })

      // Assert
      expect(wrapper.find('.post-header').exists()).toBe(true)
    })

    it('should handle empty content', () => {
      // Arrange
      const post = createMockPost({
        content: '',
      })

      // Act
      const wrapper = mount(PostCard, {
        props: { post },
      })

      // Assert
      expect(wrapper.find('.content-text').exists()).toBe(true)
    })
  })
})
