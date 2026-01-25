# Slider 滑块组件任务背景

## 任务目标
为 Tailwind UI 设计系统创建 Slider 滑块组件。

## 组件规格

### Slider.vue
滑块选择组件，支持单滑块和双滑块模式。

**Props:**
- `modelValue`: number | number[] - v-model 绑定值
- `min`: number - 最小值，默认 0
- `max`: number - 最大值，默认 100
- `step`: number - 步长，默认 1
- `disabled`: boolean - 禁用状态
- `range`: boolean - 双滑块模式
- `vertical`: boolean - 垂直模式
- `height`: string - 垂直模式高度
- `showTooltip`: boolean - 显示提示
- `formatTooltip`: (value: number) => string - 格式化提示
- `marks`: Record<number, string> - 刻度标记

**Events:**
- `update:modelValue` - 值更新
- `change` - 值改变

## 技术要求

1. 组件文件: `src/design-system/form/Slider/Slider.vue`
2. 类型定义: `src/design-system/form/Slider/types.ts`
3. Storybook: `src/design-system/form/Slider/Slider.stories.ts`
4. 单元测试: `tests/unit/design-system/form/Slider.test.ts`
5. README 文档: `src/design-system/form/Slider/README.md`
6. 导出文件: `src/design-system/form/Slider/index.ts`
7. 更新主导出: `src/design-system/form/index.ts`

## 参考组件
参考 Switch 组件的开发模式和代码风格。

## 项目路径
E:\Github\Qingyu\Qingyu_fronted
