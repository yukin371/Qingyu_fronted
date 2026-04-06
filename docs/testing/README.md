# 前端测试文档入口

`docs/testing/` 只保留前端本地测试方法、测试环境说明和验证指引。

它不负责：

- 跨仓库测试计划
- 长期阶段性实施方案
- 测试执行结果归档

这些内容应分别进入：

- 父仓库 `docs/plans/submodules/frontend/`：跨仓库测试计划
- `docs/test-reports/`：测试执行产物与报告

## 当前目录职责

- 测试策略与运行方式
- 本地测试环境准备
- API / 集成 / E2E 测试使用说明
- 面向开发者的测试排障入口

## 推荐阅读顺序

1. 本文件
2. [integration-test-results.md](./integration-test-results.md)
3. 根仓库与子模块 `package.json` 中实际测试脚本

## 当前验证命令

以 `Qingyu_fronted/package.json` 当前定义为准：

```bash
npm run test:vitest:run
npm run test:ci
npm run test:e2e
```

如果需要覆盖率或 UI 模式，可再使用：

```bash
npm run test:vitest:coverage
npm run test:vitest:ui
```

## 维护规则

1. 新的测试“方法说明”写在这里或相邻测试指南目录。
2. 新的测试“结果报告”写入 `docs/test-reports/`。
3. 如果测试变更会影响跨仓库工作流或 CI 验证口径，必须同步父仓库 `docs/roadmap.md`、相关 plan 或 ADR。
4. 不要在这里堆积完成报告、阶段总结或一次性修复纪要。
