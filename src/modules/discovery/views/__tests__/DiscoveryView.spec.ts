import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DiscoveryView from '../DiscoveryView.vue'

// Mock design system components
vi.mock('@/design-system/components', () => ({
  QyButton: { name: 'QyButton', template: '<button><slot /></button>' },
  QyIcon: { name: 'QyIcon', template: '<i />' },
  QyEmpty: { name: 'QyEmpty', template: '<div><slot /></div>' }
}))

describe('DiscoveryView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly', () => {
    const wrapper = mount(DiscoveryView)
    expect(wrapper.exists()).toBe(true)
  })

  it('displays page title', () => {
    const wrapper = mount(DiscoveryView)
    expect(wrapper.text()).toContain('发现')
  })
})
