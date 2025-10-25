# 首页空白问题 - 修复报告

## 日期: 2025-10-25

---

## 问题描述

用户访问首页 (http://localhost:5175/) 时页面显示空白。

---

## 根本原因

`src/core/utils/index.ts` 文件中使用了错误的导入路径：

```typescript
// ❌ 错误：使用 @/ 别名导入不存在的文件
export { default as cacheUtil } from '@/utils/cache'
```

由于架构重构，utils 文件仍在 `src/utils/` 目录下，但使用 `@/` 别名可能导致解析问题。

---

## 修复方案

### ✅ 已修复：core/utils/index.ts

更新为使用相对路径导入：

```typescript
// ✅ 正确：使用相对路径
export { default as cacheUtil } from '../../utils/cache'
export { default as errorHandler, ErrorHandler } from '../../utils/errorHandler'
export { default as formatUtil } from '../../utils/format'
export { default as performanceUtil, performanceMonitor } from '../../utils/performance'
```

---

## 验证步骤

1. **检查开发服务器**
   - 服务器应该自动重新加载
   - 如果没有，请手动重启: `npm run dev`

2. **访问首页**
   - 打开: http://localhost:5175/
   - 页面应该正常显示内容

3. **如果仍然空白**
   请按 F12 打开开发者工具，查看 Console 标签中的错误信息，并告诉我具体的错误内容。

---

## 其他可能的问题（如果修复后仍有问题）

### A. API 连接问题
如果后端 API 未运行，首页数据可能无法加载。

**解决方案**:
- 检查 API 服务器是否运行
- 查看 Network 标签中的 API 请求是否成功

### B. Store 初始化错误
Bookstore Store 可能有其他问题。

**解决方案**:
- 查看控制台中与 Pinia 相关的错误
- 检查 Store 的导入和使用

### C. 组件渲染错误
HomeView 或其子组件可能有渲染错误。

**解决方案**:
- 查看 Vue DevTools
- 检查组件树是否正常

---

## 相关文件

已修复：
- ✅ `src/core/utils/index.ts` - 修复导入路径

相关但未修改：
- `src/modules/bookstore/services/bookstore.service.ts` - 使用 @/core
- `src/modules/bookstore/stores/bookstore.store.ts` - 使用服务层
- `src/modules/bookstore/views/HomeView.vue` - 首页组件

---

## 测试清单

请测试以下功能：

- [ ] 首页能够正常访问和显示
- [ ] 轮播图正常显示
- [ ] 榜单数据正常加载
- [ ] 推荐书籍正常显示
- [ ] 导航菜单可以点击
- [ ] 搜索功能可用

---

## 下一步

如果页面仍然空白或有其他错误，请提供：

1. **浏览器控制台错误** (F12 → Console)
   ```
   [复制这里的错误信息]
   ```

2. **Network 请求状态** (F12 → Network)
   - 是否有失败的请求（红色）？
   - 失败的请求 URL 是什么？

3. **Vue DevTools 信息** (如果可用)
   - 组件树是否正常？
   - Store 状态如何？

---

**状态**: ✅ 初步修复完成，等待验证

