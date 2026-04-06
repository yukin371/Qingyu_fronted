# 精选指南

`guides/` 目录承接当前优先级更高、仍在维护的前端专题指南，属于前端团队精选的“现行重点”，供快速查阅和复用，区别于 legacy 的 `guide/`。

## 当前精选内容类别

- `qingyu-components-quickstart.md`：Qingyu 组件库即插即用指南（主导当前迁移）。
- `qingyu-global-services.md`：跨 UI/global services 的共享能力说明，说明何时需要与 backend/AI 同步。
- `qingyu-migration-guide.md`：组件迁移经验总结（每次迁移前先查本指南，再确认是否要写 plan）。

## 首次阅读路径

1. `qingyu-components-quickstart.md` - 组件库快速上手。
2. `qingyu-global-services.md` - 共享服务/能力，并确认是否有父仓库同步点。
3. `qingyu-migration-guide.md` - 元迁移经验，里程碑式记录。

## 使用规则

- 本目录只保留当前仍有效、与前端主线（如 Editor V3）具关联的指南。任何旧计划/遗留内容请标注 `legacy` 或移到 `/archive`。
- 新增涉及 shared capability 或跨模块依赖的指南前，先检查父仓库 [docs/plans/submodules/frontend/README.md](../../../docs/plans/submodules/frontend/README.md) 有没有对应计划，必要时把 summary 链接到 [docs/decisions/README.md](../../../docs/decisions/README.md)。
- 若本文档被用于新增 roadmap/plan，则需在父仓库 `docs/plans` 创建同步文档后，再在此 README 更新链接。
