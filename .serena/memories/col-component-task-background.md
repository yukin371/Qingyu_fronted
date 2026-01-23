# Col 组件开发任务背景

## 任务时间
2026-01-23

## 任务目标
为 Tailwind UI 设计系统创建 Col 布局组件，实现基于 12 列的网格系统。

## 组件规格

### Col.vue
一个基于 12 列网格系统的列布局组件。

**Props:**
- `span`: number (1-12) - 列宽度（占 12 列中的几列）
- `offset`: number (0-11) - 左侧偏移列数
- `order`: number - 排序顺序
- `xs`: number - 断点 xs 下的 span
- `sm`: number - 断点 sm 下的 span
- `md`: number - 断点 md 下的 span
- `lg`: number - 断点 lg 下的 span
- `xl`: number - 断点 xl 下的 span

**使用示例:**
```vue
<Col :span="6">占 6 列</Col>
<Col :span="4" :offset="2">占 4 列，偏移 2 列</Col>
<Col :xs="12" :md="6" :lg="4">响应式列</Col>
```

## 技术要求

1. **组件文件**: `src/design-system/layout/Col/Col.vue`
2. **类型定义**: `src/design-system/layout/Col/types.ts`
3. **Storybook**: `src/design-system/layout/Col/Col.stories.ts`
   - 展示所有 span 值 (1-12)
   - 展示 offset 效果
   - 展示响应式断点
   - 展示嵌套 Row/Col
4. **单元测试**: `tests/unit/design-system/layout/Col.test.ts`
   - 测试 span 属性
   - 测试 offset 属性
   - 测试响应式断点
   - 测试 order 属性
5. **README 文档**: `src/design-system/layout/Col/README.md`
6. **导出**: `src/design-system/layout/Col/index.ts`
7. **更新主导出**: `src/design-system/layout/index.ts`

## 设计规范

- 使用 Tailwind 的 w-* 百分比类或 grid 系统模拟
- span 映射: 1→w-1/12, 2→w-2/12, ..., 12→w-full
- offset 使用 ml-* 百分比类
- 响应式使用 sm:*, md:*, lg:*, xl:* 前缀
- 支持嵌套在 Row 组件中使用

## 交付标准

- [ ] 组件功能完整，所有 props 正常工作
- [ ] Storybook 文档完整，包含所有变体
- [ ] 单元测试覆盖率 > 90%
- [ ] README 文档清晰完整
- [ ] 代码符合项目 TypeScript 规范

项目路径: E:\Github\Qingyu\Qingyu_fronted
