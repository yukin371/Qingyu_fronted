# Tailwind CSS 修复 - style.css 导入问题

## 修复时间
2026-01-25

## 问题描述
图标显示过大的根本原因：`src/style.css` 文件包含 Tailwind CSS 指令（@tailwind base; @tailwind components; @tailwind utilities;），但从未在应用中被导入！

## 影响
- Tailwind CSS 工具类（如 h-5、w-5）未生成
- 图标组件使用 `class="h-5 w-5"` 无效
- 图标以 SVG 的原始尺寸（24×24 或更大）显示，而不是预期的 20px×20px

## 修复方案
在 `src/main.ts` 中添加 style.css 导入，并确保在其他样式之前导入：

```typescript
// 全局样式
import './style.css'  // Tailwind CSS - MUST be imported first
import '@/styles/variables.scss'
import '@/styles/common.scss'
```

## 修复位置
文件：`src/main.ts`
行数：第 10-12 行

## 为什么这样修复
1. Tailwind CSS 的基础样式（@tailwind base）应该最先加载
2. 避免与其他自定义样式（variables.scss、common.scss）产生冲突
3. 确保 Tailwind 工具类正确生成

## 验证步骤
1. 刷新浏览器
2. 检查图标是否正确显示为 20px×20px
3. 开发者工具中确认 h-5、w-5 类已生成

## 技术要点
- style.css 包含完整的 Tailwind 指令
- 必须在应用入口点（main.ts）导入
- 应该在其他自定义样式之前导入
- 这是 Tailwind CSS 的标准最佳实践

## 相关文件
- `src/main.ts` - 修改添加了 style.css 导入
- `src/style.css` - 包含 Tailwind 指令的样式文件
