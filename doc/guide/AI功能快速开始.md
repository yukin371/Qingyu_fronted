# AI功能快速开始指南

## 当前状态

✅ **已完成** (约85%):
- Banner点击跳转修复
- 榜单页面完整实现
- AI API接口完整
- AI组件全部开发完成（侧边栏、对话、工具、右键菜单）
- Writer Store AI状态管理

⏳ **待完成** (约15%):
- EditorView.vue 集成（详见 `AI_INTEGRATION_GUIDE.md`）

## 快速验证

### 1. 验证Banner和榜单功能

```bash
# 启动前端
cd Qingyu_fronted
npm run dev

# 访问
# 首页: http://localhost:5173
# 榜单页: http://localhost:5173/rankings
```

**测试步骤**:
1. 点击首页Banner → 应跳转到书籍详情页
2. 访问榜单页 → 应看到4个Tab（实时/周/月/新人）
3. 切换Tab → 应看到不同榜单数据
4. 点击榜单项 → 应跳转到书籍详情页

### 2. 查看AI组件

AI组件已开发完成，位置：
```
Qingyu_fronted/src/modules/writer/components/ai/
├── AIAssistantSidebar.vue  # 主侧边栏
├── AIChatPanel.vue         # 对话面板
├── AIToolsPanel.vue        # 工具面板
└── AIContextMenu.vue       # 右键菜单
```

### 3. 完成EditorView集成

**快速集成步骤** (详细步骤见 `AI_INTEGRATION_GUIDE.md`):

1. 打开 `Qingyu_fronted/src/modules/writer/views/EditorView.vue`

2. 在 `<script setup>` 顶部添加导入:
```typescript
import { useWriterStore } from '@writer/stores/writerStore'
import AIAssistantSidebar from '@writer/components/ai/AIAssistantSidebar.vue'
import AIContextMenu from '@writer/components/ai/AIContextMenu.vue'
```

3. 添加状态:
```typescript
const writerStore = useWriterStore()
const showAISidebar = computed(() => writerStore.ai.sidebarVisible)
```

4. 在模板中添加AI按钮（工具栏位置）:
```vue
<el-button @click="writerStore.toggleAISidebar()" link>
  <el-icon><MagicStick /></el-icon>
  AI助手
</el-button>
```

5. 在编辑器容器末尾添加AI组件:
```vue
<AIAssistantSidebar
  v-if="showAISidebar"
  @insert="handleInsertAIText"
/>
```

## 数据库准备

### Banner数据

```bash
cd Qingyu_backend
go run cmd/create_banners/main.go
```

### 测试数据

需要确保数据库中有：
- ✅ 用户数据（test_user01, vip_user01, admin）
- ✅ 书籍数据（至少10本）
- ✅ 章节数据
- ✅ Banner数据（运行上述命令）
- ⚠️ 榜单数据（需要后端定时任务更新）

## API配置

AI功能需要配置DeepSeek API（或其他AI提供商）：

```yaml
# Qingyu_backend/config/config.yaml
ai:
  provider: deepseek
  api_key: "your-api-key"
  model: deepseek-chat
```

## 运行测试

### 前端测试

```bash
cd Qingyu_fronted
npm run test
```

### 后端集成测试

```bash
cd Qingyu_backend

# 测试书城功能
go test ./test/integration -run TestBookstoreScenario

# 测试榜单功能
go test ./test/integration -run TestBookstoreScenario

# 测试AI功能（需要先完成前端集成）
go test ./test/integration -run TestAIGenerationScenario
```

## 常见问题

### Q1: Banner点击没反应？

**检查**:
- HomeView.vue 中的 `handleBookClick` 函数是否已修改
- 书籍是否有有效的 `id` 或 `_id`

### Q2: 榜单页面为空？

**可能原因**:
- 数据库中没有榜单数据
- 后端榜单API未正确返回数据

**解决**:
- 检查数据库 `rankings` 集合
- 运行后端榜单更新任务

### Q3: AI功能无法使用？

**检查清单**:
- [ ] 后端AI API配置正确
- [ ] DeepSeek API Key有效
- [ ] 用户已登录
- [ ] 项目ID存在
- [ ] EditorView已正确集成AI组件

### Q4: TypeScript报错？

**常见问题**:
- 导入路径不正确：使用相对路径 `../../` 而非别名 `@writer/`
- 缺少类型定义：检查 `types/ai.ts` 是否存在

## 下一步

1. ✅ 验证Banner和榜单功能
2. ⏳ 完成EditorView集成（30-60分钟）
3. ⏳ 测试AI功能
4. ⏳ 准备生产部署

## 文档索引

- **集成指南**: `AI_INTEGRATION_GUIDE.md` - EditorView详细集成步骤
- **实施总结**: `IMPLEMENTATION_SUMMARY.md` - 完整功能列表和进度
- **后端测试**: `Qingyu_backend/test/integration/` - 集成测试代码
- **API文档**: `Qingyu_backend/doc/api/` - API接口文档

## 支持

遇到问题请查看：
1. 浏览器控制台错误
2. 后端日志
3. 网络请求（DevTools Network tab）
4. 相关文档

---

**状态**: 核心功能完成，等待最后集成  
**预计剩余时间**: 30-60分钟  
**完成度**: 85%


