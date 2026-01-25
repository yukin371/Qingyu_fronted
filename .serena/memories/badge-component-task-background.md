# Badge 组件开发任务背景

## 任务目标
开发 Badge 组件，用于徽章和通知数量展示

## 技术要求
1. **组件功能**
   - Badge 组件用于徽章和通知数量展示
   - 支持 content (数字或点)
   - 支持 variant: default, primary, success, warning, danger
   - 支持 size: sm, md, lg
   - 支持 max 属性（超过显示 99+）
   - 支持绝对定位

2. **设计规范**
   - sm: h-4 w-4 text-[10px]
   - md: h-5 w-5 text-xs
   - lg: h-6 w-6 text-sm
   - 圆形: rounded-full
   - 居中: flex items-center justify-center

3. **必需文件**
   - src/design-system/base/Badge/Badge.vue
   - src/design-system/base/Badge/types.ts
   - src/design-system/base/Badge/Badge.stories.ts
   - src/design-system/base/Badge/README.md
   - src/design-system/base/Badge/index.ts
   - tests/unit/design-system/base/Badge.test.ts

4. **特殊功能**
   - 当 content 为空或 null 时显示为红点
   - max 属性限制显示数字（如超过 99 显示 99+）

## 验收标准
- Badge 组件可以正常渲染
- 支持数字和点模式
- 支持 max 属性
- 测试覆盖率 > 80%
- Storybook 文档完整

## 参考
- Button 组件: src/design-system/base/Button/
- 设计令牌: src/design-system/tokens/
