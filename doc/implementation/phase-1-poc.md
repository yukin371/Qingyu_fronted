# 阶段一实施文档（POC）

## 目标

- 在青羽内新增 `/writer` 路由；
- 迁入核心编辑能力（`EditorView`、`MarkdownEditor`、`EditorToolbar`）；
- 使用本地假数据渲染编辑器与文件树；
- 不引入 Electron 相关内容。

## 前置准备

- 创建目录：`src/modules/writer/{views,components,stores,api}`
- 安装依赖（任选其一）：
  - Markdown 渲染：`marked`
  - 或所见即所得（后续阶段）：`@tiptap/*`

## 实施步骤

1) 目录与占位
- 创建 `src/modules/writer/views/EditorView.vue`
- 创建 `src/modules/writer/components/editor/{MarkdownEditor.vue,EditorToolbar.vue}`

2) 路由接入
- 在 `Qingyu/src/router/index.js` 新增 `/writer` 路由节点，子路由指向 `EditorView`。
- 参考工程文档中的示例片段。

3) 假数据与渲染
- 在 `EditorView.vue` 注入本地假数据（文档/项目结构、内容）；
- 使用 `marked` 将 Markdown 内容解析为 HTML；
- `EditorToolbar` 提供最小功能（加粗、斜体、标题）并更新本地状态。

4) 验证
- 从主导航进入 `/writer`；
- 编辑器正常打开、无控制台错误；
- 假数据文档切换正常渲染。

## 输出物

- 目录与文件：`src/modules/writer/*`
- 路由变更：`src/router/index.js`
- 截图与说明（附在本文件末尾或放置于仓库 Wiki）

## 进度记录

- [x] 目录创建完成：2025-10-13
- [x] 路由接入完成：2025-10-13
- [x] 核心组件迁入：2025-10-13
- [x] 假数据渲染通过：2025-10-13

## 实施详情

### 已完成项目

1. **目录结构**
   - 创建 `src/modules/writer/views/`
   - 创建 `src/modules/writer/components/editor/`
   - 创建 `src/modules/writer/stores/`
   - 创建 `src/modules/writer/api/`
   - 创建 `src/modules/writer/utils/`

2. **依赖安装**
   - 安装 `marked@^16.0.0` 用于 Markdown 渲染

3. **核心文件迁移**
   - `EditorView.vue`：简化并适配青羽风格，使用 Element Plus 组件
   - `utils/markdown.js`：Markdown 渲染工具函数
   - 集成青羽主导航，添加"创作"菜单项

4. **路由配置**
   - 新增 `/writer` 路由指向 `EditorView.vue`
   - 路由元信息：`{ title: '青羽创作' }`

5. **功能特性**
   - 实时字数统计
   - 自动保存（localStorage）
   - 专注模式切换
   - 导出功能（TXT/Markdown/HTML）
   - Tab 键缩进支持
   - 草稿自动恢复

### 技术要点

- 使用 Element Plus 组件替换原始 UI（Dialog、Button、Input、Icon）
- 采用 Composition API（script setup）保持与青羽代码风格一致
- POC 阶段使用 localStorage 作为存储方案
- 内置示例 Markdown 文档用于测试

### 访问方式

启动开发服务器后，通过以下方式访问：
- 主导航：点击"创作"菜单项
- 直接访问：`http://localhost:5173/writer`
