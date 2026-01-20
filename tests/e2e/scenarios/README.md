# 场景测试快速参考

## 📁 文件结构

```
tests/e2e/scenarios/
├── scenario1-new-user-registration.spec.ts    # 场景1测试代码
├── SCENARIO1-TEST-REPORT.md                   # 场景1详细报告
├── scenario2-reader-daily-usage.spec.ts       # 场景2测试代码
├── SCENARIO2-TEST-REPORT.md                   # 场景2详细报告
├── scenario3-author-creation.spec.ts          # 场景3测试代码
└── README.md                                  # 本文件
```

---

## 🚀 快速开始

### 运行单个场景测试

```bash
# 场景1：新用户注册
npx playwright test tests/e2e/scenarios/scenario1-new-user-registration.spec.ts

# 场景2：读者日常使用
npx playwright test tests/e2e/scenarios/scenario2-reader-daily-usage.spec.ts

# 场景3：作者创作
npx playwright test tests/e2e/scenarios/scenario3-author-creation.spec.ts
```

### 运行所有场景测试

```bash
npx playwright test tests/e2e/scenarios/
```

### 使用UI模式

```bash
npx playwright test --ui tests/e2e/scenarios/
```

---

## 📊 场景覆盖总览

| 场景 | 测试文件 | 主要测试点 | 状态 |
|------|---------|-----------|------|
| **场景1** | scenario1-new-user-registration.spec.ts | 新用户注册流程 | ✅ 已完成 |
| **场景2** | scenario2-reader-daily-usage.spec.ts | 读者日常使用 | ✅ 已完成 |
| **场景3** | scenario3-author-creation.spec.ts | 作者创作流程 | ✅ 已完成 |

---

## 🎯 场景1：新用户首次访问与注册

### 测试流程
1. **Phase 1**: 发现阶段
   - 浏览首页
   - 查看书店分类
   - 预览书籍详情

2. **Phase 2**: 注册阶段
   - 触发登录提示
   - 填写注册表单
   - 完成注册

3. **Phase 3**: 首次阅读
   - 开始阅读第一章
   - 收藏书籍

### 运行命令
```bash
# 运行完整测试
npx playwright test tests/e2e/scenarios/scenario1-new-user-registration.spec.ts

# 只运行Phase 1
npx playwright test --grep "Phase 1"

# 只运行Phase 2
npx playwright test --grep "Phase 2"

# 只运行Phase 3
npx playwright test --grep "Phase 3"
```

### 详细文档
查看完整报告：[SCENARIO1-TEST-REPORT.md](./SCENARIO1-TEST-REPORT.md)

---

## 📖 场景2：读者日常使用

### 主要功能
- 继续阅读
- 查看阅读历史
- 书架管理
- 评论互动

### 运行命令
```bash
npx playwright test tests/e2e/scenarios/scenario2-reader-daily-usage.spec.ts
```

### 详细文档
查看完整报告：[SCENARIO2-TEST-REPORT.md](./SCENARIO2-TEST-REPORT.md)

---

## ✍️ 场景3：作者创作

### 主要功能
- 创建新书项目
- 章节编辑
- AI辅助写作
- 发布管理

### 运行命令
```bash
npx playwright test tests/e2e/scenarios/scenario3-author-creation.spec.ts
```

---

## 🔧 测试配置

### 环境变量
```bash
# 前端地址
BASE_URL=http://localhost:5176

# 后端API
API_BASE_URL=http://localhost:8080

# 测试超时时间
TEST_TIMEOUT=30000
```

### 测试数据
- 用户名: 随机生成
- 邮箱: 随机生成
- 密码: 随机生成
- 验证码: Mock (123456)

---

## 📸 测试截图

失败时截图保存在：
```
test-results/screenshots/scenario1/
test-results/screenshots/scenario2/
test-results/screenshots/scenario3/
```

---

## 🐛 调试技巧

### 1. 调试模式
```bash
npx playwright test --debug
```

### 2. 显示浏览器
```bash
npx playwright test --headed
```

### 3. 慢动作模式
```bash
npx playwright test --slow-mo=1000
```

### 4. 只运行失败的测试
```bash
npx playwright test --last-failed
```

---

## 📋 检查清单

在运行测试前，确保：

- [ ] 前端服务已启动 (http://localhost:5176)
- [ ] 后端API已启动 (http://localhost:8080)
- [ ] 数据库连接正常
- [ ] 已安装测试依赖 (`npm install`)
- [ ] 已配置测试环境变量

---

## 🎓 最佳实践

1. **每次提交前运行测试**
   ```bash
   npm run test:e2e
   ```

2. **使用Git Hooks自动运行**
   ```bash
   # .husky/pre-commit
   npm run test:e2e -- --only-changed
   ```

3. **CI/CD集成**
   - GitHub Actions
   - GitLab CI
   - Jenkins

4. **定期更新测试数据**
   - 清理过期的测试用户
   - 更新测试书籍数据
   - 维护Mock API

---

## 📞 支持

遇到问题？

1. 查看详细报告文档
2. 检查测试日志
3. 查看截图信息
4. 提交GitHub Issue

---

**最后更新**: 2026-01-19
