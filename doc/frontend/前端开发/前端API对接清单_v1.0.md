# 前端API对接清单 v1.0

**制定日期**: 2025-10-27  
**文档目的**: 明确前端需要对接的所有后端API，按Phase和优先级组织

---

## 📊 API对接总览

| Phase | API模块 | API数量 | 后端状态 | 前端状态 | 优先级 |
|-------|---------|---------|---------|---------|--------|
| **Phase 0** | 用户系统 | 7个 | ✅ 完成 | ⏳ 待对接 | P0 🔥 |
| **Phase 0** | 书城系统 | 15个 | ✅ 完成 | ⏳ 待对接 | P0 🔥 |
| **Phase 0** | 阅读器 | 12个 | ✅ 完成 | ⏳ 待对接 | P0 🔥 |
| **Phase 0** | 推荐系统 | 6个 | ✅ 完成 | ⏳ 待对接 | P1 |
| **Phase 1** | 项目管理 | 6个 | ✅ 完成 | ⏳ 待对接 | P0 🔥 |
| **Phase 1** | 文档管理 | 12个 | ✅ 完成 | ⏳ 待对接 | P0 🔥 |
| **Phase 1** | 编辑器 | 8个 | ✅ 完成 | ⏳ 待对接 | P0 🔥 |
| **Phase 1** | 统计 | 8个 | ✅ 完成 | ⏳ 待对接 | P1 |
| **Phase 1** | 钱包 | 7个 | ✅ 完成 | ⏳ 待对接 | P1 |
| **Phase 2** | 文件存储 | 15个 | ✅ 完成 | ⏳ 待对接 | P1 |
| **Phase 2** | 消息通知 | 5个 | 🚀 开发中 | ⏳ 待对接 | P1 |
| **Phase 3** | AI服务 | 20+个 | ⏳ 待开发 | ⏳ 待对接 | P0 🔥 |
| **Phase 3** | RAG系统 | 10+个 | ⏳ 待开发 | ⏳ 待对接 | P0 🔥 |
| **Phase 3** | Agent工具 | 8+个 | ⏳ 待开发 | ⏳ 待对接 | P0 🔥 |
| **Phase 3** | 设定百科 | 12+个 | ⏳ 待开发 | ⏳ 待对接 | P1 |

**总计**: 151+ 个API端点

---

## Phase 0: 读者端核心API (54个)

### 1. 用户系统API (7个) ✅

| 功能 | 方法 | 路径 | 需认证 | 优先级 | 状态 |
|------|------|------|--------|--------|------|
| 用户注册 | POST | `/register` | ❌ | P0 🔥 | ⏳ |
| 用户登录 | POST | `/login` | ❌ | P0 🔥 | ⏳ |
| 登出 | POST | `/shared/auth/logout` | ✅ | P0 🔥 | ⏳ |
| 刷新Token | POST | `/shared/auth/refresh` | ✅ | P0 🔥 | ⏳ |
| 获取个人信息 | GET | `/users/profile` | ✅ | P0 🔥 | ⏳ |
| 更新个人信息 | PUT | `/users/profile` | ✅ | P1 | ⏳ |
| 修改密码 | PUT | `/users/password` | ✅ | P1 | ⏳ |

**对接指南**: 参见 [认证API参考](../../../api/frontend/认证API参考.md)

---

### 2. 书城系统API (20个) ✅

#### 2.1 首页与书籍 (9个)

| 功能 | 方法 | 路径 | 需认证 | 优先级 | 状态 |
|------|------|------|--------|--------|------|
| 获取首页数据 | GET | `/bookstore/homepage` | ❌ | P0 🔥 | ⏳ |
| 获取书籍详情 | GET | `/bookstore/books/:id` | ❌ | P0 🔥 | ⏳ |
| 根据分类获取书籍 | GET | `/bookstore/categories/:categoryId/books` | ❌ | P0 🔥 | ⏳ |
| 获取推荐书籍 | GET | `/bookstore/books/recommended` | ❌ | P1 | ⏳ |
| 获取精选书籍 | GET | `/bookstore/books/featured` | ❌ | P1 | ⏳ |
| 搜索书籍 | GET | `/bookstore/books/search` | ❌ | P0 🔥 | ⏳ |
| 增加浏览量 | POST | `/bookstore/books/:id/view` | ❌ | P2 | ⏳ |
| 获取书籍列表 | GET | `/bookstore/books` | ❌ | P1 | ⏳ |
| 获取热门书籍 | GET | `/bookstore/books/hot` | ❌ | P1 | ⏳ |

#### 2.2 分类管理 (3个)

| 功能 | 方法 | 路径 | 需认证 | 优先级 | 状态 |
|------|------|------|--------|--------|------|
| 获取分类树 | GET | `/bookstore/categories/tree` | ❌ | P0 🔥 | ⏳ |
| 获取分类详情 | GET | `/bookstore/categories/:id` | ❌ | P1 | ⏳ |
| 获取分类列表 | GET | `/bookstore/categories` | ❌ | P1 | ⏳ |

#### 2.3 Banner管理 (2个)

| 功能 | 方法 | 路径 | 需认证 | 优先级 | 状态 |
|------|------|------|--------|--------|------|
| 获取Banner列表 | GET | `/bookstore/banners` | ❌ | P0 🔥 | ⏳ |
| 增加Banner点击 | POST | `/bookstore/banners/:id/click` | ❌ | P2 | ⏳ |

#### 2.4 榜单系统 (6个)

| 功能 | 方法 | 路径 | 需认证 | 优先级 | 状态 |
|------|------|------|--------|--------|------|
| 实时榜 | GET | `/bookstore/rankings/realtime` | ❌ | P1 | ⏳ |
| 周榜 | GET | `/bookstore/rankings/weekly` | ❌ | P1 | ⏳ |
| 月榜 | GET | `/bookstore/rankings/monthly` | ❌ | P1 | ⏳ |
| 新人榜 | GET | `/bookstore/rankings/newbie` | ❌ | P1 | ⏳ |
| 按类型获取榜单 | GET | `/bookstore/rankings/:type` | ❌ | P1 | ⏳ |
| 获取榜单列表 | GET | `/bookstore/rankings` | ❌ | P1 | ⏳ |

**对接指南**: 参见 [书城API参考](../../../api/frontend/书城API参考.md)

---

### 3. 阅读器API (21个) ✅

#### 3.1 章节阅读 (7个)

| 功能 | 方法 | 路径 | 需认证 | 优先级 | 状态 |
|------|------|------|--------|--------|------|
| 获取章节信息 | GET | `/reader/chapters/:id` | ❌ | P0 🔥 | ⏳ |
| 获取章节内容 | GET | `/reader/chapters/:id/content` | ✅ | P0 🔥 | ⏳ |
| 获取书籍章节列表 | GET | `/reader/chapters` | ❌ | P0 🔥 | ⏳ |
| 获取阅读设置 | GET | `/reader/settings` | ✅ | P1 | ⏳ |
| 保存阅读设置 | POST | `/reader/settings` | ✅ | P1 | ⏳ |
| 更新阅读设置 | PUT | `/reader/settings` | ✅ | P1 | ⏳ |
| 批量获取章节 | GET | `/reader/chapters/batch` | ❌ | P2 | ⏳ |

#### 3.2 评论功能 (8个) ⭐新增点赞

| 功能 | 方法 | 路径 | 需认证 | 优先级 | 状态 |
|------|------|------|--------|--------|------|
| 发表评论 | POST | `/reader/comments` | ✅ | P1 | ⏳ |
| 获取评论列表 | GET | `/reader/comments` | ❌ | P1 | ⏳ |
| 获取评论详情 | GET | `/reader/comments/:id` | ❌ | P1 | ⏳ |
| 更新评论 | PUT | `/reader/comments/:id` | ✅ | P2 | ⏳ |
| 删除评论 | DELETE | `/reader/comments/:id` | ✅ | P2 | ⏳ |
| 回复评论 | POST | `/reader/comments/:id/reply` | ✅ | P1 | ⏳ |
| **点赞评论** ⭐ | POST | `/reader/comments/:id/like` | ✅ | P1 | ⏳ |
| **取消点赞** ⭐ | DELETE | `/reader/comments/:id/like` | ✅ | P1 | ⏳ |

#### 3.3 阅读历史 (6个)

| 功能 | 方法 | 路径 | 需认证 | 优先级 | 状态 |
|------|------|------|--------|--------|------|
| 记录阅读 | POST | `/reader/reading-history` | ✅ | P0 🔥 | ⏳ |
| 获取历史列表 | GET | `/reader/reading-history` | ✅ | P1 | ⏳ |
| 获取阅读统计 | GET | `/reader/reading-history/stats` | ✅ | P1 | ⏳ |
| 删除历史记录 | DELETE | `/reader/reading-history/:id` | ✅ | P2 | ⏳ |
| 清空历史记录 | DELETE | `/reader/reading-history` | ✅ | P2 | ⏳ |
| 获取阅读进度 | GET | `/reader/reading-history/progress` | ✅ | P0 🔥 | ⏳ |

**对接指南**: 参见 [阅读器API参考](../../../api/frontend/阅读器API参考.md)

---

### 4. 推荐系统API (6个) ✅

| 功能 | 方法 | 路径 | 需认证 | 优先级 | 状态 |
|------|------|------|--------|--------|------|
| 获取个性化推荐 | GET | `/recommendation/personalized` | ✅ | P1 | ⏳ |
| 获取相似物品 | GET | `/recommendation/similar` | ❌ | P1 | ⏳ |
| 记录用户行为 | POST | `/recommendation/behavior` | ✅ | P1 | ⏳ |
| 获取首页推荐 | GET | `/recommendation/homepage` | ❌ | P1 | ⏳ |
| 获取热门推荐 | GET | `/recommendation/hot` | ❌ | P1 | ⏳ |
| 获取分类推荐 | GET | `/recommendation/category` | ❌ | P2 | ⏳ |

**对接指南**: 参见 [推荐系统API参考](../../../api/frontend/推荐系统API参考.md)

---

## Phase 1: 写作端核心API (41个)

### 5. 项目管理API (6个) ✅

| 功能 | 方法 | 路径 | 需认证 | 优先级 | 状态 |
|------|------|------|--------|--------|------|
| 创建项目 | POST | `/projects` | ✅ | P0 🔥 | ⏳ |
| 获取项目列表 | GET | `/projects` | ✅ | P0 🔥 | ⏳ |
| 获取项目详情 | GET | `/projects/:id` | ✅ | P0 🔥 | ⏳ |
| 更新项目 | PUT | `/projects/:id` | ✅ | P1 | ⏳ |
| 删除项目 | DELETE | `/projects/:id` | ✅ | P1 | ⏳ |
| 更新项目统计 | PUT | `/projects/:id/statistics` | ✅ | P2 | ⏳ |

---

### 6. 文档管理API (12个) ✅

| 功能 | 方法 | 路径 | 需认证 | 优先级 | 状态 |
|------|------|------|--------|--------|------|
| 创建文档 | POST | `/projects/:projectId/documents` | ✅ | P0 🔥 | ⏳ |
| 获取文档列表 | GET | `/projects/:projectId/documents` | ✅ | P0 🔥 | ⏳ |
| 获取文档树 | GET | `/projects/:projectId/documents/tree` | ✅ | P0 🔥 | ⏳ |
| 获取文档详情 | GET | `/documents/:id` | ✅ | P0 🔥 | ⏳ |
| 更新文档 | PUT | `/documents/:id` | ✅ | P0 🔥 | ⏳ |
| 删除文档 | DELETE | `/documents/:id` | ✅ | P1 | ⏳ |
| 移动文档 | PUT | `/documents/:id/move` | ✅ | P1 | ⏳ |
| 重新排序 | PUT | `/projects/:projectId/documents/reorder` | ✅ | P1 | ⏳ |
| 复制文档 | POST | `/documents/:id/copy` | ✅ | P2 | ⏳ |
| 批量删除 | DELETE | `/documents/batch` | ✅ | P2 | ⏳ |
| 搜索文档 | GET | `/projects/:projectId/documents/search` | ✅ | P1 | ⏳ |
| 获取最近文档 | GET | `/documents/recent` | ✅ | P1 | ⏳ |

---

### 7. 编辑器API (8个) ✅

| 功能 | 方法 | 路径 | 需认证 | 优先级 | 状态 |
|------|------|------|--------|--------|------|
| 自动保存 | POST | `/documents/:id/autosave` | ✅ | P0 🔥 | ⏳ |
| 获取保存状态 | GET | `/documents/:id/save-status` | ✅ | P1 | ⏳ |
| 获取文档内容 | GET | `/documents/:id/content` | ✅ | P0 🔥 | ⏳ |
| 更新文档内容 | PUT | `/documents/:id/content` | ✅ | P0 🔥 | ⏳ |
| 计算字数 | POST | `/documents/:id/word-count` | ✅ | P1 | ⏳ |
| 获取快捷键配置 | GET | `/user/shortcuts` | ✅ | P2 | ⏳ |
| 更新快捷键 | PUT | `/user/shortcuts` | ✅ | P2 | ⏳ |
| 重置快捷键 | POST | `/user/shortcuts/reset` | ✅ | P2 | ⏳ |

---

### 8. 数据统计API (8个) ✅

| 功能 | 方法 | 路径 | 需认证 | 优先级 | 状态 |
|------|------|------|--------|--------|------|
| 获取作品统计 | GET | `/writer/books/:book_id/stats` | ✅ | P1 | ⏳ |
| 获取章节统计 | GET | `/writer/chapters/:chapter_id/stats` | ✅ | P1 | ⏳ |
| 获取阅读热力图 | GET | `/writer/books/:book_id/heatmap` | ✅ | P1 | ⏳ |
| 获取收入统计 | GET | `/writer/books/:book_id/revenue` | ✅ | P1 | ⏳ |
| 获取热门章节 | GET | `/writer/books/:book_id/top-chapters` | ✅ | P1 | ⏳ |
| 获取每日统计 | GET | `/writer/books/:book_id/daily-stats` | ✅ | P1 | ⏳ |
| 获取跳出点分析 | GET | `/writer/books/:book_id/drop-off-points` | ✅ | P1 | ⏳ |
| 获取留存率 | GET | `/writer/books/:book_id/retention` | ✅ | P1 | ⏳ |

---

### 9. 钱包API (7个) ✅

| 功能 | 方法 | 路径 | 需认证 | 优先级 | 状态 |
|------|------|------|--------|--------|------|
| 查询余额 | GET | `/shared/wallet/balance` | ✅ | P1 | ⏳ |
| 获取钱包信息 | GET | `/shared/wallet` | ✅ | P1 | ⏳ |
| 充值 | POST | `/shared/wallet/recharge` | ✅ | P1 | ⏳ |
| 消费 | POST | `/shared/wallet/consume` | ✅ | P2 | ⏳ |
| 转账 | POST | `/shared/wallet/transfer` | ✅ | P2 | ⏳ |
| 交易历史 | GET | `/shared/wallet/transactions` | ✅ | P1 | ⏳ |
| 申请提现 | POST | `/shared/wallet/withdraw` | ✅ | P1 | ⏳ |

**对接指南**: 参见 [写作系统API参考](../../../api/frontend/写作系统API参考.md) 和 [共享服务API参考](../../../api/frontend/共享服务API参考.md)

---

## Phase 2: 核心功能增强API (20个)

### 10. 文件存储API (15个) ✅ 已完成

| 功能 | 方法 | 路径 | 需认证 | 优先级 | 状态 |
|------|------|------|--------|--------|------|
| 上传文件 | POST | `/files/upload` | ✅ | P1 | ✅ |
| 下载文件 | GET | `/files/:id/download` | ✅ | P1 | ✅ |
| 获取文件信息 | GET | `/files/:id` | ✅ | P1 | ✅ |
| 删除文件 | DELETE | `/files/:id` | ✅ | P1 | ✅ |
| 查询文件列表 | GET | `/files` | ✅ | P1 | ✅ |
| 获取下载链接 | GET | `/files/:id/url` | ✅ | P1 | ✅ |
| 初始化分片上传 | POST | `/files/multipart/init` | ✅ | P2 | ✅ |
| 上传分片 | POST | `/files/multipart/upload` | ✅ | P2 | ✅ |
| 完成分片上传 | POST | `/files/multipart/complete` | ✅ | P2 | ✅ |
| 中止分片上传 | POST | `/files/multipart/abort` | ✅ | P2 | ✅ |
| 获取上传进度 | GET | `/files/multipart/progress` | ✅ | P2 | ✅ |
| 生成缩略图 | POST | `/files/thumbnail` | ✅ | P2 | ✅ |
| 授予访问权限 | POST | `/files/:file_id/access` | ✅ | P2 | ✅ |
| 撤销访问权限 | DELETE | `/files/:file_id/access` | ✅ | P2 | ✅ |
| 批量上传 | POST | `/files/batch-upload` | ✅ | P2 | ✅ |

---

### 11. 消息通知API (5个) 🚀 开发中

| 功能 | 方法 | 路径 | 需认证 | 优先级 | 状态 |
|------|------|------|--------|--------|------|
| 获取消息列表 | GET | `/messages` | ✅ | P1 | 🚀 |
| 标记已读 | PUT | `/messages/:id/read` | ✅ | P1 | 🚀 |
| 删除消息 | DELETE | `/messages/:id` | ✅ | P2 | 🚀 |
| 获取未读数量 | GET | `/messages/unread-count` | ✅ | P1 | 🚀 |
| 全部标记已读 | PUT | `/messages/read-all` | ✅ | P2 | 🚀 |

---

## Phase 3: AI能力提升API (50+个) ⏳ 待开发

### 12. AI基础服务API (10个) ⏳

| 功能 | 方法 | 路径 | 需认证 | 优先级 | 状态 |
|------|------|------|--------|--------|------|
| 智能续写 | POST | `/ai/continue-writing` | ✅ | P0 🔥 | ⏳ |
| 文本改写 | POST | `/ai/rewrite` | ✅ | P0 🔥 | ⏳ |
| 文本扩写 | POST | `/ai/expand` | ✅ | P0 🔥 | ⏳ |
| 文本润色 | POST | `/ai/polish` | ✅ | P0 🔥 | ⏳ |
| 大纲生成 | POST | `/ai/generate-outline` | ✅ | P0 🔥 | ⏳ |
| 获取AI配额 | GET | `/ai/quota` | ✅ | P0 🔥 | ⏳ |
| 配额充值 | POST | `/ai/quota/recharge` | ✅ | P1 | ⏳ |
| 配额使用历史 | GET | `/ai/quota/history` | ✅ | P1 | ⏳ |
| 切换AI提供商 | POST | `/ai/provider/switch` | ✅ | P2 | ⏳ |
| 获取AI模型列表 | GET | `/ai/models` | ✅ | P2 | ⏳ |

---

### 13. RAG检索增强API (15个) ⏳

| 功能 | 方法 | 路径 | 需认证 | 优先级 | 状态 |
|------|------|------|--------|--------|------|
| 上传知识库文档 | POST | `/rag/knowledge/upload` | ✅ | P0 🔥 | ⏳ |
| 删除知识库文档 | DELETE | `/rag/knowledge/:id` | ✅ | P1 | ⏳ |
| 获取知识库列表 | GET | `/rag/knowledge` | ✅ | P0 🔥 | ⏳ |
| 向量化处理 | POST | `/rag/knowledge/:id/vectorize` | ✅ | P0 🔥 | ⏳ |
| 搜索知识库 | POST | `/rag/search` | ✅ | P0 🔥 | ⏳ |
| RAG增强续写 | POST | `/rag/continue-writing` | ✅ | P0 🔥 | ⏳ |
| RAG增强改写 | POST | `/rag/rewrite` | ✅ | P1 | ⏳ |
| 获取引用来源 | GET | `/rag/citations` | ✅ | P1 | ⏳ |
| 相关内容推荐 | GET | `/rag/related` | ✅ | P1 | ⏳ |
| 知识库统计 | GET | `/rag/knowledge/stats` | ✅ | P1 | ⏳ |
| 更新知识库 | PUT | `/rag/knowledge/:id` | ✅ | P1 | ⏳ |
| 知识库分类 | GET | `/rag/knowledge/categories` | ✅ | P2 | ⏳ |
| 批量上传 | POST | `/rag/knowledge/batch-upload` | ✅ | P2 | ⏳ |
| 导入导出 | POST | `/rag/knowledge/export` | ✅ | P2 | ⏳ |
| 索引管理 | POST | `/rag/index/rebuild` | ✅ | P2 | ⏳ |

---

### 14. AI Agent工具API (12个) ⏳

| 功能 | 方法 | 路径 | 需认证 | 优先级 | 状态 |
|------|------|------|--------|--------|------|
| 获取工具列表 | GET | `/agent/tools` | ✅ | P0 🔥 | ⏳ |
| 执行工具 | POST | `/agent/tools/:tool_id/execute` | ✅ | P0 🔥 | ⏳ |
| 获取执行结果 | GET | `/agent/executions/:id` | ✅ | P0 🔥 | ⏳ |
| 大纲生成工具 | POST | `/agent/tools/outline` | ✅ | P0 🔥 | ⏳ |
| 角色卡创建工具 | POST | `/agent/tools/character` | ✅ | P0 🔥 | ⏳ |
| 关系图谱生成 | POST | `/agent/tools/relationship-graph` | ✅ | P0 🔥 | ⏳ |
| 设定生成工具 | POST | `/agent/tools/worldbuilding` | ✅ | P1 | ⏳ |
| 情节建议工具 | POST | `/agent/tools/plot-suggestion` | ✅ | P1 | ⏳ |
| 工具执行历史 | GET | `/agent/executions` | ✅ | P1 | ⏳ |
| 取消执行 | DELETE | `/agent/executions/:id` | ✅ | P2 | ⏳ |
| 工具配置 | PUT | `/agent/tools/:tool_id/config` | ✅ | P2 | ⏳ |
| 自定义工具 | POST | `/agent/tools/custom` | ✅ | P2 | ⏳ |

---

### 15. 设定百科API (13个) ⏳

| 功能 | 方法 | 路径 | 需认证 | 优先级 | 状态 |
|------|------|------|--------|--------|------|
| 创建角色卡 | POST | `/worldbuilding/characters` | ✅ | P0 🔥 | ⏳ |
| 获取角色卡列表 | GET | `/worldbuilding/characters` | ✅ | P0 🔥 | ⏳ |
| 获取角色卡详情 | GET | `/worldbuilding/characters/:id` | ✅ | P0 🔥 | ⏳ |
| 更新角色卡 | PUT | `/worldbuilding/characters/:id` | ✅ | P1 | ⏳ |
| 删除角色卡 | DELETE | `/worldbuilding/characters/:id` | ✅ | P1 | ⏳ |
| 创建世界观设定 | POST | `/worldbuilding/settings` | ✅ | P0 🔥 | ⏳ |
| 获取设定列表 | GET | `/worldbuilding/settings` | ✅ | P0 🔥 | ⏳ |
| 更新设定 | PUT | `/worldbuilding/settings/:id` | ✅ | P1 | ⏳ |
| 删除设定 | DELETE | `/worldbuilding/settings/:id` | ✅ | P1 | ⏳ |
| 获取设定模板 | GET | `/worldbuilding/templates` | ✅ | P1 | ⏳ |
| 创建自定义模板 | POST | `/worldbuilding/templates` | ✅ | P2 | ⏳ |
| 关系图谱 | GET | `/worldbuilding/relationships` | ✅ | P1 | ⏳ |
| 更新关系 | PUT | `/worldbuilding/relationships/:id` | ✅ | P2 | ⏳ |

---

## 🎯 对接优先级说明

### P0 🔥 (必须完成)
- **用户认证**: 登录、注册、Token刷新
- **书城核心**: 首页、书籍详情、分类、搜索
- **阅读器核心**: 章节内容、阅读进度
- **写作核心**: 项目管理、文档管理、编辑器、自动保存
- **AI核心**: 续写、改写、扩写、润色、大纲生成
- **RAG核心**: 知识库管理、搜索、增强生成
- **Agent核心**: 工具列表、执行工具、核心工具

**总计**: ~60个P0 API

### P1 (重要功能)
- **用户**: 个人信息管理、密码修改
- **书城**: 推荐书籍、精选书籍、榜单
- **阅读器**: 评论、阅读设置、阅读历史
- **推荐系统**: 全部功能
- **写作**: 文档操作、统计、钱包
- **文件存储**: 上传下载核心功能
- **消息通知**: 消息列表、已读标记
- **AI**: 配额管理、提供商切换
- **RAG**: 引用来源、相关推荐
- **Agent**: 高级工具、执行历史
- **设定百科**: 角色卡、世界观设定

**总计**: ~50个P1 API

### P2 (优化功能)
- **书城**: 浏览量统计、点击统计
- **阅读器**: 批量操作
- **写作**: 快捷键配置、批量操作
- **文件存储**: 分片上传、图片处理
- **AI**: 模型列表、高级配置
- **RAG**: 批量上传、索引管理
- **Agent**: 自定义工具
- **设定百科**: 自定义模板

**总计**: ~20个P2 API

---

## 📋 对接进度跟踪

### Phase 0: 读者端 (Week 1-2)

- [ ] **Day 1**: 用户认证API (7个) - P0 🔥
- [ ] **Day 2-3**: 用户系统API完成
- [ ] **Day 4**: 书城首页API (9个) - P0 🔥
- [ ] **Day 5**: 书城分类、Banner、榜单API (11个) - P1
- [ ] **Day 6**: 阅读器章节API (7个) - P0 🔥
- [ ] **Day 7**: 阅读器评论、历史API (14个) - P1
- [ ] **Day 8**: 推荐系统API (6个) - P1
- [ ] **Day 9-10**: 集成测试和优化

**本Phase对接**: 54个API

---

### Phase 1: 写作端 (Week 3-4)

- [ ] **Day 11**: 项目管理API (6个) - P0 🔥
- [ ] **Day 12-13**: 文档管理API (12个) - P0 🔥
- [ ] **Day 14-15**: 编辑器API (8个) - P0 🔥
- [ ] **Day 16**: 数据统计API (8个) - P1
- [ ] **Day 17-18**: 钱包API (7个) - P1
- [ ] **Day 19-20**: 集成测试和优化

**本Phase对接**: 41个API

---

### Phase 2: 核心功能增强 (Week 5-6)

- [ ] **Day 21-22**: 文件存储API (15个) - P1
- [ ] **Day 23-24**: 搜索优化 - P1
- [ ] **Day 25**: 消息通知API (5个) - P1
- [ ] **Day 26-30**: 集成测试和优化

**本Phase对接**: 20个API

---

### Phase 3: AI能力提升 (Week 7-14) 🚀🔥

- [ ] **Week 7**: AI基础服务API (10个) - P0 🔥
- [ ] **Week 8**: AI功能完善和测试
- [ ] **Week 9-10**: RAG检索增强API (15个) - P0 🔥
- [ ] **Week 11-12**: AI Agent工具API (12个) - P0 🔥
- [ ] **Week 13-14**: 设定百科API (13个) - P1

**本Phase对接**: 50+个API

---

## 🛠️ 对接工具与资源

### 1. API文档
- ✅ [前端集成指南](../../../api/frontend/前端集成指南.md) - 8000字完整指南
- ✅ [API快速参考](../../../api/frontend/API快速参考.md) - 6000字速查表
- ✅ [TypeScript类型定义](../../../api/frontend/) - 500+行类型定义
- ✅ Swagger UI: `http://localhost:8080/swagger`

### 2. 代码模板
```typescript
// api/auth.ts
import request from '@/utils/request';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userID: string;
  username: string;
}

export function login(data: LoginRequest): Promise<LoginResponse> {
  return request.post('/login', data);
}
```

### 3. 测试工具
- **Postman Collection**: 预配置所有API请求
- **API Mock Server**: 前期独立开发用
- **API测试脚本**: 自动化API测试

---

## 📊 对接统计

| 分类 | API数量 | P0数量 | P1数量 | P2数量 | 已完成 | 进行中 | 待开始 |
|------|---------|--------|--------|--------|--------|--------|--------|
| 用户系统 | 7 | 4 | 3 | 0 | 0 | 0 | 7 |
| 书城系统 | 20 | 6 | 10 | 4 | 0 | 0 | 20 |
| 阅读器 | 21 | 6 | 11 | 4 | 0 | 0 | 21 |
| 推荐系统 | 6 | 0 | 5 | 1 | 0 | 0 | 6 |
| 项目管理 | 6 | 3 | 2 | 1 | 0 | 0 | 6 |
| 文档管理 | 12 | 5 | 5 | 2 | 0 | 0 | 12 |
| 编辑器 | 8 | 4 | 2 | 2 | 0 | 0 | 8 |
| 统计 | 8 | 0 | 8 | 0 | 0 | 0 | 8 |
| 钱包 | 7 | 0 | 5 | 2 | 0 | 0 | 7 |
| 文件存储 | 15 | 0 | 6 | 9 | 15 | 0 | 0 |
| 消息通知 | 5 | 0 | 3 | 2 | 0 | 5 | 0 |
| AI基础 | 10 | 5 | 3 | 2 | 0 | 0 | 10 |
| RAG系统 | 15 | 6 | 6 | 3 | 0 | 0 | 15 |
| Agent工具 | 12 | 6 | 4 | 2 | 0 | 0 | 12 |
| 设定百科 | 13 | 5 | 6 | 2 | 0 | 0 | 13 |
| **总计** | **165** | **50** | **79** | **36** | **15** | **5** | **145** |

---

## 🎯 下一步行动

### 立即行动 (Week 1)
1. **Day 1**: 项目初始化，Axios封装，TypeScript类型定义
2. **Day 2-3**: 对接用户认证API（7个P0 API）
3. **Day 4-5**: 对接书城核心API（首页、详情、搜索）

### 持续跟踪
- **每日**: 更新对接进度
- **每周**: 与后端同步API变更
- **每Phase**: 验收对接质量

---

**文档维护**: 前端API对接负责人  
**最后更新**: 2025-10-27  
**版本**: v1.0

---

**关键提示**: 
- ✅ **文件存储API已完成**，可立即对接
- 🚀 **消息通知API开发中**，预计2025-11-04完成
- ⏳ **AI相关API待Phase3开发**，预计2025-11-30开始

**对接建议**: 按Phase顺序对接，优先P0 API，确保核心功能快速上线！

