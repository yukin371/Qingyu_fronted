# Qingyu 设计系统

青羽组件库的设计系统文档,包含色彩、字体、间距、玻璃拟态效果和动画标准等设计规范。

## 目录

- [概述](#概述)
- [设计原则](#设计原则)
- [色彩系统](#色彩系统)
- [字体系统](#字体系统)
- [间距系统](#间距系统)
- [玻璃拟态效果](#玻璃拟态效果)
- [圆角系统](#圆角系统)
- [阴影系统](#阴影系统)
- [动画标准](#动画标准)
- [响应式设计](#响应式设计)
- [组件模式](#组件模式)

## 概述

Qingyu 设计系统基于以下核心理念:

- **青蓝美学**: 采用 cyan-blue 品牌色系
- **玻璃拟态**: 现代化的毛玻璃效果
- **大圆角**: 柔和友好的视觉体验
- **流畅动画**: 自然的交互反馈
- **品牌一致**: 统一的设计语言

## 设计原则

### 1. 简洁优先

保持界面简洁,突出核心内容:

```vue
<!-- ✅ 推荐: 简洁布局 -->
<QyCard>
  <template #title>标题</template>
  <p>核心内容</p>
</QyCard>

<!-- ❌ 避免: 过度装饰 -->
<div class="复杂的多层装饰">
  <div class="更多的装饰">
    <p>内容被淹没</p>
  </div>
</div>
```

### 2. 视觉层次

使用大小、颜色、间距建立清晰的视觉层次:

```vue
<template>
  <div class="space-y-4">
    <!-- 主要内容: 大标题 + 青蓝渐变 -->
    <h1 class="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
      主标题
    </h1>
    
    <!-- 次要内容: 中等标题 -->
    <h2 class="text-xl font-semibold text-slate-800">
      次标题
    </h2>
    
    <!-- 辅助内容: 小字 + 浅色 -->
    <p class="text-sm text-slate-500">
      辅助说明
    </p>
  </div>
</template>
```

### 3. 一致性

在整个应用中保持一致的设计模式:

```vue
<!-- ✅ 推荐: 统一的按钮样式 -->
<QyButton variant="primary">确认</QyButton>
<QyButton variant="primary">提交</QyButton>

<!-- ❌ 避免: 混乱的按钮样式 -->
<el-button type="primary">确认</el-button>
<QyButton variant="danger">提交</QyButton>
```

### 4. 反馈及时

所有交互都应该有明确的视觉反馈:

```vue
<template>
  <!-- 悬停效果 -->
  <QyCard hoverable @click="handleClick">
    悬停时会上浮
  </QyCard>

  <!-- 加载状态 -->
  <QyButton :loading="isLoading">
    加载中...
  </QyButton>

  <!-- 禁用状态 -->
  <QyButton disabled>
    禁用
  </QyButton>
</template>
```

## 色彩系统

### 品牌色

#### 青蓝渐变(默认主题)

```css
/* 主色 - Cyan */
--color-cyan-400: #22d3ee  /* 悬停状态 */
--color-cyan-500: #06b6d4  /* 主色 */
--color-cyan-600: #0891b2  /* 激活状态 */

/* 辅助色 - Blue */
--color-blue-500: #3b82f6  /* 辅助色 */
--color-blue-600: #2563eb  /* 深色状态 */

/* 渐变 */
--gradient-from: #0891b2   /* cyan-600 */
--gradient-to: #2563eb     /* blue-600 */
--gradient-soft-from: #22d3ee  /* cyan-400 */
--gradient-soft-to: #3b82f6   /* blue-500 */
```

#### Tailwind 类名

```vue
<template>
  <!-- 主色渐变 -->
  <div class="bg-gradient-to-r from-cyan-600 to-blue-600">
    主要操作
  </div>

  <!-- 柔和渐变 -->
  <div class="bg-gradient-to-r from-cyan-400 to-blue-500">
    次要操作
  </div>

  <!-- 纯色 -->
  <div class="bg-cyan-600">
    纯色背景
  </div>
</template>
```

### 功能色

```css
/* 成功 - Green */
--color-success-light: #34d399
--color-success: #10b981
--color-success-dark: #059669

/* 警告 - Yellow */
--color-warning-light: #fbbf24
--color-warning: #f59e0b
--color-warning-dark: #d97706

/* 危险 - Red */
--color-danger-light: #f87171
--color-danger: #ef4444
--color-danger-dark: #dc2626

/* 信息 - Blue */
--color-info-light: #38bdf8
--color-info: #0ea5e9
--color-info-dark: #0284c7
```

#### 使用示例

```vue
<template>
  <!-- 成功状态 -->
  <QyBadge type="status" color="green">成功</QyBadge>

  <!-- 警告状态 -->
  <QyBadge type="status" color="yellow">警告</QyBadge>

  <!-- 危险操作 -->
  <QyButton variant="danger">删除</QyButton>
</template>
```

### 中性色

```css
/* Slate 色系 */
--color-slate-50: #f8fafc   /* 背景色 */
--color-slate-100: #f1f5f9  /* 浅灰背景 */
--color-slate-200: #e2e8f0  /* 边框 */
--color-slate-400: #94a3b8  /* 禁用文本 */
--color-slate-600: #475569  /* 次要文本 */
--color-slate-900: #0f172a  /* 主要文本 */
```

#### 使用示例

```vue
<template>
  <div class="bg-slate-50 p-6">
    <h1 class="text-slate-900 text-2xl font-bold">
      主要文本
    </h1>
    <p class="text-slate-600">
      次要文本
    </p>
    <p class="text-slate-400">
      禁用文本
    </p>
    <div class="border border-slate-200 rounded-xl mt-4">
      边框示例
    </div>
  </div>
</template>
```

### 主题切换

支持三种主题切换:

```typescript
import { setTheme } from '@/design-system/tokens/theme'

// 切换到青羽主题(默认)
setTheme('qingyu')

// 切换到紫粉主题
setTheme('berry')

// 切换到森林主题
setTheme('forest')
```

## 字体系统

### 字体族

```css
/* 无衬线字体(默认) */
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* 等宽字体(代码) */
font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Courier New', monospace;
```

### 字体大小

```css
/* 标题 */
text-3xl: 1.875rem  /* 30px - H1 */
text-2xl: 1.5rem    /* 24px - H2 */
text-xl: 1.25rem    /* 20px - H3 */
text-lg: 1.125rem   /* 18px - H4 */

/* 正文 */
text-base: 1rem     /* 16px - 默认 */
text-sm: 0.875rem   /* 14px - 小字 */
text-xs: 0.75rem    /* 12px - 标签 */
```

### 字体粗细

```css
font-light: 300
font-normal: 400
font-medium: 500
font-semibold: 600
font-bold: 700
```

### 使用示例

```vue
<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <h1 class="text-3xl font-bold">
      页面主标题
    </h1>

    <!-- 卡片标题 -->
    <h2 class="text-xl font-semibold">
      卡片标题
    </h2>

    <!-- 正文 -->
    <p class="text-base text-slate-600">
      这是正文内容,使用默认字号和次要颜色。
    </p>

    <!-- 辅助文本 -->
    <p class="text-sm text-slate-400">
      这是辅助说明文本,字号较小。
    </p>

    <!-- 标签 -->
    <span class="text-xs font-medium">
      标签文本
    </span>
  </div>
</template>
```

## 间距系统

### 基础间距

```css
/* Tailwind 默认间距 */
spacing-0: 0
spacing-1: 0.25rem  /* 4px */
spacing-2: 0.5rem   /* 8px */
spacing-3: 0.75rem  /* 12px */
spacing-4: 1rem     /* 16px */
spacing-6: 1.5rem   /* 24px */
spacing-8: 2rem     /* 32px */
spacing-12: 3rem    /* 48px */
spacing-16: 4rem    /* 64px */
```

### 语义化间距

```css
/* 内边距预设 */
padding-xs: 4px
padding-sm: 8px
padding-md: 16px
padding-lg: 24px
padding-xl: 32px

/* 外边距预设 */
margin-xs: 4px
margin-sm: 8px
margin-md: 16px
margin-lg: 24px
margin-xl: 32px

/* 间隙预设(flex/grid) */
gap-xs: 4px
gap-sm: 8px
gap-md: 16px
gap-lg: 24px
gap-xl: 32px
```

### 使用示例

```vue
<template>
  <!-- 卡片内边距 -->
  <QyCard class="p-6">
    内容
  </QyCard>

  <!-- 按钮间距 -->
  <div class="space-x-2">
    <QyButton>按钮1</QyButton>
    <QyButton>按钮2</QyButton>
  </div>

  <!-- 列表间距 -->
  <div class="space-y-4">
    <div>项目1</div>
    <div>项目2</div>
    <div>项目3</div>
  </div>

  <!-- Grid 间距 -->
  <div class="grid grid-cols-2 gap-4">
    <QyCard>卡片1</QyCard>
    <QyCard>卡片2</QyCard>
  </div>
</template>
```

## 玻璃拟态效果

### 效果配方

玻璃拟态是 Qingyu 设计系统的核心特征,使用以下组合实现:

```css
/* 轻量级玻璃拟态 */
bg-white/40 backdrop-blur-sm border border-white/50

/* 标准级玻璃拟态 */
bg-white/60 backdrop-blur-md border border-white/50

/* 重量级玻璃拟态 */
bg-white/80 backdrop-blur-xl border border-white/50
```

### 使用示例

```vue
<template>
  <!-- 轻量级 - 适合背景元素 -->
  <div class="bg-white/40 backdrop-blur-sm border border-white/50 rounded-xl p-4">
    轻量级玻璃拟态
  </div>

  <!-- 标准级 - 适合卡片 -->
  <QyCard>
    自动应用标准级玻璃拟态
  </QyCard>

  <!-- 重量级 - 适合弹窗 -->
  <div class="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl p-6">
    重量级玻璃拟态
  </div>
</template>
```

### 性能优化

玻璃拟态效果可能影响性能,优化建议:

```vue
<template>
  <!-- ✅ 推荐: 使用 CSS 类(已优化) -->
  <div class="backdrop-blur-md">
    内容
  </div>

  <!-- ❌ 避免: 手动设置模糊滤镜 -->
  <div style="filter: blur(10px)">
    内容
  </div>

  <!-- ✅ 推荐: 限制使用区域 -->
  <div class="backdrop-blur-md">
    只在需要的地方使用
  </div>
</template>
```

## 圆角系统

### 圆角规范

```css
/* Tailwind 圆角类 */
rounded-sm: 0.125rem   /* 2px - 小圆角 */
rounded-md: 0.375rem   /* 6px - 中等圆角 */
rounded-lg: 0.5rem     /* 8px - 大圆角 */
rounded-xl: 0.75rem    /* 12px - 超大圆角 */
rounded-2xl: 1rem      /* 16px - 卡片圆角 */
rounded-3xl: 1.5rem    /* 24px - 大容器圆角 */
rounded-full: 9999px   /* 完全圆角 */
```

### 使用场景

```vue
<template>
  <!-- 按钮: rounded-xl (12px) -->
  <QyButton class="rounded-xl">
    按钮
  </QyButton>

  <!-- 输入框: rounded-xl (12px) -->
  <QyInput class="rounded-xl" />

  <!-- 徽章: rounded-full (完全圆角) -->
  <QyBadge class="rounded-full" />

  <!-- 卡片: rounded-3xl (24px) -->
  <QyCard class="rounded-3xl">
    卡片
  </QyCard>

  <!-- 头像: rounded-full (完全圆角) -->
  <QyAvatar class="rounded-full" />
</template>
```

## 阴影系统

### 阴影规范

```css
/* 标准阴影 */
shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1)
shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1)

/* 品牌阴影(青色) */
shadow-cyan-500/10: 0 4px 12px rgba(6, 182, 212, 0.1)
shadow-cyan-500/20: 0 4px 16px rgba(6, 182, 212, 0.2)
shadow-cyan-500/30: 0 8px 24px rgba(6, 182, 212, 0.3)

/* 自定义阴影 */
shadow-[0_8px_32px_rgba(0,0,0,0.12)]
```

### 使用示例

```vue
<template>
  <!-- 标准阴影 -->
  <div class="shadow-md rounded-xl p-4">
    标准阴影
  </div>

  <!-- 品牌阴影(悬停) -->
  <div class="hover:shadow-xl hover:shadow-cyan-500/10 rounded-xl p-4 transition-all">
    悬停时显示青色阴影
  </div>

  <!-- 自定义阴影 -->
  <div class="shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-xl p-4">
    自定义阴影
  </div>
</template>
```

## 动画标准

### 过渡时长

```css
/* 快速过渡 - 按钮悬停、状态变化 */
duration-300: 300ms

/* 慢速过渡 - 卡片动画、页面切换 */
duration-500: 500ms

/* 极速过渡 - 状态反馈 */
duration-150: 150ms
```

### 缓动函数

```css
/* 标准缓动 */
ease-out: cubic-bezier(0, 0, 0.2, 1)

/* iOS 风格缓动 */
cubic-bezier(0.25, 1, 0.5, 1)

/* 平滑缓动 */
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

### 常用动画

```vue
<template>
  <!-- 上浮效果 -->
  <div class="hover:-translate-y-1 transition-all duration-300">
    悬停时上浮
  </div>

  <!-- 放大效果 -->
  <div class="hover:scale-105 transition-all duration-300">
    悬停时放大
  </div>

  <!-- 阴影加深 -->
  <div class="hover:shadow-xl transition-all duration-300">
    悬停时阴影加深
  </div>

  <!-- 组合效果 -->
  <QyCard hoverable>
    上浮 + 阴影 + 缩放
  </QyCard>
</template>
```

### 关键帧动画

```css
/* 浮动动画 */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 渐变动画 */
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* 脉冲动画 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

#### 使用示例

```vue
<template>
  <style scoped>
    .float-animation {
      animation: float 3s ease-in-out infinite;
    }
  </style>

  <div class="float-animation">
    浮动元素
  </div>
</template>
```

## 响应式设计

### 断点系统

```css
/* Tailwind 默认断点 */
sm: 640px   /* 手机横屏 */
md: 768px   /* 平板 */
lg: 1024px  /* 小型桌面 */
xl: 1280px  /* 桌面 */
2xl: 1536px /* 大型桌面 */
```

### 使用示例

```vue
<template>
  <!-- 响应式网格 -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- 移动端: 1列 -->
    <!-- 平板: 2列 -->
    <!-- 桌面: 3列 -->
    <QyCard v-for="i in 6" :key="i">卡片 {{ i }}</QyCard>
  </div>

  <!-- 响应式文字 -->
  <h1 class="text-2xl md:text-3xl lg:text-4xl">
    响应式标题
  </h1>

  <!-- 响应式间距 -->
  <div class="p-4 md:p-6 lg:p-8">
    响应式内边距
  </div>

  <!-- 隐藏/显示 -->
  <div class="hidden md:block">
    仅在桌面端显示
  </div>
</template>
```

### 移动端优化

```vue
<template>
  <!-- iPhone X+ 安全区域适配 -->
  <div class="pb-safe" style="padding-bottom: env(safe-area-inset-bottom)">
    底部内容
  </div>

  <!-- 触摸优化 -->
  <button class="min-h-[44px] min-w-[44px]">
    触摸目标至少 44x44px
  </button>

  <!-- 防止缩放 -->
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
</template>
```

## 组件模式

### 按钮组合

```vue
<template>
  <!-- 按钮组 -->
  <div class="flex items-center space-x-2">
    <QyButton variant="ghost">取消</QyButton>
    <QyButton variant="primary">确认</QyButton>
  </div>

  <!-- 图标按钮组 -->
  <div class="flex items-center space-x-1">
    <QyButton variant="ghost" :icon="editIcon" size="sm" />
    <QyButton variant="ghost" :icon="shareIcon" size="sm" />
    <QyButton variant="danger" :icon="deleteIcon" size="sm" />
  </div>
</template>
```

### 卡片网格

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <QyCard 
      v-for="item in items" 
      :key="item.id"
      hoverable
      @click="handleClick(item)"
    >
      <template #title>
        <h3 class="text-lg font-semibold">{{ item.title }}</h3>
      </template>
      <p class="text-slate-600">{{ item.description }}</p>
    </QyCard>
  </div>
</template>
```

### 表单布局

```vue
<template>
  <QyCard>
    <template #title>
      <h2 class="text-xl font-bold">用户信息</h2>
    </template>
    
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">用户名</label>
        <QyInput v-model="form.username" placeholder="请输入用户名" />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-2">邮箱</label>
        <QyInput v-model="form.email" type="text" placeholder="请输入邮箱" />
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-end space-x-2">
        <QyButton variant="ghost" @click="handleCancel">取消</QyButton>
        <QyButton @click="handleSubmit">提交</QyButton>
      </div>
    </template>
  </QyCard>
</template>
```

### 导航模式

```vue
<template>
  <!-- 响应式混合导航 -->
  <div>
    <!-- 顶部导航(桌面) -->
    <QyTopNav
      :links="links"
      :avatar-url="avatarUrl"
    />
    
    <!-- 底部 Dock(移动端) -->
    <QyBottomDock
      :items="dockItems"
      position="floating"
    />
  </div>
</template>
```

## 最佳实践

### 1. 使用语义化类名

```vue
<!-- ✅ 推荐: 使用 Tailwind 语义化类 -->
<div class="bg-white/60 backdrop-blur-md rounded-xl p-6">
  内容
</div>

<!-- ❌ 避免: 使用任意值 -->
<div style="background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(12px);">
  内容
</div>
```

### 2. 保持一致性

```vue
<!-- ✅ 推荐: 统一的间距 -->
<div class="space-y-4">
  <QyCard>卡片1</QyCard>
  <QyCard>卡片2</QyCard>
</div>

<!-- ❌ 避免: 不一致的间距 -->
<div>
  <QyCard class="mb-4">卡片1</QyCard>
  <QyCard class="mb-8">卡片2</QyCard>
</div>
```

### 3. 性能优先

```vue
<!-- ✅ 推荐: 使用 transform 而非 position -->
<div class="hover:-translate-y-1 transition-transform">
  上浮动画
</div>

<!-- ❌ 避免: 使用 position 实现动画 -->
<div class="hover:mt-[-4px] transition-all">
  上浮动画
</div>
```

### 4. 可访问性

```vue
<template>
  <!-- ✅ 推荐: 添加 aria 标签 -->
  <button aria-label="关闭对话框" @click="handleClose">
    <CloseIcon />
  </button>

  <!-- ✅ 推荐: 语义化 HTML -->
  <nav aria-label="主导航">
    <QyTopNav :links="links" />
  </nav>
</template>
```

## 设计资源

### 工具和资源

- **Tailwind CSS**: https://tailwindcss.com/
- **Tailwind UI**: https://tailwindui.com/
- **Heroicons**: https://heroicons.com/ (图标)
- **Coolors**: https://coolors.co/ (配色)

### 设计令牌文件

```typescript
// 导入设计令牌
import { colors } from '@/design-system/tokens/colors'
import { theme } from '@/design-system/tokens/theme'
import { typography } from '@/design-system/tokens/typography'
import { spacing } from '@/design-system/tokens/spacing'
```

---

**最后更新**: 2026-01-25  
**版本**: v1.0.0  
**维护者**: Qingyu 团队
