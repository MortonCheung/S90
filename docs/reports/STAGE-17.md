# 阶段报告 · 失败恢复与无障碍

## 目标
补齐失败路径与基础可访问性，不新增展示功能。

## 实现
- 模型失败：可读错误 + “重新载入”，重试走真实加载流程；不揭幕空场景。
- `prefers-reduced-motion`：跳过逐笔生长与长补间，直接显示完成态。
- 键盘：详情按钮、车漆、缩放、返回主线均可 Tab/Enter；ESC 退出探索。
- 语义：按钮 aria-label、装饰元素 aria-hidden、标题层级 h1→h2。
- **WebGL 不可用**：入口先探测 WebGL2/WebGL，失败时渲染静态回退页（标题 + 说明 + 正侧线稿 + 署名），不创建 Canvas。用 `getContext` 注入返回 null 实测：`.fallback` 出现、`canvas=false`，截图 `webgl-fallback.png`。

## 未完成
WebGL **上下文丢失**（运行中丢失）的恢复未实现；键盘焦点在详情开合时的完整接管未走查（UNVERIFIED）。

## 结论
主要失败路径 PASS；上下文丢失 BLOCKED（未实现）。

---
生成时间：2026-11-03
