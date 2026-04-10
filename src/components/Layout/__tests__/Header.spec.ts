import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Header from '../Header.vue'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    routerPush: vi.fn(),
    confirm: vi.fn(),
    authStore: null as any,
  },
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mocks.routerPush,
  }),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mocks.authStore,
}))

vi.mock('@/design-system/services', () => ({
  messageBox: {
    confirm: mocks.confirm,
  },
}))

vi.mock('@/design-system/components', () => ({
  QyIcon: {
    template: '<i class="qy-icon" />',
    props: ['name', 'size'],
  },
}))

vi.mock('@/design-system/components/basic/QyAvatar/QyAvatar.vue', () => ({
  default: {
    template: '<div class="qy-avatar">{{ text }}</div>',
    props: ['size', 'src', 'text'],
  },
}))

const buildAuthStore = () =>
  reactive({
    isLoggedIn: true,
    user: {
      username: 'reader_001',
      nickname: '初始昵称',
      avatar: '',
    },
    logout: vi.fn(),
  })

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.authStore = buildAuthStore()
    mocks.confirm.mockResolvedValue(undefined)
  })

  it('should render the current user display name from auth store', () => {
    const wrapper = mount(Header, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a class="router-link"><slot /></a>',
          },
          'el-dropdown': {
            template: '<div class="el-dropdown"><slot /><slot name="dropdown" /></div>',
          },
          'el-dropdown-menu': {
            template: '<div class="el-dropdown-menu"><slot /></div>',
          },
          'el-dropdown-item': {
            template: '<button class="el-dropdown-item"><slot /></button>',
          },
          'el-button': {
            template: '<button class="el-button"><slot /></button>',
          },
        },
      },
    })

    expect(wrapper.find('.qy-avatar').text()).toBe('初始昵称')
    expect(wrapper.text()).toContain('初始昵称')
  })

  it('should update the displayed user name when auth store user changes', async () => {
    const wrapper = mount(Header, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a class="router-link"><slot /></a>',
          },
          'el-dropdown': {
            template: '<div class="el-dropdown"><slot /><slot name="dropdown" /></div>',
          },
          'el-dropdown-menu': {
            template: '<div class="el-dropdown-menu"><slot /></div>',
          },
          'el-dropdown-item': {
            template: '<button class="el-dropdown-item"><slot /></button>',
          },
          'el-button': {
            template: '<button class="el-button"><slot /></button>',
          },
        },
      },
    })

    mocks.authStore.user.nickname = '更新后的昵称'
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.qy-avatar').text()).toBe('更新后的昵称')
    expect(wrapper.text()).toContain('更新后的昵称')
  })
})
