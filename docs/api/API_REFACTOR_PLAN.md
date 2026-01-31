# 前端API层重构计划

## 🔍 问题分析

### 1. 重复文件
- ❌ `auth.ts` (根目录) vs `shared/auth.ts` - **重复**
- ❌ `user.ts` (根目录) vs `user/` (目录) - **混乱**
- ❌ `comment.ts` (根目录) vs `reading/comments.ts` - **重复**
- ❌ `reader.ts` (根目录) vs `reading/reader.ts` - **重复**
- ❌ `writing/` vs `writer/` - **两个目录功能重叠**

### 2. 分类不清晰
- 部分文件在根目录，部分在模块目录
- 没有统一的组织标准
- 与后端API结构不对应

### 3. 现有文件清单

#### 根目录文件（应该移除）
```
src/api/
├── auth.ts          ❌ 应移到 shared/
├── user.ts          ❌ 应移到 user/
├── comment.ts       ❌ 应移到 reading/
├── reader.ts        ❌ 应移到 reading/
├── bookstore.ts     ✅ 独立模块，需要移到目录
└── recommendation.ts ✅ 独立模块，需要移到目录
```

#### 目录结构（需要整理）
```
src/api/
├── shared/          ✅ 已有，保留
│   ├── auth.ts
│   ├── admin.ts
│   ├── wallet.ts
│   └── storage.ts
├── reading/         ✅ 已有，补充
│   ├── books.ts
│   ├── reader.ts
│   ├── comments.ts
│   ├── bookshelf.ts
│   ├── rating.ts
│   ├── history.ts
│   └── bookmarks.ts
├── user/            ⚠️ 只有security.ts，不完整
│   └── security.ts
├── writing/         ⚠️ 只有ai.ts
│   └── ai.ts
└── writer/          ❌ 与writing重复
    ├── revenue.ts
    └── statistics.ts
```

## 📐 目标结构（对应后端）

根据后端API结构：`Qingyu_backend/api/v1/`，前端应该对应：

```
src/api/
├── index.ts                    # 统一导出
├── README.md                   # API使用文档
│
├── shared/                     # 共享服务 ✅
│   ├── index.ts               # 模块导出
│   ├── auth.ts                # 认证
│   ├── wallet.ts              # 钱包
│   ├── admin.ts               # 管理员
│   ├── storage.ts             # 存储
│   └── types.ts               # 类型定义
│
├── bookstore/                  # 书城系统
│   ├── index.ts               # 模块导出
│   ├── homepage.ts            # 首页
│   ├── books.ts               # 书籍
│   ├── categories.ts          # 分类
│   ├── banners.ts             # Banner
│   └── rankings.ts            # 排行榜
│
├── reading/                    # 阅读端 ✅
│   ├── index.ts               # 模块导出
│   ├── reader.ts              # 阅读器（章节、进度）
│   ├── books.ts               # 书籍详情
│   ├── bookshelf.ts           # 书架
│   ├── comments.ts            # 评论
│   ├── rating.ts              # 评分
│   ├── history.ts             # 阅读历史
│   └── bookmarks.ts           # 书签
│
├── writing/                    # 写作端（合并writer）
│   ├── index.ts               # 模块导出
│   ├── projects.ts            # 项目管理
│   ├── documents.ts           # 文档管理
│   ├── outline.ts             # 大纲
│   ├── characters.ts          # 角色管理
│   ├── locations.ts           # 地点管理
│   ├── timeline.ts            # 时间线
│   ├── versions.ts            # 版本管理
│   ├── ai.ts                  # AI写作助手 ✅
│   ├── statistics.ts          # 统计分析
│   ├── revenue.ts             # 收入统计
│   └── audit.ts               # 审核发布
│
├── user/                       # 用户中心
│   ├── index.ts               # 模块导出
│   ├── profile.ts             # 个人资料
│   ├── security.ts            # 安全设置 ✅
│   └── preferences.ts         # 用户偏好
│
├── recommendation/             # 推荐系统
│   ├── index.ts               # 模块导出
│   └── recommendation.ts      # 推荐接口 ✅
│
└── admin/                      # 管理后台（可选，从shared分离）
    ├── index.ts
    ├── users.ts               # 用户管理
    ├── content.ts             # 内容审核
    ├── system.ts              # 系统配置
    └── analytics.ts           # 数据分析
```

## 🔄 重构步骤

### Step 1: 创建新的模块化结构

#### 1.1 重构 bookstore/
- 将 `bookstore.ts` 拆分为：
  - `bookstore/homepage.ts` - 首页数据
  - `bookstore/books.ts` - 书籍相关
  - `bookstore/categories.ts` - 分类
  - `bookstore/banners.ts` - Banner
  - `bookstore/rankings.ts` - 排行榜

#### 1.2 完善 user/
- 创建 `user/profile.ts` - 从根目录 `user.ts` 迁移
- 保留 `user/security.ts`
- 创建 `user/index.ts` - 统一导出

#### 1.3 合并 writing/ 和 writer/
- 将 `writer/statistics.ts` 移到 `writing/statistics.ts`
- 将 `writer/revenue.ts` 移到 `writing/revenue.ts`
- 补充写作端其他API（从modules/writer/api/）
- 创建 `writing/index.ts`

#### 1.4 完善 reading/
- 删除根目录 `reader.ts` 和 `comment.ts`
- 确认 `reading/` 目录完整性
- 创建 `reading/index.ts`

#### 1.5 完善 recommendation/
- 将 `recommendation.ts` 移到 `recommendation/`
- 创建 `recommendation/index.ts`

#### 1.6 清理 shared/
- 删除根目录 `auth.ts`
- 确认 `shared/auth.ts` 为主版本
- 创建或更新 `shared/index.ts`

### Step 2: 创建统一导出

每个模块创建 `index.ts`：
```typescript
// bookstore/index.ts 示例
export * from './homepage'
export * from './books'
export * from './categories'
export * from './banners'
export * from './rankings'
```

根目录创建 `index.ts`：
```typescript
// api/index.ts
export * as shared from './shared'
export * as bookstore from './bookstore'
export * as reading from './reading'
export * as writing from './writing'
export * as user from './user'
export * as recommendation from './recommendation'
export * as admin from './admin'
```

### Step 3: 更新引用

全局搜索并替换API导入：
```typescript
// 旧方式
import { login } from '@/api/auth'
import { getUserProfile } from '@/api/user'

// 新方式
import { login } from '@/api/shared/auth'
import { getUserProfile } from '@/api/user/profile'

// 或使用统一导出
import { shared, user } from '@/api'
shared.login(...)
user.getUserProfile(...)
```

### Step 4: 删除重复文件

```bash
# 删除根目录的重复文件
src/api/auth.ts          -> 删除（使用shared/auth.ts）
src/api/user.ts          -> 删除（使用user/profile.ts）
src/api/comment.ts       -> 删除（使用reading/comments.ts）
src/api/reader.ts        -> 删除（使用reading/reader.ts）

# 删除重复目录
src/api/writer/          -> 合并到writing/
```

### Step 5: 更新文档

更新 `api/README.md`：
- 新的目录结构说明
- 导入方式示例
- 每个模块的职责说明

## ✅ 验收标准

- [ ] 无重复文件
- [ ] 目录结构清晰，与后端对应
- [ ] 每个模块有 index.ts 统一导出
- [ ] 根目录有总入口 index.ts
- [ ] 所有API引用已更新
- [ ] 文档已更新
- [ ] 无TypeScript错误
- [ ] 所有功能正常运行

## 📋 模块对应关系

| 前端模块 | 后端模块 | 说明 |
|---------|---------|------|
| `shared/` | `shared/` | 共享服务（认证、钱包、管理员） |
| `bookstore/` | `bookstore/` | 书城系统 |
| `reading/` | `reading/`, `reader/` | 阅读端（合并reader模块） |
| `writing/` | `writer/`, `ai/` | 写作端（包含AI服务） |
| `user/` | `user/` | 用户中心 |
| `recommendation/` | `recommendation/` | 推荐系统 |
| `admin/` | `admin/` | 管理后台 |

## 🚀 优势

1. **清晰的模块化**：每个业务域独立目录
2. **与后端对应**：前后端结构一致，易于理解
3. **易于维护**：功能分离，职责清晰
4. **避免冲突**：无重复文件
5. **统一导出**：规范的导入方式
6. **可扩展**：易于添加新模块

## ⚠️ 注意事项

1. 重构时保持向后兼容（可选）
2. 逐步迁移，避免一次性大改动
3. 确保所有引用都已更新
4. 运行测试确保功能正常
5. 提交前review代码

---

**执行顺序**：
1. ✅ 创建新结构（不删除旧文件）
2. ✅ 更新所有引用
3. ✅ 测试功能
4. ✅ 删除旧文件
5. ✅ 更新文档

