# 阶段报告 · 侧视线稿与生长动画

## 目标
得到严格正侧、与 3D 车体同位的线稿，并逐笔生长。

## 实现
- `tools/lineart/trace.js`：同一 `openingPose` 相机、2400×1350；逐 mesh EdgesGeometry(22°) → 投影 → 深度剔除；剪影用 mask + marching squares。
- 输出 921 条路径，按 silhouette/body/glass/wheel/light/trim/detail 分层；`Opening.jsx` 逐 path dashoffset 生长，delay 0.0032、总约 3.8s。
- 运行时按 `H_viewport/viewHeightFor(aspect)` 缩放，任何宽高比都与相机同尺度。

## 证据
`public/assets/lineart/s90-side.svg`（652KB）、`docs/reports/lineart-preview.png`。
同位误差实测 0–3px（1600×900，x=200/400/800/1200）。

## 结论
PASS。车顶/机盖保留 silhouette+body 双线（1–2px），作为制图感。

---
生成时间：2026-11-03
