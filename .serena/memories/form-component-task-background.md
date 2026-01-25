# Form 和 FormItem 组件开发任务背景

## 任务目标
为 Tailwind UI 设计系统创建 Form 和 FormItem 表单容器组件，实现表单验证功能。

## 项目信息
- 项目路径: E:\Github\Qingyu\Qingyu_fronted
- 当前分支: feature/frontend-tailwind-refactor
- 设计系统: src/design-system

## 参考组件
参考 Input 组件的开发模式：
- 类型定义: types.ts - 使用 TypeScript 接口定义 Props 和 Events
- 主组件: ComponentName.vue - 使用 CVA (class-variance-authority) 管理样式变体
- Storybook: ComponentName.stories.ts - 完整的交互式文档
- README: README.md - 详细的 API 文档和使用示例
- 导出: index.ts - 组件导出
- 测试: tests/unit/design-system/component/ComponentName.test.ts - Vitest 单元测试

## 技术栈
- Vue 3 + Composition API
- TypeScript
- Tailwind CSS
- CVA (class-variance-authority)
- Vitest + @vue/test-utils
- Storybook

## 组件规格

### Form.vue
表单容器组件，管理表单状态和验证。

**Props:**
- model: Record<string, any> - 表单数据对象
- rules: Record<string, Rule[]> - 验证规则
- labelWidth: string - 标签宽度
- labelPosition: 'left' | 'right' | 'top' - 标签位置
- size: 'sm' | 'md' | 'lg' - 统一尺寸
- disabled: boolean - 全局禁用
- validateOnRuleChange: boolean - 规则改变时验证

**Methods:**
- validate() - 验证整个表单
- validateField(props) - 验证指定字段
- resetFields() - 重置表单
- clearValidation() - 清除验证

**Events:**
- validate - 验证成功

### FormItem.vue
表单项组件。

**Props:**
- prop: string - 字段名
- label: string - 标签文本
- labelWidth: string - 标签宽度
- required: boolean - 是否必填
- rules: Rule[] - 验证规则
- error: string - 错误信息
- showMessage: boolean - 是否显示错误信息

**Slots:**
- label - 自定义标签
- default - 表单控件
- error - 自定义错误信息

## 文件结构
```
src/design-system/form/Form/
├── Form.vue          # 主组件
├── FormItem.vue      # 表单项组件
├── types.ts          # 类型定义
├── Form.stories.ts   # Storybook 故事
├── README.md         # 组件文档
└── index.ts          # 导出文件
```

## 验证规则类型
参考 Element Plus 的验证规则设计：
```typescript
interface Rule {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change'
  min?: number
  max?: number
  len?: number
  pattern?: RegExp
  validator?: (rule: Rule, value: any) => boolean | Promise<boolean>
}
```

## 验收标准
1. Form 组件可以正常包裹表单项
2. FormItem 可以正确显示标签和错误信息
3. 表单验证功能完整
4. 支持嵌套表单验证
5. 测试覆盖率 > 80%
6. Storybook 文档完整
