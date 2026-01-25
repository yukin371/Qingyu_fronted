import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FilterBar from '@/modules/bookstore/components/BrowseBooks/FilterBar.vue'

const mockCategories = [
  { _id: '1', name: '玄幻' },
  { _id: '2', name: '都市' }
]

const mockYears = ['2024', '2023', '2022']

const mockStatuses = [
  { value: 'serializing', label: '连载中' },
  { value: 'completed', label: '已完结' }
]

describe('FilterBar', () => {
  it('should render all filter selects', () => {
    const wrapper = mount(FilterBar, {
      props: {
        categoryId: '',
        year: '',
        status: '',
        categories: mockCategories,
        years: mockYears,
        statuses: mockStatuses
      }
    })
    
    const selects = wrapper.findAllComponents({ name: 'Select' })
    expect(selects).toHaveLength(3)
  })

  it('should pass correct options to category select', () => {
    const wrapper = mount(FilterBar, {
      props: {
        categoryId: '',
        year: '',
        status: '',
        categories: mockCategories,
        years: mockYears,
        statuses: mockStatuses
      }
    })
    
    const categorySelect = wrapper.findAllComponents({ name: 'Select' })[0]
    const options = categorySelect.props('options')
    
    expect(options).toHaveLength(3) // 包括"全部分类"选项
    expect(options[0]).toEqual({ value: '', label: '全部分类' })
    expect(options[1]).toEqual({ value: '1', label: '玄幻' })
    expect(options[2]).toEqual({ value: '2', label: '都市' })
  })

  it('should pass correct options to year select', () => {
    const wrapper = mount(FilterBar, {
      props: {
        categoryId: '',
        year: '',
        status: '',
        categories: mockCategories,
        years: mockYears,
        statuses: mockStatuses
      }
    })
    
    const yearSelect = wrapper.findAllComponents({ name: 'Select' })[1]
    const options = yearSelect.props('options')
    
    expect(options).toHaveLength(4) // 包括"全部年份"选项
    expect(options[0]).toEqual({ value: '', label: '全部年份' })
    expect(options[1]).toEqual({ value: '2024', label: '2024' })
  })

  it('should emit categoryId update', async () => {
    const wrapper = mount(FilterBar, {
      props: {
        categoryId: '',
        year: '',
        status: '',
        categories: mockCategories,
        years: mockYears,
        statuses: mockStatuses
      }
    })
    
    const select = wrapper.findAllComponents({ name: 'Select' })[0]
    select.vm.$emit('update:model-value', '1')
    
    expect(wrapper.emitted('update:categoryId')).toBeTruthy()
    expect(wrapper.emitted('update:categoryId')[0]).toEqual(['1'])
  })

  it('should emit year update', async () => {
    const wrapper = mount(FilterBar, {
      props: {
        categoryId: '',
        year: '',
        status: '',
        categories: mockCategories,
        years: mockYears,
        statuses: mockStatuses
      }
    })
    
    const select = wrapper.findAllComponents({ name: 'Select' })[1]
    select.vm.$emit('update:model-value', '2024')
    
    expect(wrapper.emitted('update:year')).toBeTruthy()
    expect(wrapper.emitted('update:year')[0]).toEqual(['2024'])
  })

  it('should emit status update', async () => {
    const wrapper = mount(FilterBar, {
      props: {
        categoryId: '',
        year: '',
        status: '',
        categories: mockCategories,
        years: mockYears,
        statuses: mockStatuses
      }
    })
    
    const select = wrapper.findAllComponents({ name: 'Select' })[2]
    select.vm.$emit('update:model-value', 'serializing')
    
    expect(wrapper.emitted('update:status')).toBeTruthy()
    expect(wrapper.emitted('update:status')[0]).toEqual(['serializing'])
  })
})
