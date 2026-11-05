# S90 v3 总体验收

本地运行、视觉整改及参赛材料通过验收。阶段00–13各自保留报告和提交。初版远端基线为 `ae52257295bdb9e84b6926a498cf165b7bc24675`，版本对应见 [提交索引](reports/COMMITS.txt)，使用入口见 [交付清单](DELIVERY.md)。

## 整改对照

1. **线稿生长 · PASS**。初版轮廓过早铺满。现在 26 组主笔触分外轮廓、车窗结构、细节三条序列，沿同一正侧投影从左往右推进。实现位于 [Opening.jsx](../../src/opening/Opening.jsx) 与 [stroke-plan.js](../../src/opening/stroke-plan.js)。[实际六帧](evidence/stage-11/linework-contact.jpg)
2. **中央进度线 · PASS**。初版重复显示进度。现在中线绑定实际已读与总字节，总量未知时保持不定进度，下载后进入渲染准备。实现位于 [loading-state.js](../../src/opening/loading-state.js) 与 [useCarAsset.js](../../src/scene/useCarAsset.js)。[已知及未知总量回归](evidence/stage-13/visual-regression.json)
3. **同位揭幕 · PASS**。初版未把首帧完成作为开幕条件。现在等待当前模型的编译与首帧确认，且绘制完成后才由中线向上下开幕。三个画幅均见同位真车，无空场或二次请求。线稿保留简化容差。[CarModel.jsx](../../src/scene/CarModel.jsx) · [同位揭幕抽帧](evidence/stage-12/demo-reveal-filmstrip.jpg)
4. **几何与材质 · PASS**。初版简化版曲面有折面。重新从原始模型保留全部三角拓扑及 Float32 法线、切线，在相同镜头下核对轮毂、车身和内饰。用影棚反射、清漆、透射玻璃与接地阴影改善层次。[Studio.jsx](../../src/scene/Studio.jsx) · [三版对比](evidence/stage-04/comparison-contact.jpg)
5. **产品摄影 · PASS**。初版连续漂移导致主体不明。现在整车、灯组、轮毂、侧面、座舱和车尾有明确锚点、运镜和驻留。同进度正反位姿逐值相同。[story.js](../../src/story/story.js) · [分镜](SHOT_LIST.md) · [连续演示](../../deliverables/v3/s90_demo.mp4)
6. **双栏与文字衔接 · PASS**。初版右栏覆盖原画布。现在网格将桌面宽度或窄屏高度交给详情，相机同步按实时画幅取景。灯组与轮毂保留连续阅读区，章节文字随权重和位移衔接，反向恢复。[App.jsx](../../src/App.jsx) · [DetailPanel.jsx](../../src/detail/DetailPanel.jsx) · [几何实测](evidence/stage-07/metrics.json) · [过渡实测](evidence/stage-08/metrics.json)
7. **座舱内部 · PASS**。初版在车外。两个 v3 相机点位均实际在车内，分别看到仪表台、方向盘、中央区域与前排座椅。入窗路径对对应玻璃做局部处理，80 段射线抽样未命中实体表面。[cabin.js](../../src/story/cabin.js) · [位姿与碰撞采样](evidence/stage-09/poses.json) · [生产截图](evidence/stage-13/production-proof.jpg)
8. **信息减法与探索 · PASS**。合并章节入口和授权信息，移除装饰和重复说明。自由探索保留车漆、热点、缩放与返回，主相机沿同一控制链交接，反向回到叙事。[Chrome.jsx](../../src/ui/Chrome.jsx) · [CameraSystem.jsx](../../src/scene/CameraSystem.jsx) · [控件实测](evidence/stage-10/controls.json)

## 最终复跑

- 干净目录按锁文件安装依赖。项目无 npm test 脚本，现有真实浏览器验收脚本承担回归。[安装日志](reports/13-install.txt) · [构建日志](reports/13-build.txt)
- `S90_QA_DIR=test-results/stage-13/visual node tools/rework-regression.mjs` 通过。Chrome 155 / macOS Metal，桌面 1600×900、1440×900 与移动模拟 390×844。每个会话一份 GLB 请求，三轮探索返回复用同一个 Canvas 和模型 UUID，0 pageerror。404 重试、WebGL 上下文丢失、WebGL 2 不可用和两种 HTTP 长度状态均通过。[回归记录](evidence/stage-13/visual-regression.json)
- `npm run preview` 后运行 `node tools/rework-production.mjs`。新浏览器会话启动，1600×900 和 390×844 都由构建产物加载模型，详情空间实际收缩，座舱、换漆、探索退出后恢复，0 pageerror。已打开并查看两端截图。[生产记录](evidence/stage-13/production-smoke.json) · [生产截图](evidence/stage-13/production-proof.jpg)
- 三张横向 A3、RGB JPG、300 dpi，5.79 / 5.33 / 5.86 MB。设计说明、交互流程、连续演示均已打开检查。43.56 秒演示使用新浏览器会话，从线稿到自由探索，再返回并反向滚动。[印刷样张](evidence/stage-12/boards-proof.jpg) · [材料](../../deliverables/v3/README.md)
- 原参赛材料的 Git 内容与基线一致。公开分支新增记录中排除了两份外站取证拼图、源 GLB 和外站原录屏。旧公开参考审计保持原状态。本地保留完整施工材料和提交映射。[授权](../ASSET_LICENSES.md) · [安全验收](reports/STAGE-13.md)

## 未验证与交付边界

- **UNVERIFIED**。Safari、iOS / Android 真机、公网弱网首屏和长时内存。约 60.1–60.3 fps 为 Apple M3 Chrome 灯组静止驻留 3 秒的最终复跑样本。
- **取舍**。运行 GLB 由 14.54 MB 增至 73.36 MB，以保留原始曲面拓扑和法线。广域网首访等待需实测。
- **提交前核对**。展板符合施工包规格，校方实际上传条件和赛事平台待确认。
