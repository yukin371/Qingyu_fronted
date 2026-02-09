# 前端架构重构执行计划（10个工作日）

> 计划日期：2026-02-09  
> 适用范围：`Qingyu_fronted`  
> 目标：在不影响核心业务可用性的前提下，完成高内聚、低耦合重构落地
> 进度看板：`docs/plans/2026-02-09-frontend-architecture-refactor-tracking.md`

---

## 1. 重构目标与范围

### 1.1 总体目标
- 启动层只负责装配，不承载业务细节
- 路由层只做导航与策略编排，不做业务硬编码
- 基础设施（HTTP / WebSocket / Polling / Storage）单一实现
- Store 结构语义清晰，避免全局与模块“双轨冲突”
- 模块依赖有边界，禁止跨模块直接“穿透引用”

### 1.2 本轮范围（In Scope）
- `src/main.ts` 启动逻辑拆分
- `src/router/*` 路由聚合与守卫策略解耦
- `src/services/*` 与 `src/core/services/*` 重复实现收敛
- 认证 token 与 storage 读写协议统一
- `tsconfig.json` / eslint 边界规则治理
- 输出完整迁移文档与验收清单

### 1.3 非本轮范围（Out of Scope）
- UI 视觉重构
- 业务功能新增
- 后端接口协议变更
- 全量模块大规模目录迁移（仅做“可持续迁移”的骨架）

---

## 2. 执行策略

### 2.1 实施原则
- 先加适配层，再迁移调用，最后删旧代码
- 每日完成后都可回滚，不留“半迁移不可运行”状态
- 每次改动尽量限定在一个主题（启动层 / 路由 / 基础设施 / store）

### 2.2 分支与提交建议
- 分支：`refactor/frontend-architecture-2026-02`
- 提交粒度：每个工作日 2~4 个提交（便于回滚）
- 提交模板：`refactor(scope): action`
  - 示例：`refactor(router): extract guard policies`

### 2.3 每日固定动作
- 开始前：同步主分支，确认测试基线
- 中间：完成当天“文件级任务 + 最小验证”
- 结束前：更新进度文档与风险日志

---

## 3. 10个工作日详细计划（文件级）

## Day 1：基线冻结与规则先行

### 目标
- 冻结当前依赖关系和关键链路，建立迁移护栏

### 任务清单
- 新增架构基线文档（当前分层、问题、目标态）
  - `docs/architecture/frontend-boundary-baseline.md`
- 新增依赖快照文档（按层统计 import）
  - `docs/reports/import-dependency-baseline.md`
- 新增重构任务总追踪文档（状态看板）
  - `docs/plans/2026-02-09-frontend-architecture-refactor-tracking.md`
- 在 ESLint 增加临时边界规则（先 warning）
  - `eslint.config.ts`

### 验证
- `npm run lint`
- 人工确认关键路径：登录、书城、阅读、作者发布、钱包

---

## Day 2：启动层解耦（main.ts 瘦身）

### 目标
- 让 `main.ts` 只保留装配职责

### 任务清单
- 新增 bootstrap 子模块
  - `src/app/bootstrap/theme.ts`
  - `src/app/bootstrap/monitoring.ts`
  - `src/app/bootstrap/error-handler.ts`
  - `src/app/bootstrap/global-services.ts`
  - `src/app/bootstrap/index.ts`
- 重构入口
  - 修改 `src/main.ts`，移除主题/监控/错误处理细节

### 验证
- `npm run type-check`
- `npm run dev` 本地启动可用

---

## Day 3：路由聚合拆分与模块注册表

### 目标
- 路由结构从“单大文件拼接”改为“注册表聚合”

### 任务清单
- 新增路由注册表
  - `src/router/route-registry.ts`
- 拆分 Demo 路由为独立模块路由
  - 新增 `src/modules/demo/routes.ts`
  - 修改 `src/router/index.ts`（移除内联 demo route）
- 统一模块路由导入模式
  - 调整 `src/router/index.ts` 只做注册与 `createRouter`

### 验证
- `npm run type-check`
- 路由访问回归：`/bookstore`、`/writer`、`/demo`

---

## Day 4：路由守卫策略解耦

### 目标
- 去除 `guards.ts` 的路径硬编码策略（如 `/writer`）

### 任务清单
- 新增策略层
  - `src/router/policies/access-policy.ts`
  - `src/router/policies/auth-policy.ts`
  - `src/router/policies/role-policy.ts`
- 重构守卫编排
  - 修改 `src/router/guards.ts`
- 为路由元信息补充策略字段（`meta.accessPolicy`）
  - 修改模块路由定义文件（按优先模块：writer/user/admin）

### 验证
- `npm run test:unit -- router`
- 手工验证未登录跳转、角色不足跳转、guest 页重定向

---

## Day 5：基础设施收敛（一）—— Polling / WebSocket

### 目标
- 保留 `core/services` 唯一实现，`services` 仅兼容出口

### 任务清单
- Polling 收敛
  - 修改 `src/services/polling.ts` 为 re-export
  - 保留实现 `src/core/services/polling.service.ts`
- WebSocket 收敛
  - 修改 `src/services/websocket.ts` 为 re-export
  - 保留实现 `src/core/services/websocket.service.ts`
- 统一导出入口
  - 新增或修改 `src/core/services/index.ts`

### 验证
- 受影响调用点 smoke test：消息模块、通知模块
- `npm run type-check`

---

## Day 6：基础设施收敛（二）—— Request / API Adapter

### 目标
- 明确唯一请求门面，减少 `httpService` 与 `request-adapter` 语义重叠

### 任务清单
- 定义标准请求门面
  - `src/core/http.ts`（标准导出规范）
- 规范 adapter 责任
  - 修改 `src/utils/request-adapter.ts`（仅兼容层，不新增逻辑）
- 统一模块 API 模板
  - 新增 `src/modules/_template/api/index.ts`（模板）
- 先迁移高频模块一批（writer/reader/social）
  - 修改 `src/modules/writer/api/*.ts`
  - 修改 `src/modules/reader/api/manual/*.ts`
  - 修改 `src/modules/social/request.ts`

### 验证
- `npm run type-check`
- 模块 API 关键功能冒烟验证

---

## Day 7：认证与存储协议统一

### 目标
- token / refreshToken / user / roles 的读写路径唯一化

### 任务清单
- 统一存储键规范（统一 `qingyu_` 前缀策略）
  - 修改 `src/utils/storage.ts`（补充迁移辅助）
- 重构 auth store 直写 localStorage
  - 修改 `src/stores/auth.ts`
- 重构 http 刷新 token 逻辑读写
  - 修改 `src/core/services/http.service.ts`
- 增加“旧键迁移到新键”一次性逻辑
  - 新增 `src/core/services/storage-migration.service.ts`
  - 在 `src/app/bootstrap/index.ts` 接入

### 验证
- 登录 / 刷新 / 退出 / 重新打开页面状态恢复
- `npm run test:unit -- auth`

---

## Day 8：Store 结构收敛（先定规则，再迁移）

### 目标
- 明确“全局 store vs 模块 store”职责，消除 alias 混淆

### 任务清单
- 制定 store 分层规范文档
  - `docs/architecture/state-store-boundary.md`
- 修正路径别名语义
  - 修改 `tsconfig.json`
- 增加统一出口
  - 新增 `src/stores/index.ts`
- 建立 feature facade（优先 auth）
  - 新增 `src/features/auth/index.ts`
  - 新增 `src/features/auth/use-auth.ts`（或等价命名）

### 验证
- `npm run type-check`
- `@/stores/*` 引用可预测且无冲突

---

## Day 9：模块边界治理与批量修复

### 目标
- 防止跨模块直接穿透引用再次出现

### 任务清单
- ESLint 边界规则从 warning 提升为 error
  - 修改 `eslint.config.ts`
- 批量修复典型穿透依赖（优先发现的高风险点）
  - `src/modules/discovery/components/DiscussionFeed.vue`
  - `src/modules/writer/stores/writerStore.ts`
  - `src/modules/writer/views/WriterDashboard.vue`
  - `src/modules/writer/api/publish.ts`
- 为跨模块共享能力建立共享接口层
  - 新增 `src/features/*` 或 `src/modules/shared/*` 对外 API

### 验证
- `npm run lint`
- `npm run type-check`

---

## Day 10：收尾、验收与发布准备

### 目标
- 完成文档、验证、发布说明与后续 backlog

### 任务清单
- 输出重构完成报告
  - `docs/reports/2026-02-frontend-architecture-refactor-report.md`
- 输出“已废弃文件清单与删除窗口”
  - `docs/technical-debt/deprecation-plan-frontend-architecture.md`
- 更新团队开发约定
  - `docs/standards/frontend-module-boundary.md`
- 更新 README / 快速开发指南中的目录与调用方式
  - `README.md`
  - `docs/QUICK_START.md`

### 验证
- `npm run lint`
- `npm run type-check`
- `npm run test:unit`
- 关键 e2e 场景抽样执行（如已有脚本）

---

## 4. 里程碑与交付物

### M1（Day 1-3）
- 启动层拆分完成
- 路由注册表落地
- 基线文档齐备

### M2（Day 4-7）
- 守卫策略解耦
- 基础设施单一实现
- 认证存储协议统一

### M3（Day 8-10）
- store 边界清晰
- 模块边界规则强制执行
- 完成报告与发布准备完成

---

## 5. 风险与回滚

### 5.1 主要风险
- 路由策略迁移导致权限行为变化
- token 读写改造导致登录态异常
- API 调用门面统一导致局部请求失败

### 5.2 缓解措施
- 每日只迁移一个大主题，避免叠加变更
- 关键链路每日回归（登录/发布/支付/阅读）
- 保留兼容 re-export 层至少 1 个迭代周期

### 5.3 回滚策略
- 按天独立提交，出现问题按“日粒度”回滚
- 不删除旧实现直到新实现稳定运行 3 天

---

## 6. 验收标准（Definition of Done）

- `src/main.ts` 仅保留应用装配逻辑
- 路由守卫不再包含路径硬编码业务策略
- `src/services/*` 不再保留重复核心实现
- token / refreshToken 读写路径唯一且稳定
- store 边界可解释且 alias 语义一致
- ESLint 已阻断跨模块非法依赖
- 文档、报告、迁移说明完整

---

## 7. 建议执行顺序（高优先）

1. 启动层（低风险高收益）
2. 路由策略（中风险，需测试）
3. 基础设施收敛（高收益）
4. 认证存储统一（高风险，严测）
5. store 与边界规则（长期收益）

---

## 8. 计划维护方式

- 每天下班前更新 `frontend-architecture-refactor-tracking.md`：
  - 当天完成
  - 阻塞项
  - 次日计划
- 每周更新一次风险等级（低/中/高）
- 遇到新增需求时，先判断是否破坏边界，再决定是否纳入本轮
