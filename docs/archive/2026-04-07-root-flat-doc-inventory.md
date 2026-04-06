# 2026-04-07 前端 docs 根层平铺文档台账

该清单记录 `Qingyu_fronted/docs/` 根层直接放置的 Markdown 文档，用于定期评估哪些是当前入口、哪些可继续留在子模块、哪些应归类为历史或待归档，再决定是否迁移到父仓库 `docs/`。

## 当前入口

- `README.md`：本地文档中台入口，已如上文所述说明必须先读父仓库治理。
- `QUICK_START.md` / `快速开始.md`：两个 quick start 版本，仍作为本地上手步骤。
- `USER_GUIDE.md`：本地全面使用指南（含功能/操作）仍由前端维护。

## 本地操作

- `api-connection-guide.md`：API 对接说明，仅对接前端接口使用。
- `testing.md`：Vitest/Playwright 本地测试方法（详细命令已移至 `docs/testing/` README）。
- `test-failure-analysis-2026-01-29.md`：一次旧测试失败复盘，仍可作为排查参考。
- `部署检查清单.md`：本地部署步骤与环境配置。
- `element-plus-customization-guide.md`：Element Plus 定制说明，属于本地样式需求。
- `BACKEND_REQUIRED_FEATURES.md`：列出的后端依赖能力在本地工作中仍可参考。

## 根层仍待处理的历史文档

- `前端页面设计完整指南_v1.0.md`：旧版设计指导文档，仍留在根层，后续应评估是否迁入 `archive/`。

## 已迁入 archive（2026-04-07）

- `archive/merge-verification-report.md`：阶段交付合并验证摘要。
- `archive/前端页面完善实施报告.md`：前端页面改造的完成报告。
- `archive/项目进度总结.md`：历史项目进度汇总。

## 待归档 / 迁移

- 若剩余根层文档被标记为“跨仓库计划”或“共享 owner”，应迁移至父仓库 `docs/plans/submodules/frontend/` 或 `docs/analysis/`；若只是前端本地历史资料，则继续迁入 `docs/archive/`。进一步清理前请先在 `docs/analysis/2026-04-07-frontend-doc-governance-audit.md` 记录当前状态。

## 维护提醒

1. 新增的根层 Markdown 要先判断属于以上哪类，若跨模块治理目标请同步父仓库。
2. 尽量避免在 root 继续累积 `plan/roadmap`；若实在需要，应先写到父级再在此处加“参见”链接。
3. 每季度复核一次此台账，确认哪些文档已进入 `docs/archive/` 或 `docs/plans/submodules/frontend/legacy/`。
