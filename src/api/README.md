# API 接口文档

本目录包含青羽平台所有前端API接口封装。

## 📁 目录结构

```
api/
├── auth.js                 # 认证相关API（已弃用，使用user.js）
├── user.js                 # 用户管理API
├── bookstore.js           # 书城系统API
├── reading/               # 阅读端API模块
│   ├── reader.js          # 阅读器API（章节、进度、设置）
│   ├── rating.js          # 评分系统API
│   ├── books.js           # 书籍和章节API
│   └── index.js           # 统一导出
├── writing/               # 写作端API模块（待完善）
└── shared/                # 共享API模块
    ├── auth.js            # 统一认证API
    ├── admin.js           # 管理员API
    ├── wallet.js          # 钱包系统API
    ├── storage.js         # 存储工具
    └── index.js           # 统一导出
```

## 🚀 使用方式

### 1. 导入API模块

```javascript
// 导入用户API
import { userAPI } from '@/api/user'

// 导入书城API
import { bookstoreAPI } from '@/api/bookstore'

// 导入阅读器API
import { readerAPI } from '@/api/reading/reader'
import { ratingAPI } from '@/api/reading/rating'
import { booksAPI } from '@/api/reading/books'
```

### 2. 调用API方法

```javascript
// 用户登录
const loginData = {
  username: 'testuser',
  password: 'password123'
}
const response = await userAPI.login(loginData)

// 获取书籍列表
const books = await booksAPI.getBookList({
  page: 1,
  size: 20,
  category: '玄幻'
})

// 获取章节内容
const content = await readerAPI.getChapterContent('chapter123')
```

### 3. 错误处理

所有API方法都返回Promise，建议使用try-catch处理错误：

```javascript
try {
  const response = await userAPI.getProfile()
  console.log('用户信息:', response.data)
} catch (error) {
  console.error('请求失败:', error.message)
  // 处理错误（显示提示、跳转登录等）
}
```

## 📖 API模块说明

### 用户管理 API (`user.js`)

- **公开接口**：注册、登录
- **用户接口**：获取/更新个人信息、修改密码
- **管理员接口**：用户列表、用户管理、批量操作

参考文档：[用户管理API使用指南](../../Qingyu_backend/doc/api/用户管理API使用指南.md)

### 书城系统 API (`bookstore.js`)

- 首页数据、Banner管理
- 榜单系统（实时榜、周榜、月榜、新人榜）
- 推荐书籍、精选书籍
- 书籍搜索

### 阅读端 API (`reading/`)

#### 阅读器 API (`reader.js`)
- **章节阅读**：获取章节信息/内容、章节列表、章节导航
- **阅读进度**：保存/获取进度、阅读历史、阅读时长
- **注记功能**：创建/更新/删除注记、书签、高亮、笔记
- **阅读设置**：获取/保存/更新个性化设置

#### 评分系统 API (`rating.js`)
- 获取书籍评分列表
- 创建/更新/删除评分
- 获取评分统计

#### 书籍和章节 API (`books.js`)
- 书籍详情、书籍列表、分类筛选
- 搜索书籍（按标题、作者、标签）
- 章节详情、章节列表
- 分类管理

参考文档：
- [阅读端API使用文档](../../Qingyu_backend/doc/api/阅读端API使用文档.md)
- [阅读端API快速开始指南](../../Qingyu_backend/doc/api/阅读端API快速开始指南.md)

## 🔧 API测试工具

项目提供了可视化API测试工具，方便开发和调试：

```
访问路径：/api-test
或点击顶部导航栏的 "API测试" 菜单
```

测试工具支持：
- ✅ 所有API接口的可视化测试
- ✅ 自动Token管理
- ✅ 实时响应预览
- ✅ 请求参数填写

详细使用说明：[API测试工具使用指南](../../API测试工具使用指南.md)

## 💡 开发规范

### 1. API接口命名

- 使用驼峰命名法
- 动词在前，名词在后
- 明确表达接口功能

```javascript
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

- 简单参数直接传递
- 复杂参数使用对象

```javascript
// 简单参数
getBookDetail(bookId)

// 复杂参数
getBookList({
  page: 1,
  size: 20,
  category: '玄幻',
  sort: 'popular'
})
```

### 3. 响应处理

所有API接口返回的数据结构：

```javascript
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

统一在`utils/request.js`中处理常见错误：
- 401：未认证，跳转登录
- 403：权限不足
- 404：资源不存在
- 500：服务器错误

## 🔗 相关文档

- [请求封装说明](../utils/request.js)
- [后端API文档](../../Qingyu_backend/doc/api/)
- [项目开发规范](../../Qingyu/doc/项目开发规范.md)

## 📝 待完善模块

- [ ] 写作端API完善
- [ ] WebSocket实时通知API
- [ ] 支付系统API
- [ ] 社交功能API（关注、私信）
- [ ] 活动系统API

---

**维护者**: 青羽前端团队  
**最后更新**: 2025-10-16
