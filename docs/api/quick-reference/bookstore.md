# 快速参考 - 书城模块

> **版本**: v1.3
> **最后更新**: 2025-01-14

## 核心接口一览

| 接口 | 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|------|
| 首页数据 | GET | `/bookstore/homepage` | 否 | 获取首页聚合数据 |
| 榜单列表 | GET | `/bookstore/rankings/{type}` | 否 | 获取各类榜单 |
| 书籍列表 | GET | `/bookstore/books/recommended` | 否 | 获取推荐书籍列表 |
| 书籍详情 | GET | `/bookstore/books/{id}` | 否 | 获取书籍详细信息 |
| 分类列表 | GET | `/bookstore/categories/tree` | 否 | 获取分类树 |
| 搜索 | GET | `/bookstore/books/search` | 否 | 搜索书籍 |

---

## 1. 首页数据

**接口**: `GET /api/v1/bookstore/homepage`

**说明**: 获取书城首页聚合数据（Banner、推荐书籍、分类、榜单）

**请求**: 无参数

**响应**:
| 字段 | 类型 | 说明 |
|------|------|------|
| banners | Banner[] | 轮播图列表 |
| recommended_books | BookBrief[] | 推荐书籍 |
| featured_books | BookBrief[] | 精选书籍 |
| categories | Category[] | 分类列表 |
| rankings | object | 各类榜单 |

**错误码**: 3001-3005
**详细文档**: [查看详细指南](../guides/bookstore/homepage.md)

---

## 2. 榜单列表

**接口**: `GET /api/v1/bookstore/rankings/{type}`

**说明**: 获取指定类型的榜单数据

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | ✓ | 榜单类型: realtime/weekly/monthly/newbie |

**查询参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| limit | number | ✗ | 20 | 返回数量限制 |

**响应**: RankingItem[]
- rank: 排名
- book: 书籍信息
- score: 评分
- trend: 趋势 (up/down/stable)

**错误码**: 3001
**详细文档**: [查看详细指南](../guides/bookstore/rankings.md)

---

## 3. 书籍列表

**接口**: `GET /api/v1/bookstore/books/recommended`

**说明**: 获取推荐书籍列表（支持分页）

**查询参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | ✗ | 1 | 页码 |
| size | number | ✗ | 20 | 每页数量 |
| category | string | ✗ | - | 分类ID |
| status | string | ✗ | - | 书籍状态 |
| sort | string | ✗ | - | 排序字段 |
| order | string | ✗ | desc | 排序方向 |

**响应**: PaginatedResponse<BookBrief>
- data: 书籍列表
- pagination: 分页信息

**错误码**: 3001, 3005
**详细文档**: [查看详细指南](../guides/bookstore/book-list.md)

---

## 4. 书籍详情

**接口**: `GET /api/v1/bookstore/books/{id}`

**说明**: 获取书籍详细信息

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | ✓ | 书籍ID (MongoDB ObjectId) |

**响应**: BookDetail
- 基本信息: title, author, description, cover
- 统计信息: wordCount, chapterCount, rating, viewCount
- 状态信息: status, isVip, isFree
- 时间信息: publishTime, updateTime

**错误码**: 3001, 3005
**详细文档**: [查看详细指南](../guides/bookstore/book-detail.md)

---

## 5. 分类列表

**接口**: `GET /api/v1/bookstore/categories/tree`

**说明**: 获取完整的分类树结构（展平）

**请求**: 无参数

**响应**: Category[]
- id: 分类ID
- name: 分类名称
- parentId: 父分类ID
- bookCount: 书籍数量
- children: 子分类列表

**错误码**: 无
**详细文档**: 暂无

---

## 6. 搜索

**接口**: `GET /api/v1/bookstore/books/search`

**说明**: 根据条件搜索书籍

**查询参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| keyword | string | ✗ | - | 搜索关键词 |
| author | string | ✗ | - | 作者名称 |
| categoryId | string | ✗ | - | 分类ID |
| tags | string[] | ✗ | - | 标签数组 |
| status | string | ✗ | - | 书籍状态 |
| wordCountMin | number | ✗ | - | 最小字数 |
| wordCountMax | number | ✗ | - | 最大字数 |
| ratingMin | number | ✗ | - | 最低评分 |
| sortBy | string | ✗ | relevance | 排序字段 |
| sortOrder | string | ✗ | desc | 排序方向 |
| page | number | ✗ | 1 | 页码 |
| size | number | ✗ | 20 | 每页数量 |

**sortBy 支持的值**:
- relevance: 相关度（默认）
- updateTime: 更新时间
- rating: 评分
- viewCount: 浏览量
- wordCount: 字数

**响应**: PaginationResponse<BookBrief>
- data: 搜索结果
- pagination: 分页信息

**错误码**: 1001, 1002
**详细文档**: [查看详细指南](../guides/bookstore/search.md)

---

## 辅助接口

### 增加浏览量
**接口**: `POST /api/v1/bookstore/books/{id}/view`
**说明**: 记录用户浏览，增加浏览量

### 相似书籍推荐
**接口**: `GET /api/v1/bookstore/books/{id}/similar`
**说明**: 获取相似书籍推荐

### 按分类获取书籍
**接口**: `GET /api/v1/bookstore/categories/{id}/books`
**说明**: 获取指定分类下的书籍

---

## 通用错误码

| 错误码 | HTTP状态 | 错误类型 | 说明 |
|--------|---------|---------|------|
| 0000 | 200 | SUCCESS | 操作成功 |
| 1001 | 400 | INVALID_PARAM | 参数错误 |
| 1002 | 400 | MISSING_PARAM | 缺少必需参数 |
| 1003 | 401 | UNAUTHORIZED | 未授权访问 |
| 1004 | 403 | FORBIDDEN | 无权访问 |
| 1005 | 404 | NOT_FOUND | 资源不存在 |
| 1008 | 500 | INTERNAL_ERROR | 服务器内部错误 |

## 书城模块错误码

| 错误码 | HTTP状态 | 错误类型 | 说明 |
|--------|---------|---------|------|
| 3001 | 404 | BOOK_NOT_FOUND | 书籍不存在 |
| 3002 | 404 | CHAPTER_NOT_FOUND | 章节不存在 |
| 3003 | 403 | CHAPTER_LOCKED | 章节未解锁 |
| 3004 | 403 | BOOK_NOT_PURCHASED | 未购买本书 |
| 3005 | 400 | INVALID_BOOK_ID | 书籍ID格式错误 |

---

## 相关文档

- [数据模型](../data-models/request-models.md)
- [错误处理](../error-handling/error-codes.md)
- [前端集成指南](../../frontend/前端集成指南.md)
