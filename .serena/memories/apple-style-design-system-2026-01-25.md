# Apple 风格设计系统 - 任务背景

**创建日期**: 2026-01-25
**任务**: 按照 AppleStyleDemo.vue 的样式风格完善 Tailwind CSS 重构

---

## 任务目标

将 Apple 风格设计语言统一应用到整个 Qingyu 前端项目，建立完整的设计系统。

## 核心设计特征

### 1. 毛玻璃拟态 (Glassmorphism)
- **配方**: `bg-white/60 backdrop-blur-xl border border-white/50`
- **应用**: 导航栏、卡片、弹窗

### 2. 紫粉渐变
- **品牌色**: `from-purple-600 to-pink-500`
- **应用**: Logo、按钮、文字渐变

### 3. 大圆角
- **规范**: rounded-xl (12px), rounded-2xl (16px), rounded-3xl (24px)
- **应用**: 按钮、卡片、输入框

### 4. 精致阴影
- **标准**: shadow-sm, shadow-md, shadow-xl
- **彩色投影**: shadow-purple-500/20
- **自定义**: shadow-[0_8px_32px_rgba(0,0,0,0.12)]

### 5. 流畅动画
- **缓动**: cubic-bezier(0.25, 1, 0.5, 1)
- **时长**: 300ms (标准), 500ms (慢速)
- **效果**: 上浮、缩放、阴影加深

### 6. 3D 交互
- **技术**: perspective + transform-style: preserve-3d
- **效果**: 书籍翻转、卡片 3D 悬浮

### 7. 响应式混合布局
- **手机端**: 底部 TabBar (全宽，带文字标签)
- **PC 端**: 顶部菜单 + 底部悬浮 Dock (居中，只显示图标)

### 8. 背景设计
- **渐变光斑**: bg-gradient + blur-[100px] + animate-float
- **噪点纹理**: bg-noise (SVG data URI)

---

## 交付物

### 设计文档
📄 `docs/plans/2026-01-25-apple-style-tailwind-design-system.md`

**包含内容**:
- ✅ 核心设计原则（7大特征）
- ✅ 色彩系统（品牌色、中性色、半透明）
- ✅ 毛玻璃效果配方（导航栏、卡片、弹窗）
- ✅ 圆角系统规范（8级圆角）
- ✅ 阴影系统（标准、彩色、自定义）
- ✅ 动画系统（缓动函数、浮动、悬停、加载）
- ✅ 3D 交互效果
- ✅ 响应式设计规范
- ✅ 组件设计示例（Button, Card, Input, Dialog）
- ✅ 背景设计（渐变光斑、噪点）
- ✅ Tailwind 配置扩展
- ✅ 实施清单（Phase 0-3）
- ✅ 验收标准

### 参考示例
🎨 `src/views/demo/AppleStyleDemo.vue`

**完整展示**:
- 响应式混合导航
- 3D 书籍效果
- 毛玻璃卡片
- 浮动 Dock 栏
- 渐变光斑背景

---

## 实施计划

### Phase 0: 设计令牌 (1 周)
- [ ] 配置 Tailwind 主题扩展
- [ ] 创建全局样式文件
- [ ] 定义组件工具类

### Phase 1: 基础组件 (2-3 周)
- [ ] Button (4 种变体)
- [ ] Input (3 种类型)
- [ ] Card (3 种样式)
- [ ] Dialog (2 种类型)
- [ ] Badge, Avatar

### Phase 2: 复合组件 (3-4 周)
- [ ] Navigation (顶部 + Dock)
- [ ] Form (表单 + 验证)
- [ ] Table, List
- [ ] Pagination

### Phase 3: 页面迁移 (4-6 周)
1. 登录/注册页
2. 用户设置页
3. 书店首页
4. 作者工作台
5. 其他页面

---

## 验收标准

### 视觉一致性
- [ ] 所有卡片使用毛玻璃效果
- [ ] 所有按钮使用 rounded-xl
- [ ] 所有阴影符合分层规范
- [ ] 所有动画 300ms 标准时长

### 交互体验
- [ ] 悬停效果流畅自然
- [ ] 点击反馈及时明确
- [ ] 加载状态清晰可见
- [ ] 过渡动画无卡顿

### 响应式设计
- [ ] 手机端导航符合 Dock 规范
- [ ] PC 端导航符合顶部菜单规范
- [ ] 所有断点适配正确
- [ ] iPhone 安全区域适配正确

### 性能优化
- [ ] 使用 will-change 优化动画
- [ ] 使用 backdrop-blur 替代模糊图片
- [ ] 使用 transform 替代 position 动画
- [ ] 图片懒加载和占位符

---

## 技术栈

- **框架**: Vue 3.3.4
- **构建**: Vite 7.x
- **样式**: Tailwind CSS 3.3.6
- **类型**: TypeScript
- **文档**: Storybook (可选)

---

## 相关文档

- 📄 `docs/plans/2026-01-23-frontend-tailwind-ui-refactor-design.md` - 重构总计划
- 📄 `docs/plans/2026-01-23-frontend-tailwind-ui-refactor-wbs.md` - 详细 WBS
- 🎨 `src/views/demo/AppleStyleDemo.vue` - Apple 风格完整示例

---

**状态**: 设计系统文档已创建，等待用户反馈下一步行动
**下一步**: 根据用户需求开始实施组件开发或调整设计方案
