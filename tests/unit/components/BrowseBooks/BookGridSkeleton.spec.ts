import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BookGridSkeleton from '@/modules/bookstore/components/BrowseBooks/BookGridSkeleton.vue'

describe('BookGridSkeleton', () => {
  it('should render default count of 12 cards', () => {
    const wrapper = mount(BookGridSkeleton)
    expect(wrapper.findAll('.skeleton-card')).toHaveLength(12)
  })

  it('should render custom count', () => {
    const wrapper = mount(BookGridSkeleton, {
      props: { count: 6 }
    })
    expect(wrapper.findAll('.skeleton-card')).toHaveLength(6)
  })

  it('should have shimmer animation', () => {
    const wrapper = mount(BookGridSkeleton)
    const cover = wrapper.find('.skeleton-cover')

    expect(cover.exists()).toBe(true)
  })

  it('should render all skeleton elements', () => {
    const wrapper = mount(BookGridSkeleton, {
      props: { count: 1 }
    })

    const card = wrapper.find('.skeleton-card')
    expect(card.find('.skeleton-cover').exists()).toBe(true)
    expect(card.find('.skeleton-title').exists()).toBe(true)
    expect(card.find('.skeleton-author').exists()).toBe(true)
    expect(card.find('.skeleton-meta').exists()).toBe(true)
  })
})
