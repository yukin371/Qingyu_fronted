# Container 组件任务背景

## 任务信息
- **任务目标**: 为 Tailwind UI 设计系统创建 Container 布局组件，实现响应式内容容器
- **项目路径**: E:\Github\Qingyu\Qingyu_fronted
- **组件位置**: src/design-system/layout/Container/
- **开发模式**: 遵循项目 P0 组件开发模式

## 参考组件
- Col 组件已完成，可作为参考
- Col 组件路径: src/design-system/layout/Col/
- Col 组件使用 cn 工具函数合并类名
- Col 组件包含完整的 types, stories, test, README 文档

## 组件规格
### Container.vue Props
- **size**: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' - 最大宽度尺寸
  - xs: max-w-xs (20rem = 320px)
  - sm: max-w-sm (24rem = 384px)
  - md: max-w-md (28rem = 448px)
  - lg: max-w-lg (32rem = 512px)
  - xl: max-w-xl (36rem = 576px)
  - full: max-w-full (无限制)
- **fluid**: boolean - 是否流体宽度（100%），默认 false
- **padding**: boolean - 是否添加内边距，默认 true
- **centered**: boolean - 是否水平居中，默认 true

### 使用示例
```vue
<Container>
  <h1>页面内容</h1>
</Container>

<Container size="lg">
  <Row>
    <Col :span="12">内容区域</Col>
  </Row>
</Container>

<Container :fluid="true">
  全宽容器
</Container>
```

## 交付标准
- [ ] 组件功能完整，所有 props 正常工作
- [ ] Storybook 文档完整，包含所有变体
- [ ] 单元测试覆盖率 > 90%
- [ ] README 文档清晰完整
- [ ] 代码符合项目 TypeScript 规范

## 开发文件列表
1. src/design-system/layout/Container/Container.vue - 主组件
2. src/design-system/layout/Container/types.ts - 类型定义
3. src/design-system/layout/Container/Container.stories.ts - Storybook
4. src/design-system/layout/Container/README.md - 文档
5. tests/unit/design-system/layout/Container.test.ts - 单元测试
6. src/design-system/layout/Container/index.ts - 导出文件
7. 更新 src/design-system/layout/index.ts - 主导出
