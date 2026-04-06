# 前端实施文档入口

`docs/implementation/` 用于保留前端子模块本地实施记录、落地说明和交付过程文档。

它适合承接：

- 本地模块实施说明
- 阶段交付记录
- 局部能力落地总结
- 与前端仓库强绑定的执行笔记

它不适合承接：

- 跨仓库长期 roadmap
- Editor V3 总体方案
- 需要前后端与 AI 一起协调的长期计划

上述内容统一放在父仓库：

- `docs/plans/v3/`
- `docs/plans/submodules/frontend/`
- `docs/decisions/`

## 目录边界

- `phase0/`、`phase1/`、`phase2/`、`phase3/`：历史阶段实施记录
- `draw-engine/`、`indexeddb/`：局部实现专题
- 根层文档：一次性交付总结、迁移说明、实施报告

## 使用规则

1. 这里只记录“已经或正在如何落地”。
2. 还未决定、需跨模块评审的方案，不写在这里，先去父仓库 plan。
3. 当某份实施文档只剩历史追溯价值时，应移动到 `docs/archive/` 或在标题中明确为完成报告。
4. 如果实施说明改写了模块边界、验证方式或共享 owner，必须同步 `Qingyu_fronted/MODULE.md` 与父仓库治理文档。
