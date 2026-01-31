# 用户模块快速参考

> 最后更新：2025-01-14
> 模块版本：v1.0
> 错误码范围：6000-6999

## 接口列表

### 获取用户信息
**接口：** `GET /api/v1/user/profile`

**请求：** 无需参数

**响应：**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 用户ID |
| username | string | 用户名 |
| email | string | 邮箱 |
| nickname | string | 昵称 |
| avatar | string | 头像URL |
| bio | string | 个人简介 |
| role | string | 角色 |
| createdAt | string | 注册时间 |

**错误码：** 1003, 1005

---

### 更新用户信息
**接口：** `PUT /api/v1/user/profile`

**请求：**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | string | ✗ | 昵称（1-50字符） |
| bio | string | ✗ | 个人简介（1-500字符） |
| avatar | string | ✗ | 头像URL |

**响应：** 同"获取用户信息"

**错误码：** 1001, 1003

---

### 上传头像
**接口：** `POST /api/v1/user/avatar`

**请求：**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| avatar | File | ✓ | 头像图片文件 |

**响应：**
| 字段 | 类型 | 说明 |
|------|------|------|
| url | string | 头像URL |

**错误码：** 1001, 1010

---

### 获取用户书架
**接口：** `GET /api/v1/user/bookshelf`

**请求参数：**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ✗ | 页码（默认1） |
| pageSize | number | ✗ | 每页数量（默认20） |

**响应：**
| 字段 | 类型 | 说明 |
|------|------|------|
| books | array | 书籍列表 |
| total | number | 总数量 |
| page | number | 当前页码 |
| pageSize | number | 每页数量 |

**错误码：** 1003

---

### 获取阅读历史
**接口：** `GET /api/v1/user/reading-history`

**请求参数：**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | ✗ | 页码（默认1） |
| pageSize | number | ✗ | 每页数量（默认20） |

**响应：**
| 字段 | 类型 | 说明 |
|------|------|------|
| history | array | 阅读历史列表 |
| total | number | 总数量 |

**错误码：** 1003

---

## 前端调用示例

```typescript
import { userAPI } from '@/modules/user/api/user.api'

// 获取用户信息
const profile = await userAPI.getProfile()

// 更新用户信息
await userAPI.updateProfile({
  nickname: '新昵称',
  bio: '这是我的个人简介'
})

// 上传头像
const file = document.querySelector('#avatar-input').files[0]
const { url } = await userAPI.uploadAvatar(file)

// 获取书架
const { books, total } = await userAPI.getBookshelf()

// 获取阅读历史
const { history } = await userAPI.getReadingHistory()
```
