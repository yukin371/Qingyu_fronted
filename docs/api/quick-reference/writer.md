# 快速参考 / 写作模块

> **5秒找到需要的接口**

## 项目管理

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 创建项目 | POST | /api/v1/projects | 创建新的写作项目 |
| 获取项目列表 | GET | /api/v1/projects | 分页获取项目列表 |
| 获取项目详情 | GET | /api/v1/projects/{id} | 获取单个项目详情 |
| 更新项目 | PUT | /api/v1/projects/{id} | 更新项目信息 |
| 删除项目 | DELETE | /api/v1/projects/{id} | 删除项目 |
| 刷新统计 | PUT | /api/v1/projects/{id}/statistics | 重新计算字数、章节数 |

**错误码：** 5001-5099 | **详细文档：** [项目管理详细指南](../guides/writer/create-project.md)

---

## 文档管理（章节/卷）

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 创建文档 | POST | /api/v1/projects/{projectId}/documents | 创建章节或卷 |
| 获取文档列表 | GET | /api/v1/projects/{projectId}/documents | 分页获取文档列表 |
| 获取文档树 | GET | /api/v1/projects/{projectId}/documents/tree | 获取树形结构目录 |
| 获取文档详情 | GET | /api/v1/documents/{id} | 获取文档元数据 |
| 更新文档 | PUT | /api/v1/documents/{id} | 更新文档属性 |
| 删除文档 | DELETE | /api/v1/documents/{id} | 删除文档 |
| 移动文档 | PUT | /api/v1/documents/{id}/move | 调整文档位置 |
| 重新排序 | PUT | /api/v1/projects/{projectId}/documents/reorder | 批量排序 |

**错误码：** 5100-5199 | **详细文档：** [章节管理详细指南](../guides/writer/chapter-management.md)

---

## 编辑器与内容保存

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取内容 | GET | /api/v1/documents/{id}/content | 加载文档内容 |
| 更新内容 | PUT | /api/v1/documents/{id}/content | 手动保存内容 |
| 自动保存 | POST | /api/v1/documents/{id}/autosave | 自动保存（防冲突） |
| 保存状态 | GET | /api/v1/documents/{id}/save-status | 检查保存状态 |
| 字数统计 | POST | /api/v1/documents/{id}/word-count | 服务端计算字数 |

**错误码：** 5200-5299 | **详细文档：** [自动保存详细指南](../guides/writer/autosave.md)

---

## 发布管理

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取发布计划 | GET | /api/v1/writer/publish/books/{bookId}/plan | 获取书籍发布计划 |
| 创建发布计划 | POST | /api/v1/writer/publish/books/{bookId}/plan | 创建发布计划 |
| 更新发布计划 | PUT | /api/v1/writer/publish/plans/{planId} | 更新计划配置 |
| 删除发布计划 | DELETE | /api/v1/writer/publish/plans/{planId} | 删除发布计划 |
| 发布章节 | POST | /api/v1/writer/publish/chapters/{chapterId} | 发布单个章节 |
| 批量发布 | POST | /api/v1/writer/publish/chapters/batch | 批量发布章节 |
| 取消发布 | DELETE | /api/v1/writer/publish/chapters/{chapterId} | 取消已发布章节 |
| 定时发布 | POST | /api/v1/writer/publish/chapters/{chapterId}/schedule | 设置定时发布 |
| 获取发布记录 | GET | /api/v1/writer/publish/books/{bookId}/records | 获取发布历史 |
| 获取发布统计 | GET | /api/v1/writer/publish/books/{bookId}/stats | 获取发布统计数据 |
| 提交审核 | POST | /api/v1/writer/publish/books/{bookId}/review | 提交审核 |
| 获取审核状态 | GET | /api/v1/writer/publish/books/{bookId}/review/status | 查看审核状态 |
| 设置付费 | PUT | /api/v1/writer/publish/chapters/{chapterId}/pricing | 设置章节付费 |
| 暂停计划 | POST | /api/v1/writer/publish/plans/{planId}/pause | 暂停发布计划 |
| 恢复计划 | POST | /api/v1/writer/publish/plans/{planId}/resume | 恢复发布计划 |

**错误码：** 5300-5399 | **详细文档：** [发布管理详细指南](../guides/writer/publish.md)

---

## 角色管理

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 创建角色 | POST | /api/v1/projects/{projectId}/characters | 创建新角色 |
| 获取角色列表 | GET | /api/v1/projects/{projectId}/characters | 获取项目所有角色 |
| 获取角色详情 | GET | /api/v1/characters/{characterId} | 获取角色完整信息 |
| 更新角色 | PUT | /api/v1/characters/{characterId} | 更新角色信息 |
| 删除角色 | DELETE | /api/v1/characters/{characterId} | 删除角色 |
| 创建关系 | POST | /api/v1/characters/relations | 创建角色关系 |
| 获取关系列表 | GET | /api/v1/projects/{projectId}/characters/relations | 获取角色关系 |
| 删除关系 | DELETE | /api/v1/characters/relations/{relationId} | 删除角色关系 |
| 获取关系图 | GET | /api/v1/projects/{projectId}/characters/graph | 获取关系图谱数据 |

**错误码：** 5400-5499

---

## 地点管理

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 创建地点 | POST | /api/v1/projects/{projectId}/locations | 创建新地点 |
| 获取地点列表 | GET | /api/v1/projects/{projectId}/locations | 获取项目所有地点 |
| 获取地点详情 | GET | /api/v1/locations/{locationId} | 获取地点完整信息 |
| 更新地点 | PUT | /api/v1/locations/{locationId} | 更新地点信息 |
| 删除地点 | DELETE | /api/v1/locations/{locationId} | 删除地点 |

**错误码：** 5500-5599

---

## 时间线管理

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 创建事件 | POST | /api/v1/projects/{projectId}/timelines | 创建时间线事件 |
| 获取时间线 | GET | /api/v1/projects/{projectId}/timelines | 获取项目时间线 |
| 更新事件 | PUT | /api/v1/timelines/{eventId} | 更新时间线事件 |
| 删除事件 | DELETE | /api/v1/timelines/{eventId} | 删除时间线事件 |

**错误码：** 5600-5699

---

## 数据统计

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 作品统计概览 | GET | /api/v1/writer/books/{bookId}/stats | 获取作品总览数据 |
| 每日统计 | GET | /api/v1/writer/books/{bookId}/stats/daily | 获取每日趋势数据 |
| 订阅增长 | GET | /api/v1/writer/books/{bookId}/stats/subscribers | 获取订阅增长趋势 |
| 章节统计 | GET | /api/v1/writer/books/{bookId}/stats/chapters | 获取章节阅读数据 |
| 读者活跃度 | GET | /api/v1/writer/books/{bookId}/stats/reader-activity | 获取读者活跃分布 |
| 阅读热力图 | GET | /api/v1/writer/books/{bookId}/stats/reading-heatmap | 获取阅读时段热力图 |
| 作品对比 | POST | /api/v1/writer/stats/compare | 对比多个作品数据 |

**错误码：** 5700-5799

---

## 收入统计

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 收入统计 | GET | /api/v1/writer/revenue/stats | 获取收入总览 |
| 收入趋势 | GET | /api/v1/writer/revenue/trend | 获取收入趋势 |
| 收入来源 | GET | /api/v1/writer/revenue/sources | 获取收入来源分析 |
| 章节收入排行 | GET | /api/v1/writer/revenue/chapters/ranking | 获取章节收入排行 |
| 收入记录 | GET | /api/v1/writer/revenue/records | 获取收入明细 |

**错误码：** 5800-5899

---

## 导出功能

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 创建导出任务 | POST | /api/v1/writer/export/books/{bookId} | 创建书籍导出 |
| 导出章节 | POST | /api/v1/writer/export/chapters/{chapterId} | 导出单个章节 |
| 导出选中文本 | POST | /api/v1/writer/export/selection | 导出选中的文本 |
| 获取任务状态 | GET | /api/v1/writer/export/tasks/{taskId} | 查询导出进度 |
| 取消导出 | POST | /api/v1/writer/export/tasks/{taskId}/cancel | 取消导出任务 |
| 导出历史 | GET | /api/v1/writer/export/books/{bookId}/history | 获取导出历史 |
| 下载文件 | GET | /api/v1/writer/export/tasks/{taskId}/download | 下载导出文件 |
| 删除任务 | DELETE | /api/v1/writer/export/tasks/{taskId} | 删除导出记录 |
| 获取模板 | GET | /api/v1/writer/export/templates | 获取导出模板列表 |
| 保存模板 | POST | /api/v1/writer/export/templates | 保存导出模板 |
| 批量导出 | POST | /api/v1/writer/export/batch | 批量导出多个作品 |

**错误码：** 5900-5999

---

## 快捷键配置

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取快捷键 | GET | /api/v1/user/shortcuts | 获取用户快捷键配置 |
| 更新快捷键 | PUT | /api/v1/user/shortcuts | 更新快捷键配置 |
| 重置快捷键 | POST | /api/v1/user/shortcuts/reset | 恢复默认快捷键 |
| 快捷键帮助 | GET | /api/v1/user/shortcuts/help | 获取快捷键帮助列表 |

**错误码：** 5000-5999

---

## 支持的导出格式

| 格式 | 说明 | 适用场景 |
|------|------|----------|
| txt | 纯文本 | 简单备份、快速预览 |
| docx | Word文档 | 正式出版、校对 |
| pdf | PDF文档 | 打印、分享、存档 |
| markdown | Markdown格式 | 版本控制、二次编辑 |
| epub | 电子书 | 电子阅读器、分发 |
| html | 网页格式 | 在线预览、嵌入 |

---

## 发布类型

| 类型 | 说明 |
|------|------|
| free | 免费发布，所有读者可读 |
| paid | 付费阅读，需要购买 |
| vip | VIP专享，仅会员可读 |
| limited | 限时免费，之后转为付费 |

---

## 发布状态

| 状态 | 说明 |
|------|------|
| draft | 草稿，未发布 |
| pending_review | 审核中 |
| scheduled | 定时发布，等待执行 |
| published | 已发布 |
| rejected | 审核驳回 |
| unpublished | 已下架 |

---

## 文档类型

| 类型 | 说明 | 层级 |
|------|------|------|
| volume | 卷 | 最高层级 |
| chapter | 章 | 中间层级 |
| section | 节 | 较细粒度 |
| scene | 场景 | 最细粒度 |

---

## 常见问题速查

**Q: 如何实现自动保存？**
A: 使用 `POST /api/v1/documents/{id}/autosave`，前端每30秒调用一次，后端通过版本号检测冲突。

**Q: 如何处理版本冲突？**
A: 当自动保存返回 409 状态码时，提示用户"内容已被修改，是否覆盖？"。

**Q: 如何批量发布章节？**
A: 使用 `POST /api/v1/writer/publish/chapters/batch`，传入章节ID数组和发布配置。

**Q: 导出任务需要多久？**
A: 小书籍(<10万字)约10秒，大书籍(>50万字)可能需要1-2分钟，使用 `GET /api/v1/writer/export/tasks/{taskId}` 查询进度。

---

**返回：** [快速参考索引](../quick-reference/) | [数据模型](../data-models/) | [错误码手册](../error-handling/error-codes.md)
