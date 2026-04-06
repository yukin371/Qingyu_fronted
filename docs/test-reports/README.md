# 前端测试报告目录

`docs/test-reports/` 专注于自动化/手动测试验证结果，记录 Vitest/Playwright/组件测试等“验证状态”，与 `docs/reports/` 描述的交付总结不同。

## 目录职责

- 包含每次测试 campaign 的输入、触发命令、失败修复建议（例如 `2026-01-25-browse-books-e2e-report.md`）。
- 只记录用于验证的产出，避免在此重复讲述交付背景；交付背景应在 `docs/reports/` 保留。

## 维护规则

1. 每次测试触发点（Vitest、Playwright、API smoke）需在父仓库 `docs/roadmap.md` 或 `docs/plans/submodules/frontend/` 说明其验证目的。
2. 测试失败/回归的处理建议必须附上 owner 与后续动作；若需要跨组件协调，额外在父仓库 `docs/analysis/2026-04-07-documentation-reorganization-audit.md` 快照说明。
3. 不在本目录写长期 roadmap/plan；若出现需要持续跟踪的阶段性测试输出，应在父仓库新增 plan，并在本目录标注 plan link 以保持同步。
