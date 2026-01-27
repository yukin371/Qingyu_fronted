# 设计令牌系统

青羽项目的前端设计令牌系统，提供类型安全的设计规范和 Tailwind CSS 集成。

## 概述

设计令牌系统采用双层架构：
- **静态令牌**: `colors.ts`, `spacing.ts`, `typography.ts` - 提供编译时类型安全
- **动态主题**: `theme.ts` - 支持运行时主题切换

## 主题

### qingyu 主题（默认）
- **主色**: Cyan (#06b6d4) - 清新、现代
- **辅助色**: Blue (#3b82f6) - 稳重、可靠
- **渐变**: cyan-600 → blue-600

### 其他可用主题
- `berry`: 紫粉渐变主题（purple-600 → pink-600）
- `forest`: 绿蓝渐变主题（green-600 → cyan-600）

## 使用方式

### 在组件中使用令牌

#### TypeScript 组件
```typescript
import { colors, spacing, typography } from '@/design-system/tokens'

const buttonStyle = {
  backgroundColor: colors.primary[500],
  padding: `${spacing[3]} ${spacing[6]}`,
  fontSize: typography.fontSize.base,
}
```

#### Tailwind 类名
```html
<button class="bg-primary-500 px-4 py-2 text-base">
  点击我
</button>
```

#### 使用统一导出对象
```typescript
import { designTokens } from '@/design-system/tokens'

const { colors, spacing, typography } = designTokens
const cardStyle = {
  backgroundColor: colors.semantic.background.glass,
  padding: spacing.component.card,
  borderRadius: spacing.component.borderRadius,
}
```

### 主题切换

```typescript
import { setTheme, initTheme } from '@/design-system/tokens'

// 初始化主题（在应用启动时调用）
initTheme('qingyu')

// 切换到 berry 主题
setTheme('berry')

// 切换到 forest 主题
setTheme('forest')

// 切换回 qingyu 主题
setTheme('qingyu')
```

### 获取 Tailwind 配置

```typescript
import { getTailwindColors } from '@/design-system/tokens'

// 在 tailwind.config.js 中使用
const colors = getTailwindColors()

module.exports = {
  theme: {
    extend: {
      colors,
    }
  }
}
```

## 令牌结构

### 颜色令牌 (`colors.ts`)

#### 品牌色
- **primary**: 主色系（cyan）
  - 50-900: 完整色阶
  - 400: 悬停状态
  - 500: 主色
  - 600: 激活状态
- **secondary**: 辅助色系（blue）
  - 50-900: 完整色阶
  - 500: 辅助色
  - 600: 深色状态

#### 渐变色
- **gradient**: 渐变配置
  - `from`: 渐变起点（cyan-600）
  - `to`: 渐变终点（blue-600）
  - `soft`: 柔和渐变（cyan-400 → blue-500）

#### 功能色
- **success**: 成功色（绿色系）
- **warning**: 警告色（黄色系）
- **danger**: 危险色（红色系）
- **info**: 信息色（蓝色系）

#### 中性色
- **neutral**: 灰度色系（50-950）

#### 语义化颜色
- **semantic**: 语义化别名
  - `background`: 背景色（glass, solid, hover）
  - `border`: 边框色（default, subtle, strong）
  - `text`: 文本色（primary, secondary, disabled）
  - `shadow`: 阴影色（brand, glass, solid）

### 间距令牌 (`spacing.ts`)

#### 基础间距
- **0-96**: 基础间距单位（以 4px 为步进）
- **xs, sm, md, lg, xl**: 语义化间距预设

#### 组件间距
- **component**: 组件特定间距
  - `padding`: 内边距（sm, md, lg）
  - `gap`: 间隙（xs, sm, md, lg）
  - `borderRadius`: 圆角（md, lg, xl）

#### Apple 风格玻璃拟态间距
- **glass**: 玻璃拟态专用间距
  - `padding`: 内边距
  - `gap`: 元素间隙
  - `margin`: 外边距

### 字体令牌 (`typography.ts`)

#### 字体族
- **fontFamily**: 字体家族
  - `sans`: 中文字体（PingFang SC 优先）
  - `sansEn`: 英文字体（SF Pro 优先）
  - `mono`: 等宽字体（SF Mono 优先）

#### 字体大小
- **fontSize**: 字体大小（xs 到 9xl）
  - 移动端优先设计
  - 桌面端自动适配

#### 字体权重
- **fontWeight**: 字体粗细（100 到 900）
- **light**: 300
- **normal**: 400
- **medium**: 500
- **semibold**: 600
- **bold**: 700

#### 字体预设
- **heading**: 标题字体（h1-h6）
- **body**: 正文字体（base, large, small）
- **caption**: 说明文字（small, tiny）

### 主题令牌 (`theme.ts`)

#### 主题配置
- **themes**: 所有可用主题
  - `qingyu`: 青蓝渐变主题（默认）
  - `berry`: 紫粉渐变主题
  - `forest`: 绿蓝渐变主题

#### 主题工具函数
- **setTheme()**: 切换主题
- **initTheme()**: 初始化主题
- **getTailwindColors()**: 获取 Tailwind 颜色配置
- **updateCSSVariables()**: 更新 CSS 变量

## Tailwind 集成

所有令牌都已集成到 Tailwind CSS 配置中：

```javascript
// tailwind.config.js
const { qingyuTheme, getTailwindColors } = require('./src/design-system/tokens/theme')

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: qingyuTheme.primary,
        secondary: qingyuTheme.secondary,
        gradient: qingyuTheme.gradient,
        success: qingyuTheme.success,
        warning: qingyuTheme.warning,
        danger: qingyuTheme.danger,
        info: qingyuTheme.info,
      }
    }
  }
}
```

### 使用示例

```html
<!-- 渐变按钮 -->
<button class="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
  点击我
</button>

<!-- 玻璃拟态卡片 -->
<div class="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl">
  卡片内容
</div>

<!-- 语义化颜色 -->
<div class="bg-glass text-text-primary border-border-default">
  语义化内容
</div>
```

## 类型定义

```typescript
// 颜色类型
export type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
export type SpacingValue = 0 | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 14 | 16 | 20 | 24 | 28 | 32 | 36 | 40 | 44 | 48 | 52 | 56 | 60 | 64 | 72 | 80 | 96

// 主题类型
export type ThemeName = 'qingyu' | 'berry' | 'forest'
export type ThemeColors = typeof qingyuTheme

// 设计令牌类型
export type DesignTokens = typeof designTokens
```

## 测试

运行令牌测试：

```bash
# 运行所有测试
npm run test

# 运行令牌测试
npm run test tokens

# 运行类型检查
npx tsc --noEmit --skipLibCheck
```

## 测试覆盖

测试文件位于 `__tests__/` 目录：
- `colors.test.ts`: 颜色令牌测试
- `spacing.test.ts`: 间距令牌测试
- `typography.test.ts`: 字体令牌测试
- `theme.test.ts`: 主题系统测试

## 参考

- [Apple 风格设计规范](../../../../docs/plans/2026-01-25-apple-style-tailwind-design-system.md)
- [Tailwind 主题集成指南](../../../../docs/guides/tailwind-theme-integration-guide.md)
- [前端重构 WBS](../../../../docs/plans/2026-01-23-frontend-tailwind-ui-refactor-wbs.md)
- [设计令牌系统统一实施计划](../../../../docs/plans/2026-01-27-design-token-system-alignment.md)

## 更新日志

### v1.0.0 (2026-01-27)
- 完成颜色令牌系统（qingyu 主题）
- 完成 Apple 风格间距系统
- 完成 Apple 风格字体系统
- 完成主题切换功能
- 完成 Tailwind CSS 集成
- 添加完整的测试覆盖

## 维护者

青羽项目团队

---

**最后更新**: 2026-01-27
