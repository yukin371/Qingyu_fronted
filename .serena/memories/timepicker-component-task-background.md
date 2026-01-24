# TimePicker 时间选择器组件开发任务

## 任务目标
在 `Qingyu_fronted/src/design-system/other/` 下开发 TimePicker 时间选择器组件

## 技术栈
- Vue 3 + TypeScript + `<script setup>`
- Tailwind CSS 3.3.6
- CVA (class-variance-authority) 用于变体管理
- Storybook 8.6 用于组件文档
- Vitest + @testing-library/vue 用于测试

## 组件功能需求

### 基本功能
1. v-model/modelValue: 绑定值
2. readonly: 只读
3. disabled: 禁用
4. editable: 可输入
5. clearable: 可清除
6. size: 尺寸 (small, default, large)
7. placeholder: 占位文本
8. start: 起始时间
9. end: 结束时间
10. step: 时间间隔
11. format: 时间格式

### 范围选择
1. isRange: 是否范围选择
2. rangeSeparator: 范围分隔符

### 事件
1. change: 值变化
2. blur: 失焦
3. focus: 聚焦

## 目录结构
```
TimePicker/
  TimePicker.vue        # 主组件
  types.ts              # 类型定义
  TimePicker.stories.ts # Storybook 故事
  README.md             # 组件文档
  index.ts              # 导出
  utils.ts              # 时间工具函数
  TimePicker.test.ts    # 单元测试
```

## 验收标准
1. 组件功能完整
2. 至少10个 Storybook 故事
3. 至少30个单元测试
4. 测试通过率 ≥ 90%
5. README 文档完整
