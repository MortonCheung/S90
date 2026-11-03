# 阶段报告 · 失败恢复与无障碍

## 目标
补齐失败路径与基础可访问性，不新增展示功能。

## 实现
- 模型失败：可读错误 + “重新载入”，重试走真实加载流程；不揭幕空场景。
- `prefers-reduced-motion`：跳过逐笔生长与长补间，直接显示完成态。
- 键盘：详情按钮、车漆、缩放、返回主线均可 Tab/Enter；ESC 退出探索。
- 语义：按钮 aria-label、装饰元素 aria-hidden、标题层级 h1→h2。
- **WebGL 不可用**：入口先探测 WebGL2/WebGL，失败时渲染静态回退页（标题 + 说明 + 正侧线稿 + 署名），不创建 Canvas。用 `getContext` 注入返回 null 实测：`.fallback` 出现、`canvas=false`，截图 `webgl-fallback.png`。
- **运行中上下文丢失**：Canvas 监听 `webglcontextlost`，阻止默认并显示“三维渲染已中断 / 重新载入”覆盖层（不重建第二个 Canvas）。合成事件实测：覆盖层出现，截图 `context-lost.png`。
- **键盘**：Tab 依次到达品牌链接、5 个热点、4 个车漆、缩放 −/+/复位、返回主线；Enter 切换车漆（曜石黑→水晶白）；ESC 退出探索（`explore:false`）。截图 `kbd-paint.png`。
- **详情开合焦点**：未实现焦点陷阱（面板关闭后焦点不会自动回位），列为遗留。

## 未完成
详情面板关闭后的焦点回位、真机触屏手势边界未走查（UNVERIFIED）。

## 结论
主要失败路径 PASS；上下文丢失 BLOCKED（未实现）。

---
生成时间：2026-11-03
