# 前端技术债入口

`docs/technical-debt/` 用于记录仍未收敛的前端结构问题、命名漂移、验证缺口和需要后续治理的债务项。

## 适合记录的内容

- 组件或模块边界不清
- 旧实现与新实现并存
- 命名不一致、目录重复
- 测试与验证缺口
- 已识别但暂未处理的 UI / API / 状态管理风险

## 不适合记录的内容

- 一次性修复完成报告
- 纯实施步骤
- 跨仓库治理决策

## 协作规则

1. 如果技术债已经进入正式治理计划，要在父仓库 `docs/plans/submodules/frontend/` 建立对应计划条目。
2. 如果技术债影响模块边界或共享 owner，要同步 `Qingyu_fronted/MODULE.md` 和父仓库 `docs/ARCHITECTURE_GUARDRAILS.md`。
3. 已解决的债务项应转入 `docs/reports/` 或 `docs/archive/`，避免目录长期只增不减。
