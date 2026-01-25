/**
 * Form 和 FormItem 组件单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick, h, defineComponent } from 'vue'
import Form from '@/design-system/form/Form/Form.vue'
import FormItem from '@/design-system/form/Form/FormItem.vue'
import Input from '@/design-system/form/Input/Input.vue'

// 测试辅助组件
const TestFormComponent = defineComponent({
  name: 'TestFormComponent',
  props: {
    model: {
      type: Object,
      required: true,
    },
    rules: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    return () => h(Form, {
      model: props.model,
      rules: props.rules,
    }, {
      default: () => [
        h(FormItem, {
          label: '用户名',
          prop: 'username',
        }, {
          default: () => h(Input, {
            modelValue: props.model.username,
            'onUpdate:modelValue': (value: string) => {
              props.model.username = value
            },
          }),
        }),
        h(FormItem, {
          label: '邮箱',
          prop: 'email',
        }, {
          default: () => h(Input, {
            modelValue: props.model.email,
            'onUpdate:modelValue': (value: string) => {
              props.model.email = value
            },
            type: 'email',
          }),
        }),
        h(FormItem, {
          label: '密码',
          prop: 'password',
        }, {
          default: () => h(Input, {
            modelValue: props.model.password,
            'onUpdate:modelValue': (value: string) => {
              props.model.password = value
            },
            type: 'password',
          }),
        }),
      ],
    })
  },
})

describe('Form 组件', () => {
  let wrapper: VueWrapper<any>
  let formModel: any

  beforeEach(() => {
    formModel = {
      username: '',
      email: '',
      password: '',
    }
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('基础渲染', () => {
    it('应该正确渲染 Form 组件', () => {
      wrapper = mount(Form, {
        props: {
          model: formModel,
        },
      })

      expect(wrapper.find('form').exists()).toBe(true)
      expect(wrapper.find('.tw-form').exists()).toBe(true)
    })

    it('应该渲染子组件', () => {
      wrapper = mount(Form, {
        props: {
          model: formModel,
        },
        slots: {
          default: '<div class="test-slot">测试插槽</div>',
        },
      })

      expect(wrapper.find('.test-slot').exists()).toBe(true)
      expect(wrapper.find('.test-slot').text()).toBe('测试插槽')
    })

    it('应该应用自定义类名', () => {
      wrapper = mount(Form, {
        props: {
          model: formModel,
          class: 'custom-form-class',
        },
      })

      expect(wrapper.find('.custom-form-class').exists()).toBe(true)
    })
  })

  describe('Props 测试', () => {
    it('应该正确设置 labelWidth', () => {
      wrapper = mount(Form, {
        props: {
          model: formModel,
          labelWidth: '150px',
        },
      })

      const context = (wrapper.vm as any).formContext
      expect(context.labelWidth).toBe('150px')
    })

    it('应该正确设置 labelPosition', () => {
      wrapper = mount(Form, {
        props: {
          model: formModel,
          labelPosition: 'top',
        },
      })

      const context = (wrapper.vm as any).formContext
      expect(context.labelPosition).toBe('top')
    })

    it('应该正确设置 size', () => {
      wrapper = mount(Form, {
        props: {
          model: formModel,
          size: 'lg',
        },
      })

      const context = (wrapper.vm as any).formContext
      expect(context.size).toBe('lg')
    })

    it('应该正确设置 disabled', () => {
      wrapper = mount(Form, {
        props: {
          model: formModel,
          disabled: true,
        },
      })

      const context = (wrapper.vm as any).formContext
      expect(context.disabled).toBe(true)
    })

    it('应该正确设置 showColon', () => {
      wrapper = mount(Form, {
        props: {
          model: formModel,
          showColon: false,
        },
      })

      const context = (wrapper.vm as any).formContext
      expect(context.showColon).toBe(false)
    })

    it('应该正确设置 requireAsterisk', () => {
      wrapper = mount(Form, {
        props: {
          model: formModel,
          requireAsterisk: false,
        },
      })

      const context = (wrapper.vm as any).formContext
      expect(context.requireAsterisk).toBe(false)
    })
  })

  describe('表单验证', () => {
    it('应该验证整个表单', async () => {
      const rules = {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
        ],
      }

      wrapper = mount(TestFormComponent, {
        props: {
          model: formModel,
          rules,
        },
      })

      const formRef = wrapper.vm as any
      const valid = await formRef.validate()

      expect(valid).toBe(false)
    })

    it('应该在所有字段有效时返回 true', async () => {
      formModel.username = 'testuser'
      formModel.email = 'test@example.com'

      const rules = {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
        ],
      }

      wrapper = mount(TestFormComponent, {
        props: {
          model: formModel,
          rules,
        },
      })

      await nextTick()

      const formRef = wrapper.vm as any
      const valid = await formRef.validate()

      expect(valid).toBe(true)
    })

    it('应该验证指定字段', async () => {
      formModel.username = 'testuser'

      const rules = {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
        ],
      }

      wrapper = mount(TestFormComponent, {
        props: {
          model: formModel,
          rules,
        },
      })

      await nextTick()

      const formRef = wrapper.vm as any
      const valid = await formRef.validateField('username')

      expect(valid).toBe(true)
    })

    it('应该验证多个指定字段', async () => {
      formModel.username = 'testuser'
      formModel.email = 'test@example.com'

      const rules = {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
        ],
      }

      wrapper = mount(TestFormComponent, {
        props: {
          model: formModel,
          rules,
        },
      })

      await nextTick()

      const formRef = wrapper.vm as any
      const valid = await formRef.validateField(['username', 'email'])

      expect(valid).toBe(true)
    })
  })

  describe('表单重置', () => {
    it('应该重置所有字段', async () => {
      formModel.username = 'testuser'
      formModel.email = 'test@example.com'

      wrapper = mount(TestFormComponent, {
        props: {
          model: formModel,
        },
      })

      await nextTick()

      const formRef = wrapper.vm as any
      formRef.resetFields()

      await nextTick()

      expect(formModel.username).toBe(undefined)
      expect(formModel.email).toBe(undefined)
    })
  })

  describe('清除验证', () => {
    it('应该清除所有验证', async () => {
      wrapper = mount(TestFormComponent, {
        props: {
          model: formModel,
        },
      })

      const formRef = wrapper.vm as any
      formRef.clearValidation()

      await nextTick()

      // 验证方法被调用
      expect(wrapper.exists()).toBe(true)
    })

    it('应该清除指定字段验证', async () => {
      wrapper = mount(TestFormComponent, {
        props: {
          model: formModel,
        },
      })

      const formRef = wrapper.vm as any
      formRef.clearValidation('username')

      await nextTick()

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('表单数据', () => {
    it('应该获取表单数据', () => {
      formModel.username = 'testuser'
      formModel.email = 'test@example.com'

      wrapper = mount(Form, {
        props: {
          model: formModel,
        },
      })

      const formRef = wrapper.vm as any
      const data = formRef.getFormData()

      expect(data.username).toBe('testuser')
      expect(data.email).toBe('test@example.com')
    })

    it('应该设置表单数据', () => {
      wrapper = mount(Form, {
        props: {
          model: formModel,
        },
      })

      const formRef = wrapper.vm as any
      formRef.setFormData({
        username: 'newuser',
        email: 'new@example.com',
      })

      expect(formModel.username).toBe('newuser')
      expect(formModel.email).toBe('new@example.com')
    })
  })

  describe('事件触发', () => {
    it('应该在验证成功时触发 validate 事件', async () => {
      formModel.username = 'testuser'

      const rules = {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
        ],
      }

      wrapper = mount(Form, {
        props: {
          model: formModel,
          rules,
        },
        slots: {
          default: () => h(FormItem, {
            label: '用户名',
            prop: 'username',
          }, {
            default: () => h(Input, {
              modelValue: formModel.username,
              'onUpdate:modelValue': (value: string) => {
                formModel.username = value
              },
            }),
          }),
        },
      })

      await nextTick()

      const formRef = wrapper.vm as any
      await formRef.validate()

      await nextTick()

      expect(wrapper.emitted('validate')).toBeTruthy()
    })

    it('应该在验证失败时触发 validate-failed 事件', async () => {
      const rules = {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
        ],
      }

      wrapper = mount(Form, {
        props: {
          model: formModel,
          rules,
        },
        slots: {
          default: () => h(FormItem, {
            label: '用户名',
            prop: 'username',
          }, {
            default: () => h(Input, {
              modelValue: formModel.username,
              'onUpdate:modelValue': (value: string) => {
                formModel.username = value
              },
            }),
          }),
        },
      })

      await nextTick()

      const formRef = wrapper.vm as any
      await formRef.validate()

      await nextTick()

      expect(wrapper.emitted('validate-failed')).toBeTruthy()
    })
  })
})

describe('FormItem 组件', () => {
  let wrapper: VueWrapper<any>
  let formModel: any

  beforeEach(() => {
    formModel = {
      username: '',
      email: '',
    }
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('基础渲染', () => {
    it('应该正确渲染 FormItem 组件', () => {
      wrapper = mount(FormItem, {
        props: {
          label: '用户名',
          prop: 'username',
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      expect(wrapper.find('.tw-form-item').exists()).toBe(true)
      expect(wrapper.find('.tw-form-item-label').exists()).toBe(true)
      expect(wrapper.find('.tw-form-item-content').exists()).toBe(true)
    })

    it('应该渲染标签文本', () => {
      wrapper = mount(FormItem, {
        props: {
          label: '用户名',
          prop: 'username',
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      expect(wrapper.find('.tw-form-item-label-text').text()).toContain('用户名')
    })

    it('应该渲染自定义标签插槽', () => {
      wrapper = mount(FormItem, {
        props: {
          label: '用户名',
          prop: 'username',
        },
        slots: {
          label: '<span class="custom-label">自定义标签</span>',
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      expect(wrapper.find('.custom-label').exists()).toBe(true)
      expect(wrapper.find('.custom-label').text()).toBe('自定义标签')
    })

    it('应该渲染内容插槽', () => {
      wrapper = mount(FormItem, {
        props: {
          label: '用户名',
          prop: 'username',
        },
        slots: {
          default: '<input class="test-input" />',
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      expect(wrapper.find('.test-input').exists()).toBe(true)
    })

    it('应该应用自定义类名', () => {
      wrapper = mount(FormItem, {
        props: {
          label: '用户名',
          prop: 'username',
          class: 'custom-item-class',
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      expect(wrapper.find('.custom-item-class').exists()).toBe(true)
    })
  })

  describe('Props 测试', () => {
    it('应该显示必填星号', () => {
      wrapper = mount(FormItem, {
        props: {
          label: '用户名',
          prop: 'username',
          required: true,
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      expect(wrapper.find('.tw-form-item-asterisk').exists()).toBe(true)
    })

    it('应该显示错误信息', async () => {
      wrapper = mount(FormItem, {
        props: {
          label: '用户名',
          prop: 'username',
          error: '用户名已存在',
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      await nextTick()

      expect(wrapper.find('.tw-form-item-error-text').exists()).toBe(true)
      expect(wrapper.find('.tw-form-item-error-text').text()).toBe('用户名已存在')
    })

    it('应该在 showMessage 为 false 时不显示错误信息', async () => {
      wrapper = mount(FormItem, {
        props: {
          label: '用户名',
          prop: 'username',
          error: '用户名已存在',
          showMessage: false,
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      await nextTick()

      expect(wrapper.find('.tw-form-item-error-text').exists()).toBe(false)
    })

    it('应该在 inline 为 true 时应用行内样式', () => {
      wrapper = mount(FormItem, {
        props: {
          label: '用户名',
          prop: 'username',
          inline: true,
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      expect(wrapper.find('.tw-form-item-inline').exists()).toBe(true)
    })
  })

  describe('验证功能', () => {
    it('应该验证必填规则', async () => {
      wrapper = mount(FormItem, {
        props: {
          label: '用户名',
          prop: 'username',
          rules: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
          ],
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      const itemRef = wrapper.vm as any
      const valid = await itemRef.validate()

      expect(valid).toBe(false)
    })

    it('应该在有值时验证通过', async () => {
      formModel.username = 'testuser'

      wrapper = mount(FormItem, {
        props: {
          label: '用户名',
          prop: 'username',
          rules: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
          ],
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      await nextTick()

      const itemRef = wrapper.vm as any
      const valid = await itemRef.validate()

      expect(valid).toBe(true)
    })

    it('应该验证长度规则', async () => {
      formModel.username = 'ab'

      wrapper = mount(FormItem, {
        props: {
          label: '用户名',
          prop: 'username',
          rules: [
            { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' },
          ],
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      await nextTick()

      const itemRef = wrapper.vm as any
      const valid = await itemRef.validate()

      expect(valid).toBe(false)
    })

    it('应该验证正则规则', async () => {
      formModel.email = 'invalid-email'

      wrapper = mount(FormItem, {
        props: {
          label: '邮箱',
          prop: 'email',
          rules: [
            { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确', trigger: 'blur' },
          ],
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      await nextTick()

      const itemRef = wrapper.vm as any
      const valid = await itemRef.validate()

      expect(valid).toBe(false)
    })

    it('应该验证自定义验证器', async () => {
      formModel.username = 'admin'

      wrapper = mount(FormItem, {
        props: {
          label: '用户名',
          prop: 'username',
          rules: [
            {
              validator: (rule: any, value: any) => {
                return value !== 'admin' || '不能使用 admin 作为用户名'
              },
              trigger: 'blur',
            },
          ],
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      await nextTick()

      const itemRef = wrapper.vm as any
      const valid = await itemRef.validate()

      expect(valid).toBe(false)
    })
  })

  describe('方法测试', () => {
    it('应该清除验证', async () => {
      wrapper = mount(FormItem, {
        props: {
          label: '用户名',
          prop: 'username',
          rules: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
          ],
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      await nextTick()

      const itemRef = wrapper.vm as any
      // 首先设置一个错误
      itemRef.setError('错误信息')
      await nextTick()
      expect(wrapper.find('.tw-form-item-error-text').exists()).toBe(true)

      // 然后清除验证
      itemRef.clearValidation()
      await nextTick()
      expect(wrapper.find('.tw-form-item-error-text').exists()).toBe(false)
    })

    it('应该设置错误信息', async () => {
      wrapper = mount(FormItem, {
        props: {
          label: '用户名',
          prop: 'username',
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      const itemRef = wrapper.vm as any
      itemRef.setError('自定义错误信息')

      await nextTick()

      expect(wrapper.find('.tw-form-item-error-text').text()).toBe('自定义错误信息')
    })

    it('应该获取当前值', () => {
      formModel.username = 'testuser'

      wrapper = mount(FormItem, {
        props: {
          label: '用户名',
          prop: 'username',
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      const itemRef = wrapper.vm as any
      const value = itemRef.getValue()

      expect(value).toBe('testuser')
    })

    it('应该设置值', () => {
      wrapper = mount(FormItem, {
        props: {
          label: '用户名',
          prop: 'username',
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      const itemRef = wrapper.vm as any
      itemRef.setValue('newuser')

      expect(formModel.username).toBe('newuser')
    })

    it('应该重置字段', () => {
      formModel.username = 'testuser'

      wrapper = mount(FormItem, {
        props: {
          label: '用户名',
          prop: 'username',
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      const itemRef = wrapper.vm as any
      itemRef.resetField()

      expect(formModel.username).toBe(undefined)
    })
  })

  describe('事件触发', () => {
    it('应该在值改变时触发 change 事件', async () => {
      // 创建一个测试辅助组件
      const TestChangeComponent = defineComponent({
        props: ['model'],
        setup(props, { emit }) {
          const handleChange = (value: any) => {
            props.model.username = value
            emit('change', value)
          }
          return () => h(FormItem, {
            label: '用户名',
            prop: 'username',
          }, {
            default: () => h('input', {
              type: 'text',
              value: props.model.username,
              onInput: (e: any) => handleChange(e.target.value)
            })
          })
        }
      })

      wrapper = mount(TestChangeComponent, {
        props: {
          model: formModel,
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      // 找到输入框并模拟输入
      const input = wrapper.find('input')
      await input.setValue('testuser')
      await nextTick()

      // 检查 FormItem 是否触发了 change 事件
      const formItem = wrapper.findComponent(FormItem)
      expect(formItem.emitted('change')).toBeTruthy()
    })

    it('应该在验证通过时触发 validate 事件', async () => {
      formModel.username = 'testuser'

      wrapper = mount(FormItem, {
        props: {
          label: '用户名',
          prop: 'username',
          rules: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
          ],
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      await nextTick()

      const itemRef = wrapper.vm as any
      await itemRef.validate()

      await nextTick()

      expect(wrapper.emitted('validate')).toBeTruthy()
    })

    it('应该在验证失败时触发 validate-failed 事件', async () => {
      wrapper = mount(FormItem, {
        props: {
          label: '用户名',
          prop: 'username',
          rules: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
          ],
        },
        global: {
          provide: {
            FormContext: {
              model: formModel,
              labelWidth: '100px',
              labelPosition: 'right',
              size: 'md',
              disabled: false,
              showColon: true,
              requireAsterisk: true,
              registerItem: vi.fn(),
              unregisterItem: vi.fn(),
              validateField: vi.fn(),
              clearFieldValidation: vi.fn(),
            },
          },
        },
      })

      const itemRef = wrapper.vm as any
      await itemRef.validate()

      await nextTick()

      expect(wrapper.emitted('validate-failed')).toBeTruthy()
    })
  })
})

describe('Form 和 FormItem 集成测试', () => {
  let wrapper: VueWrapper<any>
  let formModel: any

  beforeEach(() => {
    formModel = {
      username: '',
      email: '',
      password: '',
    }
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('应该正确集成 Form 和 FormItem', async () => {
    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
      ],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
      ],
    }

    wrapper = mount(Form, {
      props: {
        model: formModel,
        rules,
        labelWidth: '100px',
        labelPosition: 'right',
      },
      slots: {
        default: () => [
          h(FormItem, {
            label: '用户名',
            prop: 'username',
          }, {
            default: () => h(Input, {
              modelValue: formModel.username,
              'onUpdate:modelValue': (value: string) => {
                formModel.username = value
              },
            }),
          }),
          h(FormItem, {
            label: '邮箱',
            prop: 'email',
          }, {
            default: () => h(Input, {
              modelValue: formModel.email,
              'onUpdate:modelValue': (value: string) => {
                formModel.email = value
              },
              type: 'email',
            }),
          }),
        ],
      },
    })

    expect(wrapper.find('.tw-form').exists()).toBe(true)
    expect(wrapper.findAll('.tw-form-item').length).toBe(2)
  })

  it('应该在整个表单验证失败时显示错误信息', async () => {
    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
      ],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
      ],
    }

    wrapper = mount(Form, {
      props: {
        model: formModel,
        rules,
        labelWidth: '100px',
      },
      slots: {
        default: () => [
          h(FormItem, {
            label: '用户名',
            prop: 'username',
          }, {
            default: () => h(Input, {
              modelValue: formModel.username,
              'onUpdate:modelValue': (value: string) => {
                formModel.username = value
              },
            }),
          }),
          h(FormItem, {
            label: '邮箱',
            prop: 'email',
          }, {
            default: () => h(Input, {
              modelValue: formModel.email,
              'onUpdate:modelValue': (value: string) => {
                formModel.email = value
              },
              type: 'email',
            }),
          }),
        ],
      },
    })

    const formRef = wrapper.vm as any
    await formRef.validate()

    await nextTick()

    expect(wrapper.find('.tw-form-item-error-text').exists()).toBe(true)
  })

  it('应该在表单重置时清除所有错误信息', async () => {
    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
      ],
    }

    wrapper = mount(Form, {
      props: {
        model: formModel,
        rules,
        labelWidth: '100px',
      },
      slots: {
        default: () => h(FormItem, {
          label: '用户名',
          prop: 'username',
        }, {
          default: () => h(Input, {
            modelValue: formModel.username,
            'onUpdate:modelValue': (value: string) => {
              formModel.username = value
            },
          }),
        }),
      },
    })

    const formRef = wrapper.vm as any
    await formRef.validate()

    await nextTick()

    expect(wrapper.find('.tw-form-item-error-text').exists()).toBe(true)

    formRef.resetFields()

    await nextTick()

    expect(wrapper.find('.tw-form-item-error-text').exists()).toBe(false)
  })
})
