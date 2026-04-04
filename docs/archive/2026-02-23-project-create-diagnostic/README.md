# 项目创建问题诊断归档

**日期**: 2026-02-23
**问题**: 项目创建功能无法正常工作
**状态**: 已修复

## 归档内容

| 文件 | 说明 |
|------|------|
| `project-create-diagnostic-report.md` | 诊断报告 |
| `project-create-diagnostic.spec.ts` | 诊断测试文件 |
| `test-api.sh` | API测试脚本 |
| `test-api-simple.sh` | 简化API测试脚本 |
| `test-project-create-final.sh` | 最终测试脚本 |

## 根因

前端API字段与后端不匹配:
- `description` → `summary`
- `coverImage` → `coverUrl`
- `genre` → `category`

## 修复

提交: `6a02fd79 fix(writer): 修复项目创建API字段映射问题`

## 相关文件

- `src/modules/writer/api/project.ts`
- `src/modules/writer/api/wrapper.ts`
- `src/modules/writer/views/ProjectListView.vue`
