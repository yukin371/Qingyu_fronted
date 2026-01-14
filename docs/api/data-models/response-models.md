# 数据模型 / 响应模型

> **版本**: v1.3
> **最后更新**: 2025-01-14

---

## 1. 书城模块

### 1.1 首页数据响应

**接口**: `GET /api/v1/bookstore/homepage`

| 字段 | 类型 | 必含 | 说明 | 示例 |
|------|------|------|------|------|
| code | number | ✓ | 响应码，0表示成功 | 0 |
| message | string | ✓ | 响应消息 | "获取首页数据成功" |
| data | object | ✓ | 响应数据 | 见下方 |
| data.banners | Banner[] | ✓ | 轮播图列表 | 见Banner定义 |
| data.recommended_books | BookBrief[] | ✓ | 推荐书籍列表 | 见BookBrief定义 |
| data.featured_books | BookBrief[] | ✓ | 精选书籍列表 | 见BookBrief定义 |
| data.categories | Category[] | ✓ | 分类列表 | 见Category定义 |
| data.rankings | object | ✗ | 榜单数据 | 见下方 |
| data.rankings.realtime | RankingItem[] | ✗ | 实时榜 | 见RankingItem定义 |
| data.rankings.weekly | RankingItem[] | ✗ | 周榜 | 见RankingItem定义 |
| data.rankings.monthly | RankingItem[] | ✗ | 月榜 | 见RankingItem定义 |
| timestamp | number | ✓ | Unix时间戳 | 1705228800000 |
| request_id | string | ✗ | 请求追踪ID | "req-uuid-xxx" |

**TypeScript 定义**:
```typescript
interface HomepageResponse {
  code: number;
  message: string;
  data: {
    banners: Banner[];
    recommended_books: BookBrief[];
    featured_books: BookBrief[];
    categories: Category[];
    rankings?: {
      realtime: RankingItem[];
      weekly: RankingItem[];
      monthly: RankingItem[];
    };
  };
  timestamp: number;
  request_id?: string;
}
```

---

### 1.2 榜单列表响应

**接口**: `GET /api/v1/bookstore/rankings/{type}`

| 字段 | 类型 | 必含 | 说明 | 示例 |
|------|------|------|------|------|
| code | number | ✓ | 响应码 | 0 |
| message | string | ✓ | 响应消息 | "获取榜单成功" |
| data | RankingItem[] | ✓ | 榜单数据 | 见RankingItem定义 |
| timestamp | number | ✓ | Unix时间戳 | 1705228800000 |

#### RankingItem（榜单项）

| 字段 | 类型 | 必含 | 说明 | 示例 |
|------|------|------|------|------|
| rank | number | ✓ | 排名 | 1 |
| bookId | string | ✓ | 书籍ID | "507f1f77bcf86cd799439011" |
| book | BookBrief | ✓ | 书籍简要信息 | 见BookBrief定义 |
| score | number | ✓ | 评分/分数 | 98.5 |
| trend | string | ✗ | 趋势: up/down/stable | "up" |
| trendValue | number | ✗ | 趋势变化值 | 3 |

**TypeScript 定义**:
```typescript
interface RankingResponse {
  code: number;
  message: string;
  data: RankingItem[];
  timestamp: number;
}

interface RankingItem {
  rank: number;
  bookId: string;
  book: BookBrief;
  score: number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
}
```

---

### 1.3 书籍列表响应

**接口**: `GET /api/v1/bookstore/books/recommended`

| 字段 | 类型 | 必含 | 说明 | 示例 |
|------|------|------|------|------|
| code | number | ✓ | 响应码 | 0 |
| message | string | ✓ | 响应消息 | "获取书籍列表成功" |
| data | BookBrief[] | ✓ | 书籍列表 | 见BookBrief定义 |
| total | number | ✓ | 总数量 | 100 |
| page | number | ✓ | 当前页码 | 1 |
| size | number | ✓ | 每页数量 | 20 |
| timestamp | number | ✓ | Unix时间戳 | 1705228800000 |

#### BookBrief（书籍简要信息）

| 字段 | 类型 | 必含 | 说明 | 示例 |
|------|------|------|------|------|
| id | string | ✓ | 书籍ID | "507f1f77bcf86cd799439011" |
| title | string | ✓ | 书名 | "斗破苍穹" |
| author | string | ✓ | 作者 | "天蚕土豆" |
| cover | string | ✓ | 封面URL | "https://example.com/cover.jpg" |
| categoryName | string | ✓ | 分类名称 | "玄幻" |
| rating | number | ✓ | 评分 | 4.8 |
| wordCount | number | ✓ | 字数 | 5300000 |
| viewCount | number | ✓ | 浏览量 | 10000000 |
| status | string | ✓ | 状态 | "serializing" |
| latestChapter | string | ✗ | 最新章节标题 | "第100章 突破" |
| description | string | ✗ | 简介摘要 | "三十年河东..." |

**TypeScript 定义**:
```typescript
interface BookListResponse {
  code: number;
  message: string;
  data: BookBrief[];
  total: number;
  page: number;
  size: number;
  timestamp: number;
}

interface BookBrief {
  id: string;
  title: string;
  author: string;
  cover: string;
  categoryName: string;
  rating: number;
  wordCount: number;
  viewCount: number;
  status: BookStatus;
  latestChapter?: string;
  description?: string;
}
```

---

### 1.4 书籍详情响应

**接口**: `GET /api/v1/bookstore/books/{id}`

| 字段 | 类型 | 必含 | 说明 | 示例 |
|------|------|------|------|------|
| code | number | ✓ | 响应码 | 0 |
| message | string | ✓ | 响应消息 | "获取书籍详情成功" |
| data | BookDetail | ✓ | 书籍详情 | 见BookDetail定义 |
| timestamp | number | ✓ | Unix时间戳 | 1705228800000 |

#### BookDetail（书籍详细信息）

| 字段 | 类型 | 必含 | 说明 | 示例 |
|------|------|------|------|------|
| id | string | ✓ | 书籍ID | "507f1f77bcf86cd799439011" |
| title | string | ✓ | 书名 | "斗破苍穹" |
| author | string | ✓ | 作者 | "天蚕土豆" |
| authorId | string | ✗ | 作者ID | "author-xxx" |
| cover | string | ✓ | 封面URL | "https://example.com/cover.jpg" |
| description | string | ✓ | 简介 | "三十年河东..." |
| categoryId | string | ✓ | 分类ID | "507f1f77bcf86cd799439012" |
| categoryName | string | ✓ | 分类名称 | "玄幻" |
| tags | string[] | ✗ | 标签数组 | ["玄幻", "热血"] |
| status | string | ✓ | 状态 | "completed" |
| wordCount | number | ✓ | 总字数 | 5300000 |
| chapterCount | number | ✓ | 总章节数 | 1648 |
| rating | number | ✓ | 评分 | 4.8 |
| ratingCount | number | ✗ | 评分人数 | 50000 |
| viewCount | number | ✓ | 浏览量 | 10000000 |
| favoriteCount | number | ✓ | 收藏数 | 100000 |
| isVip | boolean | ✓ | 是否VIP | false |
| isFree | boolean | ✓ | 是否免费 | true |
| price | number | ✗ | 价格（分） | 990 |
| publishTime | string | ✓ | 发布时间 | "2024-01-01T00:00:00Z" |
| updateTime | string | ✓ | 更新时间 | "2024-01-14T10:30:00Z" |
| latestChapter | object | ✗ | 最新章节 | 见下方 |
| latestChapter.id | string | ✓ | 章节ID | "chapter-xxx" |
| latestChapter.title | string | ✓ | 章节标题 | "第1648章 大结局" |
| latestChapter.updateTime | string | ✓ | 更新时间 | "2024-01-14T10:30:00Z" |

**TypeScript 定义**:
```typescript
interface BookDetailResponse {
  code: number;
  message: string;
  data: BookDetail;
  timestamp: number;
}

interface BookDetail {
  id: string;
  title: string;
  author: string;
  authorId?: string;
  cover: string;
  description: string;
  categoryId: string;
  categoryName: string;
  tags?: string[];
  status: BookStatus;
  wordCount: number;
  chapterCount: number;
  rating: number;
  ratingCount?: number;
  viewCount: number;
  favoriteCount: number;
  isVip: boolean;
  isFree: boolean;
  price?: number;
  publishTime: string;
  updateTime: string;
  latestChapter?: {
    id: string;
    title: string;
    updateTime: string;
  };
}
```

---

### 1.5 搜索响应

**接口**: `GET /api/v1/bookstore/books/search`

| 字段 | 类型 | 必含 | 说明 | 示例 |
|------|------|------|------|------|
| code | number | ✓ | 响应码 | 0 |
| message | string | ✓ | 响应消息 | "搜索成功" |
| data | BookBrief[] | ✓ | 搜索结果 | 见BookBrief定义 |
| pagination | object | ✓ | 分页信息 | 见Pagination定义 |
| pagination.total | number | ✓ | 总结果数 | 50 |
| pagination.page | number | ✓ | 当前页码 | 1 |
| pagination.page_size | number | ✓ | 每页数量 | 20 |
| pagination.total_pages | number | ✓ | 总页数 | 3 |
| pagination.has_next | boolean | ✓ | 是否有下一页 | true |
| pagination.has_previous | boolean | ✓ | 是否有上一页 | false |
| timestamp | number | ✓ | Unix时间戳 | 1705228800000 |

**TypeScript 定义**:
```typescript
interface SearchResponse {
  code: number;
  message: string;
  data: BookBrief[];
  pagination: Pagination;
  timestamp: number;
}

interface Pagination {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}
```

---

### 1.6 分类列表响应

**接口**: `GET /api/v1/bookstore/categories/tree`

| 字段 | 类型 | 必含 | 说明 | 示例 |
|------|------|------|------|------|
| code | number | ✓ | 响应码 | 0 |
| message | string | ✓ | 响应消息 | "获取分类树成功" |
| data | Category[] | ✓ | 分类列表 | 见Category定义 |
| timestamp | number | ✓ | Unix时间戳 | 1705228800000 |

#### Category（分类信息）

| 字段 | 类型 | 必含 | 说明 | 示例 |
|------|------|------|------|------|
| id | string | ✓ | 分类ID | "507f1f77bcf86cd799439014" |
| name | string | ✓ | 分类名称 | "玄幻" |
| description | string | ✗ | 分类描述 | "玄幻小说分类" |
| icon | string | ✗ | 分类图标URL | "https://example.com/icon.png" |
| bookCount | number | ✓ | 书籍数量 | 1000 |
| count | number | ✗ | 数量别名 | 1000 |
| parentId | string \| null | ✓ | 父分类ID | null |
| children | Category[] | ✗ | 子分类列表 | - |
| sort | number | ✗ | 排序值 | 1 |
| level | number | ✗ | 分类层级 | 1 |

**TypeScript 定义**:
```typescript
interface CategoryListResponse {
  code: number;
  message: string;
  data: Category[];
  timestamp: number;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  bookCount: number;
  count?: number;
  parentId: string | null;
  children?: Category[];
  sort?: number;
  level?: number;
}
```

---

### 1.7 Banner响应

**接口**: `GET /api/v1/bookstore/banners`

| 字段 | 类型 | 必含 | 说明 | 示例 |
|------|------|------|------|------|
| code | number | ✓ | 响应码 | 0 |
| message | string | ✓ | 响应消息 | "获取Banner成功" |
| data | Banner[] | ✓ | Banner列表 | 见Banner定义 |
| timestamp | number | ✓ | Unix时间戳 | 1705228800000 |

#### Banner（轮播图信息）

| 字段 | 类型 | 必含 | 说明 | 示例 |
|------|------|------|------|------|
| id | string | ✓ | Banner ID | "507f1f77bcf86cd799439015" |
| title | string | ✓ | 标题 | "热门推荐" |
| image | string | ✓ | 图片URL | "https://example.com/banner.jpg" |
| link | string | ✓ | 跳转链接 | "/books/xxx" |
| sort | number | ✓ | 排序值 | 1 |
| startTime | string | ✗ | 开始时间 | "2024-01-01T00:00:00Z" |
| endTime | string | ✗ | 结束时间 | "2024-12-31T23:59:59Z" |
| clickCount | number | ✗ | 点击次数 | 100 |

**TypeScript 定义**:
```typescript
interface BannerListResponse {
  code: number;
  message: string;
  data: Banner[];
  timestamp: number;
}

interface Banner {
  id: string;
  title: string;
  image: string;
  link: string;
  sort: number;
  startTime?: string;
  endTime?: string;
  clickCount?: number;
}
```

---

## 2. 通用响应模型

### 2.1 标准API响应

| 字段 | 类型 | 必含 | 说明 | 示例 |
|------|------|------|------|------|
| code | number | ✓ | 响应码，0表示成功 | 0 |
| message | string | ✓ | 响应消息 | "操作成功" |
| data | T \| undefined | ✓ | 响应数据 | - |
| timestamp | number | ✓ | Unix时间戳（毫秒） | 1705228800000 |
| request_id | string | ✗ | 请求追踪ID | "req-uuid-xxx" |

**TypeScript 定义**:
```typescript
interface APIResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
  request_id?: string;
}
```

### 2.2 分页响应

| 字段 | 类型 | 必含 | 说明 | 示例 |
|------|------|------|------|------|
| code | number | ✓ | 响应码 | 0 |
| message | string | ✓ | 响应消息 | "获取成功" |
| data | T[] | ✓ | 数据列表 | - |
| pagination | object | ✓ | 分页信息 | 见Pagination |
| timestamp | number | ✓ | Unix时间戳 | 1705228800000 |

**TypeScript 定义**:
```typescript
interface PaginatedResponse<T = any> {
  code: number;
  message: string;
  data: T[];
  pagination: Pagination;
  timestamp: number;
  request_id?: string;
}
```

### 2.3 错误响应

| 字段 | 类型 | 必含 | 说明 | 示例 |
|------|------|------|------|------|
| code | number | ✓ | 错误码 | 3001 |
| message | string | ✓ | 错误信息 | "书籍不存在" |
| error | string | ✗ | 错误类型 | "BOOK_NOT_FOUND" |
| details | any | ✗ | 错误详情 | - |
| timestamp | number | ✓ | Unix时间戳 | 1705228800000 |

**TypeScript 定义**:
```typescript
interface ErrorResponse {
  code: number;
  message: string;
  error?: string;
  details?: any;
  timestamp: number;
  request_id?: string;
}
```

---

## 3. 数据类型汇总

### 3.1 书籍状态 (BookStatus)

| 值 | 说明 |
|----|------|
| serializing | 连载中 |
| completed | 已完结 |
| paused | 已暂停 |

```typescript
type BookStatus = 'serializing' | 'completed' | 'paused';
```

### 3.2 榜单类型 (RankingType)

| 值 | 说明 |
|----|------|
| realtime | 实时榜 |
| weekly | 周榜 |
| monthly | 月榜 |
| newbie | 新人榜 |

```typescript
type RankingType = 'realtime' | 'weekly' | 'monthly' | 'newbie';
```

### 3.3 趋势类型 (TrendType)

| 值 | 说明 |
|----|------|
| up | 上升 |
| down | 下降 |
| stable | 持平 |

```typescript
type TrendType = 'up' | 'down' | 'stable';
```

---

## 4. 时间格式

所有时间字段使用 **ISO 8601** 格式:

- 格式: `YYYY-MM-DDTHH:mm:ss.sssZ`
- 示例: `2024-01-14T10:30:00.000Z`
- 时区: UTC (Z后缀)

**TypeScript 定义**:
```typescript
type ISO8601Timestamp = string;  // 格式: YYYY-MM-DDTHH:mm:ss.sssZ
```

---

## 5. 分页计算

### 5.1 总页数计算

```typescript
const totalPages = Math.ceil(total / pageSize);
```

### 5.2 是否有下一页

```typescript
const hasNext = page < totalPages;
```

### 5.3 是否有上一页

```typescript
const hasPrevious = page > 1;
```

---

## 6. 响应码对应关系

| 响应码 | HTTP状态 | 说明 |
|--------|---------|------|
| 0 | 200 | 成功 |
| 1001 | 400 | 参数错误 |
| 1002 | 400 | 缺少参数 |
| 1003 | 401 | 未授权 |
| 1004 | 403 | 禁止访问 |
| 1005 | 404 | 资源不存在 |
| 3001 | 404 | 书籍不存在 |
| 3005 | 400 | 书籍ID格式错误 |
| 1008 | 500 | 服务器错误 |

详细错误码说明请参考: [错误码文档](../error-handling/error-codes.md)
