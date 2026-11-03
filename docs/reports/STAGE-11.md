# 阶段报告 · 滚动控制与相机时间轴

## 目标
原生滚动是唯一进度源，正反滚动连续、可逆。

## 实现
- `App.jsx`：`raw = scrollY / (scrollHeight - innerHeight)`，`smooth = damp(raw,16,dt)`；无 ScrollTrigger pin。
- 进度条、章节、详情、探索全部由 t 派生；`html.is-locked` 仅在揭幕前锁滚动。
- 相机由 `CameraSystem` 单点写入；详情只改投影矩阵。

## 证据
0.2/0.33/0.46/0.715/0.97 五帧；反向滚动回 0.62 后画面与正向一致（截图）。

## 结论
PASS。

---
生成时间：2026-11-03
