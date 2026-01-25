# Input 组件开发任务背景

## 任务时间
2026-01-23

## 任务目标
为 Tailwind UI 设计系统创建 Input 输入框组件，作为表单组件系列的一部分。

## 组件规格

### Input.vue
一个功能完整的输入框组件。

**Props:**
- `modelValue`: string | number - v-model 绑定值
- `type`: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' - 输入类型
- `size`: 'sm' | 'md' | 'lg' - 尺寸
- `placeholder`: string - 占位符
- `disabled`: boolean - 禁用状态
- `readonly`: boolean - 只读状态
- `error`: boolean - 错误状态
- `maxlength`: number - 最大长度
- `showCount`: boolean - 显示字数统计
- `prefix`: string - 前缀图标
- `suffix`: string - 后缀图标
- `clearable`: boolean - 可清空

**Events:**
- `update:modelValue` - 值更新
- `focus` - 获得焦点
- `blur` - 失去焦点
- `change` - 值改变
- `clear` - 清空

**Slots:**
- `prefix` - 前缀内容
- `suffix` - 后缀内容
- `prepend` - 前置插槽
- `append` - 后置插槽

## 技术要求

1. **组件文件**: `src/design-system/form/Input/Input.vue`
2. **类型定义**: `src/design-system/form/Input/types.ts`
3. **Storybook**: `src/design-system/form/Input/Input.stories.ts`
4. **单元测试**: `tests/unit/design-system/form/Input.test.ts`
5. **README 文档**: `src/design-system/form/Input/README.md`
6. **导出**: `src/design-system/form/Input/index.ts`
7. **更新主导出**: `src/design-system/form/index.ts`

## 设计规范

### 尺寸规范
- **sm**: h-8 px-2 py-1 text-sm
- **md**: h-10 px-3 py-2 text-base (默认)
- **lg**: h-12 px-4 py-3 text-lg

### 样式规范
- **基础样式**: w-full rounded-lg border transition-all duration-200
- **默认状态**: border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
- **错误状态**: border-red-500 focus:border-red-500 focus:ring-red-500/20
- **禁用状态**: bg-slate-100 cursor-not-allowed opacity-60

## 参考组件
- Tag 组件: 参考其 CVA 变体管理、类型定义、Storybook 格式、测试方法
- Badge 组件: 参考其完整的测试覆盖率和文档结构

## 项目路径
E:\Github\Qingyu\Qingyu_fronted

## 开发模式
参考项目现有组件（Tag、Badge）的开发模式：
1. 使用 CVA 管理变体
2. 使用 tailwind-merge 和 clsx 处理类名合并
3. 完整的 TypeScript 类型定义
4. 集成 Icon 组件支持图标
5. 完整的单元测试覆盖（目标 >90%）
6. 详细的 Storybook 文档
