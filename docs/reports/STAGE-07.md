# 阶段报告 · 分镜与镜头关键帧

## 目标
把六个章节写成一条连续、可采样的相机曲线，避免“章节切换=跳切”。

## 实现
- `story/story.js`：`CAMERA_KEYS` 9 个关键帧（t/pos/target/fov），非均匀 Catmull-Rom + 有限差分切线；`sampleCamera(t, aspect)`。
- 开场 fov 12°、距车 16.65m（近正交）；主线 fov 24–31°，环绕车体。
- 竖屏 `distanceScale` 与尾段 `narrowPull` 防止裁车。

## 证据
第 0.2/0.33/0.46/0.715 帧截图；`window.__cam` 实测位姿。

## 结论
PASS（关键帧可在 `story.js` 一处调整）。

---
生成时间：2026-11-03
