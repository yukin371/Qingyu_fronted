# 数据模型 / 请求模型

> **版本**: v1.3
> **最后更新**: 2025-01-14

---

## 1. 认证模块

### 1.1 用户登录请求

**接口**: `POST /api/v1/shared/auth/login`

| 字段 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|------|------|------|------|----------|------|
| username | string | ✓ | 用户名 | 3-20字符，字母数字下划线 | "zhangsan" |
| password | string | ✓ | 密码 | 任意字符，建议6位以上 | "password123" |

**TypeScript 定义**:
```typescript
interface LoginCredentials {
  username: string;           // 用户名，3-20字符
  password: string;           // 密码，建议6位以上
}
```

**Go 定义**:
```go
type LoginRequest struct {
    Username string `json:"username" binding:"required,min=3,max=20"`
    Password string `json:"password" binding:"required,min=6"`
}
```

---

### 1.2 用户注册请求

**接口**: `POST /api/v1/shared/auth/register`

| 字段 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|------|------|------|------|----------|------|
| username | string | ✓ | 用户名 | 3-20字符，字母数字下划线，唯一 | "zhangsan" |
| email | string | ✓ | 邮箱地址 | 有效的邮箱格式，唯一 | "zhangsan@example.com" |
| password | string | ✓ | 密码 | 6位以上 | "password123" |
| nickname | string | ✗ | 昵称 | 可选，1-20字符 | "小张" |

**TypeScript 定义**:
```typescript
interface RegisterData {
  username: string;           // 用户名，3-20字符，唯一
  email: string;              // 邮箱地址，有效的邮箱格式，唯一
  password: string;           // 密码，6位以上
  nickname?: string;          // 昵称，可选，1-20字符
}
```

**Go 定义**:
```go
type RegisterRequest struct {
    Username string `json:"username" binding:"required,min=3,max=20,alphanum"`
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=6"`
    Nickname string `json:"nickname" binding:"omitempty,max=20"`
}
```

---

### 1.3 修改密码请求

**接口**: `PUT /api/v1/users/password`

| 字段 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|------|------|------|------|----------|------|
| old_password | string | ✓ | 原密码 | 与当前密码一致 | "oldpass123" |
| new_password | string | ✓ | 新密码 | 6位以上，不能与原密码相同 | "newpass456" |

**TypeScript 定义**:
```typescript
interface PasswordChangeData {
  old_password: string;       // 原密码，需与当前密码一致
  new_password: string;       // 新密码，6位以上，不能与原密码相同
}
```

**Go 定义**:
```go
type ChangePasswordRequest struct {
    OldPassword string `json:"old_password" binding:"required"`
    NewPassword string `json:"new_password" binding:"required,min=6"`
}
```

---

### 1.4 刷新Token请求

**接口**: `POST /api/v1/shared/auth/refresh`

**请求**: 无需请求体

Token从请求头获取：
```
Authorization: Bearer <refresh_token>
```

**说明**:
- 使用refreshToken获取新的访问令牌
- refreshToken在登录/注册时返回
- 前端应妥善存储refreshToken

---

### 1.5 用户信息更新请求

**接口**: `PUT /api/v1/users/profile`

| 字段 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|------|------|------|------|----------|------|
| nickname | string | ✗ | 昵称 | 1-20字符 | "小张" |
| avatar | string | ✗ | 头像URL | 有效的URL | "https://example.com/avatar.jpg" |
| bio | string | ✗ | 个人简介 | 最多200字符 | "热爱阅读和写作" |
| gender | string | ✗ | 性别 | "male", "female", "other" | "male" |
| birthday | string | ✗ | 生日 | ISO 8601格式 | "1990-01-01" |
| location | string | ✗ | 所在地 | 最多50字符 | "北京市" |

**TypeScript 定义**:
```typescript
interface UserUpdateData {
  nickname?: string;          // 昵称，1-20字符
  avatar?: string;            // 头像URL
  bio?: string;               // 个人简介，最多200字符
  gender?: 'male' | 'female' | 'other';  // 性别
  birthday?: string;          // 生日，ISO 8601格式
  location?: string;          // 所在地，最多50字符
}
```

**Go 定义**:
```go
type UpdateProfileRequest struct {
    Nickname string `json:"nickname" binding:"omitempty,min=1,max=20"`
    Avatar   string `json:"avatar" binding:"omitempty,url"`
    Bio      string `json:"bio" binding:"omitempty,max=200"`
    Gender   string `json:"gender" binding:"omitempty,oneof=male female other"`
    Birthday string `json:"birthday" binding:"omitempty"`
    Location string `json:"location" binding:"omitempty,max=50"`
}
```

---

## 2. 书城模块

### 1.1 首页数据请求

**接口**: `GET /api/v1/bookstore/homepage`

**请求参数**: 无

---

### 1.2 榜单查询请求

**接口**: `GET /api/v1/bookstore/rankings/{type}`

#### 路径参数

| 字段 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|------|------|------|------|----------|------|
| type | string | ✓ | 榜单类型 | 枚举值: realtime, weekly, monthly, newbie | "realtime" |

#### 查询参数

| 字段 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|------|------|------|------|----------|------|
| limit | number | ✗ | 返回数量限制 | 1-100，默认20 | 20 |

**TypeScript 定义**:
```typescript
interface RankingRequest {
  type: 'realtime' | 'weekly' | 'monthly' | 'newbie';  // 榜单类型
  limit?: number;  // 返回数量，默认20，最大100
}
```

---

### 1.3 书籍列表请求

**接口**: `GET /api/v1/bookstore/books/recommended`

#### 查询参数

| 字段 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|------|------|------|------|----------|------|
| page | number | ✗ | 页码 | >= 1，默认1 | 1 |
| size | number | ✗ | 每页数量 | 1-100，默认20 | 20 |
| category | string | ✗ | 分类ID | MongoDB ObjectId格式 | "507f1f77bcf86cd799439011" |
| status | string | ✗ | 书籍状态 | 枚举值: serializing, completed, paused | "serializing" |
| sort | string | ✗ | 排序字段 | 枚举值: updateTime, rating, viewCount, wordCount | "updateTime" |
| order | string | ✗ | 排序方向 | 枚举值: asc, desc，默认desc | "desc" |

**TypeScript 定义**:
```typescript
interface BookListRequest {
  page?: number;  // 页码，默认1
  size?: number;  // 每页数量，默认20，最大100
  category?: string;  // 分类ID
  status?: 'serializing' | 'completed' | 'paused';  // 书籍状态
  sort?: 'updateTime' | 'rating' | 'viewCount' | 'wordCount';  // 排序字段
  order?: 'asc' | 'desc';  // 排序方向，默认desc
}
```

---

### 1.4 书籍详情请求

**接口**: `GET /api/v1/bookstore/books/{id}`

#### 路径参数

| 字段 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|------|------|------|------|----------|------|
| id | string | ✓ | 书籍ID | MongoDB ObjectId格式，24位十六进制 | "507f1f77bcf86cd799439011" |

**TypeScript 定义**:
```typescript
interface BookDetailRequest {
  id: string;  // 书籍ID，MongoDB ObjectId格式
}
```

---

### 1.5 搜索请求

**接口**: `GET /api/v1/bookstore/books/search`

#### 查询参数

| 字段 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|------|------|------|------|----------|------|
| keyword | string | ✗ | 搜索关键词 | 长度1-100字符 | "斗破苍穹" |
| author | string | ✗ | 作者名称 | 长度1-50字符 | "天蚕土豆" |
| categoryId | string | ✗ | 分类ID | MongoDB ObjectId格式 | "507f1f77bcf86cd799439011" |
| tags | string[] | ✗ | 标签数组 | 数组，最多10个标签 | ["玄幻", "热血"] |
| status | string | ✗ | 书籍状态 | 枚举值: serializing, completed, paused | "serializing" |
| wordCountMin | number | ✗ | 最小字数 | >= 0 | 100000 |
| wordCountMax | number | ✗ | 最大字数 | >= wordCountMin | 5000000 |
| ratingMin | number | ✗ | 最低评分 | 0-5 | 4.0 |
| sortBy | string | ✗ | 排序字段 | 枚举值: relevance, updateTime, rating, viewCount, wordCount | "relevance" |
| sortOrder | string | ✗ | 排序方向 | 枚举值: asc, desc，默认desc | "desc" |
| page | number | ✗ | 页码 | >= 1，默认1 | 1 |
| size | number | ✗ | 每页数量 | 1-100，默认20 | 20 |

**TypeScript 定义**:
```typescript
interface SearchRequest {
  keyword?: string;  // 搜索关键词
  author?: string;  // 作者名称
  categoryId?: string;  // 分类ID
  tags?: string[];  // 标签数组
  status?: 'serializing' | 'completed' | 'paused';  // 书籍状态
  wordCountMin?: number;  // 最小字数
  wordCountMax?: number;  // 最大字数
  ratingMin?: number;  // 最低评分，0-5
  sortBy?: 'relevance' | 'updateTime' | 'rating' | 'viewCount' | 'wordCount';  // 排序字段
  sortOrder?: 'asc' | 'desc';  // 排序方向
  page?: number;  // 页码，默认1
  size?: number;  // 每页数量，默认20，最大100
}
```

---

### 1.6 分类查询请求

**接口**: `GET /api/v1/bookstore/categories/tree`

**请求参数**: 无

---

### 1.7 分类详情请求

**接口**: `GET /api/v1/bookstore/categories/{id}`

#### 路径参数

| 字段 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|------|------|------|------|----------|------|
| id | string | ✓ | 分类ID | MongoDB ObjectId格式 | "507f1f77bcf86cd799439011" |

**TypeScript 定义**:
```typescript
interface CategoryDetailRequest {
  id: string;  // 分类ID，MongoDB ObjectId格式
}
```

---

### 1.8 分类书籍请求

**接口**: `GET /api/v1/bookstore/categories/{id}/books`

#### 路径参数

| 字段 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|------|------|------|------|----------|------|
| id | string | ✓ | 分类ID | MongoDB ObjectId格式 | "507f1f77bcf86cd799439011" |

#### 查询参数

| 字段 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|------|------|------|------|----------|------|
| page | number | ✗ | 页码 | >= 1，默认1 | 1 |
| pageSize | number | ✗ | 每页数量 | 1-100，默认20 | 20 |
| sort | string | ✗ | 排序字段 | 枚举值: updateTime, rating, viewCount | "updateTime" |

**TypeScript 定义**:
```typescript
interface CategoryBooksRequest {
  id: string;  // 分类ID
  page?: number;  // 页码，默认1
  pageSize?: number;  // 每页数量，默认20，最大100
  sort?: 'updateTime' | 'rating' | 'viewCount';  // 排序字段
}
```

---

### 1.9 增加浏览量请求

**接口**: `POST /api/v1/bookstore/books/{id}/view`

#### 路径参数

| 字段 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|------|------|------|------|----------|------|
| id | string | ✓ | 书籍ID | MongoDB ObjectId格式 | "507f1f77bcf86cd799439011" |

**请求体**: 无

**TypeScript 定义**:
```typescript
interface IncrementViewRequest {
  bookId: string;  // 书籍ID
}
```

---

### 1.10 相似书籍请求

**接口**: `GET /api/v1/bookstore/books/{id}/similar`

#### 路径参数

| 字段 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|------|------|------|------|----------|------|
| id | string | ✓ | 书籍ID | MongoDB ObjectId格式 | "507f1f77bcf86cd799439011" |

#### 查询参数

| 字段 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|------|------|------|------|----------|------|
| limit | number | ✗ | 返回数量限制 | 1-50，默认10 | 10 |

**TypeScript 定义**:
```typescript
interface SimilarBooksRequest {
  bookId: string;  // 书籍ID
  limit?: number;  // 返回数量，默认10，最大50
}
```

---

## 2. 通用请求模型

### 2.1 分页参数

**TypeScript 定义**:
```typescript
interface PaginationParams {
  page?: number;  // 页码，默认1，>= 1
  page_size?: number;  // 每页数量，默认20，1-100
  size?: number;  // 每页数量的别名，默认20
}
```

### 2.2 排序参数

**TypeScript 定义**:
```typescript
interface SortParams {
  sortBy?: string;  // 排序字段
  sortOrder?: 'asc' | 'desc';  // 排序方向
}
```

### 2.3 ID参数验证

**MongoDB ObjectId 格式验证规则**:
- 24位十六进制字符串
- 只能包含 0-9 和 a-f
- 示例: "507f1f77bcf86cd799439011"

**正则表达式**: `/^[0-9a-f]{24}$/i`

---

## 3. 枚举值定义

### 3.1 书籍状态 (BookStatus)

| 值 | 说明 |
|----|------|
| serializing | 连载中 |
| completed | 已完结 |
| paused | 已暂停 |

**TypeScript 定义**:
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

**TypeScript 定义**:
```typescript
type RankingType = 'realtime' | 'weekly' | 'monthly' | 'newbie';
```

### 3.3 排序字段

| 值 | 说明 | 适用场景 |
|----|------|----------|
| relevance | 相关度 | 搜索 |
| updateTime | 更新时间 | 书籍列表 |
| rating | 评分 | 书籍列表 |
| viewCount | 浏览量 | 书籍列表 |
| wordCount | 字数 | 书籍列表 |

---

## 4. 验证规则总结

### 4.1 字符串长度限制

| 参数 | 最小长度 | 最大长度 | 说明 |
|------|---------|---------|------|
| keyword | 1 | 100 | 搜索关键词 |
| author | 1 | 50 | 作者名称 |
| id (ObjectId) | 24 | 24 | MongoDB ID |

### 4.2 数值范围限制

| 参数 | 最小值 | 最大值 | 默认值 |
|------|--------|--------|--------|
| page | 1 | - | 1 |
| size/pageSize | 1 | 100 | 20 |
| limit | 1 | 100 | 20/10 |
| ratingMin | 0 | 5 | - |
| wordCountMin | 0 | - | - |

### 4.3 数组长度限制

| 参数 | 最大长度 | 说明 |
|------|---------|------|
| tags | 10 | 标签数组 |

---

## 5. 错误码参考

书城模块请求可能返回的错误码:

| 错误码 | 说明 | 触发条件 |
|--------|------|----------|
| 1001 | 参数错误 | 参数格式或值不正确 |
| 1002 | 缺少参数 | 缺少必填的请求参数 |
| 3001 | 书籍不存在 | 指定书籍ID不存在 |
| 3005 | 书籍ID格式错误 | 书籍ID不符合ObjectId格式 |

详细错误码说明请参考: [错误码文档](../error-handling/error-codes.md)
