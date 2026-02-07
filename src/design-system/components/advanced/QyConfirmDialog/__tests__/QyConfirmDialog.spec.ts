/**
 * QyConfirmDialog 组件单元测试
 */


import { mount } from '@vue/test-utils'
import QyConfirmDialog from '../QyConfirmDialog.vue'
import QyModal from '../../QyModal/QyModal.vue'

vi.mock('../../QyModal/QyModal.vue', () => ({
  default: {
    name: 'QyModal',
    template: '<div v-if="visible" class="qy-modal"><slot name="header"></slot><slot></slot><slot name="footer"></slot></div>',
    props: ['visible', 'width', 'closable', 'maskClosable']
  }
}))

describe('QyConfirmDialog', () => {
  it('应该正确渲染基础确认对话框', () => {
    const wrapper = mount(QyConfirmDialog, {
      props: {
        visible: true,
        title: '确认操作',
        message: '确定要执行此操作吗？'
      }
    })

    expect(wrapper.find('.qy-confirm-dialog__title').text()).toBe('确认操作')
    expect(wrapper.find('.qy-confirm-dialog__message').text()).toBe('确定要执行此操作吗？')
  })

  it('应该根据类型显示不同的图标样式', () => {
    const types = ['warning', 'danger', 'info', 'success'] as const

    types.forEach((type) => {
      const wrapper = mount(QyConfirmDialog, {
        props: {
          visible: true,
          type
        }
      })

      expect(wrapper.find(`.qy-confirm-dialog__icon--${type}`).exists()).toBe(true)
    })
  })

  it('应该显示详细信息列表', () => {
    const details = [
      { label: '金额', value: '¥100.00' },
      { label: '支付方式', value: '支付宝' }
    ]

    const wrapper = mount(QyConfirmDialog, {
      props: {
        visible: true,
        details
      }
    })

    const detailItems = wrapper.findAll('.detail-item')
    expect(detailItems).toHaveLength(2)
    expect(detailItems[0].text()).toContain('金额')
    expect(detailItems[0].text()).toContain('¥100.00')
    expect(detailItems[1].text()).toContain('支付方式')
    expect(detailItems[1].text()).toContain('支付宝')
  })

  it('应该能够隐藏图标', () => {
    const wrapper = mount(QyConfirmDialog, {
      props: {
        visible: true,
        showIcon: false
      }
    })

    expect(wrapper.find('.qy-confirm-dialog__icon').exists()).toBe(false)
  })

  it('应该能够自定义按钮文本', () => {
    const wrapper = mount(QyConfirmDialog, {
      props: {
        visible: true,
        confirmText: '确定',
        cancelText: '返回'
      }
    })

    const buttons = wrapper.findAll('.qy-confirm-dialog__footer button')
    expect(buttons[0].text()).toBe('返回')
    expect(buttons[1].text()).toBe('确定')
  })

  it('应该在加载状态时禁用确认按钮', async () => {
    const wrapper = mount(QyConfirmDialog, {
      props: {
        visible: true,
        loading: true
      }
    })

    const confirmButton = wrapper.findAll('.qy-confirm-dialog__footer button')[1]
    expect(confirmButton.attributes('disabled')).toBeDefined()
  })

  it('点击确认按钮应该触发confirm事件', async () => {
    const wrapper = mount(QyConfirmDialog, {
      props: {
        visible: true
      }
    })

    const confirmButton = wrapper.findAll('.qy-confirm-dialog__footer button')[1]
    await confirmButton.trigger('click')

    expect(wrapper.emitted('confirm')).toBeTruthy()
  })

  it('点击取消按钮应该触发cancel事件并关闭对话框', async () => {
    const wrapper = mount(QyConfirmDialog, {
      props: {
        visible: true
      }
    })

    const cancelButton = wrapper.findAll('.qy-confirm-dialog__footer button')[0]
    await cancelButton.trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
    expect(wrapper.emitted('update:visible')).toBeTruthy()
    expect(wrapper.emitted('update:visible')?.[0]).toEqual([false])
  })

  it('危险类型应该使用危险样式按钮', () => {
    const wrapper = mount(QyConfirmDialog, {
      props: {
        visible: true,
        type: 'danger'
      }
    })

    // 验证confirmButtonType计算属性
    const vm = wrapper.vm as any
    expect(vm.confirmButtonType).toBe('danger')
  })

  it('警告类型应该使用主色调按钮', () => {
    const wrapper = mount(QyConfirmDialog, {
      props: {
        visible: true,
        type: 'warning'
      }
    })

    const vm = wrapper.vm as any
    expect(vm.confirmButtonType).toBe('primary')
  })

  it('应该支持不同的尺寸', () => {
    const sizes = ['large', 'default', 'small'] as const

    sizes.forEach((size) => {
      const wrapper = mount(QyConfirmDialog, {
        props: {
          visible: true,
          size
        }
      })

      const buttons = wrapper.findAll('.qy-confirm-dialog__footer button')
      buttons.forEach((button) => {
        expect(button.attributes('size')).toBe(size)
      })
    })
  })

  it('应该在visible为false时不渲染对话框', () => {
    const wrapper = mount(QyConfirmDialog, {
      props: {
        visible: false
      }
    })

    expect(wrapper.find('.qy-modal').exists()).toBe(false)
  })

  it('应该支持自定义宽度', () => {
    const wrapper = mount(QyConfirmDialog, {
      props: {
        visible: true,
        width: '600px'
      }
    })

    // 验证width属性传递给QyModal
    const modal = wrapper.findComponent(QyModal)
    expect(modal.props('width')).toBe('600px')
  })
})
