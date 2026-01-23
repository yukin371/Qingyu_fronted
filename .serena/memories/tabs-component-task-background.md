# Tabs 组件开发任务

## 任务目标
为 Tailwind UI 设计系统创建 Tabs 标签页组件。

## 组件规格

### Tabs.vue
标签页容器组件。

**Props:**
- `modelValue`: string | number - v-model 绑定值
- `type`: 'line' | 'card' | 'border-card' - 类型
- `tabPosition`: 'top' | 'right' | 'bottom' | 'left' - 位置
- `stretch`: boolean - 标签宽度自适应
- `closable`: boolean - 是否可关闭

**Events:**
- `update:modelValue` - 值更新
- `tabClick` - 标签点击
- `tabChange` - 标签改变
- `tabRemove` - 标签移除

**Slots:**
- `default` - TabPane 内容

### TabPane.vue
标签页面板组件。

**Props:**
- `label`: string - 标签标题
- `name`: string | number - 标签标识
- `disabled`: boolean - 禁用
- `closable`: boolean - 是否可关闭

**Slots:**
- `label` - 自定义标签
- `default` - 面板内容

## 技术要求

1. 组件文件: `src/design-system/data/Tabs/Tabs.vue`, `TabPane.vue`
2. 类型定义: `src/design-system/data/Tabs/types.ts`
3. Storybook: `src/design-system/data/Tabs/Tabs.stories.ts`
4. 单元测试: `tests/unit/design-system/data/Tabs.test.ts`
5. README 文档: `src/design-system/data/Tabs/README.md`
6. 导出文件: `src/design-system/data/Tabs/index.ts`
7. 更新主导出: `src/design-system/data/index.ts`

## 项目路径
E:\Github\Qingyu\Qingyu_fronted
