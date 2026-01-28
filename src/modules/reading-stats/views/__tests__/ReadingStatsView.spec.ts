import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ReadingStatsView from '../ReadingStatsView.vue'

// Mock design system components
vi.mock('@/design-system/components', () => ({
  QyButton: { name: 'QyButton', template: '<button><slot /></button>' },
  QyIcon: { name: 'QyIcon', template: '<i />' },
  QyEmpty: { name: 'QyEmpty', template: '<div><slot /></div>' }
}))

describe('ReadingStatsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly', () => {
    const wrapper = mount(ReadingStatsView)
    expect(wrapper.exists()).toBe(true)
  })
})
