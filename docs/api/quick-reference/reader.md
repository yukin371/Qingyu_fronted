# 快速参考 - 阅读器模块

> **5秒找到需要的接口** - 阅读器核心功能速查表

## 章节阅读

### 获取章节列表
```
GET /api/v1/reader/books/{bookId}/chapters
```
获取书籍的所有章节目录

**认证**: 需要登录 | **限流**: 无

**请求参数**:
| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| bookId | string | ✓ | 书籍ID（路径参数） | "book-123" |
| page | number | ✗ | 页码，默认1 | 1 |
| size | number | ✗ | 每页数量，默认20 | 20 |

**响应数据**:
| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 响应码，0表示成功 |
| message | string | 响应消息 |
| data | object | 响应数据 |
| data.items | array | 章节列表 |
| data.items[].id | string | 章节ID |
| data.items[].chapterNumber | number | 章节号 |
| data.items[].title | string | 章节标题 |
| data.items[].wordCount | number | 字数 |
| data.items[].publishedAt | string | 发布时间 |
| data.total | number | 总数 |
| data.page | number | 当前页 |
| data.size | number | 每页数量 |

---

### 获取章节内容
```
GET /api/v1/reader/books/{bookId}/chapters/{chapterId}
```
获取指定章节的完整内容（含文本）

**认证**: 需要登录 | **限流**: 无

**请求参数**:
| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| bookId | string | ✓ | 书籍ID（路径参数） | "book-123" |
| chapterId | string | ✓ | 章节ID（路径参数） | "chapter-456" |

**响应数据**:
| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 响应码，0表示成功 |
| message | string | 响应消息 |
| data | object | 章节内容数据 |
| data.chapter | object | 章节信息 |
| data.chapter.id | string | 章节ID |
| data.chapter.title | string | 章节标题 |
| data.chapter.chapterNumber | number | 章节号 |
| data.content | string | 章节正文内容 |
| data.nextChapter | object\|null | 下一章信息 |
| data.prevChapter | object\|null | 上一章信息 |
| data.locked | boolean | 是否锁定（需购买） |

---

### 获取章节信息
```
GET /api/v1/reader/chapters/{chapterId}/info
```
获取章节元信息（不含内容）

**认证**: 需要登录 | **限流**: 无

**请求参数**:
| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| chapterId | string | ✓ | 章节ID（路径参数） | "chapter-456" |

---

### 按章节号获取
```
GET /api/v1/reader/books/{bookId}/chapters/by-number/{chapterNum}
```
根据章节号获取章节内容

**认证**: 需要登录 | **限流**: 无

**请求参数**:
| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| bookId | string | ✓ | 书籍ID（路径参数） | "book-123" |
| chapterNum | number | ✓ | 章节号（路径参数） | 10 |

---

### 下一章
```
GET /api/v1/reader/books/{bookId}/chapters/{chapterId}/next
```
获取下一章内容

**认证**: 需要登录 | **限流**: 无

---

### 上一章
```
GET /api/v1/reader/books/{bookId}/chapters/{chapterId}/previous
```
获取上一章内容

**认证**: 需要登录 | **限流**: 无

---

## 阅读进度

### 获取阅读进度
```
GET /api/v1/reader/progress/{bookId}
```
返回当前书籍的阅读进度（章节号、百分比）

**认证**: 需要登录 | **限流**: 无

**请求参数**:
| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| bookId | string | ✓ | 书籍ID（路径参数） | "book-123" |

**响应数据**:
| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 响应码 |
| message | string | 响应消息 |
| data | object | 阅读进度数据 |
| data.bookId | string | 书籍ID |
| data.chapterId | string | 当前章节ID |
| data.chapterNumber | number | 当前章节号 |
| data.progress | number | 阅读进度（0-1之间的小数） |
| data.lastReadTime | string | 最后阅读时间 |

---

### 保存阅读进度
```
POST /api/v1/reader/progress
```
保存当前阅读进度

**认证**: 需要登录 | **限流**: 无

**请求参数**:
| 字段 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|------|------|------|------|----------|------|
| bookId | string | ✓ | 书籍ID | - | "book-123" |
| chapterId | string | ✓ | 章节ID | - | "chapter-456" |
| chapterNumber | number | ✓ | 章节号 | - | 10 |
| progress | number | ✓ | 阅读进度 | 0-1之间的小数 | 0.65 |

**响应数据**:
| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 响应码，0表示成功 |
| message | string | 响应消息 |
| data | null | 无返回数据 |

---

### 更新阅读时长
```
POST /api/v1/reader/progress/time
```
记录阅读时长（用于统计分析）

**认证**: 需要登录 | **限流**: 无

**请求参数**:
| 字段 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|------|------|------|------|----------|------|
| bookId | string | ✓ | 书籍ID | - | "book-123" |
| chapterId | string | ✓ | 章节ID | - | "chapter-456" |
| duration | number | ✓ | 阅读时长（秒） | 最小值1 | 120 |

---

### 获取最近阅读
```
GET /api/v1/reader/progress/recent
```
获取最近阅读的书籍列表

**认证**: 需要登录 | **限流**: 无

---

### 获取未读完书籍
```
GET /api/v1/reader/progress/unfinished
```
获取未读完的书籍列表

**认证**: 需要登录 | **限流**: 无

---

### 获取已读完书籍
```
GET /api/v1/reader/progress/finished
```
获取已读完的书籍列表

**认证**: 需要登录 | **限流**: 无

---

### 获取阅读统计
```
GET /api/v1/reader/progress/stats
```
获取阅读统计信息（总时长、今日时长等）

**认证**: 需要登录 | **限流**: 无

**响应数据**:
| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 响应码 |
| message | string | 响应消息 |
| data | object | 统计数据 |
| data.totalTime | number | 总阅读时长（秒） |
| data.todayTime | number | 今日阅读时长（秒） |
| data.weekTime | number | 本周阅读时长（秒） |

---

## 书签管理

### 获取书签列表
```
GET /api/v1/reader/bookmarks
GET /api/v1/reader/books/{bookId}/bookmarks
```
获取所有书签或指定书籍的书签

**认证**: 需要登录 | **限流**: 无

**请求参数**:
| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| bookId | string | ✗ | 书籍ID（路径参数，可选） | "book-123" |
| page | number | ✗ | 页码 | 1 |
| size | number | ✗ | 每页数量 | 20 |

---

### 创建书签
```
POST /api/v1/reader/books/{bookId}/bookmarks
```
在指定章节创建书签

**认证**: 需要登录 | **限流**: 无

**请求参数**:
| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| bookId | string | ✓ | 书籍ID（路径参数） | "book-123" |
| chapterId | string | ✓ | 章节ID | "chapter-456" |
| title | string | ✗ | 书签标题 | "精彩段落" |
| position | number | ✗ | 书签位置 | 1250 |

---

### 获取书签详情
```
GET /api/v1/reader/bookmarks/{id}
```
获取书签详细信息

**认证**: 需要登录 | **限流**: 无

---

### 更新书签
```
PUT /api/v1/reader/bookmarks/{id}
```
更新书签信息

**认证**: 需要登录 | **限流**: 无

---

### 删除书签
```
DELETE /api/v1/reader/bookmarks/{id}
```
删除指定书签

**认证**: 需要登录 | **限流**: 无

---

### 获取最新书签
```
GET /api/v1/reader/annotations/bookmark/latest
```
获取最新创建的书签

**认证**: 需要登录 | **限流**: 无

---

## 标注管理（书签/笔记/高亮）

### 创建标注
```
POST /api/v1/reader/annotations
```
创建书签、笔记或高亮标注

**认证**: 需要登录 | **限流**: 无

**请求参数**:
| 字段 | 类型 | 必填 | 说明 | 可选值 | 示例 |
|------|------|------|------|--------|------|
| bookId | string | ✓ | 书籍ID | - | "book-123" |
| chapterId | string | ✓ | 章节ID | - | "chapter-456" |
| type | string | ✓ | 标注类型 | bookmark, highlight, note | "highlight" |
| text | string | ✗ | 标注文本 | - | "精彩片段" |
| note | string | ✗ | 注释内容 | - | "这个描写很生动" |
| range | string | ✗ | 标注范围 | - | "100-200" |

**响应数据**:
| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 响应码，0表示成功 |
| message | string | 响应消息 |
| data | object | 创建的标注数据 |
| data.id | string | 标注ID |
| data.userId | string | 用户ID |
| data.bookId | string | 书籍ID |
| data.chapterId | string | 章节ID |
| data.type | string | 标注类型 |
| data.text | string | 标注文本 |
| data.note | string | 注释内容 |
| data.range | string | 标注范围 |
| data.createTime | string | 创建时间 |
| data.updateTime | string | 更新时间 |

---

### 更新标注
```
PUT /api/v1/reader/annotations/{id}
```
更新标注内容

**认证**: 需要登录 | **限流**: 无

**请求参数**:
| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| id | string | ✓ | 标注ID（路径参数） | "anno-789" |
| text | string | ✗ | 标注文本 | "更新后的文本" |
| note | string | ✗ | 注释内容 | "补充说明" |
| range | string | ✗ | 标注范围 | "150-250" |

---

### 删除标注
```
DELETE /api/v1/reader/annotations/{id}
```
删除指定标注

**认证**: 需要登录 | **限流**: 无

---

### 获取书籍标注
```
GET /api/v1/reader/annotations/book/{bookId}
```
获取指定书籍的所有标注

**认证**: 需要登录 | **限流**: 无

**请求参数**:
| 字段 | 类型 | 必填 | 说明 | 可选值 | 示例 |
|------|------|------|------|--------|------|
| bookId | string | ✓ | 书籍ID（路径参数） | - | "book-123" |
| type | string | ✗ | 标注类型（查询参数） | bookmark, highlight, note | "highlight" |
| page | number | ✗ | 页码 | - | 1 |
| size | number | ✗ | 每页数量 | - | 20 |

---

### 获取章节标注
```
GET /api/v1/reader/annotations/chapter/{chapterId}
```
获取指定章节的所有标注

**认证**: 需要登录 | **限流**: 无

---

### 获取笔记
```
GET /api/v1/reader/annotations/notes
```
获取所有笔记类型的标注

**认证**: 需要登录 | **限流**: 无

---

### 获取书签
```
GET /api/v1/reader/annotations/bookmarks
```
获取所有书签类型的标注

**认证**: 需要登录 | **限流**: 无

---

### 获取高亮
```
GET /api/v1/reader/annotations/highlights
```
获取所有高亮类型的标注

**认证**: 需要登录 | **限流**: 无

---

### 批量创建标注
```
POST /api/v1/reader/annotations/batch
```
批量创建多个标注

**认证**: 需要登录 | **限流**: 无

**请求参数**:
| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| annotations | array | ✓ | 标注数组 | 见下方 |

**annotations数组项**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| bookId | string | ✓ | 书籍ID |
| chapterId | string | ✓ | 章节ID |
| type | string | ✓ | 标注类型 |
| text | string | ✗ | 标注文本 |
| note | string | ✗ | 注释内容 |
| range | string | ✗ | 标注范围 |

**响应数据**:
| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 响应码 |
| message | string | 响应消息 |
| data | object | 批量操作结果 |
| data.successCount | number | 成功数量 |
| data.failedCount | number | 失败数量 |

---

### 批量删除标注
```
DELETE /api/v1/reader/annotations/batch
```
批量删除多个标注

**认证**: 需要登录 | **限流**: 无

**请求参数**:
| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| ids | array | ✓ | 标注ID数组 | ["anno-1", "anno-2"] |

---

## 阅读设置

### 获取阅读设置
```
GET /api/v1/reader/settings
```
获取用户的阅读设置（字号、行高、主题等）

**认证**: 需要登录 | **限流**: 无

**响应数据**:
| 字段 | 类型 | 说明 | 可选值 |
|------|------|------|--------|
| code | number | 响应码 | - |
| message | string | 响应消息 | - |
| data | object | 设置数据 | - |
| data.fontSize | number | 字号（像素） | 12-24 |
| data.lineHeight | number | 行高（倍数） | 1.0-2.5 |
| data.theme | string | 主题 | light, dark, sepia |
| data.fontFamily | string | 字体 | - |
| data.autoScroll | boolean | 自动滚动 | - |
| data.scrollSpeed | number | 滚动速度 | - |

---

### 保存阅读设置
```
POST /api/v1/reader/settings
```
保存阅读设置

**认证**: 需要登录 | **限流**: 无

**请求参数**:
| 字段 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|------|------|------|------|----------|------|
| fontSize | number | ✓ | 字号 | 12-24 | 18 |
| lineHeight | number | ✓ | 行高 | 1.0-2.5 | 1.8 |
| theme | string | ✓ | 主题 | light/dark/sepia | "light" |
| fontFamily | string | ✗ | 字体 | - | "Microsoft YaHei" |
| autoScroll | boolean | ✗ | 自动滚动 | - | false |
| scrollSpeed | number | ✗ | 滚动速度 | 1-10 | 5 |

---

### 更新阅读设置
```
PUT /api/v1/reader/settings
```
更新部分阅读设置

**认证**: 需要登录 | **限流**: 无

---

## 书架管理

### 获取书架
```
GET /api/v1/reader/books
```
获取用户书架的所有书籍

**认证**: 需要登录 | **限流**: 无

---

### 添加到书架
```
POST /api/v1/reader/books/{bookId}
```
将书籍添加到用户书架

**认证**: 需要登录 | **限流**: 无

---

### 从书架移除
```
DELETE /api/v1/reader/books/{bookId}
```
从用户书架移除书籍

**认证**: 需要登录 | **限流**: 无

---

### 最近阅读
```
GET /api/v1/reader/books/recent
```
获取最近阅读的书籍

**认证**: 需要登录 | **限流**: 无

---

## 错误码参考

| 错误码 | HTTP状态 | 错误类型 | 错误信息 | 说明 | 前端处理建议 |
|--------|---------|---------|---------|------|-------------|
| 4001 | 404 | CHAPTER_NOT_FOUND | "章节不存在" | 指定的章节ID不存在 | 提示章节不存在，返回目录 |
| 4002 | 403 | CHAPTER_NOT_PUBLISHED | "章节未发布" | 章节尚未发布 | 提示章节待发布 |
| 4003 | 403 | CHAPTER_LOCKED | "章节未解锁" | 需要付费或订阅才能阅读 | 引导购买或订阅 |
| 4004 | 400 | INVALID_PROGRESS | "无效的进度值" | 进度值不在0-1范围内 | 检查进度参数 |
| 4005 | 404 | BOOKMARK_NOT_FOUND | "书签不存在" | 指定的书签ID不存在 | 提示书签不存在 |
| 4006 | 409 | BOOKMARK_EXISTS | "书签已存在" | 该位置已创建书签 | 提示书签已存在 |
| 4007 | 400 | INVALID_ANNOTATION_TYPE | "无效的标注类型" | 标注类型不是bookmark/highlight/note | 检查标注类型参数 |
| 4008 | 400 | INVALID_BOOK_ID | "书籍ID格式错误" | 书籍ID格式不正确 | 检查路由参数 |
| 4009 | 401 | UNAUTHORIZED | "未授权访问" | 未提供有效认证信息 | 跳转登录页面 |
| 4010 | 403 | ACCESS_DENIED | "无权访问" | 无权限访问该章节 | 提示权限不足 |

**详细错误码文档**: [错误码手册](../error-handling/error-codes.md#阅读器模块)

---

## 前端调用示例

### 获取章节内容

```typescript
import { readerAPI } from '@/modules/reader/api/reader'

// 获取章节内容
const loadChapter = async (bookId: string, chapterId: string) => {
  try {
    const response = await readerAPI.getChapterContent(chapterId)

    if (response.code === 0 && response.data) {
      const { chapter, content, nextChapter, prevChapter, locked } = response.data

      if (locked) {
        // 章节未解锁，引导购买
        showPurchaseDialog(chapterId)
        return
      }

      // 加载章节内容
      currentChapter.value = chapter
      chapterContent.value = content

      // 更新导航按钮状态
      hasNextChapter.value = !!nextChapter
      hasPrevChapter.value = !!prevChapter

      // 自动保存阅读进度
      await readerAPI.saveProgress({
        bookId,
        chapterId,
        chapterNumber: chapter.chapterNumber,
        progress: 0
      })
    }
  } catch (error) {
    console.error('获取章节失败:', error)
    ElMessage.error('获取章节失败，请稍后重试')
  }
}
```

### 保存阅读进度

```typescript
// 自动保存阅读进度（防抖）
import { useDebounceFn } from '@vueuse/core'

const saveProgressDebounced = useDebounceFn(async (progress: number) => {
  try {
    await readerAPI.saveProgress({
      bookId: currentBookId.value,
      chapterId: currentChapterId.value,
      chapterNumber: currentChapterNumber.value,
      progress
    })
  } catch (error) {
    console.error('保存进度失败:', error)
  }
}, 2000)

// 监听滚动事件，更新阅读进度
const handleScroll = () => {
  const scrollTop = readerRef.value.scrollTop
  const scrollHeight = readerRef.value.scrollHeight - readerRef.value.clientHeight
  const progress = scrollTop / scrollHeight

  currentProgress.value = progress

  // 防抖保存
  saveProgressDebounced(progress)
}
```

### 创建标注

```typescript
// 创建高亮标注
const createHighlight = async (text: string, range: string) => {
  try {
    const response = await readerAPI.createAnnotation({
      bookId: currentBookId.value,
      chapterId: currentChapterId.value,
      type: 'highlight',
      text,
      range
    })

    if (response.code === 0) {
      ElMessage.success('高亮标注已创建')
      // 刷新标注列表
      await loadAnnotations()
    }
  } catch (error) {
    console.error('创建标注失败:', error)
    ElMessage.error('创建标注失败')
  }
}

// 创建笔记
const createNote = async (text: string, note: string, range: string) => {
  try {
    const response = await readerAPI.createAnnotation({
      bookId: currentBookId.value,
      chapterId: currentChapterId.value,
      type: 'note',
      text,
      note,
      range
    })

    if (response.code === 0) {
      ElMessage.success('笔记已创建')
      await loadAnnotations()
    }
  } catch (error) {
    console.error('创建笔记失败:', error)
    ElMessage.error('创建笔记失败')
  }
}
```

### 错误处理

```typescript
// 统一错误处理
import { ElMessage } from 'element-plus'
import router from '@/router'

const handleReaderError = (error: any) => {
  const { code, message } = error.response?.data || {}

  switch (code) {
    case 4001: // CHAPTER_NOT_FOUND
      ElMessage.error('章节不存在')
      router.push(`/books/${currentBookId.value}/chapters`)
      break

    case 4002: // CHAPTER_NOT_PUBLISHED
      ElMessage.warning('该章节尚未发布')
      break

    case 4003: // CHAPTER_LOCKED
      ElMessage.info('此章节需要解锁后才能阅读')
      showPurchaseDialog(currentChapterId.value)
      break

    case 4009: // UNAUTHORIZED
      ElMessage.warning('请先登录')
      router.push('/login')
      break

    case 4010: // ACCESS_DENIED
      ElMessage.error('您没有权限访问此章节')
      break

    default:
      ElMessage.error(message || '操作失败，请稍后重试')
  }
}
```

---

## 详细文档

- [章节内容详细指南](../guides/reader/chapter-content.md)
- [书签管理详细指南](../guides/reader/bookmarks.md)
- [阅读进度详细指南](../guides/reader/reading-progress.md)
- [阅读历史详细指南](../guides/reader/reading-history.md)
- [数据模型定义](../data-models/request-models.md#阅读器模块)
