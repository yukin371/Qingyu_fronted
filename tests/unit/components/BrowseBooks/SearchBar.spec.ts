import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBar from '@/modules/bookstore/components/BrowseBooks/SearchBar.vue'

describe('SearchBar', () => {
  it('should render with default placeholder', () => {
    const wrapper = mount(SearchBar)
    expect(wrapper.find('input').attributes('placeholder')).toBe('搜索书名、作者、标签...')
  })

  it('should render with custom placeholder', () => {
    const wrapper = mount(SearchBar, {
      props: { placeholder: '测试占位符' }
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('测试占位符')
  })

  it('should emit search event on Enter key', async () => {
    const wrapper = mount(SearchBar, {
      props: { modelValue: '测试搜索' }
    })
    
    await wrapper.find('input').trigger('keyup.enter')
    
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')[0]).toEqual(['测试搜索'])
  })

  it('should not emit search with empty value on Enter', async () => {
    const wrapper = mount(SearchBar, {
      props: { modelValue: '' }
    })
    
    await wrapper.find('input').trigger('keyup.enter')
    
    expect(wrapper.emitted('search')).toBeFalsy()
  })

  it('should emit clear event when clear button clicked', async () => {
    const wrapper = mount(SearchBar, {
      props: { modelValue: '测试' }
    })
    
    await wrapper.find('.clear-btn').trigger('click')
    
    expect(wrapper.emitted('clear')).toBeTruthy()
  })

  it('should not show clear button when value is empty', () => {
    const wrapper = mount(SearchBar, {
      props: { modelValue: '' }
    })
    
    expect(wrapper.find('.clear-btn').exists()).toBe(false)
  })

  it('should show clear button when value is not empty', () => {
    const wrapper = mount(SearchBar, {
      props: { modelValue: '测试' }
    })
    
    expect(wrapper.find('.clear-btn').exists()).toBe(true)
  })
})
