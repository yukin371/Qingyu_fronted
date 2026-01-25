# List 组件开发任务背景

## 任务目标
为 Tailwind UI 设计系统创建 List 列表组件。

## 组件规格

### List.vue
列表容器组件。

**Props:**
- `data`: any[] - 列表数据
- `border`: boolean - 是否显示边框
- `split`: boolean - 是否显示分割线
- `loading`: boolean - 加载状态

**Events:**
- `itemClick` - 列表项点击

**Slots:**
- `default` - 列表项
- `loading` - 加载状态
- `empty` - 空状态

### ListItem.vue
列表项组件。

**Props:**
- `disabled`: boolean - 禁用状态

**Slots:**
- `default` - 内容

## 技术要求

1. 组件文件: `src/design-system/base/List/List.vue`, `ListItem.vue`
2. 类型定义: `src/design-system/base/List/types.ts`
3. Storybook: `src/design-system/base/List/List.stories.ts`
4. 单元测试: `tests/unit/design-system/base/List.test.ts`
5. README 文档: `src/design-system/base/List/README.md`
6. 导出文件: `src/design-system/base/List/index.ts`
7. 更新主导出: `src/design-system/base/index.ts`

## 项目路径
E:\Github\Qingyu\Qingyu_fronted

## 参考组件
Card 组件 - 了解组件结构和开发模式

## 开发模式
- 使用 CVA (class-variance-authority) 管理变体
- 使用 cn 工具函数合并类名
- TypeScript 类型定义
- Storybook 故事文档
- Vitest 单元测试
- README 使用文档
