# Select 选择器组件开发任务

## 任务时间
2026-01-23

## 任务目标
为 Tailwind UI 设计系统创建 Select 选择器组件，这是 P2 表单组件的一部分。

## 组件规格

### Select.vue
一个功能完整的下拉选择组件。

**Props:**
- `modelValue`: string | number | string[] | number[] - v-model 绑定值
- `options`: Array<{label: string, value: string | number, disabled?: boolean}> - 选项数组
- `placeholder`: string - 占位符
- `disabled`: boolean - 禁用状态
- `clearable`: boolean - 可清空
- `multiple`: boolean - 多选
- `filterable`: boolean - 可搜索
- `size`: 'sm' | 'md' | 'lg' - 尺寸
- `loading`: boolean - 加载状态
- `remote`: boolean - 远程搜索
- `remoteMethod`: (query: string) => void - 远程搜索方法

**Events:**
- `update:modelValue` - 值更新
- `change` - 选项改变
- `focus` - 获得焦点
- `blur` - 失去焦点
- `clear` - 清空
- `visibleChange` - 下拉显示/隐藏

**Slots:**
- `default` - 默认选项
- `prefix` - 前缀
- `empty` - 空状态
- `loading` - 加载状态

## 技术要求

1. **组件文件**: `src/design-system/form/Select/Select.vue`
2. **类型定义**: `src/design-system/form/Select/types.ts`
3. **Storybook**: `src/design-system/form/Select/Select.stories.ts`
4. **单元测试**: `tests/unit/design-system/form/Select.test.ts`
5. **README 文档**: `src/design-system/form/Select/README.md`
6. **导出**: `src/design-system/form/Select/index.ts`
7. **更新主导出**: `src/design-system/form/index.ts`

## 项目路径
E:\Github\Qingyu\Qingyu_fronted

## 参考组件
参考现有的 Button、Input 等组件的开发模式，使用 CVA 定义变体，遵循项目代码风格。
