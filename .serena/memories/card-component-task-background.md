# Card 组件开发任务背景

## 任务信息
- 任务名称: Card 组件开发
- 分支: feature/frontend-tailwind-refactor
- 项目位置: Qingyu_fronted/
- 开始时间: 2026-01-23

## 上下文
- Button 和 Icon 组件已完成
- 正在进行 Tailwind UI 重构
- 需要开发 Card 组件作为基础设计系统的一部分

## 技术要求

### 组件功能
- Card 组件用于内容卡片展示
- 支持 header, default, footer 插槽
- 支持 variant: default, bordered, elevated
- 支持 hover 效果

### 设计规范
- border 添加边框: border border-slate-200
- elevated 添加阴影: shadow-md
- 内边距: p-6
- 圆角: rounded-lg
- 背景: bg-white

### 必需文件
```
src/design-system/base/Card/
├── Card.vue             # 主组件
├── types.ts             # 类型定义
├── Card.stories.ts      # Storybook
├── README.md            # 文档
└── index.ts             # 导出
```
测试文件: tests/unit/design-system/base/Card.test.ts

## 验收标准
- Card 组件可以正常渲染
- 支持所有插槽
- 支持 3 种变体
- 测试覆盖率 > 80%
- Storybook 文档完整

## 参考
- Button 组件: src/design-system/base/Button/
- 设计令牌: src/design-system/tokens/
