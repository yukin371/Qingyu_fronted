# 前端架构重构进度跟踪看板（模板）

> 项目：`Qingyu_fronted`  
> 计划周期：2026-02-09 ~ 2026-02-20（10个工作日）  
> 使用方式：每天收工前更新“当日记录 + 总览状态 + 风险清单”
> 执行计划：`docs/plans/2026-02-09-frontend-architecture-refactor-execution-plan.md`

---

## 1. 总览状态

| 维度 | 状态 | 说明 |
|---|---|---|
| 总体进度 | ⬜ 未开始 / 🟨 进行中 / 🟩 已完成 | 例：Day 3/10 |
| 当前里程碑 | M1 / M2 / M3 | 例：M1（启动层与路由聚合） |
| 当前风险等级 | 低 / 中 / 高 | 例：中 |
| 阻塞项数量 | 0 | 例：2 |
| 最近更新时间 | YYYY-MM-DD HH:mm | 例：2026-02-09 20:30 |

---

## 2. 里程碑跟踪

- [ ] M1（Day 1-3）：基线 + 启动层拆分 + 路由注册表
- [ ] M2（Day 4-7）：守卫策略解耦 + 基础设施收敛 + 认证存储统一
- [ ] M3（Day 8-10）：Store 边界 + 模块依赖治理 + 收尾发布

---

## 3. 每日任务看板（可勾选）

## Day 1（YYYY-MM-DD）
- [ ] 基线文档：`docs/architecture/frontend-boundary-baseline.md`
- [ ] 依赖快照：`docs/reports/import-dependency-baseline.md`
- [ ] ESLint 边界规则（warning）落地：`eslint.config.ts`
- [ ] 验证：`npm run lint`

## Day 2（YYYY-MM-DD）
- [ ] 新增 bootstrap：`src/app/bootstrap/theme.ts`
- [ ] 新增 bootstrap：`src/app/bootstrap/monitoring.ts`
- [ ] 新增 bootstrap：`src/app/bootstrap/error-handler.ts`
- [ ] 入口瘦身：`src/main.ts`
- [ ] 验证：`npm run type-check`

## Day 3（YYYY-MM-DD）
- [ ] 新增路由注册表：`src/router/route-registry.ts`
- [ ] 拆分 demo 路由：`src/modules/demo/routes.ts`
- [ ] 聚合调整：`src/router/index.ts`
- [ ] 验证：关键路由冒烟

## Day 4（YYYY-MM-DD）
- [ ] 新增策略：`src/router/policies/access-policy.ts`
- [ ] 新增策略：`src/router/policies/auth-policy.ts`
- [ ] 新增策略：`src/router/policies/role-policy.ts`
- [ ] 守卫改造：`src/router/guards.ts`
- [ ] 验证：未登录/无权限/guest 场景

## Day 5（YYYY-MM-DD）
- [ ] Polling 收敛：`src/services/polling.ts`（re-export）
- [ ] WebSocket 收敛：`src/services/websocket.ts`（re-export）
- [ ] 核心实现确认：`src/core/services/*.service.ts`
- [ ] 验证：消息/通知模块冒烟

## Day 6（YYYY-MM-DD）
- [ ] 请求门面规范：`src/core/http.ts`
- [ ] 适配层简化：`src/utils/request-adapter.ts`
- [ ] 模块 API 模板：`src/modules/_template/api/index.ts`
- [ ] 重点模块迁移：`src/modules/writer/api/*` 等
- [ ] 验证：`npm run type-check`

## Day 7（YYYY-MM-DD）
- [ ] 统一存储协议：`src/utils/storage.ts`
- [ ] auth 存储改造：`src/stores/auth.ts`
- [ ] token 刷新改造：`src/core/services/http.service.ts`
- [ ] 迁移服务：`src/core/services/storage-migration.service.ts`
- [ ] 验证：登录/刷新/退出/恢复

## Day 8（YYYY-MM-DD）
- [ ] 状态边界文档：`docs/architecture/state-store-boundary.md`
- [ ] 别名语义修正：`tsconfig.json`
- [ ] 统一 store 出口：`src/stores/index.ts`
- [ ] auth facade：`src/features/auth/*`
- [ ] 验证：store 引用无歧义

## Day 9（YYYY-MM-DD）
- [ ] 边界规则升级 error：`eslint.config.ts`
- [ ] 批量修复穿透依赖（发现项）
- [ ] 共享接口层补齐：`src/features/*` 或 `src/modules/shared/*`
- [ ] 验证：`npm run lint && npm run type-check`

## Day 10（YYYY-MM-DD）
- [ ] 重构报告：`docs/reports/2026-02-frontend-architecture-refactor-report.md`
- [ ] 废弃清单：`docs/technical-debt/deprecation-plan-frontend-architecture.md`
- [ ] 开发规范：`docs/standards/frontend-module-boundary.md`
- [ ] README/快速开始更新
- [ ] 验证：lint + type-check + unit

---

## 4. 当日记录（每日复制一节）

## Day X 记录（YYYY-MM-DD）
- **计划任务**：  
- **实际完成**：  
- **未完成项**：  
- **阻塞原因**：  
- **解决动作**：  
- **影响范围**：  
- **明日计划**：  
- **负责人**：  
- **工时（h）**：  

---

## 5. 风险与阻塞清单

| 编号 | 日期 | 风险/阻塞描述 | 影响等级(低/中/高) | 负责人 | 处理状态 | 预计解决日期 |
|---|---|---|---|---|---|---|
| R-001 | YYYY-MM-DD | 示例：路由守卫迁移后权限判断异常 | 中 | @owner | 处理中 | YYYY-MM-DD |

---

## 6. 变更记录（Changelog）

| 日期 | 修改人 | 变更内容 |
|---|---|---|
| YYYY-MM-DD | @name | 初始化看板模板 |

---

## 7. 验收清单（最终打勾）

- [ ] `src/main.ts` 仅保留装配逻辑
- [ ] 守卫无路径硬编码业务策略
- [ ] 基础设施单一实现已生效
- [ ] token/storage 协议统一并验证通过
- [ ] store 边界与 alias 语义一致
- [ ] ESLint 边界规则启用并通过
- [ ] 报告与规范文档已补齐
