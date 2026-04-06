# 迁移指南目录（当前精选）

`docs/migration-guides/` 专注于支持前端团队实际执行迁移的手把手内容，强调 Element Plus → Qingyu 组件、Tailwind 语义迁移等变更路径。这是当前仍然维护的指南集合。

## 目录职责

- `element-plus-icons-migration-guide.md`、`p2-tailwind-semantic-migration-summary.md` 等文档记录尚在执行或待验证的迁移方法。
- 只有明确处于“迁移中”“需要持续维护”的内容才留在此目录；完成验证后转为父仓库 `docs/analysis/` 或 `docs/plans/submodules/frontend/` 收敛，并在本目录注明归档路径。

## 维护规则

1. 任何新的迁移操作都先在父仓库 `docs/plans/submodules/frontend/` 输出 plan/implementation，再在本目录添加执行指南或跟进日志。
2. 逐步将过时的迁移记录标记为 `Legacy` 并在 README 末尾列出归档位置；当前尚未标记的文档以 `phase2` 为主，代表仍需观测。
3. 不在本目录直接写跨仓库规划或 roadmap，否则需移回父仓库。
