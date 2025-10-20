# 书城系统API文档

> **文档版本**: v1.0
> **创建日期**: 2025-10-09
> **最后更新**: 2025-10-09

## 📋 目录

- [1. 概述](#1-概述)
- [2. 通用说明](#2-通用说明)
- [3. 书城首页](#3-书城首页)
- [4. 书籍管理](#4-书籍管理)
- [5. 章节管理](#5-章节管理)
- [6. 分类管理](#6-分类管理)
- [7. Banner管理](#7-banner管理)
- [8. 榜单系统](#8-榜单系统)
- [9. 书籍详情](#9-书籍详情)
- [10. 错误码说明](#10-错误码说明)

---

## 1. 概述

### 1.1 接口基础信息

- **Base URL**: `http://your-domain/api/v1`
- **协议**: HTTP/HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8

### 1.2 功能模块

```
书城系统API
├── 首页模块 - 聚合首页数据
├── 书籍模块 - 书籍CRUD、搜索、推荐
├── 章节模块 - 章节内容管理
├── 分类模块 - 分类树、分类书籍
├── Banner模块 - 轮播图管理
├── 榜单模块 - 实时榜、周榜、月榜、新人榜
└── 详情模块 - 书籍详情扩展功能
```

### 1.3 API概览

| 模块           | 接口数量     | 主要功能                   |
| -------------- | ------------ | -------------------------- |
| 书城首页       | 1            | 首页数据聚合               |
| 书籍管理       | 8            | CRUD、搜索、推荐、统计     |
| 章节管理       | 16           | 章节列表、内容、导航、搜索 |
| 分类管理       | 2            | 分类树、分类详情           |
| Banner管理     | 2            | Banner列表、点击统计       |
| 榜单系统       | 5            | 多维度榜单查询             |
| 书籍详情       | 14           | 详情扩展、搜索、统计       |
| **总计** | **48** | -                          |

---

## 2. 通用说明

### 2.1 统一响应格式

#### 成功响应

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    // 具体数据
  }
}
```

#### 分页响应

```json
{
  "code": 200,
  "message": "获取成功",
  "data": [...],
  "total": 100,
  "page": 1,
  "size": 20
}
```

#### 错误响应

```json
{
  "code": 400,
  "message": "错误详细描述"
}
```

### 2.2 HTTP状态码

| 状态码 | 说明                  | 使用场景     |
| ------ | --------------------- | ------------ |
| 200    | OK                    | 请求成功     |
| 201    | Created               | 创建成功     |
| 400    | Bad Request           | 请求参数错误 |
| 401    | Unauthorized          | 未授权       |
| 404    | Not Found             | 资源不存在   |
| 500    | Internal Server Error | 服务器错误   |

### 2.3 分页参数

所有支持分页的接口使用统一的分页参数：

| 参数 | 类型 | 必填 | 默认值 | 说明              |
| ---- | ---- | ---- | ------ | ----------------- |
| page | int  | 否   | 1      | 页码，从1开始     |
| size | int  | 否   | 20     | 每页数量，最大100 |

### 2.4 数据模型

#### Book（书籍）

```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "书籍标题",
  "author": "作者名",
  "description": "书籍简介",
  "cover_image_url": "封面图片URL",
  "category_id": "507f1f77bcf86cd799439012",
  "category_name": "分类名称",
  "status": "serializing",
  "tags": ["玄幻", "热血"],
  "total_chapters": 100,
  "total_words": 500000,
  "view_count": 10000,
  "like_count": 500,
  "rating": 4.5,
  "is_vip": false,
  "is_featured": true,
  "is_recommended": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Chapter（章节）

```json
{
  "id": "507f1f77bcf86cd799439013",
  "book_id": "507f1f77bcf86cd799439011",
  "chapter_num": 1,
  "title": "第一章 开始",
  "content": "章节内容...",
  "word_count": 3000,
  "is_vip": false,
  "is_published": true,
  "published_at": "2024-01-01T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Category（分类）

```json
{
  "id": "507f1f77bcf86cd799439014",
  "name": "玄幻",
  "description": "玄幻小说分类",
  "parent_id": null,
  "level": 1,
  "book_count": 1000,
  "sort_order": 1,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Banner（轮播图）

```json
{
  "id": "507f1f77bcf86cd799439015",
  "title": "推荐书籍",
  "image_url": "图片URL",
  "link_url": "跳转URL",
  "target_type": "book",
  "target_id": "507f1f77bcf86cd799439011",
  "position": 1,
  "start_time": "2024-01-01T00:00:00Z",
  "end_time": "2024-12-31T23:59:59Z",
  "click_count": 100,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## 3. 书城首页

### 3.1 获取首页数据

**接口说明**

获取书城首页的聚合数据，包括Banner、推荐书籍、精选书籍、分类信息等。

**接口详情**

- **URL**: `/api/v1/bookstore/homepage`
- **Method**: `GET`
- **认证**: 不需要

**请求参数**

无

**响应示例**

```json
{
  "code": 200,
  "message": "获取首页数据成功",
  "data": {
    "banners": [
      {
        "id": "507f1f77bcf86cd799439015",
        "title": "热门推荐",
        "image_url": "https://example.com/banner1.jpg",
        "link_url": "/books/507f1f77bcf86cd799439011",
        "target_type": "book",
        "target_id": "507f1f77bcf86cd799439011"
      }
    ],
    "recommended_books": [
      {
        "id": "507f1f77bcf86cd799439011",
        "title": "斗破苍穹",
        "author": "天蚕土豆",
        "cover_image_url": "https://example.com/cover1.jpg",
        "category_name": "玄幻",
        "rating": 4.8,
        "view_count": 1000000
      }
    ],
    "featured_books": [...],
    "categories": [
      {
        "id": "507f1f77bcf86cd799439014",
        "name": "玄幻",
        "book_count": 1000
      }
    ],
    "rankings": {
      "realtime": [...],
      "weekly": [...],
      "monthly": [...]
    }
  }
}
```

**错误示例**

```json
{
  "code": 500,
  "message": "获取首页数据失败: 数据库连接错误"
}
```

---

## 4. 书籍管理

### 4.1 获取书籍详情

**接口说明**

根据书籍ID获取书籍的详细信息。

**接口详情**

- **URL**: `/api/v1/bookstore/books/{id}`
- **Method**: `GET`
- **认证**: 不需要

**路径参数**

| 参数 | 类型   | 必填 | 说明                       |
| ---- | ------ | ---- | -------------------------- |
| id   | string | 是   | 书籍ID（MongoDB ObjectID） |

**响应示例**

```json
{
  "code": 200,
  "message": "获取书籍详情成功",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "title": "斗破苍穹",
    "author": "天蚕土豆",
    "description": "三十年河东，三十年河西，莫欺少年穷！",
    "cover_image_url": "https://example.com/cover1.jpg",
    "category_id": "507f1f77bcf86cd799439014",
    "category_name": "玄幻",
    "status": "completed",
    "tags": ["玄幻", "热血", "升级流"],
    "total_chapters": 1648,
    "total_words": 5300000,
    "view_count": 10000000,
    "like_count": 50000,
    "rating": 4.8,
    "is_vip": false,
    "is_featured": true,
    "is_recommended": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**错误示例**

```json
{
  "code": 404,
  "message": "书籍不存在或不可用"
}
```

### 4.2 根据分类获取书籍列表

**接口说明**

根据分类ID获取该分类下的书籍列表，支持分页。

**接口详情**

- **URL**: `/api/v1/bookstore/categories/{categoryId}/books`
- **Method**: `GET`
- **认证**: 不需要

**路径参数**

| 参数       | 类型   | 必填 | 说明   |
| ---------- | ------ | ---- | ------ |
| categoryId | string | 是   | 分类ID |

**查询参数**

| 参数 | 类型 | 必填 | 默认值 | 说明     |
| ---- | ---- | ---- | ------ | -------- |
| page | int  | 否   | 1      | 页码     |
| size | int  | 否   | 20     | 每页数量 |

**响应示例**

```json
{
  "code": 200,
  "message": "获取书籍列表成功",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "斗破苍穹",
      "author": "天蚕土豆",
      "cover_image_url": "https://example.com/cover1.jpg",
      "rating": 4.8,
      "view_count": 10000000
    }
  ],
  "total": 100,
  "page": 1,
  "size": 20
}
```

### 4.3 获取推荐书籍

**接口说明**

获取推荐书籍列表。

**接口详情**

- **URL**: `/api/v1/bookstore/books/recommended`
- **Method**: `GET`
- **认证**: 不需要

**查询参数**

| 参数 | 类型 | 必填 | 默认值 | 说明     |
| ---- | ---- | ---- | ------ | -------- |
| page | int  | 否   | 1      | 页码     |
| size | int  | 否   | 20     | 每页数量 |

**响应示例**

```json
{
  "code": 200,
  "message": "获取推荐书籍成功",
  "data": [...],
  "page": 1,
  "size": 20
}
```

### 4.4 获取精选书籍

**接口说明**

获取精选书籍列表。

**接口详情**

- **URL**: `/api/v1/bookstore/books/featured`
- **Method**: `GET`
- **认证**: 不需要

**查询参数**

| 参数 | 类型 | 必填 | 默认值 | 说明     |
| ---- | ---- | ---- | ------ | -------- |
| page | int  | 否   | 1      | 页码     |
| size | int  | 否   | 20     | 每页数量 |

**响应示例**

```json
{
  "code": 200,
  "message": "获取精选书籍成功",
  "data": [...],
  "page": 1,
  "size": 20
}
```

### 4.5 搜索书籍

**接口说明**

根据关键词和过滤条件搜索书籍。

**接口详情**

- **URL**: `/api/v1/bookstore/books/search`
- **Method**: `GET`
- **认证**: 不需要

**查询参数**

| 参数       | 类型   | 必填 | 默认值     | 说明                 |
| ---------- | ------ | ---- | ---------- | -------------------- |
| keyword    | string | 否   | -          | 搜索关键词           |
| categoryId | string | 否   | -          | 分类ID               |
| author     | string | 否   | -          | 作者名称             |
| tags       | array  | 否   | -          | 标签数组             |
| minRating  | number | 否   | -          | 最低评分             |
| sortBy     | string | 否   | created_at | 排序字段             |
| sortOrder  | string | 否   | desc       | 排序方向（asc/desc） |
| page       | int    | 否   | 1          | 页码                 |
| size       | int    | 否   | 20         | 每页数量             |

**sortBy支持的值**

- `created_at` - 创建时间
- `updated_at` - 更新时间
- `view_count` - 浏览量
- `like_count` - 点赞数
- `rating` - 评分

**请求示例**

```
GET /api/v1/bookstore/books/search?keyword=斗破&categoryId=507f1f77bcf86cd799439014&sortBy=view_count&sortOrder=desc&page=1&size=20
```

**响应示例**

```json
{
  "code": 200,
  "message": "搜索书籍成功",
  "data": [...],
  "total": 50,
  "page": 1,
  "size": 20
}
```

### 4.6 增加书籍浏览量

**接口说明**

记录用户浏览书籍，增加浏览量统计。

**接口详情**

- **URL**: `/api/v1/bookstore/books/{id}/view`
- **Method**: `POST`
- **认证**: 不需要

**路径参数**

| 参数 | 类型   | 必填 | 说明   |
| ---- | ------ | ---- | ------ |
| id   | string | 是   | 书籍ID |

**响应示例**

```json
{
  "code": 200,
  "message": "浏览量增加成功"
}
```

---

## 5. 章节管理

### 5.1 获取章节详情

**接口说明**

根据章节ID获取章节详细信息。

**接口详情**

- **URL**: `/api/v1/chapters/{id}`
- **Method**: `GET`
- **认证**: 不需要

**路径参数**

| 参数 | 类型   | 必填 | 说明                       |
| ---- | ------ | ---- | -------------------------- |
| id   | string | 是   | 章节ID（MongoDB ObjectID） |

**响应示例**

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "book_id": "507f1f77bcf86cd799439011",
    "chapter_num": 1,
    "title": "第一章 药老",
    "content": "章节内容...",
    "word_count": 3000,
    "is_vip": false,
    "is_published": true,
    "published_at": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 5.2 根据书籍ID获取章节列表

**接口说明**

根据书籍ID获取所有章节列表。

**接口详情**

- **URL**: `/api/v1/books/{book_id}/chapters`
- **Method**: `GET`
- **认证**: 不需要

**路径参数**

| 参数    | 类型   | 必填 | 说明   |
| ------- | ------ | ---- | ------ |
| book_id | string | 是   | 书籍ID |

**查询参数**

| 参数 | 类型 | 必填 | 默认值 | 说明     |
| ---- | ---- | ---- | ------ | -------- |
| page | int  | 否   | 1      | 页码     |
| size | int  | 否   | 20     | 每页数量 |

**响应示例**

```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": "507f1f77bcf86cd799439013",
      "chapter_num": 1,
      "title": "第一章 药老",
      "word_count": 3000,
      "is_vip": false,
      "published_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1648,
  "page": 1,
  "size": 20
}
```

### 5.3 根据书籍ID和章节号获取章节

**接口说明**

根据书籍ID和章节号获取特定章节。

**接口详情**

- **URL**: `/api/v1/books/{book_id}/chapters/{chapter_num}`
- **Method**: `GET`
- **认证**: 不需要

**路径参数**

| 参数        | 类型   | 必填 | 说明   |
| ----------- | ------ | ---- | ------ |
| book_id     | string | 是   | 书籍ID |
| chapter_num | int    | 是   | 章节号 |

**响应示例**

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "book_id": "507f1f77bcf86cd799439011",
    "chapter_num": 1,
    "title": "第一章 药老",
    "content": "章节内容...",
    "word_count": 3000,
    "is_vip": false
  }
}
```

### 5.4 获取章节内容

**接口说明**

根据章节ID获取章节内容（支持VIP权限验证）。

**接口详情**

- **URL**: `/api/v1/chapters/{id}/content`
- **Method**: `GET`
- **认证**: VIP章节需要

**路径参数**

| 参数 | 类型   | 必填 | 说明   |
| ---- | ------ | ---- | ------ |
| id   | string | 是   | 章节ID |

**响应示例**

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "chapter_id": "507f1f77bcf86cd799439013",
    "content": "章节完整内容..."
  }
}
```

### 5.5 获取上一章节

**接口说明**

根据当前章节ID获取上一章节。

**接口详情**

- **URL**: `/api/v1/chapters/{id}/previous`
- **Method**: `GET`
- **认证**: 不需要

**路径参数**

| 参数 | 类型   | 必填 | 说明       |
| ---- | ------ | ---- | ---------- |
| id   | string | 是   | 当前章节ID |

**响应示例**

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "chapter_num": 0,
    "title": "序章",
    "word_count": 2000,
    "is_vip": false
  }
}
```

### 5.6 获取下一章节

**接口说明**

根据当前章节ID获取下一章节。

**接口详情**

- **URL**: `/api/v1/chapters/{id}/next`
- **Method**: `GET`
- **认证**: 不需要

**路径参数**

| 参数 | 类型   | 必填 | 说明       |
| ---- | ------ | ---- | ---------- |
| id   | string | 是   | 当前章节ID |

**响应示例**

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "chapter_num": 2,
    "title": "第二章 魔兽山脉",
    "word_count": 3200,
    "is_vip": false
  }
}
```

### 5.7 获取第一章节

**接口说明**

根据书籍ID获取第一章节。

**接口详情**

- **URL**: `/api/v1/books/{book_id}/chapters/first`
- **Method**: `GET`
- **认证**: 不需要

**响应示例**

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "chapter_num": 1,
    "title": "第一章 药老",
    "is_vip": false
  }
}
```

### 5.8 获取最后章节

**接口说明**

根据书籍ID获取最后章节。

**接口详情**

- **URL**: `/api/v1/books/{book_id}/chapters/last`
- **Method**: `GET`
- **认证**: 不需要

**响应示例**

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "507f1f77bcf86cd799439999",
    "chapter_num": 1648,
    "title": "第1648章 大结局",
    "is_vip": false
  }
}
```

### 5.9 搜索章节

**接口说明**

根据关键词搜索章节。

**接口详情**

- **URL**: `/api/v1/chapters/search`
- **Method**: `GET`
- **认证**: 不需要

**查询参数**

| 参数    | 类型   | 必填 | 默认值 | 说明               |
| ------- | ------ | ---- | ------ | ------------------ |
| keyword | string | 是   | -      | 搜索关键词         |
| book_id | string | 否   | -      | 限定书籍ID（可选） |
| page    | int    | 否   | 1      | 页码               |
| size    | int    | 否   | 20     | 每页数量           |

**响应示例**

```json
{
  "code": 200,
  "message": "搜索成功",
  "data": [...],
  "total": 10,
  "page": 1,
  "size": 20
}
```

### 5.10 获取章节统计信息

**接口说明**

获取书籍的章节统计信息（总章节数、免费章节数、付费章节数、总字数）。

**接口详情**

- **URL**: `/api/v1/books/{book_id}/chapters/statistics`
- **Method**: `GET`
- **认证**: 不需要

**路径参数**

| 参数    | 类型   | 必填 | 说明   |
| ------- | ------ | ---- | ------ |
| book_id | string | 是   | 书籍ID |

**响应示例**

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "book_id": "507f1f77bcf86cd799439011",
    "total_chapters": 1648,
    "free_chapters": 100,
    "paid_chapters": 1548,
    "total_word_count": 5300000
  }
}
```

---

## 6. 分类管理

### 6.1 获取分类树

**接口说明**

获取完整的分类树结构。

**接口详情**

- **URL**: `/api/v1/bookstore/categories/tree`
- **Method**: `GET`
- **认证**: 不需要

**响应示例**

```json
{
  "code": 200,
  "message": "获取分类树成功",
  "data": [
    {
      "id": "507f1f77bcf86cd799439014",
      "name": "玄幻",
      "description": "玄幻小说分类",
      "level": 1,
      "book_count": 1000,
      "children": [
        {
          "id": "507f1f77bcf86cd799439015",
          "name": "东方玄幻",
          "parent_id": "507f1f77bcf86cd799439014",
          "level": 2,
          "book_count": 500,
          "children": []
        }
      ]
    }
  ]
}
```

### 6.2 获取分类详情

**接口说明**

根据分类ID获取分类的详细信息。

**接口详情**

- **URL**: `/api/v1/bookstore/categories/{id}`
- **Method**: `GET`
- **认证**: 不需要

**路径参数**

| 参数 | 类型   | 必填 | 说明   |
| ---- | ------ | ---- | ------ |
| id   | string | 是   | 分类ID |

**响应示例**

```json
{
  "code": 200,
  "message": "获取分类详情成功",
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "name": "玄幻",
    "description": "玄幻小说分类",
    "parent_id": null,
    "level": 1,
    "book_count": 1000,
    "sort_order": 1,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## 7. Banner管理

### 7.1 获取激活的Banner列表

**接口说明**

获取当前激活的Banner列表。

**接口详情**

- **URL**: `/api/v1/bookstore/banners`
- **Method**: `GET`
- **认证**: 不需要

**查询参数**

| 参数  | 类型 | 必填 | 默认值 | 说明               |
| ----- | ---- | ---- | ------ | ------------------ |
| limit | int  | 否   | 5      | 数量限制（最大20） |

**响应示例**

```json
{
  "code": 200,
  "message": "获取Banner列表成功",
  "data": [
    {
      "id": "507f1f77bcf86cd799439015",
      "title": "热门推荐",
      "image_url": "https://example.com/banner1.jpg",
      "link_url": "/books/507f1f77bcf86cd799439011",
      "target_type": "book",
      "target_id": "507f1f77bcf86cd799439011",
      "position": 1,
      "click_count": 100
    }
  ]
}
```

### 7.2 增加Banner点击次数

**接口说明**

记录用户点击Banner，增加点击次数统计。

**接口详情**

- **URL**: `/api/v1/bookstore/banners/{id}/click`
- **Method**: `POST`
- **认证**: 不需要

**路径参数**

| 参数 | 类型   | 必填 | 说明      |
| ---- | ------ | ---- | --------- |
| id   | string | 是   | Banner ID |

**响应示例**

```json
{
  "code": 200,
  "message": "点击次数增加成功"
}
```

---

## 8. 榜单系统

### 8.1 获取实时榜

**接口说明**

获取当日实时榜单数据。

**接口详情**

- **URL**: `/api/v1/bookstore/rankings/realtime`
- **Method**: `GET`
- **认证**: 不需要

**查询参数**

| 参数  | 类型 | 必填 | 默认值 | 说明                |
| ----- | ---- | ---- | ------ | ------------------- |
| limit | int  | 否   | 20     | 限制数量（最大100） |

**响应示例**

```json
{
  "code": 200,
  "message": "获取实时榜成功",
  "data": [
    {
      "rank": 1,
      "book_id": "507f1f77bcf86cd799439011",
      "title": "斗破苍穹",
      "author": "天蚕土豆",
      "cover_image_url": "https://example.com/cover1.jpg",
      "score": 10000,
      "trend": "up"
    }
  ]
}
```

### 8.2 获取周榜

**接口说明**

获取指定周期的周榜单数据。

**接口详情**

- **URL**: `/api/v1/bookstore/rankings/weekly`
- **Method**: `GET`
- **认证**: 不需要

**查询参数**

| 参数   | 类型   | 必填 | 默认值 | 说明                   |
| ------ | ------ | ---- | ------ | ---------------------- |
| period | string | 否   | 当前周 | 周期（格式：2024-W01） |
| limit  | int    | 否   | 20     | 限制数量               |

**响应示例**

```json
{
  "code": 200,
  "message": "获取周榜成功",
  "data": [...]
}
```

### 8.3 获取月榜

**接口说明**

获取指定月份的月榜单数据。

**接口详情**

- **URL**: `/api/v1/bookstore/rankings/monthly`
- **Method**: `GET`
- **认证**: 不需要

**查询参数**

| 参数   | 类型   | 必填 | 默认值 | 说明                  |
| ------ | ------ | ---- | ------ | --------------------- |
| period | string | 否   | 当前月 | 月份（格式：2024-01） |
| limit  | int    | 否   | 20     | 限制数量              |

**响应示例**

```json
{
  "code": 200,
  "message": "获取月榜成功",
  "data": [...]
}
```

### 8.4 获取新人榜

**接口说明**

获取指定月份的新人榜单数据。

**接口详情**

- **URL**: `/api/v1/bookstore/rankings/newbie`
- **Method**: `GET`
- **认证**: 不需要

**查询参数**

| 参数   | 类型   | 必填 | 默认值 | 说明                  |
| ------ | ------ | ---- | ------ | --------------------- |
| period | string | 否   | 当前月 | 月份（格式：2024-01） |
| limit  | int    | 否   | 20     | 限制数量              |

**响应示例**

```json
{
  "code": 200,
  "message": "获取新人榜成功",
  "data": [...]
}
```

### 8.5 根据类型获取榜单

**接口说明**

根据榜单类型获取指定周期的榜单数据。

**接口详情**

- **URL**: `/api/v1/bookstore/rankings/{type}`
- **Method**: `GET`
- **认证**: 不需要

**路径参数**

| 参数 | 类型   | 必填 | 说明                                       |
| ---- | ------ | ---- | ------------------------------------------ |
| type | string | 是   | 榜单类型（realtime/weekly/monthly/newbie） |

**查询参数**

| 参数   | 类型   | 必填 | 默认值 | 说明     |
| ------ | ------ | ---- | ------ | -------- |
| period | string | 否   | -      | 周期     |
| limit  | int    | 否   | 20     | 限制数量 |

**响应示例**

```json
{
  "code": 200,
  "message": "获取榜单成功",
  "data": [...]
}
```

---

## 9. 书籍详情

### 9.1 根据标题搜索书籍

**接口说明**

根据书籍标题进行模糊搜索。

**接口详情**

- **URL**: `/api/v1/books/search/title`
- **Method**: `GET`
- **认证**: 不需要

**查询参数**

| 参数  | 类型   | 必填 | 默认值 | 说明     |
| ----- | ------ | ---- | ------ | -------- |
| title | string | 是   | -      | 书籍标题 |
| page  | int    | 否   | 1      | 页码     |
| size  | int    | 否   | 20     | 每页数量 |

**响应示例**

```json
{
  "code": 200,
  "message": "搜索成功",
  "data": [...],
  "total": 10,
  "page": 1,
  "size": 20
}
```

### 9.2 根据作者搜索书籍

**接口说明**

根据作者名称搜索书籍。

**接口详情**

- **URL**: `/api/v1/books/search/author`
- **Method**: `GET`
- **认证**: 不需要

**查询参数**

| 参数   | 类型   | 必填 | 默认值 | 说明     |
| ------ | ------ | ---- | ------ | -------- |
| author | string | 是   | -      | 作者名称 |
| page   | int    | 否   | 1      | 页码     |
| size   | int    | 否   | 20     | 每页数量 |

**响应示例**

```json
{
  "code": 200,
  "message": "搜索成功",
  "data": [...],
  "total": 5,
  "page": 1,
  "size": 20
}
```

### 9.3 根据状态获取书籍

**接口说明**

根据书籍状态获取书籍列表。

**接口详情**

- **URL**: `/api/v1/books/status`
- **Method**: `GET`
- **认证**: 不需要

**查询参数**

| 参数   | 类型   | 必填 | 默认值 | 说明                                     |
| ------ | ------ | ---- | ------ | ---------------------------------------- |
| status | string | 是   | -      | 书籍状态（serializing/completed/paused） |
| page   | int    | 否   | 1      | 页码                                     |
| size   | int    | 否   | 20     | 每页数量                                 |

**status支持的值**

- `serializing` - 连载中
- `completed` - 已完结
- `paused` - 暂停

**响应示例**

```json
{
  "code": 200,
  "message": "获取成功",
  "data": [...],
  "total": 50,
  "page": 1,
  "size": 20
}
```

### 9.4 根据标签获取书籍

**接口说明**

根据标签获取书籍列表。

**接口详情**

- **URL**: `/api/v1/books/tags`
- **Method**: `GET`
- **认证**: 不需要

**查询参数**

| 参数 | 类型   | 必填 | 默认值 | 说明                                |
| ---- | ------ | ---- | ------ | ----------------------------------- |
| tags | string | 是   | -      | 标签列表（逗号分隔，如：玄幻,热血） |
| page | int    | 否   | 1      | 页码                                |
| size | int    | 否   | 20     | 每页数量                            |

**请求示例**

```
GET /api/v1/books/tags?tags=玄幻,热血&page=1&size=20
```

**响应示例**

```json
{
  "code": 200,
  "message": "获取成功",
  "data": [...],
  "total": 30,
  "page": 1,
  "size": 20
}
```

### 9.5 获取相似书籍

**接口说明**

根据书籍ID获取相似书籍。

**接口详情**

- **URL**: `/api/v1/books/{id}/similar`
- **Method**: `GET`
- **认证**: 不需要

**路径参数**

| 参数 | 类型   | 必填 | 说明   |
| ---- | ------ | ---- | ------ |
| id   | string | 是   | 书籍ID |

**查询参数**

| 参数  | 类型 | 必填 | 默认值 | 说明               |
| ----- | ---- | ---- | ------ | ------------------ |
| limit | int  | 否   | 10     | 数量限制（最大50） |

**响应示例**

```json
{
  "code": 200,
  "message": "获取成功",
  "data": [...]
}
```

### 9.6 获取热门书籍

**接口说明**

获取热门书籍列表。

**接口详情**

- **URL**: `/api/v1/books/popular`
- **Method**: `GET`
- **认证**: 不需要

**查询参数**

| 参数  | 类型 | 必填 | 默认值 | 说明               |
| ----- | ---- | ---- | ------ | ------------------ |
| limit | int  | 否   | 10     | 数量限制（最大50） |

**响应示例**

```json
{
  "code": 200,
  "message": "获取成功",
  "data": [...]
}
```

### 9.7 获取最新书籍

**接口说明**

获取最新发布的书籍列表。

**接口详情**

- **URL**: `/api/v1/books/latest`
- **Method**: `GET`
- **认证**: 不需要

**查询参数**

| 参数  | 类型 | 必填 | 默认值 | 说明               |
| ----- | ---- | ---- | ------ | ------------------ |
| limit | int  | 否   | 10     | 数量限制（最大50） |

**响应示例**

```json
{
  "code": 200,
  "message": "获取成功",
  "data": [...]
}
```

---

## 10. 错误码说明

### 10.1 通用错误码

| 错误码 | 说明           | 解决方案                 |
| ------ | -------------- | ------------------------ |
| 200    | 成功           | -                        |
| 201    | 创建成功       | -                        |
| 400    | 请求参数错误   | 检查请求参数格式和必填项 |
| 401    | 未授权         | 需要登录或Token失效      |
| 404    | 资源不存在     | 检查资源ID是否正确       |
| 500    | 服务器内部错误 | 联系技术支持             |

### 10.2 业务错误码

| 错误信息           | 说明         | 解决方案                 |
| ------------------ | ------------ | ------------------------ |
| 书籍ID不能为空     | 路径参数缺失 | 提供有效的书籍ID         |
| 无效的书籍ID格式   | ID格式错误   | 使用MongoDB ObjectID格式 |
| 书籍不存在或不可用 | 书籍未找到   | 检查书籍ID是否正确       |
| 章节不存在         | 章节未找到   | 检查章节ID或章节号       |
| 搜索关键词不能为空 | 搜索参数缺失 | 提供搜索关键词           |
| 无效的榜单类型     | 榜单类型错误 | 使用支持的榜单类型       |

---

## 附录

### A. 快速开始示例

#### JavaScript/Axios

```javascript
// 获取首页数据
axios.get('http://your-domain/api/v1/bookstore/homepage')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });

// 搜索书籍
axios.get('http://your-domain/api/v1/bookstore/books/search', {
  params: {
    keyword: '斗破',
    page: 1,
    size: 20
  }
})
  .then(response => {
    console.log(response.data);
  });
```

#### Python/Requests

```python
import requests

# 获取首页数据
response = requests.get('http://your-domain/api/v1/bookstore/homepage')
data = response.json()
print(data)

# 搜索书籍
params = {
    'keyword': '斗破',
    'page': 1,
    'size': 20
}
response = requests.get('http://your-domain/api/v1/bookstore/books/search', params=params)
data = response.json()
print(data)
```

#### cURL

```bash
# 获取首页数据
curl -X GET "http://your-domain/api/v1/bookstore/homepage"

# 搜索书籍
curl -X GET "http://your-domain/api/v1/bookstore/books/search?keyword=斗破&page=1&size=20"

# 获取书籍详情
curl -X GET "http://your-domain/api/v1/bookstore/books/507f1f77bcf86cd799439011"
```

### B. 更新日志

| 版本 | 日期       | 更新内容                      |
| ---- | ---------- | ----------------------------- |
| v1.0 | 2025-10-09 | 初始版本，包含所有书城系统API |

---


**最后更新**: 2025-10-09
