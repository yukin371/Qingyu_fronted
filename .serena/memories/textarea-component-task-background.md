# Textarea 组件开发任务背景

## 任务目标
为 Tailwind UI 设计系统创建 Textarea 多行文本框组件。

## 组件规格

### Textarea.vue
一个支持多行文本输入的组件。

**Props:**
- `modelValue`: string - v-model 绑定值
- `rows`: number - 显示行数，默认 3
- `maxlength`: number - 最大长度
- `showCount`: boolean - 显示字数统计
- `resize`: 'none' | 'both' | 'horizontal' | 'vertical' - 调整大小
- `disabled`: boolean - 禁用状态
- `readonly`: boolean - 只读状态
- `error`: boolean - 错误状态
- `placeholder`: string - 占位符
- `autofocus`: boolean - 自动聚焦

**Events:**
- `update:modelValue` - 值更新
- `focus` - 获得焦点
- `blur` - 失去焦点

## 技术要求

1. **组件文件**: `src/design-system/base/Textarea/Textarea.vue`
2. **类型定义**: `src/design-system/base/Textarea/types.ts`
3. **Storybook**: `src/design-system/base/Textarea/Textarea.stories.ts`
4. **单元测试**: `tests/unit/design-system/base/Textarea.test.ts`
5. **README 文档**: `src/design-system/base/Textarea/README.md`
6. **导出**: `src/design-system/base/Textarea/index.ts`
7. **更新主导出**: `src/design-system/base/index.ts`

## 参考组件
参考 `src/design-system/base/Button` 组件的开发模式，包括:
- 使用 CVA (class-variance-authority) 管理样式变体
- 完整的 TypeScript 类型定义
- 详细的 README 文档
- Storybook 故事示例
- 单元测试覆盖

## 项目路径
E:\Github\Qingyu\Qingyu_fronted
