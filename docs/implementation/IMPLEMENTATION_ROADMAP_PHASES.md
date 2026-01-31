# 青羽平台 分阶段实施计划 v2.0

> **版本**: v2.0  
> **更新日期**: 2025-10-30  
> **项目**: 青羽一站式阅读写作平台  
> **状态**: 进行中（Phase 0 完成，Phase 1-3 规划中）

---

## 📋 目录

1. [计划概览](#计划概览)
2. [Phase 0: 基础对接](#phase-0-基础对接)
3. [Phase 1: 阅读端完整功能](#phase-1-阅读端完整功能)
4. [Phase 2: 写作端完整功能](#phase-2-写作端完整功能)
5. [Phase 3: AI功能与社区功能](#phase-3-ai功能与社区功能)
6. [工时与资源规划](#工时与资源规划)

---

## 计划概览

### 项目目标

构建 **AI赋能的一站式阅读写作平台**，包含：
- 📖 **阅读端**: 个性化推荐、社交互动、AI阅读助手
- ✍️ **写作端**: 智能编辑器、项目管理、AI辅助创作  
- 🤖 **AI服务**: 文本生成、RAG检索、Agent工具调用
- 👥 **社区功能**: 书圈、评论、互动、变现

### 总体时间规划

| 阶段 | 名称 | 周期 | 截止日期 | 工时 |
|------|------|------|---------|------|
| **Phase 0** | 基础对接与基础框架 | 2周 | 2025-11-10 | 80h |
| **Phase 1** | 阅读端完整功能 | 3周 | 2025-12-01 | 120h |
| **Phase 2** | 写作端完整功能 | 3周 | 2025-12-22 | 150h |
| **Phase 3** | AI功能与社区功能 | 4周 | 2026-01-19 | 180h |
| **总计** | - | **12周** | 2026-01-19 | **530h** |

### 关键依赖关系

```
Phase 0: 基础框架
  ├─ 后端架构 → API路由
  └─ 前端框架 → 基础组件
        ↓
Phase 1: 阅读端
  ├─ 书城系统 (已60%完成)
  ├─ 阅读器 (已40%完成)
  ├─ 个人书架
  └─ 推荐系统 (已完成)
        ↓
Phase 2: 写作端
  ├─ 项目管理 (已30%完成)
  ├─ 编辑器 (已20%完成)
  ├─ 设定管理
  └─ 数据统计
        ↓
Phase 3: AI & 社区
  ├─ AI聊天与配额
  ├─ AI工具（大纲、角色等）
  ├─ 评论系统 (已30%完成)
  └─ 社区互动

```

---

## Phase 0: 基础对接

**周期**: 已开始 → 2025-11-10  
**状态**: ✅ 大部分完成，优化进行中  
**目标**: 建立后端API基础、前端项目框架、开发工具链

### 0.1 后端基础框架 ✅ (已完成 95%)

#### 目标
- ✅ 完成后端项目结构搭建
- ✅ 实现统一的API响应格式
- ✅ 配置数据库连接与初始化
- ✅ 实现JWT认证与RBAC权限系统
- ✅ 配置日志系统与错误处理

#### 已完成任务 ✅
- ✅ 后端项目架构搭建（Go 1.24）
  - 分层架构：Router → API → Service → Repository → Model
  - 依赖注入容器与服务管理
  - 事件驱动架构（EventBus）

- ✅ MongoDB连接与配置
  - 多数据库支持
  - 事务管理
  - 索引创建

- ✅ JWT认证实现
  - Token生成与验证
  - 刷新令牌机制
  - 权限检查中间件

- ✅ API响应标准化
  - UnifiedError错误处理
  - 统一的Success/Error响应格式

- ✅ 日志系统配置
  - Zap结构化日志
  - 请求追踪

#### 待完成任务 ⏳
- ⏳ 性能优化
  - Redis缓存集成（进度: 30%）
  - 数据库索引优化（进度: 50%）
  - API限流配置（进度: 20%）

- ⏳ 监控与指标
  - Prometheus指标导出（进度: 10%）
  - 健康检查端点（进度: 40%）

#### 交付物
- ✅ `Qingyu_backend/` - 完整后端项目
- ✅ `doc/architecture/` - 架构设计文档
- ✅ 配置文件示例 & Docker Compose

#### 验收标准
- [ ] 所有核心API能正常启动
- [ ] 数据库连接正常
- [ ] 认证系统可用
- [ ] API文档完整

---

### 0.2 前端基础框架 ✅ (已完成 90%)

#### 目标
- ✅ 搭建Vue 3 + TypeScript + Vite项目
- ✅ 配置Pinia状态管理
- ✅ 实现路由系统与权限控制
- ✅ 创建共享组件库
- ✅ 配置API请求层

#### 已完成任务 ✅
- ✅ Vue 3项目初始化
  - TypeScript配置
  - Vite构建配置
  - ESLint & Prettier

- ✅ 核心插件配置
  - Vue Router (4个路由模块)
  - Pinia (5个Store)
  - Axios HTTP客户端
  - Element Plus UI库
  - Tailwind CSS样式

- ✅ 项目结构规划
  - `/modules/` - 功能模块 (admin, bookstore, reader, user, writer)
  - `/shared/` - 共享组件 & 工具
  - `/stores/` - 状态管理
  - `/types/` - TypeScript类型定义

- ✅ 基础组件库
  - 布局组件 (Header, Sidebar, Layout)
  - 常用组件 (Button, Input, Card, Modal等)
  - 设计系统 (颜色、间距、排版规范)

#### 待完成任务 ⏳
- ⏳ 高级功能
  - PWA配置（进度: 10%）
  - 离线存储（进度: 30%）
  - IndexedDB集成（进度: 50%）

- ⏳ 性能优化
  - 代码分割与路由懒加载（进度: 40%）
  - 虚拟列表实现（进度: 20%）
  - 图片懒加载（进度: 30%）

#### 交付物
- ✅ `Qingyu_fronted/` - 完整前端项目
- ✅ 5个核心模块框架
- ✅ 共享组件库
- ✅ 启动指南 & 环境配置

#### 验收标准
- [ ] 项目能正常启动（npm run dev）
- [ ] 路由系统工作正常
- [ ] API请求能成功发送
- [ ] 组件库可用

---

### 0.3 工具链与开发环境 ✅ (已完成 85%)

#### 目标
- ✅ Docker容器化配置
- ✅ 数据库初始化脚本
- ✅ 快速启动脚本
- ✅ 测试环境准备

#### 已完成任务 ✅
- ✅ Docker配置
  - MongoDB容器配置
  - Redis容器配置
  - 后端服务容器
  - Docker Compose编排

- ✅ 启动脚本
  - Windows批处理脚本 (15个)
  - Linux shell脚本 (5个)
  - 快速启动指南

- ✅ 数据库初始化
  - 集合创建脚本
  - 初始数据加载
  - 索引创建

#### 待完成任务 ⏳
- ⏳ CI/CD流程（进度: 20%）
  - GitHub Actions配置
  - 自动化测试
  - 自动化部署

#### 交付物
- ✅ Docker相关配置
- ✅ 启动脚本集合
- ✅ 数据库脚本

#### 验收标准
- [ ] Docker Compose能正常启动所有服务
- [ ] 所有脚本都能正常执行

---

### 0.4 API核心端点实现 ✅ (已完成 85%)

#### 后端API统计

| 模块 | API数量 | 实现状态 | 路由状态 | 可用性 |
|------|---------|---------|---------|--------|
| 用户系统 | 7 | ✅ 100% | ✅ 已注册 | ✅ 可用 |
| 书城系统 | 20 | ✅ 100% | ✅ 已注册 | ✅ 可用 |
| 阅读器 | 21 | ✅ 100% | ✅ 已注册 | ✅ 可用 |
| 推荐系统 | 6 | ✅ 100% | ✅ 已注册 | ✅ 可用 |
| 项目管理 | 6 | ✅ 100% | ✅ 已注册 | ✅ 可用 |
| 文档管理 | 12 | ⚠️ 67% | ⚠️ 部分 | ⚠️ 部分可用 |
| 编辑器 | 8 | ✅ 100% | ✅ 已注册 | ✅ 可用 |
| 钱包系统 | 7 | ✅ 100% | ✅ 已注册 | ✅ 可用 |
| **总计** | **87** | **~92%** | **~90%** | **✅ 78个可用** |

#### 已实现关键API ✅
- ✅ 用户认证 & 授权 (7个)
- ✅ 书籍浏览 & 详情 (20个)
- ✅ 阅读进度 & 标注 (21个)
- ✅ 个性化推荐 (6个)
- ✅ 项目管理基础 (6个)
- ✅ 编辑器支持 (8个)
- ✅ 钱包系统 (7个)

#### 需要优化的API ⚠️
- ⚠️ 文档管理API (12个，需完成33%)
- ⚠️ 缓存层优化
- ⚠️ 性能指标收集

---

### Phase 0 总结

**完成度**: 87% ✅

**重要成就**:
- ✅ 后端架构完整搭建
- ✅ 前端框架准备就绪
- ✅ 78个API端点可用
- ✅ 开发工具链配置完成

**关键指标**:
- 系统可用性: 90%+
- API文档完整度: 85%
- 自动化脚本覆盖: 10+

**后续行动** 🚀:
1. **立即启动 Phase 1** - 完成阅读端完整功能
2. **持续优化** - 性能调优与缓存集成
3. **文档完善** - API文档与最佳实践文档

---

## Phase 1: 阅读端完整功能

**周期**: 2周 (2025-11-10 → 2025-11-24)  
**工时**: 120小时  
**优先级**: 🔴 **高** - 核心功能  
**状态**: 🟡 **进行中** - 50%完成

### 1.1 书城系统完善

#### 现状分析
- 实现进度: 60% ✅
- API完成度: 95% ✅
- 前端完成度: 50% ⏳

#### 目标
- [ ] 完成分类浏览功能
- [ ] 完成搜索与筛选
- [ ] 完成排序功能
- [ ] 完成无限滚动加载

#### 前端任务

**模块**: `Qingyu_fronted/src/modules/bookstore/`

| 任务 | 文件 | 工时 | 优先级 |
|------|------|------|--------|
| 分类树组件 | CategoryTree.vue | 4h | 🔴 高 |
| 搜索建议 | SearchBar.vue | 3h | 🔴 高 |
| 过滤面板 | FilterPanel.vue | 5h | 🔴 高 |
| 书籍网格 | BookGrid.vue | 4h | 🔴 高 |
| 排序功能 | BooksView.vue | 2h | 🟡 中 |
| 无限滚动 | BooksView.vue | 3h | 🟡 中 |
| **小计** | - | **21h** | - |

**API集成**:
```typescript
// modules/bookstore/services/bookstore.service.ts
- getCategories()           // 获取分类树
- searchBooks()             // 搜索书籍
- filterBooks()             // 应用筛选条件
- sortBooks()               // 排序书籍
```

**关键实现**:
```typescript
// 虚拟列表优化长列表
import VirtualList from 'virtual-list-component';

// 搜索防抖
import { debounce } from 'lodash';

// 缓存管理
const bookCache = new Map();
```

---

#### 后端任务

**模块**: `Qingyu_backend/service/bookstore/` & `api/v1/bookstore/`

| 任务 | 文件 | 工时 | 状态 |
|------|------|------|------|
| 搜索优化 | bookstore_api.go | 2h | ✅ 完成 |
| 排序逻辑 | book_service.go | 1h | ✅ 完成 |
| 缓存集成 | book_service.go | 3h | ⏳ 进行中 |
| 性能测试 | benchmark_test.go | 2h | ⏳ 进行中 |
| **小计** | - | **8h** | - |

**验收标准**:
- [ ] 搜索响应时间 < 200ms
- [ ] 分类加载完整
- [ ] 无限滚动流畅
- [ ] 筛选条件正确应用

---

### 1.2 阅读器功能完善

#### 现状分析
- 实现进度: 40% ⏳
- API完成度: 85% ✅
- 前端完成度: 35% ⏳

#### 目标
- [ ] 完成阅读设置面板
- [ ] 完成笔记与书签功能
- [ ] 完成章节导航
- [ ] 集成AI阅读助手（预留）

#### 前端任务

**模块**: `Qingyu_fronted/src/modules/reader/`

| 任务 | 文件 | 工时 | 优先级 |
|------|------|------|--------|
| 阅读设置面板 | ReadingSettingsPanel.vue | 6h | 🔴 高 |
| 字体与排版 | ReadingView.vue | 3h | 🔴 高 |
| 笔记功能 | NotesPanel.vue | 5h | 🔴 高 |
| 书签管理 | BookmarkManager.vue | 3h | 🔴 高 |
| 章节导航 | ChapterNavigation.vue | 2h | 🔴 高 |
| 进度显示 | ProgressBar.vue | 2h | 🟡 中 |
| 快捷菜单 | FloatingMenu.vue | 3h | 🟡 中 |
| **小计** | - | **24h** | - |

**核心功能实现**:

```typescript
// 阅读设置管理
export interface ReadingSettings {
  fontSize: 12-24;          // 字体大小
  fontFamily: string;       // 字体选择
  backgroundColor: string;  // 背景颜色
  lineHeight: number;       // 行距
  margin: number;           // 页边距
}

// 笔记与书签
export interface Note {
  id: string;
  text: string;
  position: number;  // 段落位置
  color: string;     // 标记颜色
  createdAt: Date;
}

export interface Bookmark {
  id: string;
  chapterId: string;
  position: number;
  createdAt: Date;
}
```

**关键实现**:
- 使用LocalStorage保存阅读设置
- 使用IndexedDB保存笔记与书签
- 实现章节预加载优化

#### 后端任务

**模块**: `Qingyu_backend/service/reading/` & `api/v1/reader/`

| 任务 | 文件 | 工时 | 状态 |
|------|------|------|------|
| 笔记CRUD | reader_api.go | 2h | ✅ 完成 |
| 书签CRUD | reader_api.go | 1h | ✅ 完成 |
| 阅读进度 | progress.go | 1h | ✅ 完成 |
| 缓存层 | reader_service.go | 3h | ⏳ 进行中 |
| **小计** | - | **7h** | - |

**验收标准**:
- [ ] 阅读设置正确保存
- [ ] 笔记与书签同步
- [ ] 阅读进度精确
- [ ] 章节导航流畅

---

### 1.3 个人书架功能

#### 现状分析
- 实现进度: 30% ⏳
- API完成度: 50% ⏳
- 前端完成度: 20% ⏳

#### 目标
- [ ] 实现阅读中/已完成/收藏分类
- [ ] 实现批量操作
- [ ] 实现书单创建与管理
- [ ] 实现排序与筛选

#### 前端任务

**模块**: `Qingyu_fronted/src/modules/reader/`

| 任务 | 文件 | 工时 | 优先级 |
|------|------|------|--------|
| 书架Tab视图 | BookshelfView.vue | 4h | 🔴 高 |
| 书籍卡片 | ShelfBookCard.vue | 3h | 🔴 高 |
| 批量操作 | BatchOperations.vue | 3h | 🟡 中 |
| 书单管理 | BooklistManager.vue | 5h | 🟡 中 |
| 排序筛选 | ShelfFilters.vue | 3h | 🟡 中 |
| **小计** | - | **18h** | - |

**API集成**:
```typescript
// 书架管理API
- getBookshelf(status)      // 获取书架 (reading/completed/collected)
- updateBookStatus()        // 更新书籍状态
- batchUpdateBooks()        // 批量更新
- createBooklist()          // 创建书单
- addToBooklist()           // 添加到书单
```

#### 后端任务

| 任务 | 文件 | 工时 | 状态 |
|------|------|------|------|
| 书架查询 | bookshelf.go | 2h | ✅ 完成 |
| 书单管理 | bookshelf.go | 3h | ⏳ 进行中 |
| 批量操作 | bookshelf.go | 2h | ⏳ 进行中 |
| **小计** | - | **7h** | - |

**验收标准**:
- [ ] 书架分类完整
- [ ] 书单创建可用
- [ ] 批量操作快速

---

### 1.4 推荐系统集成

#### 现状分析
- 实现进度: 100% ✅
- API完成度: 100% ✅
- 前端集成度: 40% ⏳

#### 目标
- [ ] 完成首页推荐展示
- [ ] 完成分类推荐
- [ ] 完成相似推荐
- [ ] 完成热门推荐

#### 前端任务

**模块**: `Qingyu_fronted/src/modules/bookstore/`

| 任务 | 文件 | 工时 | 优先级 |
|------|------|------|--------|
| 推荐区块 | RecommendationSection.vue | 3h | 🔴 高 |
| 轮播图 | BannerCarousel.vue | 3h | 🔴 高 |
| 相似推荐 | SimilarBooks.vue | 2h | 🟡 中 |
| 热门推荐 | TrendingBooks.vue | 2h | 🟡 中 |
| **小计** | - | **10h** | - |

**验收标准**:
- [ ] 首页推荐加载正常
- [ ] 轮播图响应式
- [ ] 推荐算法准确

---

### Phase 1 总体时间表

```
Week 1 (Nov 10-14):
  ✅ Mon-Tue: 书城分类与搜索 (12h)
  ✅ Wed-Thu: 阅读设置面板 (12h)
  ✅ Fri: 笔记与书签 (8h)

Week 2 (Nov 17-21):
  ✅ Mon-Tue: 个人书架 (12h)
  ✅ Wed-Thu: 推荐系统集成 (12h)
  ✅ Fri: 测试与优化 (12h)
```

**Phase 1 交付物**:
- ✅ 完整的书城系统
- ✅ 功能完整的阅读器
- ✅ 个人书架与收藏
- ✅ 推荐系统集成
- ✅ 单元测试覆盖 > 80%

**验收标准**:
- [ ] 阅读端所有核心功能可用
- [ ] API调用成功率 > 99%
- [ ] 页面加载时间 < 2s
- [ ] 用户能完整阅读一本书

---

## Phase 2: 写作端完整功能

**周期**: 3周 (2025-11-24 → 2025-12-15)  
**工时**: 150小时  
**优先级**: 🔴 **高** - 核心功能  
**状态**: 🟢 **未开始** - 0%完成

### 2.1 项目管理系统

#### 目标
- [ ] 完成项目列表展示
- [ ] 完成项目创建/编辑/删除
- [ ] 完成项目统计信息
- [ ] 完成快速操作

#### 前端任务

| 任务 | 文件 | 工时 | 优先级 |
|------|------|------|--------|
| 项目列表视图 | ProjectsView.vue | 5h | 🔴 高 |
| 项目卡片 | ProjectCard.vue | 3h | 🔴 高 |
| 创建/编辑对话框 | ProjectDialog.vue | 4h | 🔴 高 |
| 删除确认 | ConfirmDialog.vue | 2h | 🟡 中 |
| 统计信息 | ProjectStats.vue | 3h | 🟡 中 |
| 搜索筛选 | ProjectFilters.vue | 2h | 🟡 中 |
| **小计** | - | **19h** | - |

#### 后端任务

| 任务 | 文件 | 工时 | 状态 |
|------|------|------|------|
| 项目CRUD | project_service.go | 4h | ⏳ 进行中 |
| 统计信息 | stats_service.go | 3h | ⏳ 进行中 |
| 权限检查 | project_service.go | 2h | ⏳ 进行中 |
| **小计** | - | **9h** | - |

---

### 2.2 编辑器核心功能

#### 目标
- [ ] 完成文档编辑（Markdown & 富文本）
- [ ] 完成自动保存
- [ ] 完成版本历史
- [ ] 完成大纲管理

#### 前端任务

| 任务 | 文件 | 工时 | 优先级 |
|------|------|------|--------|
| 编辑器主体 | EditorView.vue | 8h | 🔴 高 |
| 工具栏 | EditorToolbar.vue | 4h | 🔴 高 |
| 大纲管理 | OutlinePanel.vue | 5h | 🔴 高 |
| 自动保存 | useAutoSave.ts | 3h | 🔴 高 |
| 版本历史 | VersionHistory.vue | 4h | 🟡 中 |
| 代码高亮 | CodeHighlight.vue | 3h | 🟡 中 |
| **小计** | - | **27h** | - |

**核心实现**:
```typescript
// 编辑器配置
export interface EditorConfig {
  mode: 'markdown' | 'rich';
  autoSave: boolean;
  autoSaveInterval: number;  // 毫秒
  maxHistoryVersions: number;
}

// 自动保存实现
const useAutoSave = (content, interval = 30000) => {
  let timer;
  watch(content, () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      await saveDocument(content);
    }, interval);
  });
};

// 版本管理
export interface DocumentVersion {
  id: string;
  content: string;
  savedAt: Date;
  changeSize: number;
}
```

#### 后端任务

| 任务 | 文件 | 工时 | 状态 |
|------|------|------|------|
| 文档保存 | document_api.go | 3h | ⏳ 进行中 |
| 版本管理 | version_api.go | 3h | ⏳ 进行中 |
| 并发控制 | document_service.go | 3h | ⏳ 进行中 |
| **小计** | - | **9h** | - |

---

### 2.3 设定管理系统

#### 目标
- [ ] 完成角色卡管理
- [ ] 完成世界观设定
- [ ] 完成时间线管理
- [ ] 完成关系图谱

#### 前端任务

| 任务 | 文件 | 工时 | 优先级 |
|------|------|------|--------|
| 角色卡管理 | CharacterManager.vue | 8h | 🔴 高 |
| 世界观编辑 | WorldSettingsView.vue | 6h | 🔴 高 |
| 时间线 | TimelineEditor.vue | 5h | 🔴 高 |
| 关系图谱 | RelationshipGraph.vue | 5h | 🟡 中 |
| 标签系统 | TagManager.vue | 3h | 🟡 中 |
| **小计** | - | **27h** | - |

**角色卡数据结构**:
```typescript
export interface CharacterCard {
  // 基础信息
  id: string;
  name: string;
  gender: 'M' | 'F' | 'Other';
  age: number;
  role: string;  // 主角、女主、配角等

  // 外观
  appearance: {
    height: number;
    weight: number;
    features: string;
    clothing: string;
  };

  // 性格
  personality: {
    strengths: string[];
    weaknesses: string[];
    hobbies: string[];
    habits: string[];
  };

  // 背景
  background: {
    origin: string;
    experience: string;
    trauma: string;
    goals: string;
  };

  // 能力
  abilities: {
    skills: string[];
    weapons: string[];
    cultivation?: string;
  };

  // 关系网络
  relationships: RelationshipLink[];

  // 发展轨迹
  development: DevelopmentStage[];
}
```

#### 后端任务

| 任务 | 文件 | 工时 | 状态 |
|------|------|------|------|
| 角色CRUD | character_api.go | 4h | ⏳ 进行中 |
| 设定管理 | location_api.go | 3h | ⏳ 进行中 |
| 关系处理 | relationship_service.go | 3h | ⏳ 进行中 |
| **小计** | - | **10h** | - |

---

### 2.4 数据统计与分析

#### 目标
- [ ] 完成字数统计
- [ ] 完成更新统计
- [ ] 完成收藏/点赞统计
- [ ] 完成数据可视化

#### 前端任务

| 任务 | 文件 | 工时 | 优先级 |
|------|------|------|--------|
| 统计仪表板 | StatisticsView.vue | 6h | 🔴 高 |
| 图表展示 | ChartComponents.vue | 5h | 🟡 中 |
| 数据导出 | DataExport.vue | 3h | 🟡 中 |
| **小计** | - | **14h** | - |

#### 后端任务

| 任务 | 文件 | 工时 | 状态 |
|------|------|------|------|
| 统计计算 | stats_api.go | 3h | ⏳ 进行中 |
| 数据缓存 | stats_service.go | 2h | ⏳ 进行中 |
| **小计** | - | **5h** | - |

---

### Phase 2 时间表

```
Week 1 (Nov 24-28):
  Mon-Tue: 项目管理系统 (12h)
  Wed-Fri: 编辑器基础 (18h)

Week 2 (Dec 1-5):
  Mon-Tue: 编辑器高级功能 (12h)
  Wed-Fri: 设定管理 (15h)

Week 3 (Dec 8-12):
  Mon-Tue: 设定管理完成 (12h)
  Wed-Fri: 数据统计 (12h)
```

**Phase 2 交付物**:
- ✅ 完整的项目管理系统
- ✅ 功能完整的编辑器
- ✅ 完整的设定管理系统
- ✅ 数据统计与分析
- ✅ 单元测试覆盖 > 80%

---

## Phase 3: AI功能与社区功能

**周期**: 4周 (2025-12-15 → 2026-01-12)  
**工时**: 180小时  
**优先级**: 🟡 **中** - 增强功能  
**状态**: 🟢 **未开始** - 0%完成

### 3.1 AI助手系统

#### 目标
- [ ] 完成AI聊天功能
- [ ] 完成配额管理
- [ ] 完成流式响应
- [ ] 完成上下文管理

#### 前端任务

| 任务 | 文件 | 工时 | 优先级 |
|------|------|------|--------|
| AI聊天界面 | AIChatView.vue | 6h | 🔴 高 |
| 会话管理 | SessionManager.vue | 3h | 🔴 高 |
| 流式显示 | StreamingMessage.vue | 4h | 🔴 高 |
| 配额显示 | QuotaDisplay.vue | 2h | 🟡 中 |
| 充值界面 | QuotaRecharge.vue | 3h | 🟡 中 |
| **小计** | - | **18h** | - |

**API集成**:
```typescript
// AI服务API
- startChatSession()        // 开始聊天会话
- sendMessage()             // 发送消息
- streamResponse()          // 流式响应（SSE）
- getQuota()                // 获取配额
- purchaseQuota()           // 购买配额
```

**流式响应实现**:
```typescript
const useAIStream = async (prompt: string) => {
  const response = await fetch('/api/v1/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const chunk = decoder.decode(value);
    yield chunk;  // 流式发送数据
  }
};
```

#### 后端任务

| 任务 | 文件 | 工时 | 状态 |
|------|------|------|------|
| 聊天API | chat_api.go | 4h | ⏳ 进行中 |
| 配额管理 | quota_api.go | 3h | ⏳ 进行中 |
| LLM集成 | ai_service.go | 5h | ⏳ 进行中 |
| SSE支持 | stream_handler.go | 3h | ⏳ 进行中 |
| **小计** | - | **15h** | - |

---

### 3.2 AI工具系统

#### 目标
- [ ] 完成AI大纲生成
- [ ] 完成AI角色生成
- [ ] 完成AI情节设计
- [ ] 完成设定一致性检查

#### 前端任务

| 任务 | 文件 | 工时 | 优先级 |
|------|------|------|--------|
| 大纲生成器 | OutlineGenerator.vue | 6h | 🔴 高 |
| 角色生成器 | CharacterGenerator.vue | 6h | 🔴 高 |
| 情节设计 | PlotDesigner.vue | 5h | 🟡 中 |
| 一致性检查 | ConsistencyChecker.vue | 4h | 🟡 中 |
| 使用记录 | UsageHistory.vue | 3h | 🟡 中 |
| **小计** | - | **24h** | - |

**核心功能**:
```typescript
// AI工具API
- generateOutline()         // 生成大纲
- generateCharacter()       // 生成角色
- generatePlot()            // 生成情节
- checkConsistency()        // 检查一致性
```

#### 后端任务

| 任务 | 文件 | 工时 | 状态 |
|------|------|------|------|
| 大纲生成 | writing_api.go | 5h | ⏳ 进行中 |
| 角色生成 | writing_api.go | 5h | ⏳ 进行中 |
| RAG集成 | rag_service.go | 6h | ⏳ 进行中 |
| **小计** | - | **16h** | - |

---

### 3.3 社区评论系统

#### 现状分析
- 实现进度: 30% ⏳
- API完成度: 60% ⏳
- 前端完成度: 20% ⏳

#### 目标
- [ ] 完成评论展示
- [ ] 完成评论发布与回复
- [ ] 完成点赞系统
- [ ] 完成评论线程

#### 前端任务

| 任务 | 文件 | 工时 | 优先级 |
|------|------|------|--------|
| 评论列表 | CommentList.vue | 6h | 🔴 高 |
| 评论发布 | CommentInput.vue | 4h | 🔴 高 |
| 评论线程 | CommentThread.vue | 5h | 🔴 高 |
| 点赞系统 | LikeButton.vue | 2h | 🟡 中 |
| 评论管理 | CommentManagement.vue | 3h | 🟡 中 |
| **小计** | - | **20h** | - |

**评论数据结构**:
```typescript
export interface Comment {
  id: string;
  content: string;
  author: User;
  target: {
    type: 'book' | 'chapter' | 'document';
    id: string;
  };
  parentId?: string;  // 回复的父评论ID
  likes: number;
  replies: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentThread {
  root: Comment;
  replies: Comment[];  // 直接回复
  nestedReplies: Map<string, Comment[]>;  // 嵌套回复
}
```

#### 后端任务

| 任务 | 文件 | 工时 | 状态 |
|------|------|------|------|
| 评论CRUD | comment_api.go | 4h | ✅ 部分完成 |
| 评论线程 | comment_service.go | 4h | ⏳ 进行中 |
| 点赞系统 | like_api.go | 2h | ⏳ 进行中 |
| **小计** | - | **10h** | - |

---

### 3.4 社区互动功能

#### 目标
- [ ] 完成用户关注系统
- [ ] 完成消息通知系统
- [ ] 完成书圈/社区功能
- [ ] 完成用户互动

#### 前端任务

| 任务 | 文件 | 工时 | 优先级 |
|------|------|------|--------|
| 关注系统 | FollowButton.vue | 3h | 🟡 中 |
| 消息通知 | NotificationCenter.vue | 5h | 🟡 中 |
| 书圈社区 | CommunityView.vue | 6h | 🟡 中 |
| 用户互动 | InteractionPanel.vue | 4h | 🟡 中 |
| **小计** | - | **18h** | - |

#### 后端任务

| 任务 | 文件 | 工时 | 状态 |
|------|------|------|------|
| 关注功能 | follow_api.go | 2h | ⏳ 进行中 |
| 消息系统 | notification_api.go | 4h | ⏳ 进行中 |
| 社区功能 | community_api.go | 4h | ⏳ 进行中 |
| **小计** | - | **10h** | - |

---

### 3.5 钱包与变现系统

#### 目标
- [ ] 完成充值功能
- [ ] 完成提现功能
- [ ] 完成交易记录
- [ ] 完成VIP订阅

#### 前端任务

| 任务 | 文件 | 工时 | 优先级 |
|------|------|------|--------|
| 钱包页面 | WalletView.vue | 5h | 🟡 中 |
| 充值流程 | RechargeFlow.vue | 4h | 🟡 中 |
| 提现流程 | WithdrawalFlow.vue | 4h | 🟡 中 |
| 交易记录 | TransactionHistory.vue | 3h | 🟡 中 |
| VIP管理 | VIPManagement.vue | 3h | 🟡 中 |
| **小计** | - | **19h** | - |

#### 后端任务

| 任务 | 文件 | 工时 | 状态 |
|------|------|------|------|
| 钱包系统 | wallet_api.go | 4h | ✅ 完成 |
| 充值支付 | payment_service.go | 5h | ⏳ 进行中 |
| 提现处理 | withdrawal_service.go | 4h | ⏳ 进行中 |
| **小计** | - | **13h** | - |

---

### Phase 3 时间表

```
Week 1 (Dec 15-19):
  Mon-Tue: AI助手系统 (12h)
  Wed-Fri: AI工具系统 (16h)

Week 2 (Dec 22-26):
  Mon-Tue: 评论系统 (12h)
  Wed-Fri: 社区互动 (14h)

Week 3 (Dec 29-31/Jan 2):
  Mon-Tue: 钱包系统 (12h)
  Wed-Fri: 集成与优化 (15h)

Week 4 (Jan 5-9):
  Mon-Thu: 测试与修复 (20h)
  Fri: 最终验收 (5h)
```

**Phase 3 交付物**:
- ✅ 完整的AI助手系统
- ✅ AI工具集合
- ✅ 完整的评论与社区系统
- ✅ 钱包与变现功能
- ✅ 集成测试覆盖 > 90%

---

## 工时与资源规划

### 总体工时统计

| 阶段 | 后端(h) | 前端(h) | 测试(h) | 文档(h) | 小计(h) |
|------|---------|---------|---------|---------|---------|
| Phase 0 | 35 | 30 | 10 | 5 | 80 |
| Phase 1 | 25 | 73 | 15 | 7 | 120 |
| Phase 2 | 32 | 87 | 20 | 11 | 150 |
| Phase 3 | 54 | 99 | 20 | 7 | 180 |
| **总计** | **146** | **289** | **65** | **30** | **530** |

### 人员配置建议

**最优配置** (推荐):
- 后端工程师: 2人 (各146h ÷ 2 = 73h)
- 前端工程师: 3人 (各289h ÷ 3 ≈ 96h)
- 测试工程师: 1人 (65h)
- 文档/PM: 1人 (30h)
- **总人数**: 7人

**快速配置** (加快进度):
- 后端工程师: 3人 (各146h ÷ 3 ≈ 49h)
- 前端工程师: 4人 (各289h ÷ 4 ≈ 72h)
- 测试工程师: 2人 (各65h ÷ 2 = 33h)
- **总人数**: 9人
- **预期加快**: 20-30%

### 每周工时分配

| 周数 | Phase | 总工时 | 人均工时 | 说明 |
|------|-------|--------|----------|------|
| 1-2 | P0 | 80 | 11-15h | 基础框架搭建 |
| 3-4 | P1 | 60 | 8-10h | 阅读端基础功能 |
| 5-6 | P1 | 60 | 8-10h | 阅读端高级功能 |
| 7-8 | P2 | 75 | 10-12h | 写作端基础功能 |
| 9-10 | P2 | 75 | 10-12h | 写作端高级功能 |
| 11-12 | P3 | 90 | 12-15h | AI & 社区系统 |
| 13-14 | P3 | 90 | 12-15h | AI工具 & 钱包 |

### 风险与缓冲

**风险清单**:

| 风险 | 概率 | 影响 | 缓冲 |
|------|------|------|------|
| 后端API延期 | 中 | 高 | +15% (Phase 1-2) |
| 前端复杂度 | 中 | 中 | +20% (整体) |
| 数据库性能 | 低 | 高 | +10% (优化阶段) |
| 第三方API | 低 | 中 | +5% (集成阶段) |

**总缓冲建议**: 额外预留 **100小时** (18%)

**最终工时**: 530h + 100h = **630小时** ≈ **16周** (4个月)

---

## 实施建议

### 1. 代码质量标准

✅ **后端**:
- 代码覆盖率 > 80%
- 遵循分层架构规范
- API文档完整

✅ **前端**:
- TypeScript严格模式
- 组件测试覆盖 > 70%
- 响应式设计验证

### 2. 协作规范

📋 **提交规范**:
- Commit message: `[Phase-X] [feature/fix/docs] description`
- PR审查制度
- 代码审查检查清单

📋 **沟通规范**:
- 日报同步
- 周会进度审查
- 风险及时上报

### 3. 验收标准

✅ **功能验收**:
- 功能完整实现
- 单元测试通过
- 集成测试通过

✅ **性能验收**:
- API响应时间 < 500ms
- 前端页面加载 < 2s
- 缓存命中率 > 80%

✅ **质量验收**:
- 0个P0级Bug
- P1级Bug < 5个
- Linter无错误

---

## 总结

本实施计划为青羽平台提供了详细的12周（4阶段）完整开发路线：

✅ **Phase 0**: 建立基础框架和开发环境  
✅ **Phase 1**: 完成阅读端核心功能  
✅ **Phase 2**: 完成写作端核心功能  
✅ **Phase 3**: 实现AI和社区高级功能

**关键成功因素**:
- 清晰的阶段划分和依赖关系
- 适当的人员配置
- 严格的质量管理
- 持续的风险控制

**预期成果** (2026年1月中旬):
- ✅ 一个功能完整的AI赋能写作平台
- ✅ 超过500+ API端点
- ✅ 超过200+ 前端页面/组件
- ✅ 80%+ 测试覆盖率
- ✅ 生产级可部署系统

🚀 **准备就绪，让我们开始构建青羽平台！**

