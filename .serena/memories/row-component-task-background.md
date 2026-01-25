# Row 组件开发任务背景

## 任务时间
2026-01-23

## 任务目标
为 Tailwind UI 设计系统创建 Row 布局组件，实现 Flexbox 行容器。

## 组件规格

### Row.vue
一个基于 Flexbox 的行布局容器组件。

**Props:**
- `justify`: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly' - 水平对齐方式
- `align`: 'top' | 'center' | 'bottom' | 'stretch' - 垂直对齐方式
- `gutter`: number - Col 之间的间距 (0, 8, 16, 24, 32)
- `wrap`: boolean - 是否换行，默认 true

**使用示例:**
```vue
<Row>
  <Col :span="6">列 1</Col>
  <Col :span="6">列 2</Col>
  <Col :span="12">列 3</Col>
</Row>

<Row justify="center" align="center" :gutter="16">
  <Col :span="8">居中内容</Col>
</Row>
```

## 技术要求

1. **组件文件**: `src/design-system/layout/Row/Row.vue`
2. **类型定义**: `src/design-system/layout/Row/types.ts`
3. **Storybook**: `src/design-system/layout/Row/Row.stories.ts`
   - 展示所有对齐方式组合
   - 展示不同 gutter 值
   - 展示嵌套 Row/Col
   - 展示实际布局示例
4. **单元测试**: `tests/unit/design-system/layout/Row.test.ts`
   - 测试 justify 属性
   - 测试 align 属性
   - 测试 gutter 属性
   - 测试 wrap 属性
   - 测试与 Col 组件配合
5. **README 文档**: `src/design-system/layout/Row/README.md`
6. **导出**: `src/design-system/layout/Row/index.ts`
7. **更新主导出**: `src/design-system/layout/index.ts`

## 设计规范

- 使用 Tailwind 的 Flexbox 类: flex, flex-wrap, justify-*, items-*
- gutter 通过负 margin 和 Col 的 padding 实现
- 默认 wrap: true
- 支持嵌套在 Container 或其他 Row 中使用

## 交付标准

- [ ] 组件功能完整，所有 props 正常工作
- [ ] Storybook 文档完整，包含所有变体
- [ ] 单元测试覆盖率 > 90%
- [ ] README 文档清晰完整
- [ ] 代码符合项目 TypeScript 规范

项目路径: E:\Github\Qingyu\Qingyu_fronted
