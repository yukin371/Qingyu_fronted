# 详细指南 - 首页数据

> **接口**: `GET /api/v1/bookstore/homepage`
> **版本**: v1.3
> **最后更新**: 2025-01-14

---

## 快速版

### 基本信息

- **接口**: `GET /api/v1/bookstore/homepage`
- **认证**: 不需要
- **限流**: 60次/分钟
- **缓存时间**: 5分钟

### 请求参数

无参数

### 响应数据

| 字段 | 类型 | 说明 |
|------|------|------|
| banners | Banner[] | 轮播图列表 |
| recommended_books | BookBrief[] | 推荐书籍列表（6-10本） |
| featured_books | BookBrief[] | 精选书籍列表（6-10本） |
| categories | Category[] | 分类列表（展平的树结构） |
| rankings | object | 各类榜单数据（可选） |

### 错误码

| 错误码 | 说明 | HTTP状态 |
|--------|------|---------|
| 1008 | 服务器内部错误 | 500 |
| 3001 | 书籍不存在 | 404 |

---

## 详细版

### 业务逻辑

首页数据聚合接口返回书城首页所需的所有数据，包括:

1. **Banner轮播图** - 当前激活的推广位，按sort字段排序
2. **推荐书籍** - 系统推荐的优质书籍，基于用户偏好或热门度
3. **精选书籍** - 编辑精选的优质书籍
4. **分类列表** - 完整的分类树结构（展平），包含一级和二级分类
5. **榜单数据** (可选) - 实时榜、周榜、月榜的TOP 10

### 数据获取流程

```
1. 获取激活的Banner列表（按时间过滤和sort排序）
2. 获取推荐书籍（按推荐算法或人工标记）
3. 获取精选书籍（按精选标记和评分）
4. 获取分类树（展平为列表）
5. 获取榜单数据（可选，实时计算）
6. 组装数据并返回
```

### 性能优化

- **缓存策略**: 整个响应缓存5分钟
- **CDN加速**: Banner图片和书籍封面使用CDN
- **数据预加载**: 榜单数据异步计算，使用缓存

### 完整请求示例

#### cURL

```bash
curl -X GET "http://localhost:8080/api/v1/bookstore/homepage" \
  -H "Accept: application/json"
```

#### JavaScript/Axios

```javascript
import axios from 'axios';

const response = await axios.get('/api/v1/bookstore/homepage');
console.log(response.data);
```

#### TypeScript

```typescript
import { getHomepage } from '@/modules/bookstore/api/homepage';

try {
  const data = await getHomepage();
  console.log('Banners:', data.banners);
  console.log('Recommended books:', data.recommended_books);
} catch (error) {
  console.error('Failed to fetch homepage:', error);
}
```

### 完整响应示例

```json
{
  "code": 0,
  "message": "获取首页数据成功",
  "data": {
    "banners": [
      {
        "id": "507f1f77bcf86cd799439015",
        "title": "热门推荐",
        "image": "https://cdn.example.com/banner1.jpg",
        "link": "/books/507f1f77bcf86cd799439011",
        "sort": 1
      },
      {
        "id": "507f1f77bcf86cd799439016",
        "title": "新书上线",
        "image": "https://cdn.example.com/banner2.jpg",
        "link": "/books/507f1f77bcf86cd799439012",
        "sort": 2
      }
    ],
    "recommended_books": [
      {
        "id": "507f1f77bcf86cd799439011",
        "title": "斗破苍穹",
        "author": "天蚕土豆",
        "cover": "https://cdn.example.com/cover1.jpg",
        "categoryName": "玄幻",
        "rating": 4.8,
        "wordCount": 5300000,
        "viewCount": 10000000,
        "status": "completed"
      }
    ],
    "featured_books": [
      {
        "id": "507f1f77bcf86cd799439017",
        "title": "完美世界",
        "author": "辰东",
        "cover": "https://cdn.example.com/cover2.jpg",
        "categoryName": "玄幻",
        "rating": 4.7,
        "wordCount": 6000000,
        "viewCount": 8000000,
        "status": "completed"
      }
    ],
    "categories": [
      {
        "id": "507f1f77bcf86cd799439014",
        "name": "玄幻",
        "bookCount": 1000,
        "parentId": null,
        "level": 1
      },
      {
        "id": "507f1f77bcf86cd799439015",
        "name": "东方玄幻",
        "bookCount": 500,
        "parentId": "507f1f77bcf86cd799439014",
        "level": 2
      }
    ],
    "rankings": {
      "realtime": [
        {
          "rank": 1,
          "bookId": "507f1f77bcf86cd799439011",
          "book": {
            "id": "507f1f77bcf86cd799439011",
            "title": "斗破苍穹",
            "author": "天蚕土豆",
            "cover": "https://cdn.example.com/cover1.jpg"
          },
          "score": 10000,
          "trend": "up"
        }
      ]
    }
  },
  "timestamp": 1705228800000
}
```

### 前端集成示例

#### Vue 3 Composition API

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getHomepage } from '@/modules/bookstore/api/homepage';
import type { HomepageData } from '@/types/bookstore';

const homepageData = ref<HomepageData | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const fetchHomepage = async () => {
  loading.value = true;
  error.value = null;

  try {
    homepageData.value = await getHomepage();
  } catch (err) {
    error.value = '获取首页数据失败';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchHomepage();
});
</script>

<template>
  <div v-if="loading">加载中...</div>
  <div v-else-if="error">{{ error }}</div>
  <div v-else-if="homepageData">
    <!-- Banner轮播图 -->
    <div class="banners">
      <div v-for="banner in homepageData.banners" :key="banner.id">
        <img :src="banner.image" :alt="banner.title" />
      </div>
    </div>

    <!-- 推荐书籍 -->
    <section>
      <h2>推荐书籍</h2>
      <div class="book-list">
        <div v-for="book in homepageData.recommended_books" :key="book.id">
          <img :src="book.cover" :alt="book.title" />
          <h3>{{ book.title }}</h3>
          <p>{{ book.author }}</p>
        </div>
      </div>
    </section>

    <!-- 分类列表 -->
    <section>
      <h2>分类</h2>
      <div class="categories">
        <div v-for="category in homepageData.categories" :key="category.id">
          {{ category.name }} ({{ category.bookCount }})
        </div>
      </div>
    </section>
  </div>
</template>
```

#### Pinia Store

```typescript
// src/stores/bookstore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getHomepage } from '@/modules/bookstore/api/homepage';
import type { HomepageData } from '@/types/bookstore';

export const useBookstoreStore = defineStore('bookstore', () => {
  const homepageData = ref<HomepageData | null>(null);
  const isLoading = ref(false);

  async function fetchHomepage() {
    try {
      isLoading.value = true;
      const data = await getHomepage();
      homepageData.value = data;
      return data;
    } catch (error) {
      console.error('获取首页数据失败:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    homepageData,
    isLoading,
    fetchHomepage
  };
});
```

### 常见问题

#### Q1: 为什么首页数据不包含榜单？

**A**: 榜单数据是可选的，因为榜单计算比较耗时。如果不需要实时榜单，可以使用 `/rankings/{type}` 接口单独获取。

#### Q2: 首页数据多久更新一次？

**A**:
- Banner: 实时（基于start_time和end_time）
- 推荐书籍: 缓存5分钟
- 精选书籍: 缓存1小时
- 分类树: 缓存1天
- 榜单: 缓存5分钟

#### Q3: 如何处理Banner点击统计？

**A**: 使用 `POST /api/v1/bookstore/banners/{id}/click` 接口记录点击。

```typescript
import { clickBanner } from '@/modules/bookstore/api/banners';

const handleBannerClick = async (bannerId: string) => {
  await clickBanner(bannerId);  // 异步记录，不阻塞导航
  router.push(banner.link);
};
```

#### Q4: 推荐书籍和精选书籍有什么区别？

**A**:
- **推荐书籍**: 基于算法推荐的个性化内容，考虑用户偏好
- **精选书籍**: 编辑手动标记的优质书籍，面向所有用户

#### Q5: 分类数据为什么要展平？

**A**: 展平的分类树结构更容易在前端渲染。如果需要树形结构，可以使用 `parentId` 字段重建：

```typescript
function buildCategoryTree(categories: Category[]): Category[] {
  const map = new Map<string, Category>();
  categories.forEach(cat => map.set(cat.id, { ...cat, children: [] }));

  const root: Category[] = [];
  categories.forEach(cat => {
    const node = map.get(cat.id)!;
    if (cat.parentId) {
      const parent = map.get(cat.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      }
    } else {
      root.push(node);
    }
  });

  return root;
}
```

### 相关接口

- [Banner列表](../quick-reference/bookstore.md#辅助接口)
- [榜单查询](./rankings.md)
- [书籍详情](./book-detail.md)
- [分类查询](../quick-reference/bookstore.md#5-分类列表)

### 变更日志

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.3 | 2025-01-14 | 添加timestamp和request_id字段 |
| v1.2 | 2025-01-10 | 优化返回数据结构，rankings改为可选 |
| v1.1 | 2025-01-05 | 添加featured_books字段 |
| v1.0 | 2024-12-20 | 初始版本 |
