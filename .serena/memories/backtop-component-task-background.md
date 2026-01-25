# BackTop 返回顶部组件任务背景

## 任务目标
开发 BackTop 返回顶部组件，属于设计系统 P5 其他组件类别。

## 技术栈
- Vue 3 + TypeScript + `<script setup>`
- Tailwind CSS 3.3.6
- CVA (class-variance-authority) 用于变体管理
- Storybook 8.6 用于组件文档
- Vitest + @testing-library/vue 用于单元测试

## 组件功能要求
1. **基本功能**
   - visibilityHeight: 滚动高度达到该值时显示（默认400）
   - backPosition: 返回顶部位置（默认0）
   - easing: 滚动动画缓动函数
   - duration: 滚动动画时长（默认300ms）

2. **自定义**
   - 自定义图标/内容（默认slot）
   - 自定义样式类名
   - 支持圆形/方形等样式变体

3. **事件**
   - click: 点击事件

## 目录结构
```
src/design-system/other/BackTop/
  BackTop.vue          # 主组件
  types.ts             # 类型定义
  BackTop.stories.ts   # Storybook 故事
  README.md            # 组件文档
  index.ts             # 导出
```

## 验收标准
1. 组件功能完整
2. 至少8个 Storybook 故事
3. 至少25个单元测试
4. 测试通过率 ≥ 90%
5. README 文档完整

## Stories 示例
1. Default - 基础用法
2. CustomVisibility - 自定义显示高度
3. CustomDuration - 自定义动画时长
4. CustomContent - 自定义内容
5. DifferentStyles - 不同样式
6. WithProgress - 显示滚动进度
7. SmoothScroll - 平滑滚动
8. TargetElement - 滚动到指定元素

## 参考组件
- Drawer 组件（同目录下的 other 组件）
- Button 组件（CVA 用法参考）
- Progress 组件（进度显示参考）
