# Notification模块组件迁移技术债务

## 概述

本文档记录了Notification模块中仍需迁移到Qingyu组件库的Element Plus组件。

## 已迁移组件 ✅

以下组件已从Element Plus迁移到Qingyu组件库：

- `el-card` → `QyCard`
- `el-button` → `QyButton`
- `el-tag` → `QyTag`
- `el-empty` → `QyEmpty`
- `el-dialog` → `QyModal`

## 待迁移组件 🔄

### 1. qy-dropdown

**当前使用：** `el-dropdown`, `el-dropdown-menu`, `el-dropdown-item`

**使用位置：**
- `src/modules/notification/views/NotificationView.vue` (筛选器)

**迁移优先级：** 中

**替代方案：**
- 开发Qingyu组件库的QyDropdown组件
- 或使用原生select + option实现

---

### 2. qy-checkbox

**当前使用：** `el-checkbox`

**使用位置：**
- `src/modules/notification/views/NotificationView.vue` (通知选择)
- `src/modules/notification/components/NotificationList.vue` (全选)
- `src/modules/notification/components/NotificationItem.vue` (单项选择)

**迁移优先级：** 高

**替代方案：**
- 开发Qingyu组件库的QyCheckbox组件
- 或使用原生input[type="checkbox"]实现

---

### 3. qy-pagination

**当前使用：** `el-pagination`

**使用位置：**
- `src/modules/notification/views/NotificationView.vue` (分页)

**迁移优先级：** 高

**替代方案：**
- 开发Qingyu组件库的QyPagination组件
- 或使用简化的自定义分页组件

---

### 4. qy-switch

**当前使用：** `el-switch`

**使用位置：**
- `src/modules/notification/views/NotificationView.vue` (通知设置，10处)

**迁移优先级：** 中

**替代方案：**
- 开发Qingyu组件库的QySwitch组件
- 或使用原生input[type="checkbox"] + CSS实现

---

### 5. qy-divider

**当前使用：** `el-divider`

**使用位置：**
- `src/modules/notification/views/NotificationView.vue` (设置对话框分隔线，2处)

**迁移优先级：** 低

**替代方案：**
- 使用CSS border实现
- 或开发简单的QyDivider组件

---

### 6. qy-time-picker

**当前使用：** `el-time-picker`

**使用位置：**
- `src/modules/notification/views/NotificationView.vue` (免打扰时段设置，2处)

**迁移优先级：** 中

**替代方案：**
- 使用原生input[type="time"]
- 或开发Qingyu组件库的QyTimePicker组件

---

### 7. qy-form

**当前使用：** `el-form`, `el-form-item`

**使用位置：**
- `src/modules/notification/views/NotificationView.vue` (设置对话框表单)

**迁移优先级：** 中

**替代方案：**
- 已有QyForm和QyFormItem组件，需要替换
- 或使用原生form + label实现

---

## 特殊说明：el-icon

**状态：** 保留

**原因：** `el-icon`用于动态图标组件渲染，当前Qingyu组件库的QyIcon不支持动态组件。

**使用位置：**
- `src/modules/notification/views/NotificationView.vue` (通知图标)
- `src/modules/notification/components/NotificationItem.vue` (通知图标)
- `src/modules/notification/components/NotificationBell.vue` (铃铛图标)
- `src/modules/notification/views/NotificationCenter.vue` (连接状态图标)

**长期方案：**
- 增强QyIcon组件支持动态组件渲染
- 或使用统一的图标映射表

---

## 迁移计划

### 第一阶段（高优先级）
1. 开发并迁移 `qy-checkbox`
2. 开发并迁移 `qy-pagination`

### 第二阶段（中优先级）
3. 开发并迁移 `qy-dropdown`
4. 开发并迁移 `qy-switch`
5. 开发并迁移 `qy-time-picker`
6. 替换 `qy-form` 和 `qy-form-item`

### 第三阶段（低优先级）
7. 开发或替换 `qy-divider`
8. 增强 `qy-icon` 支持动态组件

---

## 参考资料

- Qingyu组件库：`src/design-system/components/`
- Element Plus文档：https://element-plus.org/
