# 开发指南（历史入门区）

本目录保留前期的基础开发手册，适合复盘或新成员快速上手旧流程。它现在被标记为 legacy 文档，意味着团队不会再在这里扩展跨仓库治理或全新计划；若需要新增 roadmap/plan，请优先转到父仓库 [docs/plans/submodules/frontend/README.md](../../../docs/plans/submodules/frontend/README.md) 并在本文档末尾补链说明。

## 推荐阅读路径

1. [quick-start.md](./quick-start.md)：本地环境、依赖安装、启动命令。
2. [project-structure.md](./project-structure.md)：目录与模块划分。
3. [component-guide.md](./component-guide.md)：组件开发流程与测试。
4. [page-guide.md](./page-guide.md)：页面/路由开发实战。
5. [state-management.md](./state-management.md)：Pinia Store 组织与策略。
6. [api-integration.md](./api-integration.md)：HTTP 客户端与错误处理。
7. [styling.md](./styling.md)、[routing.md](./routing.md)、[debugging.md](./debugging.md)：补充章节。

## 使用规则

- 只留本地开发、组件、页面、状态、路由、样式与调试实操内容。
- 不再在此目录编写跨模块 plan/roadmap/ADR；相关变更在父仓库 [docs/plans/submodules/frontend/README.md](../../../docs/plans/submodules/frontend/README.md) 建文档后，此 README 可附上“更多治理内容请见…”的备注。
- 若发现此目录仍在写入新的治理注意事项，请标注 `TBD` 并同步到父仓库 [docs/decisions/README.md](../../../docs/decisions/README.md)。
