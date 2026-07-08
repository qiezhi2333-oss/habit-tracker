# 小习惯 — 打卡习惯追踪器

移动端 PWA，参考"小日常"App 设计。分类管理活动，点击打卡，日历回顾。

## 使用方式

### 桌面浏览器
直接打开 `index.html`，或运行：
```
npx serve .
```

### 手机端（推荐）
1. 部署到 GitHub Pages（见下方）
2. 手机浏览器打开网址
3. **添加到主屏幕**：iOS Safari → 分享 → "添加到主屏幕" / Android Chrome → 菜单 → "添加到主屏幕"
4. 此后像原生 App 一样打开，离线可用

## 功能

- 🏷️ **分类管理**：自定义分类（运动/饮食/学习…），8 种马卡龙配色
- ✅ **点击打卡**：轻触卡片即可打卡，支持每天多次/每 N 天一次/每周 N 次
- 📅 **日历视图**：按月查看完成情况，每天显示彩色完成点
- 📊 **数据统计**：连续天数、累计次数、月度完成率
- 🌙 **深色模式**：支持浅色/深色主题切换
- 📦 **数据备份**：导出/导入 JSON，数据安全可控
- 📱 **PWA 离线**：首次加载后离线可用

## 部署到 GitHub Pages

1. 在 GitHub 创建仓库 `habit-tracker`
2. 推送代码：
```bash
cd habit-tracker
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/qf233/habit-tracker.git
git push -u origin main
```
3. 仓库 Settings → Pages → Source: "Deploy from a branch" → Branch: main, folder: / (root) → Save
4. 等待 1-2 分钟，访问 `https://qf233.github.io/habit-tracker/`

## 技术栈

纯 HTML/CSS/JS，零依赖。IndexedDB 本地存储。Service Worker 离线缓存。
