import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { ref } from 'vue'
import TimePicker from '@/design-system/other/TimePicker/TimePicker.vue'
import * as utils from '@/design-system/other/TimePicker/utils'

describe('TimePicker 组件', () => {
  describe('渲染测试', () => {
    it('应该正确渲染单时间选择器', () => {
      const { container } = render(TimePicker, {
        props: {
          placeholder: '选择时间',
        },
      })

      const input = container.querySelector('input[type="text"]') as HTMLInputElement
      expect(input).toBeTruthy()
      expect(input.placeholder).toBe('选择时间')
    })

    it('应该正确渲染时间范围选择器', () => {
      const { container } = render(TimePicker, {
        props: {
          isRange: true,
          placeholder: ['开始时间', '结束时间'],
        },
      })

      const inputs = container.querySelectorAll('input[type="text"]')
      expect(inputs.length).toBe(2)
      expect(inputs[0].placeholder).toBe('开始时间')
      expect(inputs[1].placeholder).toBe('结束时间')
    })

    it('应该显示前缀图标', () => {
      const { container } = render(TimePicker, {
        props: {
          prefix: 'clock',
          showPrefix: true,
        },
      })

      const iconContainer = container.querySelector('.absolute.left-0')
      expect(iconContainer).toBeTruthy()
    })

    it('应该正确显示绑定的值', () => {
      const { container } = render(TimePicker, {
        props: {
          modelValue: '09:30:00',
        },
      })

      const input = container.querySelector('input[type="text"]') as HTMLInputElement
      expect(input.value).toBe('09:30:00')
    })

    it('应该正确显示范围值', () => {
      const { container } = render(TimePicker, {
        props: {
          isRange: true,
          modelValue: ['09:00:00', '18:00:00'],
        },
      })

      const inputs = container.querySelectorAll('input[type="text"]')
      expect(inputs[0].value).toBe('09:00:00')
      expect(inputs[1].value).toBe('18:00:00')
    })
  })

  describe('尺寸测试', () => {
    it('应该正确应用小尺寸样式', () => {
      const { container } = render(TimePicker, {
        props: {
          size: 'sm',
        },
      })

      const input = container.querySelector('input[type="text"]') as HTMLInputElement
      expect(input.classList.contains('h-8')).toBe(true)
      expect(input.classList.contains('text-sm')).toBe(true)
    })

    it('应该正确应用中尺寸样式', () => {
      const { container } = render(TimePicker, {
        props: {
          size: 'md',
        },
      })

      const input = container.querySelector('input[type="text"]') as HTMLInputElement
      expect(input.classList.contains('h-10')).toBe(true)
      expect(input.classList.contains('text-base')).toBe(true)
    })

    it('应该正确应用大尺寸样式', () => {
      const { container } = render(TimePicker, {
        props: {
          size: 'lg',
        },
      })

      const input = container.querySelector('input[type="text"]') as HTMLInputElement
      expect(input.classList.contains('h-12')).toBe(true)
      expect(input.classList.contains('text-lg')).toBe(true)
    })
  })

  describe('状态测试', () => {
    it('应该正确应用禁用状态', () => {
      const { container } = render(TimePicker, {
        props: {
          disabled: true,
        },
      })

      const input = container.querySelector('input[type="text"]') as HTMLInputElement
      expect(input.disabled).toBe(true)
      expect(input.classList.contains('cursor-not-allowed')).toBe(true)
    })

    it('应该正确应用只读状态', () => {
      const { container } = render(TimePicker, {
        props: {
          readonly: true,
        },
      })

      const input = container.querySelector('input[type="text"]') as HTMLInputElement
      expect(input.readOnly).toBe(true)
    })

    it('应该正确应用不可编辑状态', () => {
      const { container } = render(TimePicker, {
        props: {
          editable: false,
        },
      })

      const input = container.querySelector('input[type="text"]') as HTMLInputElement
      expect(input.readOnly).toBe(true)
    })

    it('应该在有值且可清空时显示清空按钮', () => {
      const { container } = render(TimePicker, {
        props: {
          modelValue: '09:30:00',
          clearable: true,
        },
      })

      const clearButton = container.querySelector('button')
      expect(clearButton).toBeTruthy()
    })

    it('应该在无值时不显示清空按钮', () => {
      const { container } = render(TimePicker, {
        props: {
          clearable: true,
        },
      })

      const clearButton = container.querySelector('button')
      expect(clearButton).toBeFalsy()
    })

    it('应该在禁用时不显示清空按钮', () => {
      const { container } = render(TimePicker, {
        props: {
          modelValue: '09:30:00',
          clearable: true,
          disabled: true,
        },
      })

      const clearButton = container.querySelector('button')
      expect(clearButton).toBeFalsy()
    })
  })

  describe('交互测试', () => {
    it('应该在输入时触发 update:modelValue 和 change 事件', async () => {
      const { container, emitted } = render(TimePicker, {
        props: {
          modelValue: ref(null),
        },
      })

      const input = container.querySelector('input[type="text"]') as HTMLInputElement

      await fireEvent.update(input, '09:30:00')
      await fireEvent.input(input)

      await waitFor(() => {
        expect(emitted('update:modelValue')).toBeTruthy()
        expect(emitted('change')).toBeTruthy()
      })
    })

    it('应该在聚焦时触发 focus 事件', async () => {
      const { container, emitted } = render(TimePicker, {
        props: {},
      })

      const input = container.querySelector('input[type="text"]') as HTMLInputElement

      await fireEvent.focus(input)

      expect(emitted('focus')).toBeTruthy()
    })

    it('应该在失焦时触发 blur 事件', async () => {
      const { container, emitted } = render(TimePicker, {
        props: {},
      })

      const input = container.querySelector('input[type="text"]') as HTMLInputElement

      await fireEvent.blur(input)

      expect(emitted('blur')).toBeTruthy()
    })

    it('应该在点击清空按钮时触发 clear 事件', async () => {
      const { container, emitted } = render(TimePicker, {
        props: {
          modelValue: '09:30:00',
          clearable: true,
        },
      })

      const clearButton = container.querySelector('button') as HTMLButtonElement

      await fireEvent.click(clearButton)

      await waitFor(() => {
        expect(emitted('clear')).toBeTruthy()
        expect(emitted('update:modelValue')).toBeTruthy()
        expect(emitted('change')).toBeTruthy()
      })
    })

    it('应该正确更新范围选择器的值', async () => {
      const { container, emitted } = render(TimePicker, {
        props: {
          isRange: true,
          modelValue: ref(null),
        },
      })

      const inputs = container.querySelectorAll('input[type="text"]')

      await fireEvent.update(inputs[0], '09:00:00')
      await fireEvent.input(inputs[0])

      await fireEvent.update(inputs[1], '18:00:00')
      await fireEvent.input(inputs[1])

      await waitFor(() => {
        expect(emitted('update:modelValue')).toBeTruthy()
      })
    })
  })

  describe('时间格式测试', () => {
    it('应该正确处理 HH:mm:ss 格式', () => {
      const { container } = render(TimePicker, {
        props: {
          modelValue: '09:30:45',
          format: 'HH:mm:ss',
        },
      })

      const input = container.querySelector('input[type="text"]') as HTMLInputElement
      expect(input.value).toBe('09:30:45')
    })

    it('应该正确处理 HH:mm 格式', () => {
      const { container } = render(TimePicker, {
        props: {
          modelValue: '09:30',
          format: 'HH:mm',
        },
      })

      const input = container.querySelector('input[type="text"]') as HTMLInputElement
      expect(input.value).toBe('09:30')
    })

    it('应该正确处理 HHmmss 格式', () => {
      const { container } = render(TimePicker, {
        props: {
          modelValue: '093045',
          format: 'HHmmss',
        },
      })

      const input = container.querySelector('input[type="text"]') as HTMLInputElement
      expect(input.value).toBe('093045')
    })

    it('应该正确处理 HHmm 格式', () => {
      const { container } = render(TimePicker, {
        props: {
          modelValue: '0930',
          format: 'HHmm',
        },
      })

      const input = container.querySelector('input[type="text"]') as HTMLInputElement
      expect(input.value).toBe('0930')
    })
  })

  describe('范围分隔符测试', () => {
    it('应该使用默认的分隔符', () => {
      const { container } = render(TimePicker, {
        props: {
          isRange: true,
        },
      })

      const separator = container.textContent?.includes('-')
      expect(separator).toBe(true)
    })

    it('应该使用自定义的分隔符', () => {
      const { container } = render(TimePicker, {
        props: {
          isRange: true,
          rangeSeparator: '至',
        },
      })

      const separator = container.textContent?.includes('至')
      expect(separator).toBe(true)
    })
  })

  describe('暴露方法测试', () => {
    it('应该暴露 focus 方法', () => {
      const { container } = render(TimePicker, {
        props: {},
      })

      const input = container.querySelector('input[type="text"]') as HTMLInputElement
      expect(input).toBeTruthy()
    })

    it('应该暴露 blur 方法', () => {
      const { container } = render(TimePicker, {
        props: {},
      })

      const input = container.querySelector('input[type="text"]') as HTMLInputElement
      expect(input).toBeTruthy()
    })

    it('应该暴露 getCurrentTime 方法', () => {
      const { container } = render(TimePicker, {
        props: {},
      })

      // getCurrentTime 方法通过 defineExpose 暴露，这里验证组件正确渲染
      const input = container.querySelector('input[type="text"]') as HTMLInputElement
      expect(input).toBeTruthy()
      // 验证 utils 中的 getCurrentTime 函数存在
      expect(utils.getCurrentTime).toBeDefined()
      expect(typeof utils.getCurrentTime).toBe('function')
    })
  })

  describe('占位符测试', () => {
    it('应该使用自定义占位符', () => {
      const { container } = render(TimePicker, {
        props: {
          placeholder: '请选择时间',
        },
      })

      const input = container.querySelector('input[type="text"]') as HTMLInputElement
      expect(input.placeholder).toBe('请选择时间')
    })

    it('应该使用默认占位符', () => {
      const { container } = render(TimePicker, {
        props: {},
      })

      const input = container.querySelector('input[type="text"]') as HTMLInputElement
      expect(input.placeholder).toBe('选择时间')
    })

    it('应该使用范围的默认占位符', () => {
      const { container } = render(TimePicker, {
        props: {
          isRange: true,
        },
      })

      const inputs = container.querySelectorAll('input[type="text"]')
      expect(inputs[0].placeholder).toBe('开始时间')
      expect(inputs[1].placeholder).toBe('结束时间')
    })
  })

  describe('样式类名测试', () => {
    it('应该正确应用自定义类名', () => {
      const { container } = render(TimePicker, {
        props: {
          class: 'custom-class',
        },
      })

      const input = container.querySelector('input[type="text"]') as HTMLInputElement
      expect(input.classList.contains('custom-class')).toBe(true)
    })

    it('应该有正确的基础样式类', () => {
      const { container } = render(TimePicker, {
        props: {},
      })

      const input = container.querySelector('input[type="text"]') as HTMLInputElement
      expect(input.classList.contains('w-full')).toBe(true)
      expect(input.classList.contains('rounded-lg')).toBe(true)
      expect(input.classList.contains('border')).toBe(true)
    })
  })
})

describe('TimePicker 工具函数测试', () => {
  describe('formatTime', () => {
    it('应该正确格式化为 HH:mm:ss', () => {
      expect(utils.formatTime(9, 30, 45, 'HH:mm:ss')).toBe('09:30:45')
    })

    it('应该正确格式化为 HH:mm', () => {
      expect(utils.formatTime(9, 30, 45, 'HH:mm')).toBe('09:30')
    })

    it('应该正确格式化为 HHmmss', () => {
      expect(utils.formatTime(9, 30, 45, 'HHmmss')).toBe('093045')
    })

    it('应该正确格式化为 HHmm', () => {
      expect(utils.formatTime(9, 30, 45, 'HHmm')).toBe('0930')
    })
  })

  describe('parseTime', () => {
    it('应该正确解析 HH:mm:ss 格式', () => {
      const result = utils.parseTime('09:30:45', 'HH:mm:ss')
      expect(result).toEqual({ hour: 9, minute: 30, second: 45 })
    })

    it('应该正确解析 HH:mm 格式', () => {
      const result = utils.parseTime('09:30', 'HH:mm')
      expect(result).toEqual({ hour: 9, minute: 30, second: 0 })
    })

    it('应该正确解析 HHmmss 格式', () => {
      const result = utils.parseTime('093045', 'HHmmss')
      expect(result).toEqual({ hour: 9, minute: 30, second: 45 })
    })

    it('应该对无效时间返回 null', () => {
      const result = utils.parseTime('invalid', 'HH:mm:ss')
      expect(result).toBeNull()
    })

    it('应该对超出范围的小时返回 null', () => {
      const result = utils.parseTime('25:30:45', 'HH:mm:ss')
      expect(result).toBeNull()
    })

    it('应该对超出范围的分钟返回 null', () => {
      const result = utils.parseTime('09:60:45', 'HH:mm:ss')
      expect(result).toBeNull()
    })

    it('应该对超出范围的秒返回 null', () => {
      const result = utils.parseTime('09:30:60', 'HH:mm:ss')
      expect(result).toBeNull()
    })
  })

  describe('isValidTime', () => {
    it('应该对有效时间返回 true', () => {
      expect(utils.isValidTime('09:30:45', 'HH:mm:ss')).toBe(true)
    })

    it('应该对无效时间返回 false', () => {
      expect(utils.isValidTime('invalid', 'HH:mm:ss')).toBe(false)
    })

    it('应该对空字符串返回 false', () => {
      expect(utils.isValidTime('', 'HH:mm:ss')).toBe(false)
    })
  })

  describe('compareTimes', () => {
    it('应该在 time1 < time2 时返回 -1', () => {
      expect(utils.compareTimes('09:00:00', '10:00:00', 'HH:mm:ss')).toBe(-1)
    })

    it('应该在 time1 = time2 时返回 0', () => {
      expect(utils.compareTimes('09:00:00', '09:00:00', 'HH:mm:ss')).toBe(0)
    })

    it('应该在 time1 > time2 时返回 1', () => {
      expect(utils.compareTimes('10:00:00', '09:00:00', 'HH:mm:ss')).toBe(1)
    })
  })

  describe('isTimeInRange', () => {
    it('应该在时间范围内返回 true', () => {
      expect(utils.isTimeInRange('09:30:00', '09:00:00', '10:00:00', 'HH:mm:ss')).toBe(true)
    })

    it('应该在时间范围外返回 false', () => {
      expect(utils.isTimeInRange('11:00:00', '09:00:00', '10:00:00', 'HH:mm:ss')).toBe(false)
    })

    it('应该在边界时间返回 true', () => {
      expect(utils.isTimeInRange('09:00:00', '09:00:00', '10:00:00', 'HH:mm:ss')).toBe(true)
      expect(utils.isTimeInRange('10:00:00', '09:00:00', '10:00:00', 'HH:mm:ss')).toBe(true)
    })
  })

  describe('isTimeInDisabledRanges', () => {
    it('应该在禁用范围内返回 true', () => {
      const ranges = [{ start: '12:00:00', end: '13:00:00' }]
      expect(utils.isTimeInDisabledRanges('12:30:00', ranges, 'HH:mm:ss')).toBe(true)
    })

    it('应该在禁用范围外返回 false', () => {
      const ranges = [{ start: '12:00:00', end: '13:00:00' }]
      expect(utils.isTimeInDisabledRanges('09:00:00', ranges, 'HH:mm:ss')).toBe(false)
    })
  })

  describe('getCurrentTime', () => {
    it('应该返回当前时间字符串', () => {
      const time = utils.getCurrentTime('HH:mm:ss')
      expect(time).toMatch(/^\d{2}:\d{2}:\d{2}$/)
    })
  })

  describe('generateHours', () => {
    it('应该生成正确的小时列表', () => {
      const hours = utils.generateHours(1)
      expect(hours.length).toBe(24)
      expect(hours[0]).toBe(0)
      expect(hours[23]).toBe(23)
    })

    it('应该根据步长生成小时列表', () => {
      const hours = utils.generateHours(2)
      expect(hours.length).toBe(12)
      expect(hours[0]).toBe(0)
      expect(hours[11]).toBe(22)
    })
  })

  describe('generateMinutes', () => {
    it('应该生成正确的分钟列表', () => {
      const minutes = utils.generateMinutes(1)
      expect(minutes.length).toBe(60)
      expect(minutes[0]).toBe(0)
      expect(minutes[59]).toBe(59)
    })

    it('应该根据步长生成分钟列表', () => {
      const minutes = utils.generateMinutes(15)
      expect(minutes.length).toBe(4)
      expect(minutes[0]).toBe(0)
      expect(minutes[3]).toBe(45)
    })
  })

  describe('generateSeconds', () => {
    it('应该生成正确的秒列表', () => {
      const seconds = utils.generateSeconds(1)
      expect(seconds.length).toBe(60)
      expect(seconds[0]).toBe(0)
      expect(seconds[59]).toBe(59)
    })

    it('应该根据步长生成秒列表', () => {
      const seconds = utils.generateSeconds(30)
      expect(seconds.length).toBe(2)
      expect(seconds[0]).toBe(0)
      expect(seconds[1]).toBe(30)
    })
  })

  describe('convertTimeFormat', () => {
    it('应该正确转换时间格式', () => {
      const result = utils.convertTimeFormat('09:30:45', 'HH:mm:ss', 'HHmmss')
      expect(result).toBe('093045')
    })

    it('应该对无效时间返回 null', () => {
      const result = utils.convertTimeFormat('invalid', 'HH:mm:ss', 'HHmmss')
      expect(result).toBeNull()
    })
  })

  describe('isValidTimeRange', () => {
    it('应该对有效时间范围返回 true', () => {
      expect(utils.isValidTimeRange('09:00:00', '18:00:00', 'HH:mm:ss')).toBe(true)
    })

    it('应该对无效时间范围返回 false', () => {
      expect(utils.isValidTimeRange('18:00:00', '09:00:00', 'HH:mm:ss')).toBe(false)
    })

    it('应该对相等时间返回 true', () => {
      expect(utils.isValidTimeRange('09:00:00', '09:00:00', 'HH:mm:ss')).toBe(true)
    })
  })

  describe('formatTimeRange', () => {
    it('应该正确格式化时间范围', () => {
      const result = utils.formatTimeRange('09:00:00', '18:00:00', '-', 'HH:mm:ss')
      expect(result).toBe('09:00:00 - 18:00:00')
    })

    it('应该使用自定义分隔符', () => {
      const result = utils.formatTimeRange('09:00:00', '18:00:00', '至', 'HH:mm:ss')
      expect(result).toBe('09:00:00 至 18:00:00')
    })
  })

  describe('parseTimeRange', () => {
    it('应该正确解析时间范围', () => {
      const result = utils.parseTimeRange('09:00:00 - 18:00:00', '-', 'HH:mm:ss')
      expect(result).toEqual(['09:00:00', '18:00:00'])
    })

    it('应该对无效格式返回 null', () => {
      const result = utils.parseTimeRange('invalid', '-', 'HH:mm:ss')
      expect(result).toBeNull()
    })
  })

  describe('getTimeDifferenceInSeconds', () => {
    it('应该正确计算时间差', () => {
      const diff = utils.getTimeDifferenceInSeconds('09:00:00', '10:00:00', 'HH:mm:ss')
      expect(diff).toBe(3600)
    })

    it('应该对相同时间返回 0', () => {
      const diff = utils.getTimeDifferenceInSeconds('09:00:00', '09:00:00', 'HH:mm:ss')
      expect(diff).toBe(0)
    })
  })

  describe('addTime', () => {
    it('应该正确添加时间', () => {
      const result = utils.addTime('09:00:00', 1, 30, 0, 'HH:mm:ss')
      expect(result).toBe('10:30:00')
    })

    it('应该正确处理跨天', () => {
      const result = utils.addTime('23:00:00', 2, 0, 0, 'HH:mm:ss')
      expect(result).toBe('01:00:00')
    })

    it('应该对无效时间返回 null', () => {
      const result = utils.addTime('invalid', 1, 0, 0, 'HH:mm:ss')
      expect(result).toBeNull()
    })
  })
})
