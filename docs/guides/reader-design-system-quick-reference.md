# 阅读器设计系统快速参考

**版本**: v1.0.0
**更新日期**: 2026-02-07
**状态**: 已实施

## 🎨 CSS变量快速参考

### 主题颜色

```css
--color-primary: #5b8cff /* 主色调 */ --color-accent: #c0a062 /* 强调色 */;
```

### 阅读器主题背景（P0修复：避免纯黑）

```css
--reader-light-bg: #ffffff /* 浅色主题 */ --reader-sepia-bg: #f4ecd8 /* 护眼主题（羊皮纸） */
  --reader-night-bg: #1a1a1a /* ✅ 夜间主题（非纯黑） */ --reader-dark-bg: #121212
  /* ✅ 暗色主题（Material Design推荐） */ --reader-eyecare-bg: #c7edcc /* 护眼绿主题 */;
```

### 阅读器主题文字

```css
--reader-light-text: #2c3e50 --reader-sepia-text: #5c4a2f --reader-night-text: #c9c9c9
  --reader-dark-text: #e0e0e0 --reader-eyecare-text: #333333;
```

### 中文字体回退栈（P0修复：完整回退）

```css
--font-serif-zh:
  'Noto Serif SC', 'Source Han Serif SC', 'SimSun', 'Songti SC', 'STSong', 'AR PL UMing CN', serif;
--font-sans-zh:
  'Noto Sans SC', 'Source Han Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Heiti SC', 'STHeiti',
  'Arial', sans-serif;
--font-mono-zh:
  'JetBrains Mono', 'Fira Code', 'Consolas', 'SF Mono', 'Monaco', 'Menlo', 'Courier New',
  'Noto Sans SC', monospace;
```

### 字体应用变量

```css
--font-family-reader: var(--font-serif-zh) /* 阅读器使用衬线字体 */
  --font-family-editor: var(--font-mono-zh) /* 编辑器使用等宽字体 */
  --font-family-ui: var(--font-sans-zh) /* UI使用无衬线字体 */;
```

## 🧩 组件样式类

### 卡片组件

```html
<div class="qy-card">
  <!-- 内容 -->
</div>
```

**样式特点**:

- 圆角: 8px
- 内边距: 16px
- 阴影: 0 2px 8px rgba(0, 0, 0, 0.05)
- 悬浮阴影: 0 4px 12px rgba(0, 0, 0, 0.1)

### 按钮组件

```html
<button class="qy-btn qy-btn--primary">主要按钮</button>
<button class="qy-btn qy-btn--ghost">幽灵按钮</button>
<button class="qy-btn qy-btn--success">成功按钮</button>
<button class="qy-btn qy-btn--warning">警告按钮</button>
<button class="qy-btn qy-btn--danger">危险按钮</button>
```

**样式特点**:

- 布局: inline-flex
- 圆角: 4px
- 内边距: 8px 16px
- 过渡: all 0.3s ease

## 🔄 主题类使用

### 在Vue组件中

```vue
<template>
  <div :class="['reader-container', themeClass]">
    <!-- 阅读器内容 -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const theme = ref('light') // light, sepia, night, dark, eyecare

const themeClass = computed(() => `theme-${theme.value}`)
</script>

<style scoped>
.reader-container {
  background-color: var(--reader-bg);
  color: var(--reader-text);
  font-family: var(--font-family-reader);
  transition:
    background-color 0.3s,
    color 0.3s;
}
</style>
```

### 动态切换主题

```typescript
// 切换到暗色主题
document.documentElement.classList.add('theme-dark')

// 切换到夜间主题
document.documentElement.classList.remove('theme-dark')
document.documentElement.classList.add('theme-night')

// 切换到浅色主题
document.documentElement.classList.remove('theme-dark', 'theme-night')
```

## 📋 测试覆盖

### 变量测试（6个）

- T2.1: 主题配色变量
- T2.2: 暗色主题非纯黑
- T2.2.1: 夜间主题非纯黑
- T2.3: 中文字体回退栈
- T2.4: 阅读器主题变量
- T2.5: 字体应用变量

### 组件测试（5个）

- T2.6: 卡片组件样式
- T2.7: 按钮组件样式
- T2.8: 按钮变体样式
- T2.9: 卡片悬浮效果
- T2.10: 按钮过渡效果

运行测试:

```bash
npm run test:vitest:run -- src/styles/__tests__/
```

## 🐛 常见问题

### Q: 为什么暗色主题不使用纯黑#000000？

A: 根据Material Design设计规范，纯黑色会导致高度对比和视觉疲劳。推荐使用#121212（Dark Gray）作为暗色主题背景。

### Q: 中文字体回退栈为什么这么长？

A: 为了确保在不同操作系统（Windows/Mac/Linux）和不同浏览器中都能显示合适的字体，需要提供完整的回退栈。

### Q: 如何添加新的主题？

A:

1. 在`reader-variables.scss`中添加新的CSS变量
2. 添加对应的主题类（如`.theme-custom`）
3. 在`variables.test.ts`中添加测试用例
4. 运行测试确保通过

### Q: 组件样式没有生效？

A: 确保：

1. `main.ts`中已导入`reader-variables.scss`
2. 组件使用了正确的类名（如`qy-card`）
3. 没有其他样式覆盖了这些样式

## 📚 相关文档

- [TDD Phase 2实施报告](./2026-02-07-tdd-phase2-design-system-implementation.md)
- [TDD实施计划](../../../docs/plans/2026-02-07-reader-editor-enhancement-tdd-implementation.md)
- [Material Design - Dark Theme](https://material.io/design/color/dark-theme.html)

---

**维护者**: 猫娘助手Kore 🐱
**最后更新**: 2026-02-07
