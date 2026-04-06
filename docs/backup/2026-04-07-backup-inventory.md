# 前端备份目录台账

## 当前内容

- `README.md`：解释 `docs/backup/` 的临时快照用途、命名规则与删除时机。
- `2026-04-07-backup-inventory.md`：记录当前备份目录状态、风险和迁移轨迹。

## 目录用途

- 仅在大规模变更前保存快照，供回滚或手工对照。
- 不是正式文档，更新后要么删除要么转移到正式目录（如 `docs/archive/` 或父仓库 `legacy/`）。

## 已执行迁移（2026-04-07）

- 源文件：`Qingyu_fronted/docs/backup/websocket-backup-2026-02-05.md`
- 目标文件：`docs/plans/submodules/frontend/legacy/2026-02-05-websocket-backup-from-qingyu-fronted-docs-backup.md`
- 原因：该文件为 2026-02-05 的历史快照，已超出 `backup/` 临时用途，且具有跨仓库追溯价值，归档到父仓库 frontend legacy 更符合治理边界。

## 保留风险

- 若未来再次写入长期快照但不迁移，会重复出现“临时目录长期化”的风险。
- 若未持续维护本台账，可能再次出现“文件存在但去向不明”的追溯断点。

## 操作建议

1. 所有新备份必须先说明“何时/为何生成”，并在本台账中追加记录。
2. 每 1-2 个月评估一次现有备份，确认是否仍需保留；不再需要的直接删除或转 `docs/archive/` 。
3. 如果某份备份变成唯一在用文档，请把其总结写成父仓库 plan/analysis，并在本台账备注转正路径。
4. 对具备跨仓库历史价值的快照，优先迁移到 `docs/plans/submodules/frontend/legacy/`，并保留原路径与迁移日期。
