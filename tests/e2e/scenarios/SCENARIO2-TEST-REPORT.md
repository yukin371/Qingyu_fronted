# 场景2: 读者日常使用 E2E测试报告

## 测试概述

本测试场景覆盖了读者在日常使用Qingyu平台时的完整流程，包含5个主要部分、9个测试步骤、20+个验证点。

## 测试文件

**文件路径**: `tests/e2e/scenarios/scenario2-reader-daily-usage.spec.ts`

**设计文档**: `docs/plans/2026-01-18-qingyu-frontend-test-design.md` (第308-387行)

## 测试结构

### 测试套件配置

```typescript
test.describe('场景2: 读者日常使用', () => {
  // 包含5个独立测试
  // 每个测试对应一个Part
})
```

### 测试数据管理

使用动态生成的测试数据，避免硬编码：

```typescript
const testData = {
  search: {
    keyword: '修仙小说',
    category: '玄幻',
    status: '连载中'
  },
  reader: {
    username: testFixtures.users.reader.username,
    password: testFixtures.users.reader.password
  },
  bookshelf: {
    name: testFixtures.bookshelf.name
  }
}
```

## 测试场景详情

### Part 1: 搜索发现

**测试目标**: 验证用户搜索书籍和使用筛选器的功能

**测试步骤**:
1. 登录读者账号
2. 搜索"修仙小说"
   - ✅ 验证API返回200
   - ✅ 验证搜索结果相关度排序
   - ✅ 验证支持高级筛选
3. 选择分类"玄幻"
   - ✅ 验证URL更新查询参数
   - ✅ 验证结果正确过滤
4. 选择状态"连载中"
   - ✅ 验证URL更新查询参数
   - ✅ 验证结果正确过滤

**关键技术点**:
- 使用`page.waitForResponse()`验证API响应
- 验证URL查询参数更新
- 验证筛选结果正确性

### Part 2: 深度阅读

**测试目标**: 验证用户阅读书籍和使用阅读器功能

**测试步骤**:
1. 登录并进入搜索结果
2. 点击"继续阅读"
   - ✅ 验证API返回200
   - ✅ 验证自动跳转上次阅读章节
   - ✅ 验证阅读进度恢复
   - ✅ 验证设置记住偏好
3. 测试字体调整
   - ✅ 验证设置实时生效
4. 测试主题切换
   - ✅ 验证设置实时生效
5. 测试目录导航
   - ✅ 验证章节切换流畅
6. 验证阅读进度自动保存

**关键技术点**:
- 验证阅读进度数据结构
- 验证DOM样式实时变化
- 验证滚动位置保存

### Part 3: 互动评论

**测试目标**: 验证用户发表评论和回复评论的功能

**测试步骤**:
1. 登录并进入章节页
2. 滚动到评论区
3. 填写并发表评论
   - ✅ 验证API返回200
   - ✅ 验证评论立即显示
   - ✅ 验证显示"刚刚"时间
4. 点击回复按钮
5. 填写并提交回复
   - ✅ 验证API返回200
   - ✅ 验证回复显示为缩进样式

**关键技术点**:
- 验证评论数据结构
- 验证评论DOM插入
- 验证时间显示格式
- 验证回复样式缩进

### Part 4: 社交互动

**测试目标**: 验证用户关注作者和管理书单的功能

**测试步骤**:
1. 登录并进入作者主页
2. 点击关注按钮
   - ✅ 验证API返回200
   - ✅ 验证按钮变为"已关注"
3. 返回书籍详情页
4. 点击加入书单
5. 选择书单并确认
   - ✅ 验证书单数量+1
6. 验证个人中心可见

**关键技术点**:
- 验证关注状态更新
- 验证按钮文本和样式变化
- 验证书单数量递增
- 验证个人中心数据同步

### Part 5: 阅读统计

**测试目标**: 验证用户查看个人阅读统计的功能

**测试步骤**:
1. 登录并导航到个人统计页
2. 验证API返回200
3. 验证显示本周阅读时长
4. 验证显示阅读字数统计
5. 验证显示阅读偏好图表
6. 验证其他统计信息
   - ✅ 连续阅读天数
   - ✅ 完成书籍数
   - ✅ 阅读进度

**关键技术点**:
- 验证统计数据格式
- 验证图表容器和数据
- 验证多种统计维度

## 技术特性

### 1. Screenplay模式

使用Actor和Builder模式，代码易读易维护：

```typescript
const readerActor = ActorFactory.createReader(session)
await readerActor.login(username, password)
await readerActor.searchBooks(keyword)
```

### 2. API验证

使用`page.waitForResponse()`验证API：

```typescript
const searchPromise = page.waitForResponse(
  response =>
    response.url().includes('/api/books/search') &&
    response.status() === 200
)
await readerActor.searchBooks(keyword)
const response = await searchPromise
```

### 3. 错误处理

每个Part都有独立的try-catch：

```typescript
try {
  // 测试步骤
} catch (error) {
  console.error('Part X 测试失败:', error)
  throw error
}
```

### 4. 失败截图

 afterEach钩子自动截图：

```typescript
if (test.info().status !== 'passed') {
  await page.screenshot({
    path: `test-results/scenario2-failure-${test.info().title}.png`,
    fullPage: true
  })
}
```

### 5. 测试步骤细分

使用test.step()细分步骤，提高可读性：

```typescript
await test.step('1.1 登录读者账号', async () => {
  await readerActor.login(username, password)
})
```

## 依赖文件

### 必需的Helper文件

1. **browser-session.ts**: 浏览器会话管理
2. **actor-factory.ts**: Actor创建工厂
3. **step-builder.ts**: 场景构建器
4. **test-data.ts**: 测试数据fixtures

### 需要的Actor方法

ReaderActor需要实现以下方法：
- `login(username, password)`: 登录
- `searchBooks(keyword)`: 搜索书籍
- `filterByCategory(category)`: 分类筛选
- `filterByStatus(status)`: 状态筛选
- `continueReading()`: 继续阅读
- `adjustFontSize(size)`: 调整字体
- `resetFontSize()`: 重置字体
- `switchTheme(theme)`: 切换主题
- `openTableOfContents()`: 打开目录
- `navigateToNextChapter()`: 下一章
- `scrollToComments()`: 滚动到评论区
- `postComment(content)`: 发表评论
- `postReply(content)`: 回复评论
- `navigateToAuthorPage()`: 进入作者主页
- `followAuthor()`: 关注作者
- `openAddToBookshelfModal()`: 打开书单弹窗
- `selectBookshelf(name)`: 选择书单
- `confirmAddToBookshelf()`: 确认添加
- `navigateToProfile()`: 进入个人中心

## 运行测试

### 运行完整场景

```bash
npm run test:e2e tests/e2e/scenarios/scenario2-reader-daily-usage.spec.ts
```

### 运行单个Part

```bash
# 运行Part 1
npm run test:e2e tests/e2e/scenarios/scenario2-reader-daily-usage.spec.ts -g "Part 1"

# 运行Part 2
npm run test:e2e tests/e2e/scenarios/scenario2-reader-daily-usage.spec.ts -g "Part 2"
```

### 调试模式

```bash
# 显示浏览器
npm run test:e2e tests/e2e/scenarios/scenario2-reader-daily-usage.spec.ts --headed

# 慢速模式
npm run test:e2e tests/e2e/scenarios/scenario2-reader-daily-usage.spec.ts --slow
```

## 测试覆盖率

### 功能覆盖

- ✅ 搜索功能
- ✅ 筛选功能
- ✅ 阅读进度管理
- ✅ 阅读器设置
- ✅ 章节导航
- ✅ 评论系统
- ✅ 回复功能
- ✅ 关注作者
- ✅ 书单管理
- ✅ 阅读统计

### API端点覆盖

- `/api/books/search` - 搜索书籍
- `/api/reading/progress` - 阅读进度
- `/api/comments` - 发表评论
- `/api/comments/:id` - 回复评论
- `/api/social/follow` - 关注作者
- `/api/bookshelf/` - 书单管理
- `/api/statistics/reading` - 阅读统计

## 预期结果

### 成功标准

1. ✅ 所有5个Part测试通过
2. ✅ 所有API验证通过
3. ✅ 所有DOM元素验证通过
4. ✅ 无控制台错误
5. ✅ 测试执行时间 < 5分钟

### 失败处理

- 失败时自动截图保存到`test-results/`
- 每个Part独立，一个失败不影响其他
- 详细的错误日志输出

## 维护建议

1. **定期更新测试数据**: 确保测试数据与生产环境一致
2. **监控测试执行时间**: 如果某个Part超过预期，需要优化
3. **定期检查选择器**: UI变更时及时更新data-testid
4. **添加新的验证点**: 随着功能增加，补充测试覆盖
5. **保持测试独立性**: 确保每个Part可以独立运行

## 相关文档

- [测试设计文档](../../../docs/plans/2026-01-18-qingyu-frontend-test-design.md)
- [Playwright配置](../../playwright.config.ts)
- [测试数据管理](../../helpers/test-data.ts)
- [Actor模式说明](../../helpers/actor-factory.ts)

## 测试执行日志示例

```
Running 5 tests using 1 worker

✓ scenario2-reader-daily-usage.spec.ts:45:3 › Part 1: 搜索发现 (15.2s)
✓ scenario2-reader-daily-usage.spec.ts:120:3 › Part 2: 深度阅读 (22.8s)
✓ scenario2-reader-daily-usage.spec.ts:213:3 › Part 3: 互动评论 (18.5s)
✓ scenario2-reader-daily-usage.spec.ts:298:3 › Part 4: 社交互动 (20.1s)
✓ scenario2-reader-daily-usage.spec.ts:383:3 › Part 5: 阅读统计 (12.3s)

5 passed (88.9s)
```

---

**创建时间**: 2026-01-19
**测试版本**: 1.0.0
**维护者**: Qingyu测试团队
