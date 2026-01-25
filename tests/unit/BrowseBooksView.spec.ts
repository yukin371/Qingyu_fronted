import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BrowseBooksView from '@/modules/bookstore/views/BrowseBooksView.vue'

describe('BrowseBooksView', () => {
  it('should render page title', () => {
    const wrapper = mount(BrowseBooksView)
    expect(wrapper.find('.page-title').text()).toBe('探索书库')
  })

  it('should render subtitle', () => {
    const wrapper = mount(BrowseBooksView)
    expect(wrapper.find('.page-subtitle').text()).toBe('发现你喜欢的精彩书籍')
  })
})
