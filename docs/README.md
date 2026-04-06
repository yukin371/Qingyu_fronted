# Qingyu 前端本地文档中台

`Qingyu_fronted/docs/` 只承接前端子模块本地开发、测试、部署、组件与局部实施说明。

它不是跨仓库治理入口。所有跨仓库的 roadmap、plan、ADR、architecture guardrails、共享 owner 与治理审计，统一在父仓库 `docs/` 维护。

## 留在子模块的内容

- 本地快速开始、项目结构、页面与组件开发指南
- 前端架构、性能优化、设计系统与组件库说明
- 本地测试方法、测试环境、部署步骤、API 对接使用说明
- 前端局部实施记录、阶段交付总结、测试报告、技术债台账

## 必须迁回父仓库的内容

- 跨仓库 roadmap / plan
- 长期有效的架构决策与 ADR
- 与后端、AI 服务共享的 owner / guardrails / 标准
- 跨仓库审计、风险 review、治理结论

对应入口：

- [父仓库文档总入口](../../docs/README.md)
- [前端子模块计划迁移区](../../docs/plans/submodules/frontend/README.md)
- [父仓库决策入口](../../docs/decisions/README.md)

## 首次阅读路径

1. 先读父仓库 [docs/README.md](../../docs/README.md)
2. 再读父仓库 [docs/PROJECT_PROFILE.md](../../docs/PROJECT_PROFILE.md)
3. 再读父仓库 [docs/roadmap.md](../../docs/roadmap.md)
4. 再读父仓库 [docs/ARCHITECTURE_GUARDRAILS.md](../../docs/ARCHITECTURE_GUARDRAILS.md)
5. 最后回到本目录，根据目的继续进入本地指南

## 根层平铺文档不是默认入口

前端 `docs/` 根层目前还保留一组平铺的 Markdown 文档（`QUICK_START.md`、`testing.md` 等），它们在本地实践中仍有参考价值，但不是跨仓库治理入口。使用前可参考 [archive/2026-04-07-root-flat-doc-inventory.md](./archive/2026-04-07-root-flat-doc-inventory.md) 了解它们的当前分类与未来归档方向。新增跨模块内容时，先写到父仓库，再在此处补链说明。

## 本地阅读入口

- [guide/README.md](./guide/README.md)：历史入门区，适合补旧流程上下文
- [guides/README.md](./guides/README.md)：当前精选指南
- [architecture/README.md](./architecture/README.md)：前端本地架构资料
- [standards/README.md](./standards/README.md)：前端本地开发规范
- [implementation/README.md](./implementation/README.md)：前端局部实施与落地记录
- [testing/README.md](./testing/README.md)：本地测试方法与验证入口
- [reports/README.md](./reports/README.md)：交付/阶段总结
- [test-reports/README.md](./test-reports/README.md)：测试验证产物
- [migration/README.md](./migration/README.md)：历史迁移档案
- [migration-guides/README.md](./migration-guides/README.md)：当前迁移指南
- [technical-debt/README.md](./technical-debt/README.md)：技术债入口
- [archive/README.md](./archive/README.md)：历史归档
- [backup/README.md](./backup/README.md)：临时备份区
- [legacy inventory](./legacy/2026-04-07-root-flat-doc-inventory.md)（正在编制）提供根层平铺文档的分类/归档指引

## 维护规则

1. 不再把新的长期 plan / roadmap 写进 `Qingyu_fronted/docs/plans/`。
2. 本地目录只写“前端团队能直接执行”的内容。
3. 一旦文档开始描述跨模块边界、shared capability 或 owner，先同步父仓库 `docs/`，再回写本地入口。
4. 旧文档不急着删，但必须通过 README 标明它属于 `legacy`、`archive`、`backup` 还是 `current`。
