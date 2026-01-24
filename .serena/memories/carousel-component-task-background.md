# Carousel 轮播图组件开发任务

## 任务背景
主人要求开发 Carousel 轮播图组件，这是 Qingyu 前端设计系统中展示类组件的一部分喵~

## 任务要求
- 技术栈：Vue 3 + TypeScript + script setup + Tailwind CSS + CVA + Storybook 8.6
- 位置：Qingyu_fronted/src/design-system/other/Carousel/
- 功能：完整的轮播图功能，包括自动播放、方向控制、指示器、箭头等

## 组件功能清单
1. **基本功能**
   - height: 高度控制
   - initialIndex: 初始索引
   - trigger: 切换方式（click/hover）
   - autoplay: 自动播放
   - interval: 自动播放间隔（默认3000ms）
   - loop: 循环播放
   - direction: 播放方向（horizontal/vertical）

2. **指示器**
   - indicatorPosition: 指示器位置（none/inside/outside）
   - type: 指示器类型（default/dots/card）

3. **箭头**
   - arrow: 箭头显示方式（always/hover/never）
   - prev/next 插槽

4. **事件**
   - change: 切换时触发

## 验收标准
1. 组件功能完整
2. 至少10个 Storybook 故事
3. 至少30个单元测试
4. 测试通过率 ≥ 90%
5. README 文档完整

## Stories 清单
1. Default - 基础轮播
2. AutoPlay - 自动播放
3. Vertical - 垂直方向
4. CardMode - 卡片模式
5. WithoutIndicator - 无指示器
6. DifferentTriggers - 不同触发方式
7. CustomArrow - 自定义箭头
8. Loop - 循环播放
9. LazyLoad - 懒加载
10. Thumbs - 缩略图模式
