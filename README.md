# 静谧的秩序 · Volvo S90 数字交互展厅

2026 华灿奖数字媒体设计作品。严格正侧线稿与真实加载并行，中央裂幕露出同位三维车身。六章滚动叙事连接全幅、详情与座舱，最后连续交接给自由探索。

## 运行

从本仓库根目录运行，使用 Node.js 18+、npm 和支持 WebGL 2 的浏览器。验证环境使用 Node.js 24 和 Chrome 155。

```bash
npm ci
npm run dev        # http://127.0.0.1:5177/
npm run build      # dist/
npm run preview    # http://127.0.0.1:4177/
```

模型随仓库提供，当前运行文件为 `public/assets/model/candidates/s90-quality-v3.glb`（73.36 MB）。原始模型由用户保存在 `source_assets/volvo_s90_recharge_free.glb`，用于 [保真审计及生成](docs/rework/reports/MODEL_QUALITY_AUDIT.md)。直接运行无需原始文件。

## 操作

- 开场中央横线显示实际加载状态。线稿完成且三维首帧就绪后自动揭幕。
- 普通滚动推进整车、灯组、轮毂、侧面、座舱和车尾。点击「章节」可定位。反向滚动恢复镜头与详情状态。
- 桌面详情向右展开。窄屏详情从画布下方展开。两种布局都改变画布实际尺寸。
- 到达末段进入自由探索。拖动旋转，使用按钮缩放、重置、换漆与查看热点，按 Esc 或点击「返回主线」退出。
- 减少动态效果设置会跳过绘制与开幕动画，并等待真实首帧。WebGL 2 不可用时显示静态回退。

## 交付与验证

- [v3 展板、设计说明、流程图和演示视频](deliverables/v3/README.md)
- [最终交付索引](docs/rework/DELIVERY.md) · [总验收报告](docs/rework/FINAL_REVIEW.md) · [逐阶段提交](docs/rework/reports/COMMITS.txt)
- [视觉及性能实测](docs/rework/reports/VISUAL_QA.md) · [桌面与移动适配](docs/ADAPTATION.md)
- [素材授权](docs/ASSET_LICENSES.md)

体验始终使用同一 Canvas、同一 GLB 实例和同一主相机。Chrome 桌面及移动模拟通过，Safari、iOS / Android 真机和公网弱网耗时待实测。旧版展板及演示保留在 `deliverables/`。

车模由 lazercar 发布，遵循 CC BY 4.0。本项目为非官方概念设计。
