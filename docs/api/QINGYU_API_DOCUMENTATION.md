# 青羽写作平台 API 文档

## 目录

- [基础信息](#基础信息)
- [认证系统](#认证系统)
- [用户管理](#用户管理)
- [写作功能](#写作功能)
- [AI辅助](#ai辅助)
- [书城系统](#书城系统)
- [阅读功能](#阅读功能)
- [社交功能](#社交功能)
- [支付系统](#支付系统)
- [推荐系统](#推荐系统)
- [存储服务](#存储服务)
- [系统管理](#系统管理)
- [消息通知](#消息通知)
- [搜索服务](#搜索服务)

---

## 基础信息

### 通用信息

| 项目 | 说明 |
|------|------|
| **Base URL** | `http://localhost:8080` |
| **API版本** | `/api/v1` |
| **认证方式** | Bearer Token (JWT) |
| **响应格式** | `application/json` |
| **字符编码** | `UTF-8` |

### 认证机制

```
Authorization: Bearer <token>
```

### 通用响应格式

**成功响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

**错误响应**
```json
{
  "code": 1001,
  "message": "错误描述",
  "data": null
}
```

### 通用错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 未认证 |
| 1003 | 无权限 |
| 1004 | 资源不存在 |
| 1005 | 服务器内部错误 |
| 1006 | 配额不足 |
| 1007 | 操作频繁 |

---

## 认证系统

### 用户注册

**请求**
```http
POST /api/v1/user-management/auth/register
Content-Type: application/json
```

**请求体**
```json
{
  "username": "string",     // 用户名 (必填, 3-20字符)
  "email": "string",        // 邮箱 (必填, 格式验证)
  "password": "string",     // 密码 (必填, 6-20字符)
  "nickname": "string"      // 昵称 (可选)
}
```

**响应**
```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "user_id": "string",
    "username": "string",
    "email": "string",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 用户登录

**请求**
```http
POST /api/v1/user-management/auth/login
Content-Type: application/json
```

**请求体**
```json
{
  "account": "string",      // 账号 (用户名或邮箱)
  "password": "string"      // 密码
}
```

**响应**
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "string",              // JWT Token
    "refresh_token": "string",      // 刷新Token
    "expires_in": 86400,            // 过期时间(秒)
    "user": {
      "id": "string",
      "username": "string",
      "nickname": "string",
      "avatar": "string",
      "roles": ["string"]
    }
  }
}
```

### 刷新Token

**请求**
```http
POST /api/v1/shared/auth/refresh
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "token": "string",
    "expires_in": 86400
  }
}
```

### 用户登出

**请求**
```http
POST /api/v1/shared/auth/logout
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "message": "登出成功"
}
```

### 获取用户权限

**请求**
```http
GET /api/v1/shared/auth/permissions
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "permissions": ["read", "write", "delete"]
  }
}
```

### 获取用户角色

**请求**
```http
GET /api/v1/shared/auth/roles
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "roles": ["user", "author"]
  }
}
```

---

## 用户管理

### 获取当前用户信息

**请求**
```http
GET /api/v1/user-management/profile
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "nickname": "string",
    "avatar": "string",
    "bio": "string",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 更新用户资料

**请求**
```http
PUT /api/v1/user-management/profile
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "nickname": "string",
  "avatar": "string",
  "bio": "string",
  "gender": "male",          // male/female/other
  "birthday": "2000-01-01",
  "location": "string"
}
```

**响应**
```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": "string",
    "nickname": "string",
    "avatar": "string"
  }
}
```

### 修改密码

**请求**
```http
PUT /api/v1/user-management/password
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "old_password": "string",
  "new_password": "string"
}
```

**响应**
```json
{
  "code": 0,
  "message": "密码修改成功"
}
```

### 获取用户统计

**请求**
```http
GET /api/v1/user-management/stats/my
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "total_books": 10,
    "total_words": 1000000,
    "total_readers": 5000,
    "total_revenue": 50000.00
  }
}
```

### 获取公开用户信息

**请求**
```http
GET /api/v1/user-management/users/:id
```

**响应**
```json
{
  "code": 0,
  "data": {
    "id": "string",
    "username": "string",
    "nickname": "string",
    "avatar": "string",
    "bio": "string"
  }
}
```

### 获取用户详细资料（公开）

**请求**
```http
GET /api/v1/user-management/users/:id/profile
```

**响应**
```json
{
  "code": 0,
  "data": {
    "id": "string",
    "nickname": "string",
    "avatar": "string",
    "bio": "string",
    "gender": "string",
    "location": "string",
    "joined_date": "2024-01-01T00:00:00Z"
  }
}
```

### 获取用户作品列表（公开）

**请求**
```http
GET /api/v1/user-management/users/:id/books?page=1&limit=20
```

**响应**
```json
{
  "code": 0,
  "data": {
    "total": 10,
    "items": [
      {
        "id": "string",
        "title": "string",
        "cover": "string",
        "description": "string",
        "status": "published"
      }
    ]
  }
}
```

---

## 写作功能

### 项目管理

#### 获取项目列表

**请求**
```http
GET /api/v1/projects?page=1&limit=20&status=all
Authorization: Bearer <token>
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| limit | int | 否 | 每页数量，默认20 |
| status | string | 否 | 状态筛选：all/draft/published/archived |

**响应**
```json
{
  "code": 0,
  "data": {
    "total": 50,
    "items": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "cover": "string",
        "status": "draft",
        "word_count": 50000,
        "chapter_count": 10,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### 创建项目

**请求**
```http
POST /api/v1/projects
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "title": "string",           // 项目名称 (必填)
  "description": "string",     // 项目描述
  "cover": "string",           // 封面图片URL
  "genre": "string",           // 题材分类
  "tags": ["string"]           // 标签列表
}
```

**响应**
```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": "string",
    "title": "string",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 获取项目详情

**请求**
```http
GET /api/v1/projects/:id
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "cover": "string",
    "genre": "string",
    "tags": ["string"],
    "status": "draft",
    "word_count": 50000,
    "chapter_count": 10,
    "statistics": {
      "views": 1000,
      "likes": 50,
      "collections": 20
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 更新项目

**请求**
```http
PUT /api/v1/projects/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "title": "string",
  "description": "string",
  "cover": "string",
  "genre": "string",
  "tags": ["string"],
  "status": "published"
}
```

**响应**
```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": "string",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 删除项目

**请求**
```http
DELETE /api/v1/projects/:id
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "message": "删除成功"
}
```

### 文档管理

#### 获取文档列表

**请求**
```http
GET /api/v1/projects/:id/documents
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": [
    {
      "id": "string",
      "title": "string",
      "type": "chapter",        // chapter/scene/note
      "word_count": 3000,
      "order": 1,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 创建文档

**请求**
```http
POST /api/v1/projects/:id/documents
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "title": "string",
  "type": "chapter",
  "parent_id": "string",        // 父文档ID (可选)
  "order": 1
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "id": "string",
    "title": "string",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 获取文档详情

**请求**
```http
GET /api/v1/documents/:id
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "id": "string",
    "title": "string",
    "type": "chapter",
    "word_count": 3000,
    "parent_id": "string",
    "order": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 获取文档内容

**请求**
```http
GET /api/v1/documents/:id/content
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "id": "string",
    "content": "文档正文内容...",
    "word_count": 3000,
    "version": 5,
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 更新文档内容

**请求**
```http
PUT /api/v1/documents/:id/content
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "content": "string",          // 文档内容
  "word_count": 3000
}
```

**响应**
```json
{
  "code": 0,
  "message": "保存成功",
  "data": {
    "version": 6,
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 自动保存

**请求**
```http
POST /api/v1/documents/:id/autosave
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "content": "string"
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "saved": true,
    "version": 6
  }
}
```

#### 删除文档

**请求**
```http
DELETE /api/v1/documents/:id
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "message": "删除成功"
}
```

#### 移动文档

**请求**
```http
PUT /api/v1/documents/:id/move
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "parent_id": "string",        // 新的父文档ID
  "order": 1                    // 新的顺序
}
```

**响应**
```json
{
  "code": 0,
  "message": "移动成功"
}
```

### 版本控制

#### 获取版本历史

**请求**
```http
GET /api/v1/documents/:id/versions?page=1&limit=20
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "total": 10,
    "items": [
      {
        "version_id": "string",
        "version": 5,
        "created_at": "2024-01-01T00:00:00Z",
        "word_count": 3000
      }
    ]
  }
}
```

#### 获取指定版本

**请求**
```http
GET /api/v1/documents/:id/versions/:versionId
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "version_id": "string",
    "version": 5,
    "content": "文档内容...",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 恢复版本

**请求**
```http
POST /api/v1/documents/:id/versions/:versionId/restore
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "message": "版本恢复成功",
  "data": {
    "version": 6,
    "content": "string"
  }
}
```

### 角色管理

#### 获取角色列表

**请求**
```http
GET /api/v1/projects/:id/characters
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": [
    {
      "id": "string",
      "name": "角色名",
      "avatar": "string",
      "role": "protagonist",     // protagonist/antagonist/supporting
      "description": "string",
      "personality": ["勇敢", "聪明"],
      "background": "string"
    }
  ]
}
```

#### 创建角色

**请求**
```http
POST /api/v1/projects/:id/characters
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "name": "string",
  "avatar": "string",
  "role": "protagonist",
  "description": "string",
  "personality": ["string"],
  "background": "string"
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "id": "string",
    "name": "string"
  }
}
```

#### 获取角色关系

**请求**
```http
GET /api/v1/projects/:id/characters/relations
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "nodes": [
      {
        "id": "string",
        "name": "角色名",
        "avatar": "string"
      }
    ],
    "edges": [
      {
        "source": "string",
        "target": "string",
        "relationship": "朋友",
        "strength": 8
      }
    ]
  }
}
```

### 地点管理

#### 获取地点列表

**请求**
```http
GET /api/v1/projects/:id/locations
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": [
    {
      "id": "string",
      "name": "地点名称",
      "type": "city",          // city/building/room/natural
      "description": "string",
      "parent_id": "string"
    }
  ]
}
```

#### 创建地点

**请求**
```http
POST /api/v1/projects/:id/locations
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "name": "string",
  "type": "city",
  "description": "string",
  "parent_id": "string"
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "id": "string",
    "name": "string"
  }
}
```

### 时间线管理

#### 获取时间线列表

**请求**
```http
GET /api/v1/projects/:id/timelines
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": [
    {
      "id": "string",
      "name": "主线剧情",
      "color": "#FF5733",
      "event_count": 10
    }
  ]
}
```

#### 创建时间线

**请求**
```http
POST /api/v1/projects/:id/timelines
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "name": "string",
  "color": "#FF5733",
  "description": "string"
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "id": "string",
    "name": "string"
  }
}
```

#### 创建事件

**请求**
```http
POST /api/v1/timelines/:timelineId/events
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "title": "string",
  "description": "string",
  "date": "2024-01-01T00:00:00Z",
  "chapter_id": "string"      // 关联章节ID
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "id": "string",
    "title": "string"
  }
}
```

### 统计分析

#### 获取项目统计

**请求**
```http
GET /api/v1/projects/:id/stats
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "word_count": 100000,
    "chapter_count": 20,
    "character_count": 10,
    "location_count": 5,
    "daily_average": 2000
  }
}
```

#### 获取阅读热力图

**请求**
```http
GET /api/v1/projects/:id/heatmap
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "heatmap": [
      {
        "date": "2024-01-01",
        "value": 50
      }
    ]
  }
}
```

#### 获取收入统计

**请求**
```http
GET /api/v1/projects/:id/revenue?start_date=2024-01-01&end_date=2024-12-31
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "total": 50000.00,
    "daily": [
      {
        "date": "2024-01-01",
        "amount": 100.00
      }
    ]
  }
}
```

---

## AI辅助

### 智能续写

**请求**
```http
POST /api/v1/ai/writing/continue
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "content": "前面已经写的内容...",      // 上下文内容
  "length": 500,                       // 续写长度
  "style": "default"                   // 风格：default/literary/casual
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "generated_text": "AI续写的内容...",
    "word_count": 500,
    "quota_used": 500
  }
}
```

### 智能续写（流式）

**请求**
```http
POST /api/v1/ai/writing/continue/stream
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "content": "string",
  "length": 500,
  "style": "default"
}
```

**响应**
```
Content-Type: text/event-stream

data: {"token": "第"}
data: {"token": "一"}
data: {"token": "段"}
...
data: {"done": true}
```

### 文本改写

**请求**
```http
POST /api/v1/ai/writing/rewrite
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "content": "需要改写的内容...",
  "style": "polite"                    // 改写风格：polite/formal/casual/dramatic
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "rewritten_text": "改写后的内容...",
    "word_count": 300
  }
}
```

### AI聊天对话

**请求**
```http
POST /api/v1/ai/chat/completions
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "你好，请帮我构思一个情节"
    }
  ],
  "model": "default",
  "temperature": 0.7
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "id": "string",
    "message": {
      "role": "assistant",
      "content": "AI回复内容..."
    },
    "usage": {
      "prompt_tokens": 50,
      "completion_tokens": 100,
      "total_tokens": 150
    }
  }
}
```

### 生成大纲

**请求**
```http
POST /api/v1/ai/creative/outline
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "genre": "玄幻",                    // 题材
  "theme": "string",                  // 主题
  "chapters": 20,                     // 章节数
  "style": "default"                  // 风格
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "title": "小说标题",
    "outline": [
      {
        "chapter": 1,
        "title": "章节名",
        "summary": "章节摘要"
      }
    ]
  }
}
```

### 生成角色

**请求**
```http
POST /api/v1/ai/creative/characters
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "role": "protagonist",              // 角色类型
  "story_background": "string",       // 故事背景
  "personality_traits": ["勇敢"]      // 性格特征
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "name": "角色名",
    "description": "角色描述",
    "personality": ["勇敢", "善良"],
    "background": "角色背景故事"
  }
}
```

### 生成情节

**请求**
```http
POST /api/v1/ai/creative/plot
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "context": "前面的剧情...",
  "type": "conflict",                 // 情节类型：conflict/revelation/romance
  "characters": ["角色A", "角色B"]
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "plot": "生成的情节描述...",
    "suggestions": ["建议1", "建议2"]
  }
}
```

### 执行创作工作流

**请求**
```http
POST /api/v1/ai/creative/workflow
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "type": "full_novel",               // 工作流类型
  "parameters": {
    "genre": "玄幻",
    "chapters": 50
  }
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "workflow_id": "string",
    "status": "processing",
    "steps": [
      {
        "name": "生成大纲",
        "status": "completed"
      },
      {
        "name": "生成角色",
        "status": "processing"
      }
    ]
  }
}
```

### 获取配额信息

**请求**
```http
GET /api/v1/ai/quota
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "total": 100000,
    "used": 5000,
    "remaining": 95000,
    "reset_date": "2024-02-01T00:00:00Z"
  }
}
```

### 获取使用记录

**请求**
```http
GET /api/v1/ai/quota/usage?page=1&limit=20
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "total": 100,
    "items": [
      {
        "id": "string",
        "action": "writing_continue",
        "tokens": 500,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

## 书城系统

### 获取首页数据

**请求**
```http
GET /api/v1/bookstore/homepage
```

**响应**
```json
{
  "code": 0,
  "data": {
    "banners": [
      {
        "id": "string",
        "title": "string",
        "image": "string",
        "link": "string"
      }
    ],
    "featured": [
      {
        "id": "string",
        "title": "string",
        "cover": "string",
        "author": "string"
      }
    ],
    "recommended": [
      {
        "id": "string",
        "title": "string",
        "cover": "string"
      }
    ]
  }
}
```

### 获取书籍列表

**请求**
```http
GET /api/v1/bookstore/books?page=1&limit=20&category=玄幻&status=completed&sort=hot
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码 |
| limit | int | 否 | 每页数量 |
| category | string | 否 | 分类筛选 |
| status | string | 否 | 状态：ongoing/completed |
| sort | string | 否 | 排序：hot/latest/rating |

**响应**
```json
{
  "code": 0,
  "data": {
    "total": 100,
    "items": [
      {
        "id": "string",
        "title": "string",
        "cover": "string",
        "author": {
          "id": "string",
          "username": "string"
        },
        "description": "string",
        "category": "string",
        "status": "ongoing",
        "word_count": 100000,
        "chapter_count": 50,
        "rating": 4.5,
        "views": 10000,
        "tags": ["标签1", "标签2"]
      }
    ]
  }
}
```

### 获取书籍详情

**请求**
```http
GET /api/v1/bookstore/books/:id
```

**响应**
```json
{
  "code": 0,
  "data": {
    "id": "string",
    "title": "string",
    "cover": "string",
    "author": {
      "id": "string",
      "username": "string",
      "avatar": "string"
    },
    "description": "string",
    "category": "string",
    "status": "ongoing",
    "word_count": 100000,
    "chapter_count": 50,
    "rating": 4.5,
    "rating_count": 100,
    "views": 10000,
    "collections": 500,
    "tags": ["标签1", "标签2"],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "is_liked": false,
    "is_collected": false
  }
}
```

### 增加书籍浏览量

**请求**
```http
POST /api/v1/bookstore/books/:id/view
```

**响应**
```json
{
  "code": 0,
  "message": "记录成功"
}
```

### 搜索书籍

**请求**
```http
GET /api/v1/bookstore/books/search?q=关键字&page=1&limit=20
```

**响应**
```json
{
  "code": 0,
  "data": {
    "total": 50,
    "items": [
      {
        "id": "string",
        "title": "string",
        "cover": "string",
        "author": "string",
        "highlight": "高亮显示..."
      }
    ]
  }
}
```

### 获取推荐书籍

**请求**
```http
GET /api/v1/bookstore/books/recommended?limit=10
```

**响应**
```json
{
  "code": 0,
  "data": [
    {
      "id": "string",
      "title": "string",
      "cover": "string",
      "reason": "推荐理由"
    }
  ]
}
```

### 获取精选书籍

**请求**
```http
GET /api/v1/bookstore/books/featured
```

**响应**
```json
{
  "code": 0,
  "data": [
    {
      "id": "string",
      "title": "string",
      "cover": "string",
      "badge": "编辑推荐"
    }
  ]
}
```

### 分类管理

#### 获取分类树

**请求**
```http
GET /api/v1/bookstore/categories/tree
```

**响应**
```json
{
  "code": 0,
  "data": [
    {
      "id": "string",
      "name": "玄幻",
      "icon": "string",
      "children": [
        {
          "id": "string",
          "name": "东方玄幻",
          "parent_id": "string"
        }
      ]
    }
  ]
}
```

#### 获取分类详情

**请求**
```http
GET /api/v1/bookstore/categories/:id
```

**响应**
```json
{
  "code": 0,
  "data": {
    "id": "string",
    "name": "玄幻",
    "description": "string",
    "book_count": 1000,
    "parent_id": "string"
  }
}
```

#### 获取分类下的书籍

**请求**
```http
GET /api/v1/bookstore/categories/:id/books?page=1&limit=20
```

**响应**
```json
{
  "code": 0,
  "data": {
    "total": 100,
    "items": [
      {
        "id": "string",
        "title": "string",
        "cover": "string"
      }
    ]
  }
}
```

### 排行榜

#### 获取实时榜

**请求**
```http
GET /api/v1/bookstore/rankings/realtime?limit=50
```

**响应**
```json
{
  "code": 0,
  "data": [
    {
      "rank": 1,
      "book": {
        "id": "string",
        "title": "string",
        "cover": "string",
        "author": "string"
      },
      "score": 9999
    }
  ]
}
```

#### 获取周榜

**请求**
```http
GET /api/v1/bookstore/rankings/weekly?limit=50
```

**响应**同实时榜

#### 获取月榜

**请求**
```http
GET /api/v1/bookstore/rankings/monthly?limit=50
```

**响应**同实时榜

#### 获取新人榜

**请求**
```http
GET /api/v1/bookstore/rankings/newbie?limit=50
```

**响应**同实时榜

### Banner管理

#### 获取激活的Banner

**请求**
```http
GET /api/v1/bookstore/banners
```

**响应**
```json
{
  "code": 0,
  "data": [
    {
      "id": "string",
      "title": "string",
      "image": "string",
      "link": "string",
      "position": "home"
    }
  ]
}
```

#### 增加Banner点击次数

**请求**
```http
POST /api/v1/bookstore/banners/:id/click
```

**响应**
```json
{
  "code": 0,
  "message": "记录成功"
}
```

### 书籍评分

#### 提交评分

**请求**
```http
POST /api/v1/bookstore/ratings
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "book_id": "string",
  "rating": 5,                    // 1-5分
  "comment": "string"             // 评价内容 (可选)
}
```

**响应**
```json
{
  "code": 0,
  "message": "评分成功",
  "data": {
    "id": "string",
    "rating": 5
  }
}
```

#### 获取书籍评分

**请求**
```http
GET /api/v1/bookstore/ratings/book/:bookId?page=1&limit=20
```

**响应**
```json
{
  "code": 0,
  "data": {
    "average": 4.5,
    "total": 100,
    "distribution": {
      "5": 50,
      "4": 30,
      "3": 15,
      "2": 3,
      "1": 2
    },
    "items": [
      {
        "id": "string",
        "user": {
          "username": "string",
          "avatar": "string"
        },
        "rating": 5,
        "comment": "string",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

## 阅读功能

### 书架管理

#### 获取书架书籍

**请求**
```http
GET /api/v1/reader/books?page=1&limit=20
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "total": 10,
    "items": [
      {
        "id": "string",
        "book": {
          "id": "string",
          "title": "string",
          "cover": "string",
          "author": "string"
        },
        "added_at": "2024-01-01T00:00:00Z",
        "last_read_chapter": "第一章",
        "progress": 50
      }
    ]
  }
}
```

#### 添加书籍到书架

**请求**
```http
POST /api/v1/reader/books
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "book_id": "string"
}
```

**响应**
```json
{
  "code": 0,
  "message": "添加成功"
}
```

#### 从书架移除书籍

**请求**
```http
DELETE /api/v1/reader/books/:bookId
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "message": "移除成功"
}
```

### 阅读进度

#### 获取阅读进度

**请求**
```http
GET /api/v1/reader/progress?book_id=xxx
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "book_id": "string",
    "chapter_id": "string",
    "chapter_index": 10,
    "position": 500,                // 字符位置
    "percentage": 50,               // 百分比
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 更新阅读进度

**请求**
```http
PUT /api/v1/reader/progress
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "book_id": "string",
  "chapter_id": "string",
  "chapter_index": 10,
  "position": 500,
  "percentage": 50
}
```

**响应**
```json
{
  "code": 0,
  "message": "更新成功"
}
```

### 章节内容

#### 获取章节内容

**请求**
```http
GET /api/v1/reader/chapters/:chapterId
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "id": "string",
    "title": "章节标题",
    "index": 10,
    "word_count": 3000,
    "book_id": "string",
    "prev_chapter_id": "string",
    "next_chapter_id": "string"
  }
}
```

#### 获取章节正文

**请求**
```http
GET /api/v1/reader/chapters/:chapterId/content
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "content": "章节正文内容...",
    "word_count": 3000
  }
}
```

### 阅读标注

#### 获取标注列表

**请求**
```http
GET /api/v1/reader/annotations?book_id=xxx&chapter_id=xxx
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": [
    {
      "id": "string",
      "chapter_id": "string",
      "position": 100,
      "length": 20,
      "note": "标注内容",
      "color": "yellow",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 创建标注

**请求**
```http
POST /api/v1/reader/annotations
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "chapter_id": "string",
  "position": 100,
  "length": 20,
  "note": "标注内容",
  "color": "yellow"
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "id": "string"
  }
}
```

#### 更新标注

**请求**
```http
PUT /api/v1/reader/annotations/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "note": "更新后的标注内容",
  "color": "blue"
}
```

**响应**
```json
{
  "code": 0,
  "message": "更新成功"
}
```

#### 删除标注

**请求**
```http
DELETE /api/v1/reader/annotations/:id
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "message": "删除成功"
}
```

### 阅读历史

#### 获取阅读历史

**请求**
```http
GET /api/v1/reader/reading-history?page=1&limit=20
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "total": 50,
    "items": [
      {
        "id": "string",
        "book": {
          "id": "string",
          "title": "string",
          "cover": "string"
        },
        "chapter": "章节名",
        "read_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### 删除阅读记录

**请求**
```http
DELETE /api/v1/reader/reading-history/:id
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "message": "删除成功"
}
```

---

## 社交功能

### 评论系统

#### 获取评论列表

**请求**
```http
GET /api/v1/social/comments?book_id=xxx&chapter_id=xxx&page=1&limit=20
```

**响应**
```json
{
  "code": 0,
  "data": {
    "total": 100,
    "items": [
      {
        "id": "string",
        "user": {
          "id": "string",
          "username": "string",
          "avatar": "string"
        },
        "content": "评论内容",
        "reply_to": {
          "id": "string",
          "username": "string"
        },
        "likes": 10,
        "is_liked": false,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### 发表评论

**请求**
```http
POST /api/v1/social/comments
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "book_id": "string",
  "chapter_id": "string",              // 可选，章节评论
  "content": "评论内容",
  "reply_to_id": "string"              // 可选，回复的评论ID
}
```

**响应**
```json
{
  "code": 0,
  "message": "评论成功",
  "data": {
    "id": "string",
    "content": "评论内容"
  }
}
```

#### 更新评论

**请求**
```http
PUT /api/v1/social/comments/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "content": "更新后的评论内容"
}
```

**响应**
```json
{
  "code": 0,
  "message": "更新成功"
}
```

#### 删除评论

**请求**
```http
DELETE /api/v1/social/comments/:id
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "message": "删除成功"
}
```

#### 获取书籍评论

**请求**
```http
GET /api/v1/social/comments/book/:bookId?page=1&limit=20
```

**响应**同获取评论列表

### 点赞系统

#### 点赞/取消点赞

**请求**
```http
POST /api/v1/social/books/:bookId/like
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "liked": true,
    "likes_count": 100
  }
}
```

#### 检查是否已点赞

**请求**
```http
GET /api/v1/social/books/:bookId/liked
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "liked": true
  }
}
```

### 收藏系统

#### 获取收藏列表

**请求**
```http
GET /api/v1/social/collections?page=1&limit=20
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "total": 10,
    "items": [
      {
        "id": "string",
        "book": {
          "id": "string",
          "title": "string",
          "cover": "string",
          "author": "string"
        },
        "note": "收藏备注",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### 添加收藏

**请求**
```http
POST /api/v1/social/collections
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "book_id": "string",
  "note": "收藏备注"
}
```

**响应**
```json
{
  "code": 0,
  "message": "收藏成功",
  "data": {
    "id": "string"
  }
}
```

#### 删除收藏

**请求**
```http
DELETE /api/v1/social/collections/:id
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "message": "取消收藏成功"
}
```

---

## 支付系统

### 钱包管理

#### 获取余额

**请求**
```http
GET /api/v1/finance/wallet/balance
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "balance": 1000.00,
    "frozen": 50.00,
    "available": 950.00
  }
}
```

#### 获取钱包详情

**请求**
```http
GET /api/v1/finance/wallet/detail
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "user_id": "string",
    "balance": 1000.00,
    "total_income": 5000.00,
    "total_expense": 4000.00,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 充值

**请求**
```http
POST /api/v1/finance/wallet/recharge
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "amount": 100.00,
  "method": "alipay",                // 支付方式：alipay/wechat/bank
  "order_id": "string"
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "transaction_id": "string",
    "payment_url": "string",
    "qr_code": "string"
  }
}
```

#### 消费

**请求**
```http
POST /api/v1/finance/wallet/consume
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "amount": 10.00,
  "description": "购买章节"
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "transaction_id": "string",
    "balance": 990.00
  }
}
```

#### 转账

**请求**
```http
POST /api/v1/finance/wallet/transfer
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "to_user_id": "string",
  "amount": 50.00,
  "note": "转账备注"
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "transaction_id": "string",
    "balance": 950.00
  }
}
```

#### 申请提现

**请求**
```http
POST /api/v1/finance/wallet/withdraw
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "amount": 500.00,
  "method": "bank",
  "account": "string",
  "account_name": "string"
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "withdraw_id": "string",
    "status": "pending"
  }
}
```

#### 获取交易记录

**请求**
```http
GET /api/v1/finance/wallet/transactions?page=1&limit=20&type=all
Authorization: Bearer <token>
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 类型：all/income/expense |

**响应**
```json
{
  "code": 0,
  "data": {
    "total": 100,
    "items": [
      {
        "id": "string",
        "type": "income",             // income/expense
        "amount": 100.00,
        "balance": 1000.00,
        "description": "充值",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### 获取提现记录

**请求**
```http
GET /api/v1/finance/wallet/withdraws?page=1&limit=20
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "total": 10,
    "items": [
      {
        "id": "string",
        "amount": 500.00,
        "status": "approved",         // pending/approved/rejected
        "method": "bank",
        "created_at": "2024-01-01T00:00:00Z",
        "processed_at": "2024-01-02T00:00:00Z"
      }
    ]
  }
}
```

---

## 推荐系统

### 个性化推荐

**请求**
```http
GET /api/v1/recommendation/personalized?limit=20
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": [
    {
      "book": {
        "id": "string",
        "title": "string",
        "cover": "string"
      },
      "score": 0.95,
      "reason": "基于您的阅读历史推荐"
    }
  ]
}
```

### 相似推荐

**请求**
```http
GET /api/v1/recommendation/similar?book_id=xxx&limit=10
```

**响应**
```json
{
  "code": 0,
  "data": [
    {
      "book": {
        "id": "string",
        "title": "string",
        "cover": "string"
      },
      "similarity": 0.85
    }
  ]
}
```

### 记录用户行为

**请求**
```http
GET /api/v1/recommendation/behavior?type=view&book_id=xxx
Authorization: Bearer <token>
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 行为类型：view/click/like/collect |
| book_id | string | 是 | 书籍ID |

**响应**
```json
{
  "code": 0,
  "message": "记录成功"
}
```

### 首页推荐

**请求**
```http
GET /api/v1/recommendation/homepage
```

**响应**
```json
{
  "code": 0,
  "data": {
    "banners": [...],
    "recommended": [...],
    "hot": [...]
  }
}
```

### 热门推荐

**请求**
```http
GET /api/v1/recommendation/hot?limit=20
```

**响应**
```json
{
  "code": 0,
  "data": [
    {
      "book": {
        "id": "string",
        "title": "string",
        "cover": "string"
      },
      "hot_score": 9999
    }
  ]
}
```

### 分类推荐

**请求**
```http
GET /api/v1/recommendation/category?category=玄幻&limit=20
```

**响应**
```json
{
  "code": 0,
  "data": [
    {
      "book": {
        "id": "string",
        "title": "string",
        "cover": "string"
      }
    }
  ]
}
```

---

## 存储服务

### 上传文件

**请求**
```http
POST /api/v1/shared/storage/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求体**
```
file: <binary>
type: avatar/cover/document
```

**响应**
```json
{
  "code": 0,
  "data": {
    "file_id": "string",
    "url": "https://cdn.example.com/file.jpg",
    "size": 102400,
    "mime_type": "image/jpeg"
  }
}
```

### 下载文件

**请求**
```http
GET /api/v1/shared/storage/download/:file_id
Authorization: Bearer <token>
```

**响应**
文件流

### 获取文件信息

**请求**
```http
GET /api/v1/shared/storage/files/:file_id
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "id": "string",
    "filename": "string",
    "size": 102400,
    "mime_type": "image/jpeg",
    "url": "string",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 删除文件

**请求**
```http
DELETE /api/v1/shared/storage/files/:file_id
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "message": "删除成功"
}
```

### 获取文件列表

**请求**
```http
GET /api/v1/shared/storage/files?type=avatar&page=1&limit=20
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "total": 50,
    "items": [
      {
        "id": "string",
        "filename": "string",
        "size": 102400,
        "url": "string",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### 获取下载链接

**请求**
```http
GET /api/v1/shared/storage/files/:file_id/url
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "url": "https://cdn.example.com/file.jpg?expires=xxx",
    "expires_at": "2024-01-01T01:00:00Z"
  }
}
```

---

## 系统管理

### 系统健康检查

#### 系统健康状态

**请求**
```http
GET /api/v1/system/health
```

**响应**
```json
{
  "code": 0,
  "data": {
    "status": "healthy",
    "services": {
      "database": "healthy",
      "redis": "healthy",
      "ai_service": "healthy"
    }
  }
}
```

#### 服务健康状态

**请求**
```http
GET /api/v1/system/health/:service
```

**响应**
```json
{
  "code": 0,
  "data": {
    "service": "database",
    "status": "healthy",
    "latency": 5
  }
}
```

#### 所有服务指标

**请求**
```http
GET /api/v1/system/metrics
```

**响应**
```json
{
  "code": 0,
  "data": {
    "database": {
      "connections": 10,
      "latency": 5
    },
    "redis": {
      "memory": "100MB",
      "keys": 1000
    }
  }
}
```

### 配置管理

#### 获取系统配置

**请求**
```http
GET /api/v1/admin/config
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "site_name": "青羽写作",
    "site_url": "https://example.com",
    "ai_quota_default": 10000,
    "registration_enabled": true
  }
}
```

#### 更新系统配置

**请求**
```http
PUT /api/v1/admin/config
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "site_name": "青羽写作",
  "registration_enabled": true
}
```

**响应**
```json
{
  "code": 0,
  "message": "更新成功"
}
```

### 用户配额管理

#### 获取用户配额

**请求**
```http
GET /api/v1/admin/quota/:userId
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "user_id": "string",
    "ai_quota": 50000,
    "storage_quota": 1073741824
  }
}
```

#### 更新用户配额

**请求**
```http
PUT /api/v1/admin/quota/:userId
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "ai_quota": 100000,
  "storage_quota": 2147483648
}
```

**响应**
```json
{
  "code": 0,
  "message": "更新成功"
}
```

### 审核管理

#### 获取待审核内容

**请求**
```http
GET /api/v1/admin/audit/pending?page=1&limit=20
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "total": 50,
    "items": [
      {
        "id": "string",
        "type": "document",
        "content": "摘要...",
        "risk_level": "medium",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### 审核内容

**请求**
```http
POST /api/v1/admin/audit/:id/review
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "approved": true,
  "reason": "审核通过"
}
```

**响应**
```json
{
  "code": 0,
  "message": "审核完成"
}
```

### 公告管理

#### 获取公告列表

**请求**
```http
GET /api/v1/admin/announcements?page=1&limit=20
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": {
    "total": 10,
    "items": [
      {
        "id": "string",
        "title": "公告标题",
        "content": "公告内容",
        "status": "active",
        "priority": "high",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### 创建公告

**请求**
```http
POST /api/v1/admin/announcements
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**
```json
{
  "title": "公告标题",
  "content": "公告内容",
  "priority": "high",
  "start_time": "2024-01-01T00:00:00Z",
  "end_time": "2024-12-31T23:59:59Z"
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "id": "string",
    "title": "公告标题"
  }
}
```

#### 更新公告

**请求**
```http
PUT /api/v1/admin/announcements/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**响应**
```json
{
  "code": 0,
  "message": "更新成功"
}
```

#### 删除公告

**请求**
```http
DELETE /api/v1/admin/announcements/:id
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "message": "删除成功"
}
```

---

## 消息通知

### 获取有效公告

**请求**
```http
GET /api/v1/announcements/effective
```

**响应**
```json
{
  "code": 0,
  "data": [
    {
      "id": "string",
      "title": "公告标题",
      "content": "公告内容",
      "priority": "high",
      "start_time": "2024-01-01T00:00:00Z",
      "end_time": "2024-12-31T23:59:59Z"
    }
  ]
}
```

### 获取公告详情

**请求**
```http
GET /api/v1/announcements/:id
```

**响应**
```json
{
  "code": 0,
  "data": {
    "id": "string",
    "title": "公告标题",
    "content": "公告内容",
    "views": 100,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 增加公告查看次数

**请求**
```http
POST /api/v1/announcements/:id/view
```

**响应**
```json
{
  "code": 0,
  "message": "记录成功"
}
```

---

## 搜索服务

### 搜索文档

**请求**
```http
GET /api/v1/writer/search/documents?q=关键字&project_id=xxx
Authorization: Bearer <token>
```

**响应**
```json
{
  "code": 0,
  "data": [
    {
      "id": "string",
      "title": "文档标题",
      "highlight": "高亮内容...",
      "project_id": "string"
    }
  ]
}
```

### 搜索建议

**请求**
```http
GET /api/v1/shared/search/suggest?q=关
```

**响应**
```json
{
  "code": 0,
  "data": [
    "关键字1",
    "关键字2",
    "关键字3"
  ]
}
```

---

## 其他接口

### 健康检查

**请求**
```http
GET /health
GET /ping
GET /ready
GET /metrics
```

**响应**
```json
{
  "status": "ok"
}
```

---

## 数据模型

### 用户模型 (User)

```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "nickname": "string",
  "avatar": "string",
  "bio": "string",
  "gender": "male",
  "birthday": "2000-01-01",
  "location": "string",
  "roles": ["user"],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 项目模型 (Project)

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "cover": "string",
  "genre": "string",
  "tags": ["string"],
  "status": "draft",
  "author_id": "string",
  "word_count": 0,
  "chapter_count": 0,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 文档模型 (Document)

```json
{
  "id": "string",
  "title": "string",
  "content": "string",
  "type": "chapter",
  "project_id": "string",
  "parent_id": "string",
  "order": 0,
  "word_count": 0,
  "version": 1,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 书籍模型 (Book)

```json
{
  "id": "string",
  "title": "string",
  "cover": "string",
  "description": "string",
  "category": "string",
  "tags": ["string"],
  "status": "ongoing",
  "author_id": "string",
  "word_count": 0,
  "chapter_count": 0,
  "rating": 0,
  "rating_count": 0,
  "views": 0,
  "likes": 0,
  "collections": 0,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 未认证 |
| 1003 | 无权限 |
| 1004 | 资源不存在 |
| 1005 | 服务器内部错误 |
| 1006 | 配额不足 |
| 1007 | 操作频繁 |
| 2001 | 用户已存在 |
| 2002 | 用户不存在 |
| 2003 | 密码错误 |
| 3001 | 项目不存在 |
| 3002 | 文档不存在 |
| 4001 | 书籍不存在 |
| 4002 | 章节不存在 |
| 5001 | 钱包余额不足 |
| 5002 | 交易失败 |
| 6001 | 文件上传失败 |
| 6002 | 文件大小超限 |
| 7001 | 审核未通过 |
| 8001 | AI服务异常 |

---

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 完成基础功能API
