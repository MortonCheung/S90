# 阶段报告 · 真实资源加载门槛

## 目标
揭幕必须等真实资源可用，不能“动画放完就开盲盒”。

## 实现
- `useCarAsset.js`：XHR 真实字节进度 + GLTFLoader/MeshoptDecoder；返回 status/progress/total/error/retry。
- `Opening.jsx`：`ready && drawn` 同时成立才启动揭幕；`CarModel` 首帧 `gl.compile` 后回调。
- 失败：显示可读错误与“重新载入”，不揭幕空场景；重试复用同一 Canvas。

## 证据
慢网/404 注入测试截图（`docs/reports/`），错误态文案与重试按钮可见；正常路径 5.3–6.3s 首帧（两次实测）。

## 结论
PASS（重试路径已实测）。

---
生成时间：2026-11-03
