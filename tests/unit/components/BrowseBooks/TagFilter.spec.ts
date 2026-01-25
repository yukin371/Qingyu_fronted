import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TagFilter from '@/modules/bookstore/components/BrowseBooks/TagFilter.vue'

describe('TagFilter', () => {
  it('should render empty state', () => {
    const wrapper = mount(TagFilter, {
      props: {
        selectedTags: [],
        availableTags: ['热血', '穿越', '系统']
      }
    })
    
    expect(wrapper.find('.add-tag-chip').exists()).toBe(true)
    expect(wrapper.find('.tag-count').text()).toBe('0/8')
  })

  it('should render selected tags', () => {
    const wrapper = mount(TagFilter, {
      props: {
        selectedTags: ['热血', '穿越'],
        availableTags: ['热血', '穿越', '系统']
      }
    })
    
    expect(wrapper.findAll('.selected-tag')).toHaveLength(2)
  })

  it('should emit add-tag when clicking add button', async () => {
    const wrapper = mount(TagFilter, {
      props: {
        selectedTags: [],
        availableTags: ['热血']
      }
    })
    
    wrapper.vm.addTag('热血')
    
    expect(wrapper.emitted('update:selectedTags')).toBeTruthy()
    expect(wrapper.emitted('update:selectedTags')[0]).toEqual([['热血']])
  })

  it('should not add duplicate tag', () => {
    const wrapper = mount(TagFilter, {
      props: {
        selectedTags: ['热血'],
        availableTags: ['热血', '穿越']
      }
    })
    
    wrapper.vm.addTag('热血')
    
    expect(wrapper.emitted('update:selectedTags')).toBeFalsy()
  })

  it('should remove tag when clicking close button', () => {
    const wrapper = mount(TagFilter, {
      props: {
        selectedTags: ['热血', '穿越'],
        availableTags: ['热血', '穿越', '系统']
      }
    })
    
    wrapper.vm.removeTag('热血')
    
    expect(wrapper.emitted('update:selectedTags')).toBeTruthy()
    expect(wrapper.emitted('update:selectedTags')[0]).toEqual([['穿越']])
  })

  it('should show max hint when reaching limit', () => {
    const wrapper = mount(TagFilter, {
      props: {
        selectedTags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8'],
        availableTags: [],
        maxSelected: 8
      }
    })
    
    expect(wrapper.find('.add-tag-chip').exists()).toBe(false)
    expect(wrapper.find('.max-tags-hint').exists()).toBe(true)
  })

  it('should show perf warning when exceeding recommend limit', () => {
    const wrapper = mount(TagFilter, {
      props: {
        selectedTags: ['tag1', 'tag2', 'tag3'],
        availableTags: [],
        recommendLimit: 3
      }
    })
    
    expect(wrapper.find('.perf-warning').exists()).toBe(true)
  })
})
