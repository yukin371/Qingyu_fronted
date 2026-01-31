# 新架构快速开始指南

## 🚀 快速验证

### 1. 启动开发服务器

```bash
npm run dev
```

如果遇到错误，尝试清除缓存：

```bash
# 删除缓存目录
rm -rf node_modules/.vite

# 重新启动
npm run dev
```

### 2. 测试主要功能

访问以下页面确认正常工作：

- **首页**: http://localhost:5173/
- **书库**: http://localhost:5173/books
- **排行榜**: http://localhost:5173/rankings
- **分类**: http://localhost:5173/categories
- **搜索**: http://localhost:5173/search

## 📦 新架构使用示例

### 示例 1: 使用 Bookstore 服务

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { bookstoreService, type BookBrief } from '@bookstore'

const books = ref<BookBrief[]>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    books.value = await bookstoreService.getRecommendedBooks()
  } catch (error) {
    console.error('Failed to load books:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <LoadingComponent v-if="loading" />
    <BookList v-else :books="books" />
  </div>
</template>
```

### 示例 2: 使用 Reader 服务

```vue
<script setup lang="ts">
import { readerService } from '@reader'
import { onMounted } from 'vue'

const chapterId = ref('chapter-123')
const content = ref('')

onMounted(async () => {
  const chapterData = await readerService.getChapterContent(chapterId.value)
  content.value = chapterData.content
})
</script>
```

### 示例 3: 使用核心服务

```typescript
import { storageService, validationService, httpService } from '@core'

// 存储数据
storageService.set('user-settings', settings, { ttl: 3600000 })

// 验证邮箱
const result = validationService.validateEmail(email)
if (!result.valid) {
  showError(result.message)
}

// HTTP 请求
const data = await httpService.get('/api/endpoint')
```

### 示例 4: 使用 Store

```vue
<script setup lang="ts">
import { useBookstoreStore } from '@bookstore'
import { storeToRefs } from 'pinia'

const bookstore = useBookstoreStore()
const { homepageData, loading } = storeToRefs(bookstore)

onMounted(() => {
  bookstore.fetchHomepageData()
})
</script>
```

## 🔧 路径别名参考

```typescript
// 模块导入
import { ... } from '@bookstore'  // Bookstore 模块
import { ... } from '@reader'     // Reader 模块
import { ... } from '@user'       // User 模块
import { ... } from '@admin'      // Admin 模块
import { ... } from '@writer'     // Writer 模块

// 核心和共享
import { ... } from '@core'       // 核心服务
import { ... } from '@shared'     // 共享资源

// 通用
import { ... } from '@/...'       // 任意 src/ 下的文件
```

## 📁 常用文件位置

### 添加新的 Bookstore 功能

1. **API 调用**: `src/modules/bookstore/api/bookstore.api.ts`
2. **业务逻辑**: `src/modules/bookstore/services/bookstore.service.ts`
3. **状态管理**: `src/modules/bookstore/stores/bookstore.store.ts`
4. **页面组件**: `src/modules/bookstore/views/YourView.vue`
5. **业务组件**: `src/modules/bookstore/components/YourComponent.vue`
6. **类型定义**: `src/modules/bookstore/types/bookstore.types.ts`

### 添加共享组件

- **基础组件**: `src/shared/components/base/`
- **通用组件**: `src/shared/components/common/`
- **布局组件**: `src/shared/components/layout/`

### 添加工具函数

- **核心工具**: `src/core/utils/`
- **通用工具**: `src/utils/`

## ❗ 常见问题

### Q: 导入错误 "Cannot find module '@bookstore'"

**A:** 重启你的 IDE/编辑器和开发服务器

### Q: 类型错误

**A:** 确保从正确的模块导入类型：

```typescript
// ✅ 正确
import { type Book } from '@bookstore'

// ❌ 错误
import { type Book } from '@/types/bookstore'
```

### Q: 找不到组件

**A:** 检查组件是否已移动到模块目录，更新导入路径：

```vue
<!-- ✅ 正确 -->
<script setup>
import BookCard from '@bookstore/components/BookCard.vue'
</script>

<!-- ❌ 错误 -->
<script setup>
import BookCard from '@/components/BookCard.vue'
</script>
```

### Q: Store 无法使用

**A:** 确保从模块导入 Store：

```typescript
// ✅ 推荐
import { useBookstoreStore } from '@bookstore'

// ⚠️  向后兼容
import { useBookstoreStore } from '@/stores/bookstore'
```

## 📚 文档参考

- **架构指南**: `ARCHITECTURE_REFACTORING.md`
- **架构文档**: `doc/architecture/NEW_ARCHITECTURE.md`
- **迁移报告**: `MIGRATION_COMPLETE.md`
- **进度跟踪**: `REFACTORING_PROGRESS.md`

## ✅ 功能检查清单

测试以下功能确保架构工作正常：

### Bookstore 模块
- [ ] 首页加载
- [ ] 书籍列表显示
- [ ] 书籍详情查看
- [ ] 搜索功能
- [ ] 分类浏览
- [ ] 排行榜查看

### Reader 模块
- [ ] 阅读器打开
- [ ] 章节切换
- [ ] 阅读设置
- [ ] 书架管理
- [ ] 书签功能
- [ ] 阅读历史

### User 模块
- [ ] 登录/注册
- [ ] 个人资料
- [ ] 账户设置
- [ ] 安全设置
- [ ] 钱包功能

### Admin 模块
- [ ] 仪表板
- [ ] 内容审核
- [ ] 用户管理
- [ ] 提现审核
- [ ] 操作日志

## 🎯 下一步建议

1. **立即测试**: 启动开发服务器，测试所有功能
2. **逐步迁移**: 如果发现旧的导入路径，逐步更新为新的模块导入
3. **添加测试**: 为新的服务层编写单元测试
4. **性能优化**: 利用新架构进行代码分割和懒加载优化
5. **团队培训**: 确保团队成员了解新的架构模式

## 🤝 需要帮助？

查看以下资源：

1. 详细架构文档: `doc/architecture/NEW_ARCHITECTURE.md`
2. 迁移指南: `ARCHITECTURE_REFACTORING.md`
3. Vue 3 文档: https://vuejs.org/
4. Pinia 文档: https://pinia.vuejs.org/
5. TypeScript 文档: https://www.typescriptlang.org/

---

**祝开发愉快！** 🎉

新的模块化架构将使项目更易于维护和扩展。

