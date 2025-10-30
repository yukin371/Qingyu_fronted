# API 接口文档

本目录包含青羽平台所有前端API接口封装。

## 📁 目录结构（重构后）

```text
api/
├── index.ts                    # 统一导出入口
├── README.md                   # 本文档
│
├── shared/                     # 共享服务模块
│   ├── index.ts               # 模块统一导出
│   ├── auth.ts                # 认证API（登录、注册、登出）
│   ├── wallet.ts              # 钱包系统API
│   ├── admin.ts               # 管理员API
│   ├── storage.ts             # 存储工具
│   └── types.ts               # 类型定义
│
├── bookstore/                  # 书城系统模块
│   ├── index.ts               # 模块统一导出
│   ├── homepage.ts            # 首页数据API
│   ├── books.ts               # 书籍相关API
│   ├── categories.ts          # 分类API
│   ├── banners.ts             # Banner API
│   └── rankings.ts            # 排行榜API
│
├── reading/                    # 阅读端模块
│   ├── index.ts               # 模块统一导出
│   ├── reader.ts              # 阅读器API（章节、进度、设置）
│   ├── books.ts               # 书籍详情API
│   ├── bookshelf.ts           # 书架API
│   ├── comments.ts            # 评论API
│   ├── rating.ts              # 评分系统API
│   ├── history.ts             # 阅读历史API
│   └── bookmarks.ts           # 书签API
│
├── writing/                    # 写作端模块
│   ├── index.ts               # 模块统一导出
│   ├── ai.ts                  # AI写作助手API
│   ├── statistics.ts          # 作品统计API
│   └── revenue.ts             # 收入统计API
│
├── user/                       # 用户中心模块
│   ├── index.ts               # 模块统一导出
│   ├── profile.ts             # 个人资料API
│   └── security.ts            # 安全设置API
│
└── recommendation/             # 推荐系统模块
    ├── index.ts               # 模块统一导出
    └── recommendation.ts      # 推荐API
```

## 🚀 使用方式

### 方式1：命名空间导入（推荐）

```typescript
import { bookstore, reading, user, shared } from '@/api'

// 使用
await bookstore.getHomepage()
await reading.getChapterContent(chapterId)
await user.getUserProfile()
await shared.login(loginData)
```

### 方式2：直接导入函数

```typescript
import { getHomepage } from '@/api/bookstore'
import { getUserProfile } from '@/api/user'

// 使用
await getHomepage()
await getUserProfile()
```

### 方式3：从子模块导入

```typescript
import { getHomepage } from '@/api/bookstore/homepage'
import { getBookDetail } from '@/api/bookstore/books'
import { getUserProfile } from '@/api/user/profile'

// 使用
await getHomepage()
await getBookDetail(bookId)
await getUserProfile()
```

## 📖 API模块说明

### 1. 共享服务 (shared/)

**认证相关** (`auth.ts`)
- `register()` - 用户注册
- `login()` - 用户登录
- `logout()` - 用户登出
- `refreshToken()` - 刷新Token

**钱包系统** (`wallet.ts`)
- 余额查询、充值、提现
- 交易记录查询

**管理员** (`admin.ts`)
- 用户管理、内容审核
- 系统配置

### 2. 书城系统 (bookstore/)

**首页** (`homepage.ts`)
- `getHomepage()` - 获取首页数据（Banner、榜单、推荐）

**书籍** (`books.ts`)
- `getBookDetail(bookId)` - 获取书籍详情
- `searchBooks(params)` - 搜索书籍
- `getRecommendedBooks()` - 获取推荐书籍
- `getFeaturedBooks()` - 获取精选书籍
- `incrementBookView(bookId)` - 增加浏览量

**分类** (`categories.ts`)
- `getCategoryTree()` - 获取分类树
- `getCategoryDetail(categoryId)` - 获取分类详情
- `getBooksByCategory(categoryId)` - 根据分类获取书籍

**Banner** (`banners.ts`)
- `getBanners()` - 获取Banner列表
- `incrementBannerClick(bannerId)` - 增加点击量

**排行榜** (`rankings.ts`)
- `getRealtimeRanking()` - 实时榜
- `getWeeklyRanking()` - 周榜
- `getMonthlyRanking()` - 月榜
- `getNewbieRanking()` - 新人榜
- `getRankingByType(type)` - 按类型获取榜单

### 3. 阅读端 (reading/)

**阅读器** (`reader.ts`)
- 章节内容、进度管理
- 阅读设置、注记功能

**书籍** (`books.ts`)
- 书籍列表、详情、搜索

**书架** (`bookshelf.ts`)
- 添加/删除书籍、书架管理

**评论** (`comments.ts`)
- 创建、更新、删除评论
- 点赞、回复

**评分** (`rating.ts`)
- 评分管理、统计

**历史** (`history.ts`)
- 阅读历史记录

**书签** (`bookmarks.ts`)
- 书签管理

### 4. 写作端 (writing/)

**AI助手** (`ai.ts`)
- `chatWithAI()` - AI对话
- `continueWriting()` - 续写
- `polishText()` - 润色
- `expandText()` - 扩写
- `rewriteText()` - 改写

**统计** (`statistics.ts`)
- `getBookStats(bookId)` - 作品统计概览
- `getDailyStats(bookId)` - 每日数据
- `getChapterStats(bookId)` - 章节统计
- `getReaderActivity(bookId)` - 读者活跃度
- `getReadingHeatmap(bookId)` - 阅读时段热力图

**收入** (`revenue.ts`)
- `getRevenueStats()` - 收入统计
- `getRevenueTrend()` - 收入趋势
- `getRevenueSources()` - 收入来源分布
- `getChapterRevenueRanking()` - 章节收入排行

### 5. 用户中心 (user/)

**个人资料** (`profile.ts`)
- `getUserProfile()` - 获取个人信息
- `updateUserProfile(data)` - 更新个人信息
- `changePassword()` - 修改密码
- `uploadAvatar(file)` - 上传头像

**安全设置** (`security.ts`)
- 安全相关设置

### 6. 推荐系统 (recommendation/)

**推荐** (`recommendation.ts`)
- `getPersonalizedRecommendations()` - 个性化推荐
- `getSimilarRecommendations()` - 相似推荐
- `recordBehavior()` - 记录用户行为
- `getHomepageRecommendations()` - 首页推荐
- `getTrendingRecommendations()` - 热门推荐
- `getCategoryRecommendations()` - 分类推荐

## 💡 开发规范

### 1. API接口命名

- 使用驼峰命名法
- 动词在前，名词在后
- 明确表达接口功能

```typescript
// 推荐
getBookList()
createAnnotation()
updateProfile()

// 不推荐
bookList()
annotation()
profile()
```

### 2. 参数传递

```typescript
// 简单参数直接传递
getBookDetail(bookId)

// 复杂参数使用对象
getBookList({
  page: 1,
  size: 20,
  category: '玄幻',
  sort: 'popular'
})
```

### 3. 响应处理

所有API接口返回的数据结构：

```typescript
{
  code: 200,           // 状态码
  message: "成功",     // 消息
  data: {},            // 数据
  total: 100,          // 总数（分页接口）
  page: 1,             // 当前页（分页接口）
  size: 20             // 每页数量（分页接口）
}
```

### 4. 错误处理

统一在 `utils/request.ts` 中处理常见错误：

- 401：未认证，跳转登录
- 403：权限不足
- 404：资源不存在
- 500：服务器错误

## 🔗 与后端对应关系

| 前端模块 | 后端模块 | 说明 |
|---------|---------|------|
| `shared/` | `shared/` | 共享服务（认证、钱包、管理员） |
| `bookstore/` | `bookstore/` | 书城系统 |
| `reading/` | `reading/`, `reader/` | 阅读端（合并reader模块） |
| `writing/` | `writer/`, `ai/` | 写作端（包含AI服务） |
| `user/` | `user/` | 用户中心 |
| `recommendation/` | `recommendation/` | 推荐系统 |

## 📝 迁移指南

### 旧版本 → 新版本

```typescript
// ❌ 旧版本（已废弃）
import { login } from '@/api/auth'
import { getUserProfile } from '@/api/user'
import { getBookDetail } from '@/api/bookstore'

// ✅ 新版本（推荐）
import { shared, user, bookstore } from '@/api'
shared.login()
user.getUserProfile()
bookstore.getBookDetail()

// ✅ 或者直接导入
import { login } from '@/api/shared/auth'
import { getUserProfile } from '@/api/user/profile'
import { getBookDetail } from '@/api/bookstore/books'
```

## 🔧 相关文档

- [请求封装说明](../utils/request.ts)
- [后端API文档](../../../Qingyu_backend/doc/api/)
- [项目开发规范](../../../doc/项目开发规范.md)

## ✅ 最近更新

### 2025-10-30

- ✅ **重构API层结构**，按业务模块化组织
  - 拆分 `bookstore.ts` 为 5 个子模块
  - 完善 `user/` 模块
  - 合并 `writing/` 和 `writer/` 模块
  - 为每个模块添加统一导出
- ✅ **与后端对应**，前后端结构一致
- ✅ **清理重复文件**，避免冲突
- ✅ **统一导出方式**，支持多种导入方式

### 2025-10-18

- ✅ 新增推荐系统API (`recommendation.ts`)
- ✅ 新增完整API测试工具 (`/api-test-comprehensive`)

---

**维护者**: 青羽前端团队  
**最后更新**: 2025-10-30
