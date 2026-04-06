# 前端交付/阶段报告目录

`docs/reports/` 汇总前端模块的本地交付里程碑、阶段复盘与整体验收；这类文档侧重本地交付总结，不作为跨仓库长期治理归档目录。

`2026-02-23-reader-api-verification-report.md` 与 `2026-02-23-writer-api-verification-report.md` 已于 `2026-04-07` 迁移到父仓库：

- `docs/plans/submodules/frontend/legacy/2026-02-23-reader-api-verification-report.md`
- `docs/plans/submodules/frontend/legacy/2026-02-23-writer-api-verification-report.md`

## 目录职责

- 记录“改了什么、怎么验证、影响怎样”的前端本地交付报告（阶段总结、验收复盘、修复闭环）。
- 包含阶段总结、问题修复清单、性能观察等面向 PM/Stakeholder 的输出。
- 历史 API verification 这类跨仓库归档型报告统一放在父仓库 `docs/plans/submodules/frontend/legacy/`。

## 同步原则

1. 若报告与跨仓库计划有关，必须在父仓库 `docs/plans/submodules/frontend/` 新增同步计划，并在 `docs/reports/` 中附上 plan link。
2. 报告产生后，父仓库 `docs/analysis/2026-04-07-documentation-reorganization-audit.md` 需记录关键收敛/差距。
3. 报告中不应直接包含新的 governance 规则、owner 声明或 architecture 说明；这类内容应转到 `docs/standards` 或 `docs/ARCHITECTURE_GUARDRAILS.md`。
