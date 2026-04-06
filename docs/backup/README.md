# 前端备份区

`docs/backup/` 是临时快照区，不是长期文档目录。

## 当前状态（2026-04-07）

- `websocket-backup-2026-02-05.md` 已迁移到父仓库 legacy：`docs/plans/submodules/frontend/legacy/2026-02-05-websocket-backup-from-qingyu-fronted-docs-backup.md`。
- 当前目录保留治理说明与台账，不再保留该 WebSocket 历史快照原件。

## 用途

- 在大规模重写前保留短期参考副本
- 为临时对照、回滚或人工核对保留一次性快照

## 规则

1. 不要把长期可维护文档写进 `backup/`。
2. 新增备份时，文件名应包含来源与日期。
3. 备份一旦失去短期价值，应删除或转入 `docs/archive/`，不要长期堆积。
4. 若某份备份实际上已经成为唯一可读版本，应立即转正到正式目录，而不是继续留在这里。
5. 涉及跨仓库历史追溯价值的快照，应优先迁入父仓库 `docs/plans/submodules/frontend/legacy/`，并在本目录台账记录迁移链路。
