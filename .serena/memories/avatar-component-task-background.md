# Avatar 组件开发任务背景

## 任务概述
正在 Qingyu 前端项目的 Tailwind UI 重构分支上开发 Avatar 组件。

## 已完成组件
- Button 组件：支持多种变体和尺寸，使用 CVA 管理
- Icon 组件：基于 Heroicons 的图标组件，支持多种尺寸

## 当前任务
开发 Avatar 组件，位于 `src/design-system/base/Avatar/`

## 项目位置
前端项目根目录：`E:\Github\Qingyu\Qingyu_fronted\`
设计系统：`src/design-system/base/`

## 技术要求

### 组件功能
1. 支持图片 src
2. 支持 fallback 文字（取首字母）
3. 支持 size: xs, sm, md, lg, xl, 2xl
4. 支持 variant: circle, square, rounded
5. 支持在线状态指示器 (status: online, offline, away, busy)
6. 支持 alt 文本

### 设计规范
- xs: h-6 w-6 text-xs
- sm: h-8 w-8 text-sm
- md: h-10 w-10 text-base
- lg: h-12 w-12 text-lg
- xl: h-16 w-16 text-xl
- 2xl: h-20 w-20 text-2xl
- 在线状态: 小绿点，绝对定位

### 验收标准
- Avatar 组件可以正常渲染
- 支持图片和 fallback 文字
- 支持多种尺寸和形状
- 支持在线状态指示器
- 测试覆盖率 > 80%
- Storybook 文档完整

## 任务列表
1. 创建 Avatar 组件目录结构
2. 创建 Avatar 组件类型定义
3. 创建 Avatar.vue 主组件
4. 创建 Avatar.stories.ts
5. 创建 README.md 文档
6. 创建导出文件并更新设计系统导出
7. 创建 Avatar.test.ts 单元测试
8. 运行测试验证
9. 提交代码并更新子模块引用

## 参考资料
- Button 组件: src/design-system/base/Button/
- Icon 组件: src/design-system/base/Icon/
- 设计令牌: src/design-system/tokens/
