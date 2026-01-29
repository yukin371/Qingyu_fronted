# CI/CD 工作流说明

## 概述

本项目使用GitHub Actions实现CI/CD自动化流程。

## 工作流文件

### 1. test.yml - 单元测试和覆盖率

**触发条件**:
- Pull Request到main或develop分支
- Push到main或develop分支

**功能**:
- 运行单元测试 (`npm run test:run`)
- 生成测试覆盖率报告 (`npm run test:coverage`)
- 上传覆盖率到Codecov（需要配置CODECOV_TOKEN）
- 上传测试结果和覆盖率报告作为artifacts

**覆盖率阈值**:
- 当前设置为60%（占位符）
- 需要根据实际覆盖率工具输出调整

### 2. pr-check.yml - PR检查门禁

**触发条件**:
- Pull Request打开、同步或重新打开

**功能**:
- 运行单元测试
- 生成覆盖率报告
- 检查覆盖率阈值
- 在PR中自动评论测试结果
- 运行lint检查（如果配置）
- 运行类型检查（如果配置）

**PR评论内容**:
- ✅ 测试通过状态
- 📊 覆盖率报告
- 🔗 相关链接

### 3. e2e-test.yml - E2E测试

**触发条件**:
- Pull Request到main或develop分支
- Push到main或develop分支
- 手动触发 (workflow_dispatch)

**功能**:
- 安装Playwright浏览器
- 运行E2E测试 (`npm run test:e2e`)
- 上传测试结果和截图作为artifacts

**注意**: E2E测试可能需要后端服务运行，当前配置为独立运行

## 配置要求

### 必需配置

无（所有工作流都可独立运行）

### 可选配置

1. **Codecov集成**（用于覆盖率报告）
   - 在GitHub仓库设置中添加`CODECOV_TOKEN` secret
   - 在Codecov网站注册项目

2. **后端服务**（用于E2E测试）
   - 需要配置测试环境或mock后端

## 使用说明

### 查看工作流运行结果

1. 访问仓库的"Actions"标签
2. 选择具体的工作流运行
3. 查看运行日志和artifacts

### 本地测试工作流

```bash
# 测试单元测试
npm run test:run

# 测试覆盖率
npm run test:coverage

# 测试E2E
npm run test:e2e
```

### 覆盖率阈值设置

当前覆盖率阈值为60%，可以在工作流文件中调整：

```yaml
- name: Check coverage threshold
  run: |
    # 添加实际的覆盖率检查逻辑
    # 例如: if coverage < 60; then exit 1; fi
```

## 自定义和扩展

### 添加新的检查步骤

在工作流文件的`steps`部分添加新的步骤：

```yaml
- name: Custom check
  run: |
    # 你的自定义检查命令
```

### 修改触发条件

在工作流文件的`on`部分修改：

```yaml
on:
  push:
    branches: [main, develop, your-branch]
  pull_request:
    branches: [main, develop, your-branch]
```

### 添加环境变量

在工作流文件中添加：

```yaml
env:
  NODE_ENV: test
  CUSTOM_VAR: value
```

## 故障排除

### 工作流失败

1. 查看Actions标签中的详细日志
2. 本地重现问题：`npm run test:run`
3. 检查依赖版本：`npm ci`

### 覆盖率不上传

1. 检查CODECOV_TOKEN是否正确配置
2. 检查覆盖率文件路径是否正确
3. 查看Codecov集成状态

### E2E测试失败

1. 确认Playwright浏览器已安装
2. 检查测试环境配置
3. 查看E2E测试截图artifacts

## 最佳实践

1. **保持工作流快速**: 只在必要时运行完整测试
2. **使用缓存**: 工作流已配置npm缓存
3. **并行运行**: 多个job可以并行运行
4. **artifacts管理**: 定期清理旧的artifacts
5. **安全性**: 不要在日志中暴露secrets

## 后续改进建议

1. **添加部署步骤**: 在测试通过后自动部署到staging环境
2. **性能测试**: 添加Lighthouse或其他性能测试
3. **安全扫描**: 添加依赖安全扫描
4. **通知集成**: 添加Slack或其他通知渠道
5. **覆盖率门禁**: 实现更严格的覆盖率检查
