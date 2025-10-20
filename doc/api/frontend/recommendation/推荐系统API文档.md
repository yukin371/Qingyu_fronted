# 推荐系统 API 文档

> **版本**: v1.0
> **更新时间**: 2025-10-10
> **基础路径**: `/api/v1/recommendation`
> **认证方式**: Bearer Token (JWT)

---

## 📋 API 接口概览

### 接口列表

| 接口名称       | 方法 | 路径              | 认证    | 说明                           |
| -------------- | ---- | ----------------- | ------- | ------------------------------ |
| 获取个性化推荐 | GET  | `/personalized` | ✅ 需要 | 基于用户画像的个性化推荐       |
| 获取相似物品   | GET  | `/similar`      | ❌ 公开 | 基于物品的协同过滤推荐         |
| 记录用户行为   | POST | `/behavior`     | ✅ 需要 | 记录用户浏览、点击、收藏等行为 |

---

## 🎯 API 详细说明

### 1. 获取个性化推荐

**接口描述**: 基于用户历史行为和偏好，返回个性化推荐的书籍列表。

#### 请求参数

```http
GET /api/v1/recommendation/personalized?limit=10
Authorization: Bearer {token}
```

**Query 参数**

| 参数名 | 类型    | 必填 | 默认值 | 说明                |
| ------ | ------- | ---- | ------ | ------------------- |
| limit  | integer | 否   | 10     | 推荐数量，范围 1-50 |

#### 响应示例

**成功响应 (200)**

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "recommendations": [
      "673c1a2f9d5f8e4b3c8a1234",
      "673c1a2f9d5f8e4b3c8a5678"
    ],
    "count": 2,
    "source": "user_profile"
  }
}
```

**数据说明**

- `recommendations`: 书籍ID列表（推荐按相关度排序）
- `count`: 推荐数量
- `source`: 推荐来源
  - `user_profile`: 基于用户画像
  - `hot_books`: 热门书籍（冷启动）

**错误响应 (401)**

```json
{
  "code": 401,
  "message": "未授权，请先登录"
}
```

---

### 2. 获取相似物品

**接口描述**: 基于物品特征，返回与指定书籍相似的书籍列表（公开接口，无需认证）。

#### 请求参数

```http
GET /api/v1/recommendation/similar?itemId=673c1a2f9d5f8e4b3c8a1234&limit=10
```

**Query 参数**

| 参数名 | 类型    | 必填 | 默认值 | 说明                |
| ------ | ------- | ---- | ------ | ------------------- |
| itemId | string  | 是   | -      | 书籍ID              |
| limit  | integer | 否   | 10     | 推荐数量，范围 1-50 |

#### 响应示例

**成功响应 (200)**

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "similar_items": [
      "673c1a2f9d5f8e4b3c8a5678",
      "673c1a2f9d5f8e4b3c8a9abc"
    ],
    "count": 2,
    "base_item": "673c1a2f9d5f8e4b3c8a1234"
  }
}
```

**数据说明**

- `similar_items`: 相似书籍ID列表（按相似度排序）
- `count`: 推荐数量
- `base_item`: 基准书籍ID

**错误响应 (400)**

```json
{
  "code": 400,
  "message": "缺少必填参数: itemId"
}
```

**错误响应 (404)**

```json
{
  "code": 404,
  "message": "书籍不存在"
}
```

---

### 3. 记录用户行为

**接口描述**: 记录用户的浏览、点击、收藏、阅读等行为，用于更新用户画像和改进推荐效果。

#### 请求参数

```http
POST /api/v1/recommendation/behavior
Authorization: Bearer {token}
Content-Type: application/json
```

**Body 参数**

```json
{
  "itemId": "673c1a2f9d5f8e4b3c8a1234",
  "chapterId": "673c1a2f9d5f8e4b3c8a5678",
  "behaviorType": "read",
  "value": 300,
  "metadata": {
    "duration": 300,
    "progress": 0.15
  }
}
```

**参数说明**

| 参数名       | 类型    | 必填 | 说明                     |
| ------------ | ------- | ---- | ------------------------ |
| itemId       | string  | 是   | 书籍ID                   |
| chapterId    | string  | 否   | 章节ID（阅读行为时必填） |
| behaviorType | string  | 是   | 行为类型                 |
| value        | float64 | 否   | 行为强度（默认1.0）      |
| metadata     | object  | 否   | 扩展数据                 |

**行为类型 (behaviorType)**

| 类型    | 说明         | value 含义     |
| ------- | ------------ | -------------- |
| view    | 浏览书籍详情 | 浏览时长（秒） |
| click   | 点击书籍     | 固定为 1.0     |
| collect | 收藏书籍     | 固定为 1.0     |
| read    | 阅读章节     | 阅读时长（秒） |
| finish  | 读完章节     | 固定为 1.0     |
| like    | 点赞         | 固定为 1.0     |
| share   | 分享         | 固定为 1.0     |

#### 响应示例

**成功响应 (200)**

```json
{
  "code": 200,
  "message": "行为记录成功"
}
```

**错误响应 (400)**

```json
{
  "code": 400,
  "message": "缺少必填参数: itemId, behaviorType"
}
```

**错误响应 (401)**

```json
{
  "code": 401,
  "message": "未授权，请先登录"
}
```

---

## 🔧 推荐算法说明

### 1. 个性化推荐算法

**基于用户画像 (User Profile Based)**

**算法流程**:

1. 获取用户画像（标签偏好、作者偏好、分类偏好）
2. 计算候选书籍与用户偏好的匹配度
3. 按匹配度排序，返回 Top-N

**匹配度计算**:

```
Score(user, book) = 
    w1 * Σ(user_tag_weight[tag] * book_tag_weight[tag]) +
    w2 * Σ(user_author_weight[author] * book_author_weight[author]) +
    w3 * Σ(user_category_weight[cat] * book_category_weight[cat])
```

**权重分配**: w1=0.5, w2=0.3, w3=0.2

**冷启动策略**:

- 新用户：推荐热门书籍（按阅读量/收藏量排序）
- 无画像：基于实时行为快速建模

### 2. 相似物品推荐算法

**基于物品的协同过滤 (Item-Based Collaborative Filtering)**

**算法流程**:

1. 获取物品特征向量（标签、作者、分类）
2. 计算余弦相似度
3. 返回最相似的 N 个物品

**余弦相似度**:

```
similarity(A, B) = cos(θ) = (A · B) / (||A|| * ||B||)
```

**特征权重**:

- 标签：权重 0.6
- 作者：权重 0.3
- 分类：权重 0.1

---

## 📊 缓存策略

### 个性化推荐缓存

- **缓存键**: `qingyu:reco:personalized:{userID}`
- **缓存值**: 书籍ID列表（JSON格式）
- **过期时间**: 1小时
- **失效策略**: 用户产生新行为时清除缓存

### 相似物品缓存

- **缓存键**: `qingyu:reco:similar:{itemID}`
- **缓存值**: 相似书籍ID列表（JSON格式）
- **过期时间**: 24小时
- **失效策略**: 书籍特征更新时清除缓存

---

## 🚀 性能指标

| 指标       | 目标值  | 说明                 |
| ---------- | ------- | -------------------- |
| 响应时间   | < 200ms | 包含缓存命中的情况   |
| 缓存命中率 | > 80%   | 个性化推荐缓存命中率 |
| 推荐准确率 | > 20%   | 用户点击率           |
| 推荐多样性 | > 0.5   | 避免推荐过于集中     |

---

## 🔐 安全说明

### 认证

- 个性化推荐需要用户登录，从 JWT Token 中提取 userID
- 相似物品推荐为公开接口，无需认证

### 限流

| 接口       | 限流策略   | 说明               |
| ---------- | ---------- | ------------------ |
| 个性化推荐 | 10次/分钟  | 防止恶意刷推荐     |
| 相似物品   | 30次/分钟  | 公开接口，宽松限流 |
| 行为记录   | 100次/分钟 | 支持高频行为记录   |

### 数据隐私

- 用户行为数据仅用于推荐算法，不对外公开
- 用户画像数据加密存储
- 支持用户删除个人行为数据

---

## 📝 调用示例

### JavaScript (Fetch API)

```javascript
// 1. 获取个性化推荐
async function getPersonalizedRecommendations(limit = 10) {
  const response = await fetch(`/api/v1/recommendation/personalized?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
}

// 2. 获取相似物品
async function getSimilarItems(itemId, limit = 10) {
  const response = await fetch(`/api/v1/recommendation/similar?itemId=${itemId}&limit=${limit}`);
  return response.json();
}

// 3. 记录用户行为
async function recordBehavior(itemId, behaviorType, value) {
  const response = await fetch('/api/v1/recommendation/behavior', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      itemId,
      behaviorType,
      value
    })
  });
  return response.json();
}
```

### Go (net/http)

```go
// 1. 获取个性化推荐
func GetPersonalizedRecommendations(token string, limit int) ([]string, error) {
    url := fmt.Sprintf("http://api.qingyu.com/api/v1/recommendation/personalized?limit=%d", limit)
    req, _ := http.NewRequest("GET", url, nil)
    req.Header.Set("Authorization", "Bearer "+token)
  
    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
  
    // 解析响应...
}

// 2. 记录用户行为
func RecordBehavior(token, itemId, behaviorType string, value float64) error {
    body := map[string]interface{}{
        "itemId":       itemId,
        "behaviorType": behaviorType,
        "value":        value,
    }
    bodyBytes, _ := json.Marshal(body)
  
    req, _ := http.NewRequest("POST", "http://api.qingyu.com/api/v1/recommendation/behavior", bytes.NewReader(bodyBytes))
    req.Header.Set("Authorization", "Bearer "+token)
    req.Header.Set("Content-Type", "application/json")
  
    resp, err := http.DefaultClient.Do(req)
    // 处理响应...
}
```

---

## 📈 后续优化计划

### 短期

1. **算法增强**

   - 实现混合推荐算法（多算法融合）
   - 增加时间衰减因子（近期行为权重更高）
   - 优化冷启动策略（多维度热门书籍）
2. **性能优化**

   - 推荐结果预计算（每小时更新）
   - 缓存预热（热门用户）
   - 批量推荐接口

### 中期

3. **功能扩展**

   - 实时推荐（基于会话）
   - 推荐解释（为什么推荐这本书）
   - A/B测试框架
4. **算法升级**

   - 深度学习模型集成
   - 多臂老虎机（探索 vs 利用）
   - 上下文感知推荐（时间、地点、设备）

### 长期

5. **智能化**
   - 强化学习优化推荐策略
   - 知识图谱增强推荐
   - 跨领域推荐（书籍+视频+音频）

---

**文档版本**: v1.0.0
**最后更新**: 2025-10-10
