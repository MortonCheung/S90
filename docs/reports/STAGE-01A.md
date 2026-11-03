# 阶段 01A 验收报告 · 参考网站逆向分析

## 目标
在不复制参考站资产的前提下，用可复核证据回答四个问题：线稿如何建立、滚动如何驱动镜头、详情如何进出、硬切如何避免。

## 执行
- REA：仓库可克隆、文档可读；Node 24.15.0 < 要求 24.22.1 → 标记 **UNAVAILABLE**，未升级系统运行时。
- 降级：Playwright + Chromium(Metal) 抓取 DOM/资源/截图；ffmpeg 抽取用户提供的两段录屏（Heron 12.8s、Spyker 30.0s）。
- 证据：`reference/audit/{heron,spyker,illoca,demo}/`（截图、evidence.json、requests.txt、recording/）。

## 结果
- Heron：单屏、0 video、1 canvas；加载线稿 + 固定红色横线 + 百分比；100% 后同位交叉淡化到成品插画（**未见上下裂开**）。
- Spyker：42,199px 长页、0 video、4 个全屏 canvas；滚动驱动、章节化、双栏阅读；具体是 WebGL 还是视频纹理**证据不足，不下结论**。
- illoca：单屏、1 canvas(2160×1350)、4 GLB + 56 JPG；到达点详情、反向恢复（高置信实时 3D）。
- Demo：4 个 mp4 + 小 canvas；媒体硬切，无统一相机——作为反例。

## 应用到 S90 的决策
1. 线稿与 3D 共用同一相机投影，保证同位；2) 原生滚动为唯一进度源，所有状态是 t 的纯函数；3) 详情用投影平移而非切场景；4) 唯一混合过渡是 explore 的 0.85s 位姿插值；5) 展板只写有证据的技术点。

## 产物
`docs/reports/REFERENCE_SITE_AUDIT.md`（含每站证据、机制、置信度、取舍）。

## 结论
**PASS（研究）**；REA 本身 **BLOCKED**（运行时版本不满足），已按预案降级，不阻塞主线。
